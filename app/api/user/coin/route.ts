import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const result = await db.query(
      'SELECT sl_coin FROM users WHERE id = $1',
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ sl_coin: result.rows[0].sl_coin || 0 });
  } catch (error) {
    console.error('Failed to get coin:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
