import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateDownloadUrl, deleteFile } from '@/lib/oss';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT ft.*, fto.status
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    const transfer = result.rows[0];

    if (transfer.status !== 'paid') {
      return NextResponse.json({ error: '该文件尚未完成支付' }, { status: 400 });
    }

    if (new Date(transfer.expire_at) < new Date()) {
      await deleteFile(transfer.file_key);
      await db.query('DELETE FROM file_transfers WHERE id = $1', [transfer.id]);
      return NextResponse.json({ error: '该文件已过期' }, { status: 400 });
    }

    if (transfer.download_count >= transfer.max_downloads) {
      await deleteFile(transfer.file_key);
      await db.query('DELETE FROM file_transfers WHERE id = $1', [transfer.id]);
      return NextResponse.json({ error: '下载次数已用完' }, { status: 400 });
    }

    const newCount = transfer.download_count + 1;
    const isLastDownload = newCount >= transfer.max_downloads;

    if (isLastDownload) {
      await db.query('DELETE FROM file_transfers WHERE id = $1', [transfer.id]);
      setTimeout(() => deleteFile(transfer.file_key), 60000);
    } else {
      await db.query(
        'UPDATE file_transfers SET download_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newCount, transfer.id]
      );
    }

    const downloadUrl = await generateDownloadUrl(transfer.file_key, transfer.file_name);

    return NextResponse.json({
      downloadUrl,
      fileName: transfer.file_name,
      remainingDownloads: isLastDownload ? 0 : transfer.max_downloads - newCount,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}
