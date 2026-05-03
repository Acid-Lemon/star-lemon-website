import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const result = await db.query(
      `SELECT 
        id, transfer_id, code, file_name, file_size, max_downloads, download_count,
        retain_days, price, pay_order_no, status, refund_amount, deleted_at, created_at
      FROM file_transfer_orders
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return NextResponse.json({ error: '获取订单记录失败' }, { status: 500 });
  }
}
