import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateDownloadUrl, deleteFile } from '@/lib/oss';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await db.pool.connect();
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (typeof body.code !== 'string' || !/^\d{6}$/.test(body.code)) {
      return NextResponse.json({ error: '取件码无效' }, { status: 400 });
    }

    await client.query('BEGIN');
    const result = await client.query(
      `SELECT ft.*, fto.status
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1 AND ft.code = $2
       FOR UPDATE OF ft`,
      [parseInt(id), body.code]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    const transfer = result.rows[0];
    if (transfer.status !== 'paid') {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: '该文件尚未完成支付' }, { status: 400 });
    }
    if (new Date(transfer.expire_at) < new Date() || transfer.download_count >= transfer.max_downloads) {
      await client.query('DELETE FROM file_transfers WHERE id = $1', [transfer.id]);
      await client.query('COMMIT');
      await deleteFile(transfer.file_key);
      return NextResponse.json({ error: '该文件已过期或下载次数已用完' }, { status: 400 });
    }

    const newCount = transfer.download_count + 1;
    const isLastDownload = newCount >= transfer.max_downloads;
    const downloadUrl = await generateDownloadUrl(transfer.file_key, transfer.file_name);
    if (isLastDownload) {
      await client.query('DELETE FROM file_transfers WHERE id = $1', [transfer.id]);
    } else {
      await client.query(
        'UPDATE file_transfers SET download_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newCount, transfer.id]
      );
    }
    await client.query('COMMIT');
    if (isLastDownload) setTimeout(() => deleteFile(transfer.file_key), 60000);

    return NextResponse.json({
      downloadUrl,
      fileName: transfer.file_name,
      remainingDownloads: isLastDownload ? 0 : transfer.max_downloads - newCount,
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Download error:', error);
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  } finally {
    client.release();
  }
}
