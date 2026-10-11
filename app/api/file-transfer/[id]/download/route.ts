import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateDownloadUrl } from '@/lib/oss';

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
      // 记录和 OSS 对象均不在此处删除，统一交由定时清理任务处理（带宽限期），
      // 避免删除后进程崩溃产生不可恢复的孤儿文件
      await client.query('ROLLBACK');
      return NextResponse.json({ error: '该文件已过期或下载次数已用完' }, { status: 400 });
    }

    const newCount = transfer.download_count + 1;
    const isLastDownload = newCount >= transfer.max_downloads;
    const downloadUrl = await generateDownloadUrl(transfer.file_key, transfer.file_name);

    // 最后一次下载也只更新计数：记录保留，由定时清理在宽限期后删除记录与 OSS 对象，
    // 确保下载 URL 在有效期内（及传输过程中）文件仍然存在
    await client.query(
      'UPDATE file_transfers SET download_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newCount, transfer.id]
    );
    await client.query('COMMIT');

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
