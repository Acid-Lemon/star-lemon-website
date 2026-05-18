import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { getSetting } from '../../../lib/settings';
import { deleteUploadedFile } from '../../../lib/file';
import { getPublicUrl } from '../../../lib/oss';
import { sendCommentNotification } from '../../../lib/mail';
import { getClientIP, lookupLocation } from '../../../lib/ip-location';

// 获取文章的评论（包含回复）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    
    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    // 获取已审核的评论及其回复
    const result = await db.query(
      `SELECT c.id, c.post_id, c.user_id, u.nickname, u.avatar, c.content, c.image_url, c.parent_id, c.status, c.location, c.created_at
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1 AND (c.status = 'approved' OR c.parent_id IS NOT NULL)
       ORDER BY c.created_at ASC`,
      [postId]
    );

    const rows = await Promise.all(
      result.rows.map(async (row: any) => ({
        ...row,
        image_url: await getPublicUrl(row.image_url),
        avatar: await getPublicUrl(row.avatar),
      }))
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// 提交评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, content, parent_id, image_url } = body;

    if (!post_id || (!content && !image_url)) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    // 获取当前用户（如果已登录）
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === 'admin';

    const ip = getClientIP(request);
    let ipAddress: string | null = null;
    let locationText: string | null = null;
    if (ip) {
        const locResult = await lookupLocation(ip);
        if (locResult) {
            ipAddress = locResult.ip_address;
            locationText = locResult.location;
        }
    }

    // 管理员不需要审核，或者根据配置决定
    const commentReview = await getSetting('comment_review', 'true');
    const status = isAdmin ? 'approved' : (commentReview === 'true' ? 'pending' : 'approved');

    // 插入评论
    const result = await db.query(
      `INSERT INTO comments (post_id, user_id, content, image_url, parent_id, status, ip_address, location, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, post_id, user_id, content, image_url, parent_id, status, location, created_at`,
      [post_id, userId, content || null, image_url || null, parent_id || null, status, ipAddress, locationText]
    );

    const userResult = await db.query('SELECT nickname, avatar FROM users WHERE id = $1', [userId]);
    const commentAuthor = userResult.rows[0];

    const newComment = {
      ...result.rows[0],
      nickname: commentAuthor?.nickname || '用户',
      avatar: await getPublicUrl(commentAuthor?.avatar),
    };

    if (status === 'pending') {
      const authorName = commentAuthor?.nickname || '用户';
      const postResult = await db.query(
        `SELECT p.title, u.email FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = $1`,
        [post_id]
      );
      const postAuthor = postResult.rows[0];
      if (postAuthor?.email) {
        sendCommentNotification(postAuthor.title, content || '[图片]', authorName, postAuthor.email).catch(() => {});
      }
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// 删除评论
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查评论是否存在
    const commentResult = await db.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    const comment = commentResult.rows[0];

    // 只有评论发布者或管理员可以删除
    if (comment.user_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: '没有权限删除此评论' }, { status: 403 });
    }

    // 删除评论及其所有子评论
    const deleteResult = await db.query(
      `WITH RECURSIVE comment_tree AS (
        SELECT id FROM comments WHERE id = $1
        UNION ALL
        SELECT c.id FROM comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
      )
      DELETE FROM comments WHERE id IN (SELECT id FROM comment_tree) RETURNING image_url`,
      [commentId]
    );

    // 删除关联的图片文件
    for (const row of deleteResult.rows) {
      await deleteUploadedFile(row.image_url);
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
