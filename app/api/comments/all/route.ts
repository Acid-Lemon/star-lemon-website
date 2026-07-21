import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';
import { getPublicUrl } from '../../../../lib/oss';

// 获取所有评论（管理员）
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query(
      `SELECT c.*, u.nickname, u.avatar, p.title as post_title
       FROM comments c
       LEFT JOIN posts p ON c.post_id = p.id
       LEFT JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC`
    );

    const rows = await Promise.all(
      result.rows.map(async (row) => ({
        ...row,
        avatar: await getPublicUrl(row.avatar),
      }))
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
