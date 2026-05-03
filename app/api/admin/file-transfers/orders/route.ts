import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const result = await db.query(
      `SELECT 
        id, transfer_id, code, file_name, file_size, max_downloads, download_count,
        retain_days, price, pay_order_no, user_id, user_nickname, user_email,
        status, refund_amount, deleted_at, created_at
      FROM file_transfer_orders
      ORDER BY created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: '获取订单记录失败' }, { status: 500 });
  }
}
