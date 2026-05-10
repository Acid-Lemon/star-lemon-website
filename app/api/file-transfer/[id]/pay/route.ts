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

    const result = await client.query(
      `SELECT ft.*, fto.price, fto.status, fto.id as order_id
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1 AND fto.status = $2`,
      [parseInt(id), 'unpaid']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单不存在或已支付' }, { status: 400 });
    }

    // 未登录不允许使用
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const transfer = result.rows[0];
    const price = parseFloat(transfer.price);

    // 尝试用星柠币抵扣
    const userResult = await client.query(
      'SELECT sl_coin FROM users WHERE id = $1 FOR UPDATE',
      [session.user.id]
    );

    if (userResult.rows.length > 0) {
      const userCoin = parseFloat(userResult.rows[0].sl_coin || '0');
      // 1星柠币 = 0.01元，所以价格(元) * 100 = 所需星柠币
      const coinNeeded = Math.ceil(price * 100);

      if (userCoin >= coinNeeded) {
        // 星柠币足够，直接抵扣
        await client.query('BEGIN');

        await client.query(
          'UPDATE users SET sl_coin = sl_coin - $1 WHERE id = $2',
          [coinNeeded, session.user.id]
        );

        await client.query(
          `UPDATE file_transfer_orders
           SET status = 'paid', paid_at = NOW(), pay_order_no = 'COIN'
           WHERE id = $1`,
          [transfer.order_id]
        );

        await client.query('COMMIT');

        return NextResponse.json({ paid: true, coinUsed: coinNeeded });
      }
    }

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
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Pay error:', error);
    return NextResponse.json({ error: error.message || '发起支付失败' }, { status: 500 });
  } finally {
    client.release();
  }
}
