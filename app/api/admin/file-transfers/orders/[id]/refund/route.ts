import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { refundPayOrder } from '@/lib/lantu-pay';
import { getSetting } from '@/lib/settings';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const orderId = Number((await params).id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) return NextResponse.json({ error: '订单无效' }, { status: 400 });

  const result = await db.query(
    `SELECT fto.*, ft.file_key FROM file_transfer_orders fto
     LEFT JOIN file_transfers ft ON ft.id = fto.transfer_id
     WHERE fto.id = $1 AND fto.status = 'paid'`,
    [orderId]
  );
  const order = result.rows[0];
  if (!order) return NextResponse.json({ error: '订单不存在或已处理' }, { status: 404 });

  const refundAmount = Number(order.price);
  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    return NextResponse.json({ error: '订单金额无效' }, { status: 400 });
  }
  const isCoinPay = !order.out_trade_no;

  if (!isCoinPay) {
    try {
      const siteUrl = await getSetting('site_url') || 'http://localhost:3000';
      await refundPayOrder({
        outTradeNo: order.out_trade_no,
        refundFee: refundAmount.toFixed(2),
        outRefundNo: `RF${order.id}${Date.now()}`,
        notifyUrl: `${siteUrl}/api/file-transfer/refund-notify`,
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : '退款失败' }, { status: 502 });
    }
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    if (isCoinPay) {
      await client.query('UPDATE users SET sl_coin = COALESCE(sl_coin, 0) + $1 WHERE id = $2', [Math.floor(refundAmount * 100), order.user_id]);
    }
    await client.query(
      `UPDATE file_transfer_orders SET status = $1, refund_amount = $2 WHERE id = $3`,
      [isCoinPay ? 'refunded' : 'refunding', refundAmount, order.id]
    );
    if (order.transfer_id) await client.query('DELETE FROM file_transfers WHERE id = $1', [order.transfer_id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return NextResponse.json({ success: true, status: isCoinPay ? 'refunded' : 'refunding', refundAmount });
}
