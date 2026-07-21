import { NextResponse } from 'next/server';
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
        fto.id, fto.transfer_id, ft.code, ft.file_name, ft.file_size, ft.file_key, ft.max_downloads,
        ft.download_count, ft.retain_days, fto.price, fto.pay_order_no, fto.status,
        fto.refund_amount, fto.created_at
      FROM file_transfer_orders fto
      LEFT JOIN file_transfers ft ON ft.id = fto.transfer_id
      WHERE fto.user_id = $1
      ORDER BY fto.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return NextResponse.json({ error: '获取订单记录失败' }, { status: 500 });
  }
}
