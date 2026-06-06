import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { deleteUploadedFile } from '../../../lib/file';
import { getPublicUrl } from '../../../lib/oss';

interface MomentRow {
  image_url: string | null;
  avatar: string | null;
  [key: string]: unknown;
}

// 获取动态列表
export async function GET(request: NextRequest) {
  let stage = '初始化';
  try {
    stage = '解析查询参数';
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const date = searchParams.get('date');

    let query = `SELECT moments.*, users.nickname, users.avatar
       FROM moments
       LEFT JOIN users ON moments.user_id = users.id
       WHERE moments.status = 'approved'`;
    const params: (string | number)[] = [];

    if (date) {
      query += ` AND DATE(moments.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai') = $${params.length + 1}`;
      params.push(date);
    }

    query += ` ORDER BY moments.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    stage = '查询动态列表';
    const result = await db.query(query, params);

    stage = '处理动态图片地址';
    const rows = await Promise.all(
      result.rows.map(async (row: MomentRow) => ({
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
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`Failed to fetch moments at stage "${stage}":`, error);
    return NextResponse.json({ error: `${stage}失败`, detail }, { status: 500 });
  }
}

// 发布动态
export async function POST(request: NextRequest) {
  let stage = '初始化';
  try {
    stage = '校验登录';
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    stage = '解析请求';
    const body = await request.json();
    const { content, image_url } = body;
    const trimmedContent = content?.toString().trim() || '';

    if (!trimmedContent && !image_url) {
      return NextResponse.json({ error: '内容和图片不能同时为空' }, { status: 400 });
    }

    stage = '写入动态';
    const result = await db.query(
      `INSERT INTO moments (user_id, content, image_url, status) 
       VALUES ($1, $2, $3, 'approved') 
       RETURNING *`,
      [session.user.id, trimmedContent, image_url || null]
    );

    stage = '处理用户头像';
    const moment = {
      ...result.rows[0],
      nickname: session.user.nickname,
      avatar: await getPublicUrl(session.user.avatar),
    };

    return NextResponse.json(moment, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`Failed to create moment at stage "${stage}":`, error);
    return NextResponse.json({ error: `${stage}失败`, detail }, { status: 500 });
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
