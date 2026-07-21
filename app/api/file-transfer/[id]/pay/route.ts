import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNativePayOrder } from '@/lib/lantu-pay';
import { getSetting } from '@/lib/settings';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await db.pool.connect();
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const result = await client.query(
      `SELECT ft.*, fto.price, fto.status, fto.id as order_id
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1 AND fto.status = $2 AND ft.user_id = $3`,
      [parseInt(id), 'unpaid', session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单不存在或已支付' }, { status: 400 });
    }

    const transfer = result.rows[0];
    const price = parseFloat(transfer.price);

    const coinNeeded = Math.ceil(price * 100);
    await client.query('BEGIN');
    const lockedOrder = await client.query(
      "SELECT id FROM file_transfer_orders WHERE id = $1 AND status = 'unpaid' FOR UPDATE",
      [transfer.order_id]
    );
    const coinDebit = lockedOrder.rows.length > 0
      ? await client.query(
          'UPDATE users SET sl_coin = sl_coin - $1 WHERE id = $2 AND sl_coin >= $1 RETURNING id',
          [coinNeeded, session.user.id]
        )
      : { rows: [] };

    if (lockedOrder.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ paid: true });
    }

    if (coinDebit.rows.length > 0) {

        await client.query(
          `UPDATE file_transfer_orders
           SET status = 'paid', paid_at = NOW(),
               pay_order_no = 'COIN-FT-' || id,
               out_trade_no = NULL
           WHERE id = $1`,
          [transfer.order_id]
        );

      await client.query('COMMIT');
      return NextResponse.json({ paid: true, coinUsed: coinNeeded });
    }
    await client.query('ROLLBACK');

    // 星柠币不足，走微信支付
    const siteUrl = await getSetting('site_url') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const notifyUrl = `${siteUrl}/api/file-transfer/pay-notify`;

    const outTradeNo = `FT${transfer.id}${Date.now()}`;
    const payResult = await createNativePayOrder({
      outTradeNo,
      totalFee: transfer.price.toString(),
      body: `文件快传 - ${transfer.file_name}`,
      notifyUrl,
      attach: transfer.id.toString(),
    });

    await client.query(
      'UPDATE file_transfer_orders SET pay_order_no = $1, out_trade_no = $2 WHERE transfer_id = $3',
      [payResult.orderNo, outTradeNo, transfer.id]
    );

    return NextResponse.json({
      qrCodeUrl: payResult.qrCodeUrl,
      codeUrl: payResult.codeUrl,
      paid: false,
    });
  } catch (error: unknown) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Pay error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '发起支付失败' }, { status: 500 });
  } finally {
    client.release();
  }
}
