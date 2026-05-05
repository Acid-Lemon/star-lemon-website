import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { multipartUpload } from '@/lib/oss';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const result = await db.query(
      `SELECT ft.*, fto.status
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1 AND ft.user_id = $2 AND fto.status = $3`,
      [parseInt(id), session.user.id, 'paid']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单不存在或未支付' }, { status: 400 });
    }

    const transfer = result.rows[0];

    if (transfer.file_key) {
      return NextResponse.json({ error: '文件已上传' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: '未收到文件' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let lastPct = 0;
    const key = await multipartUpload(transfer.file_name, fileBuffer, (pct) => {
      lastPct = pct;
    });

    await db.query(
      'UPDATE file_transfers SET file_key = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [key, transfer.id]
    );

    return NextResponse.json({ success: true, fileKey: key });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
