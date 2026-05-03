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
        ft.id, ft.code, ft.file_name, ft.file_size, ft.file_key, ft.max_downloads, ft.download_count,
        ft.retain_days, ft.expire_at, fto.price, fto.status, ft.created_at, ft.updated_at
      FROM file_transfers ft
      JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
      WHERE ft.user_id = $1
        AND fto.status = 'paid'
        AND ft.download_count < ft.max_downloads
        AND ft.expire_at > NOW()
      ORDER BY ft.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch user file transfers:', error);
    return NextResponse.json({ error: '获取文件列表失败' }, { status: 500 });
  }
}
