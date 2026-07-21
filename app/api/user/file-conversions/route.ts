import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    await db.query(
      `UPDATE file_conversions SET status = 'failed', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status = 'uploading' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes'`,
      [session.user.id]
    );

    const result = await db.query(
      `SELECT fc.id, fc.file_name, fc.file_size, fc.src_format, fc.page_count, fc.status, fc.created_at,
              fco.price, fco.status as order_status
       FROM file_conversions fc
       LEFT JOIN file_conversion_orders fco ON fco.conversion_id = fc.id
       WHERE fc.user_id = $1
       ORDER BY fc.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get user conversions error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
