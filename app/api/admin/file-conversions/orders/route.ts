import { NextResponse } from 'next/server';
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
        fco.id, fco.conversion_id, fco.price, fco.pay_order_no,
        fco.status, fco.refund_amount, fco.created_at,
        fc.file_name, fc.file_size, fc.page_count, fc.src_format, fc.dst_format,
        u.nickname as user_nickname, u.email as user_email
      FROM file_conversion_orders fco
      LEFT JOIN file_conversions fc ON fc.id = fco.conversion_id
      LEFT JOIN users u ON u.id = fco.user_id
      ORDER BY fco.created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch conversion orders:', error);
    return NextResponse.json({ error: '获取订单记录失败' }, { status: 500 });
  }
}
