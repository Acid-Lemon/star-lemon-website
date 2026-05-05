import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { deleteUploadedFile } from '../../../lib/file';
import { getPublicUrl } from '../../../lib/oss';

// 获取动态列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await db.query(
      `SELECT moments.*, users.nickname, users.avatar
       FROM moments
       LEFT JOIN users ON moments.user_id = users.id
       WHERE moments.status = 'approved'
       ORDER BY moments.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const rows = await Promise.all(
      result.rows.map(async (row: any) => ({
        ...row,
        image_url: row.image_url
          ? (await Promise.all(
              row.image_url.split(',').map((url: string) => getPublicUrl(url.trim()))
            )).filter(Boolean).join(',')
          : null,
        avatar: await getPublicUrl(row.avatar),
      }))
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch moments:', error);
    return NextResponse.json({ error: 'Failed to fetch moments' }, { status: 500 });
  }
}

// 发布动态
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { content, image_url } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO moments (user_id, content, image_url, status) 
       VALUES ($1, $2, $3, 'approved') 
       RETURNING *`,
      [session.user.id, content.trim(), image_url || null]
    );

    const moment = {
      ...result.rows[0],
      nickname: session.user.nickname,
      avatar: await getPublicUrl(session.user.avatar),
    };

    return NextResponse.json(moment, { status: 201 });
  } catch (error) {
    console.error('Failed to create moment:', error);
    return NextResponse.json({ error: 'Failed to create moment' }, { status: 500 });
  }
}

// 删除动态
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const momentId = searchParams.get('id');

    if (!momentId) {
      return NextResponse.json({ error: 'Moment ID is required' }, { status: 400 });
    }

    // 检查动态是否存在且属于当前用户（或管理员）
    const momentResult = await db.query('SELECT user_id, image_url FROM moments WHERE id = $1', [momentId]);
    if (momentResult.rows.length === 0) {
      return NextResponse.json({ error: '动态不存在' }, { status: 404 });
    }

    const moment = momentResult.rows[0];
    if (moment.user_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: '没有权限删除此动态' }, { status: 403 });
    }

    await db.query('DELETE FROM moments WHERE id = $1', [momentId]);

    // 删除关联的图片文件
    await deleteUploadedFile(moment.image_url);

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Failed to delete moment:', error);
    return NextResponse.json({ error: 'Failed to delete moment' }, { status: 500 });
  }
}
