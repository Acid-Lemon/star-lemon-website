import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const outTradeNo = searchParams.get('outTradeNo');

    if (!outTradeNo) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
    }

    const result = await db.query(
      `SELECT status, coin_amount, bonus_coin FROM coin_recharge_orders WHERE out_trade_no = $1 AND user_id = $2`,
      [outTradeNo, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    const order = result.rows[0];
    return NextResponse.json({
      paid: order.status === 'paid',
      coinAmount: order.coin_amount,
      bonusCoin: order.bonus_coin,
    });
  } catch (error) {
    console.error('Check recharge status error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
