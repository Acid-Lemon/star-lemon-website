import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import {
  abortTransferMultipartUpload,
  completeTransferMultipartUpload,
  generatePartUploadUrl,
  getFileSize,
  getTransferObjectKey,
  initTransferMultipartUpload,
} from '@/lib/oss';

async function getPaidTransfer(id: number, userId: number) {
  const result = await db.query(
    `SELECT ft.id, ft.file_name, ft.file_size, ft.file_key
     FROM file_transfers ft
     JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
     WHERE ft.id = $1 AND ft.user_id = $2 AND fto.status = 'paid'`,
    [id, userId]
  );

  return result.rows[0] ?? null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const transfer = await getPaidTransfer(parseInt(id), session.user.id);
    if (!transfer) {
      return NextResponse.json({ error: '订单不存在或未支付' }, { status: 400 });
    }
    if (transfer.file_key) {
      return NextResponse.json({ error: '文件已上传' }, { status: 409 });
    }

    const multipart = await initTransferMultipartUpload(transfer.id, transfer.file_name);
    return NextResponse.json({
      ...multipart,
      partSize: 8 * 1024 * 1024,
      concurrency: 32,
    });
  } catch (error) {
    console.error('Generate upload URL error:', error);
    return NextResponse.json({ error: '获取上传地址失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const transfer = await getPaidTransfer(parseInt(id), session.user.id);
    if (!transfer) {
      return NextResponse.json({ error: '订单不存在或未支付' }, { status: 400 });
    }
    if (transfer.file_key) {
      return NextResponse.json({ success: true, fileKey: transfer.file_key });
    }

    const body = await request.json().catch(() => ({}));
    if (body.action === 'complete') {
      if (typeof body.uploadId !== 'string' || !Array.isArray(body.parts) || body.parts.length === 0) {
        return NextResponse.json({ error: '分片上传参数无效' }, { status: 400 });
      }
      const parts: Array<{ number: number; etag: string }> = body.parts.map((part: { number?: unknown; etag?: unknown }) => ({
        number: Number(part.number),
        etag: String(part.etag || ''),
      }));
      if (parts.some((part) => !Number.isInteger(part.number) || part.number < 1 || !part.etag)) {
        return NextResponse.json({ error: '分片信息无效' }, { status: 400 });
      }
      const key = getTransferObjectKey(transfer.id, transfer.file_name);
      await completeTransferMultipartUpload(key, body.uploadId, parts);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'part') {
      const partNumber = Number(body.partNumber);
      if (typeof body.uploadId !== 'string' || !Number.isInteger(partNumber) || partNumber < 1) {
        return NextResponse.json({ error: '分片参数无效' }, { status: 400 });
      }
      const key = getTransferObjectKey(transfer.id, transfer.file_name);
      return NextResponse.json({ uploadUrl: await generatePartUploadUrl(key, body.uploadId, partNumber) });
    }

    const key = `file-transfer/${transfer.id}/${transfer.file_name}`;
    const uploadedSize = await getFileSize(key);
    if (!Number.isFinite(uploadedSize) || uploadedSize !== Number(transfer.file_size)) {
      return NextResponse.json({ error: '上传文件大小不完整，请重新上传' }, { status: 400 });
    }

    const updateResult = await db.query(
      `UPDATE file_transfers
       SET file_key = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND NULLIF(BTRIM(file_key), '') IS NULL
       RETURNING file_key`,
      [key, transfer.id]
    );

    const fileKey = updateResult.rows[0]?.file_key;
    if (!fileKey) {
      return NextResponse.json({ error: '保存文件信息失败，请重试' }, { status: 409 });
    }

    return NextResponse.json({ success: true, fileKey });
  } catch (error) {
    console.error('Confirm upload error:', error);
    return NextResponse.json({ error: '确认上传失败，请重试' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
    const transfer = await getPaidTransfer(parseInt(id), session.user.id);
    if (!transfer) return NextResponse.json({ error: '订单不存在或未支付' }, { status: 400 });
    const body = await request.json().catch(() => ({}));
    if (typeof body.uploadId === 'string') {
      await abortTransferMultipartUpload(getTransferObjectKey(transfer.id, transfer.file_name), body.uploadId);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abort upload error:', error);
    return NextResponse.json({ error: '终止上传失败' }, { status: 500 });
  }
}
