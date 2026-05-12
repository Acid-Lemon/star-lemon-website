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
      `SELECT fco.id, fco.price, fco.pay_order_no, fco.status, fco.refund_amount, fco.created_at,
              fc.file_name, fc.file_size, fc.page_count
       FROM file_conversion_orders fco
       JOIN file_conversions fc ON fco.conversion_id = fc.id
       WHERE fco.user_id = $1
       ORDER BY fco.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get user conversion orders error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
