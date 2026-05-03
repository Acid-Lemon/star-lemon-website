import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateUploadCredentials } from '@/lib/oss';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const result = await db.query(
      'SELECT * FROM file_transfers WHERE id = $1 AND user_id = $2 AND pay_status = $3',
      [parseInt(id), session.user.id, 'paid']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单不存在或未支付' }, { status: 400 });
    }

    const transfer = result.rows[0];

    if (transfer.file_key) {
      return NextResponse.json({ error: '文件已上传' }, { status: 400 });
    }

    const uploadCreds = await generateUploadCredentials(transfer.file_name);

    await db.query(
      'UPDATE file_transfers SET file_key = $1, oss_bucket = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [uploadCreds.key, uploadCreds.bucket, transfer.id]
    );

    return NextResponse.json({
      uploadUrl: uploadCreds.uploadUrl,
      fileKey: uploadCreds.key,
    });
  } catch (error) {
    console.error('Get upload credentials error:', error);
    return NextResponse.json({ error: '获取上传凭证失败' }, { status: 500 });
  }
}
