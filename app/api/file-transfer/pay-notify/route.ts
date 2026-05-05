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

    console.log('Pay notify received:', JSON.stringify(params));

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

    const transferId = parseInt(attach);
    const transfer = await client.query(
      `SELECT ft.*, fto.price, fto.status as order_status
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1 AND fto.status = $2
       FOR UPDATE OF fto`,
      [transferId, 'unpaid']
    );

    if (transfer.rows.length === 0) {
      await client.query('COMMIT');
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const paidAmount = parseFloat(params.total_fee || '0');
    const expectedAmount = parseFloat(transfer.rows[0].price);

    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error('Amount mismatch:', paidAmount, expectedAmount);
      await client.query('COMMIT');
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const row = transfer.rows[0];

    await client.query(
      `UPDATE file_transfer_orders 
       SET status = 'paid', 
           pay_order_no = COALESCE($1, pay_order_no),
           out_trade_no = COALESCE($2, out_trade_no)
       WHERE transfer_id = $3`,
      [params.order_no || row.pay_order_no, params.out_trade_no, transferId]
    );

    await client.query('COMMIT');
    return new NextResponse('SUCCESS', { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Pay notify error:', error);
    return new NextResponse('FAIL', { status: 200 });
  } finally {
    client.release();
  }
}
