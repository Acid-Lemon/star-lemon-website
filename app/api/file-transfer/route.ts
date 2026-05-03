import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculatePrice } from '@/lib/price-calc';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileSize, maxDownloads, retainDays } = body;

    if (!fileName || !fileSize || !maxDownloads || !retainDays) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    if (maxDownloads < 1 || maxDownloads > 100) {
      return NextResponse.json({ error: '下载次数需在 1-100 之间' }, { status: 400 });
    }

    if (retainDays < 1 || retainDays > 30) {
      return NextResponse.json({ error: '保留天数需在 1-30 之间' }, { status: 400 });
    }

    const price = await calculatePrice({ fileSizeBytes: fileSize, retainDays, maxDownloads });

    let code = '';
    for (let i = 0; i < 10; i++) {
      code = generateCode();
      const exists = await db.query('SELECT id FROM file_transfers WHERE code = $1', [code]);
      if (exists.rows.length === 0) break;
      code = '';
    }
    if (!code) {
      return NextResponse.json({ error: '生成取件码失败，请重试' }, { status: 500 });
    }

    const expireAt = new Date(Date.now() + retainDays * 24 * 60 * 60 * 1000);

    const result = await db.query(
      `INSERT INTO file_transfers (code, file_name, file_size, file_key, max_downloads, retain_days, expire_at, price, pay_status, user_id)
       VALUES ($1, $2, $3, '', $4, $5, $6, $7, 'unpaid', $8)
       RETURNING id, code`,
      [code, fileName, fileSize, maxDownloads, retainDays, expireAt, price, session.user.id]
    );

    const transfer = result.rows[0];

    return NextResponse.json({
      id: transfer.id,
      code: transfer.code,
      price,
    });
  } catch (error) {
    console.error('Create transfer error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: '请输入取件码' }, { status: 400 });
    }

    const result = await db.query(
      'SELECT id, code, file_name, file_size, max_downloads, download_count, retain_days, expire_at, pay_status FROM file_transfers WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '取件码不存在' }, { status: 404 });
    }

    const transfer = result.rows[0];

    if (transfer.pay_status !== 'paid') {
      return NextResponse.json({ error: '该文件尚未完成支付' }, { status: 400 });
    }

    if (new Date(transfer.expire_at) < new Date()) {
      return NextResponse.json({ error: '该文件已过期' }, { status: 400 });
    }

    if (transfer.download_count >= transfer.max_downloads) {
      return NextResponse.json({ error: '下载次数已用完' }, { status: 400 });
    }

    return NextResponse.json({
      id: transfer.id,
      code: transfer.code,
      fileName: transfer.file_name,
      fileSize: transfer.file_size,
      maxDownloads: transfer.max_downloads,
      downloadCount: transfer.download_count,
      retainDays: transfer.retain_days,
      expireAt: transfer.expire_at,
    });
  } catch (error) {
    console.error('Query transfer error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
