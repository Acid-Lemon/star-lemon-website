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
        fto.id, fto.transfer_id, ft.code, ft.file_name, ft.file_size, ft.max_downloads,
        ft.download_count, ft.retain_days, fto.price, fto.pay_order_no, fto.user_id,
        u.nickname as user_nickname, u.email as user_email,
        fto.status, fto.refund_amount, fto.created_at
      FROM file_transfer_orders fto
      LEFT JOIN file_transfers ft ON ft.id = fto.transfer_id
      LEFT JOIN users u ON u.id = fto.user_id
      ORDER BY fto.created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: '获取订单记录失败' }, { status: 500 });
  }
}
