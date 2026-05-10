import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';
import { getPublicUrl } from '../../../../lib/oss';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const result = await db.query(
      'SELECT id, nickname, email, role, avatar, bio, birthday, qq_identifier, sl_coin, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    const rows = await Promise.all(
      result.rows.map(async (row: any) => ({
        ...row,
        avatar: await getPublicUrl(row.avatar),
      }))
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}
