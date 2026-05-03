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
        id, code, file_name, file_size, file_key, max_downloads, download_count,
        retain_days, expire_at, price, pay_status, created_at, updated_at
      FROM file_transfers
      WHERE user_id = $1
        AND pay_status = 'paid'
        AND download_count < max_downloads
        AND expire_at > NOW()
      ORDER BY created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch user file transfers:', error);
    return NextResponse.json({ error: '获取文件列表失败' }, { status: 500 });
  }
}
