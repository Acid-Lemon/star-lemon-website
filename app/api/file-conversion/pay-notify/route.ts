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

    console.log('File conversion pay notify received:', JSON.stringify(params));

    const isValid = await verifyPayNotify(params);
    if (!isValid) {
      console.error('Pay notify signature verification failed');
      return new NextResponse('FAIL', { status: 200 });
    }

    if (params.code !== '0') {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const attach = params.attach;
    if (!attach) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    await client.query('BEGIN');

    const conversionId = parseInt(attach);
    const conversion = await client.query(
      `SELECT fc.*, fco.price, fco.status as order_status
       FROM file_conversions fc
       JOIN file_conversion_orders fco ON fco.conversion_id = fc.id
       WHERE fc.id = $1 AND fco.status = $2
       FOR UPDATE OF fco`,
      [conversionId, 'unpaid']
    );

    if (conversion.rows.length === 0) {
      await client.query('COMMIT');
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const paidAmount = parseFloat(params.total_fee || '0');
    const expectedAmount = parseFloat(conversion.rows[0].price);

    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error('Amount mismatch:', paidAmount, expectedAmount);
      await client.query('COMMIT');
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const row = conversion.rows[0];

    await client.query(
      `UPDATE file_conversion_orders
       SET status = 'paid',
           pay_order_no = COALESCE($1, pay_order_no),
           out_trade_no = COALESCE($2, out_trade_no)
       WHERE conversion_id = $3`,
      [params.order_no || row.pay_order_no, params.out_trade_no, conversionId]
    );

    await client.query('COMMIT');
    return new NextResponse('SUCCESS', { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('File conversion pay notify error:', error);
    return new NextResponse('FAIL', { status: 200 });
  } finally {
    client.release();
  }
}
