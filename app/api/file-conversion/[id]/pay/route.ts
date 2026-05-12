import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNativePayOrder } from '@/lib/lantu-pay';
import { getSetting } from '@/lib/settings';
import { calculateConversionPrice } from '@/lib/convert-price-calc';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await db.pool.connect();
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const conversionResult = await client.query(
      `SELECT fc.*, fco.id as order_id, fco.price, fco.status as order_status
       FROM file_conversions fc
       LEFT JOIN file_conversion_orders fco ON fco.conversion_id = fc.id
       WHERE fc.id = $1 AND fc.user_id = $2`,
      [parseInt(id), session.user.id]
    );

    if (conversionResult.rows.length === 0) {
      return NextResponse.json({ error: '转换记录不存在' }, { status: 400 });
    }

    const conversion = conversionResult.rows[0];

    if (conversion.status !== 'completed') {
      return NextResponse.json({ error: '文件尚未转换完成' }, { status: 400 });
    }

    if (conversion.order_status === 'paid') {
      return NextResponse.json({ paid: true });
    }

    const price = await calculateConversionPrice({ pageCount: conversion.page_count });

    if (conversion.order_id && conversion.order_status === 'unpaid') {
      // order exists, proceed to payment
    } else {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO file_conversion_orders (conversion_id, user_id, price, status)
         VALUES ($1, $2, $3, 'unpaid')`,
        [conversion.id, session.user.id, price]
      );
      await client.query('COMMIT');
    }

    const userResult = await client.query(
      'SELECT sl_coin FROM users WHERE id = $1 FOR UPDATE',
      [session.user.id]
    );

    if (userResult.rows.length > 0) {
      const userCoin = parseFloat(userResult.rows[0].sl_coin || '0');
      const coinNeeded = Math.ceil(price * 100);

      if (userCoin >= coinNeeded) {
        await client.query('BEGIN');
        await client.query(
          'UPDATE users SET sl_coin = sl_coin - $1 WHERE id = $2',
          [coinNeeded, session.user.id]
        );
        await client.query(
          `UPDATE file_conversion_orders
           SET status = 'paid', paid_at = NOW(), pay_order_no = 'COIN'
           WHERE conversion_id = $1`,
          [conversion.id]
        );
        await client.query('COMMIT');
        return NextResponse.json({ paid: true, coinUsed: coinNeeded });
      }
    }

    const siteUrl = await getSetting('site_url') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const notifyUrl = `${siteUrl}/api/file-conversion/pay-notify`;

    const outTradeNo = `FC${conversion.id}${Date.now()}`;
    const payResult = await createNativePayOrder({
      outTradeNo,
      totalFee: price.toString(),
      body: `文件转换 - ${conversion.file_name}`,
      notifyUrl,
      attach: conversion.id.toString(),
    });

    await client.query(
      `UPDATE file_conversion_orders SET pay_order_no = $1, out_trade_no = $2 WHERE conversion_id = $3`,
      [payResult.orderNo, outTradeNo, conversion.id]
    );

    return NextResponse.json({
      qrCodeUrl: payResult.qrCodeUrl,
      codeUrl: payResult.codeUrl,
      paid: false,
      price,
    });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Pay error:', error);
    return NextResponse.json({ error: error.message || '发起支付失败' }, { status: 500 });
  } finally {
    client.release();
  }
}
