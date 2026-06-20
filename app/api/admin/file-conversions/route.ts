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
        fc.id, fc.file_name, fc.file_size, fc.src_format, fc.dst_format, fc.task_id,
        fc.page_count, fc.status, fc.created_at, fc.updated_at,
        u.id as user_id, u.nickname as user_nickname, u.email as user_email,
        fco.price, fco.status as order_status, fco.pay_order_no
      FROM file_conversions fc
      LEFT JOIN users u ON fc.user_id = u.id
      LEFT JOIN file_conversion_orders fco ON fco.conversion_id = fc.id
      ORDER BY fc.created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch file conversions:', error);
    return NextResponse.json({ error: '获取转换列表失败' }, { status: 500 });
  }
}
