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
        ft.id, ft.code, ft.file_name, ft.file_size, ft.file_key, ft.oss_bucket,
        ft.max_downloads, ft.download_count, ft.retain_days, ft.expire_at,
        ft.price, ft.pay_status, ft.pay_order_no, ft.created_at, ft.updated_at,
        u.id as user_id, u.nickname as user_nickname, u.email as user_email
      FROM file_transfers ft
      LEFT JOIN users u ON ft.user_id = u.id
      WHERE ft.pay_status = 'paid'
        AND ft.download_count < ft.max_downloads
        AND ft.expire_at > NOW()
      ORDER BY ft.created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch file transfers:', error);
    return NextResponse.json({ error: '获取文件列表失败' }, { status: 500 });
  }
}
