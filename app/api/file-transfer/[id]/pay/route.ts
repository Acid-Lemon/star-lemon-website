import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createNativePayOrder } from '@/lib/lantu-pay';
import { getSetting } from '@/lib/settings';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT ft.*, fto.price, fto.status
       FROM file_transfers ft
       JOIN file_transfer_orders fto ON fto.transfer_id = ft.id
       WHERE ft.id = $1 AND fto.status = $2`,
      [parseInt(id), 'unpaid']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单不存在或已支付' }, { status: 400 });
    }

    const transfer = result.rows[0];
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

    await db.query(
      'UPDATE file_transfer_orders SET pay_order_no = $1, out_trade_no = $2 WHERE transfer_id = $3',
      [payResult.orderNo, outTradeNo, transfer.id]
    );

    return NextResponse.json({
      qrCodeUrl: payResult.qrCodeUrl,
      codeUrl: payResult.codeUrl,
    });
  } catch (error: any) {
    console.error('Pay error:', error);
    return NextResponse.json({ error: error.message || '发起支付失败' }, { status: 500 });
  }
}
