import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { deleteFile } from '@/lib/oss';
import { calculatePrice } from '@/lib/price-calc';
import { refundPayOrder } from '@/lib/lantu-pay';
import { getSetting } from '@/lib/settings';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = await params;

    const result = await db.query(
      `SELECT ft.*, fto.price, fto.status, fto.pay_order_no, fto.out_trade_no
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1 AND ft.user_id = $2 AND fto.status = $3`,
      [parseInt(id), session.user.id, 'paid']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '文件不存在或不属于您' }, { status: 404 });
    }

    const transfer = result.rows[0];

    if (transfer.download_count >= transfer.max_downloads) {
      return NextResponse.json({ error: '下载次数已用完，无需退款' }, { status: 400 });
    }

    if (new Date(transfer.expire_at) < new Date()) {
      return NextResponse.json({ error: '文件已过期，无需退款' }, { status: 400 });
    }

    const remainingDownloads = transfer.max_downloads - transfer.download_count;
    const totalDays = transfer.retain_days;
    const createdAt = new Date(transfer.created_at);
    const now = new Date();
    const usedDays = Math.max(0, Math.ceil((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)));
    const remainingDays = Math.max(0, totalDays - usedDays);

    const originalPrice = parseFloat(transfer.price);

    const originalCalcPrice = await calculatePrice({
      fileSizeBytes: transfer.file_size,
      retainDays: totalDays,
      maxDownloads: transfer.max_downloads,
    });

    let refundAmount = 0;
    if (originalCalcPrice > 0) {
      const currentCalcPrice = await calculatePrice({
        fileSizeBytes: transfer.file_size,
        retainDays: remainingDays,
        maxDownloads: remainingDownloads,
      });
      refundAmount = Math.min(originalPrice, currentCalcPrice);
      refundAmount = Math.ceil(refundAmount * 100) / 100;
    }

    // Call refund API first
    if (transfer.out_trade_no && refundAmount > 0) {
      const siteUrl = await getSetting('site_url') || 'http://localhost:3000';
      try {
        await refundPayOrder({
          outTradeNo: transfer.out_trade_no,
          refundFee: refundAmount.toFixed(2),
          outRefundNo: `RF${transfer.id}${Date.now()}`,
          notifyUrl: `${siteUrl}/api/file-transfer/refund-notify`,
        });
      } catch (refundErr: any) {
        console.error('Refund API call failed:', refundErr.message);
        return NextResponse.json({ error: `退款失败: ${refundErr.message}` }, { status: 500 });
      }
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      if (refundAmount > 0) {
        await client.query(
          'UPDATE file_transfer_orders SET status = $1, refund_amount = $2 WHERE transfer_id = $3',
          ['refunding', refundAmount, transfer.id]
        );
      }

      await client.query('DELETE FROM file_transfers WHERE id = $1', [transfer.id]);

      if (transfer.file_key) {
        await deleteFile(transfer.file_key);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      refundAmount,
      message: refundAmount > 0
        ? `文件已删除，应退金额 ¥${refundAmount.toFixed(2)}（剩余 ${remainingDownloads} 次下载、${remainingDays} 天存储）`
        : '文件已删除，无退款金额',
    });
  } catch (error) {
    console.error('Delete file transfer error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
