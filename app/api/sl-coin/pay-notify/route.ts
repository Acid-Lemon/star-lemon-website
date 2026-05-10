import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPayNotify } from '@/lib/lantu-pay';

export async function POST(request: NextRequest) {
  const client = await db.pool.connect();
  try {
    const text = await request.text();
    const searchParams = new URLSearchParams(text);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('Coin recharge notify received:', JSON.stringify(params));

    const isValid = await verifyPayNotify(params);
    if (!isValid) {
      console.error('Coin recharge notify signature verification failed');
      return new NextResponse('FAIL', { status: 200 });
    }

    if (params.code !== '0') {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const attach = params.attach;
    if (!attach) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    let attachData: { userId?: number; tierId?: string; coin?: number } = {};
    try {
      attachData = JSON.parse(attach);
    } catch {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const { userId, coin } = attachData;
    if (!userId || !coin) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    await client.query('BEGIN');

    const outTradeNo = params.out_trade_no;
    const orderResult = await client.query(
      `SELECT * FROM coin_recharge_orders WHERE out_trade_no = $1 AND status = 'unpaid' FOR UPDATE`,
      [outTradeNo]
    );

    if (orderResult.rows.length === 0) {
      await client.query('COMMIT');
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const order = orderResult.rows[0];
    const paidAmount = parseFloat(params.total_fee || '0');
    const expectedAmount = parseFloat(order.price_yuan);

    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error('Coin recharge amount mismatch:', paidAmount, expectedAmount);
      await client.query('COMMIT');
      return new NextResponse('SUCCESS', { status: 200 });
    }

    await client.query(
      `UPDATE coin_recharge_orders
       SET status = 'paid', pay_order_no = COALESCE($1, pay_order_no), paid_at = NOW()
       WHERE out_trade_no = $2`,
      [params.order_no || order.pay_order_no, outTradeNo]
    );

    await client.query(
      `UPDATE users SET sl_coin = COALESCE(sl_coin, 0) + $1 WHERE id = $2`,
      [coin, userId]
    );

    await client.query('COMMIT');
    return new NextResponse('SUCCESS', { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Coin recharge notify error:', error);
    return new NextResponse('FAIL', { status: 200 });
  } finally {
    client.release();
  }
}
