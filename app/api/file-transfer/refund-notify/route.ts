import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPayNotify } from '@/lib/lantu-pay';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const searchParams = new URLSearchParams(text);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('Refund notify received:', JSON.stringify(params));

    const isValid = await verifyPayNotify(params);
    if (!isValid) {
      console.error('Refund notify signature verification failed');
      return new NextResponse('FAIL', { status: 200 });
    }

    if (params.code !== '0') {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const outRefundNo = params.out_refund_no;
    if (!outRefundNo) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    await db.query(
      `UPDATE file_transfer_orders
       SET status = 'refunded'
       WHERE out_trade_no = $1 AND status = 'refunding'`,
      [params.out_trade_no]
    );

    return new NextResponse('SUCCESS', { status: 200 });
  } catch (error) {
    console.error('Refund notify error:', error);
    return new NextResponse('FAIL', { status: 200 });
  }
}
