import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNativePayOrder } from '@/lib/lantu-pay';
import { getSetting } from '@/lib/settings';
import { RECHARGE_TIERS, getTierById, getTotalCoin, calcCustomCoin } from '@/lib/coin-recharge';

export async function GET() {
  return NextResponse.json({ tiers: RECHARGE_TIERS });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { tierId, customAmount } = body;

    const tier = getTierById(tierId);
    if (!tier) {
      return NextResponse.json({ error: '无效的充值档位' }, { status: 400 });
    }

    let priceYuan: number;
    let coinAmount: number;
    let bonusCoin: number;
    let displayName: string;

    if (tier.custom) {
      const amount = parseFloat(customAmount);
      if (!amount || isNaN(amount) || amount < 0.01) {
        return NextResponse.json({ error: '自定义金额最少0.01元' }, { status: 400 });
      }
      if (amount > 99999) {
        return NextResponse.json({ error: '单次充值金额不能超过99999元' }, { status: 400 });
      }
      priceYuan = Math.round(amount * 100) / 100;
      coinAmount = calcCustomCoin(priceYuan);
      bonusCoin = 0;
      displayName = `自定义 ¥${priceYuan}`;
    } else {
      priceYuan = tier.priceYuan;
      coinAmount = tier.coinAmount;
      bonusCoin = tier.bonusCoin;
      displayName = tier.name;
    }

    const siteUrl = (await getSetting('site_url')) || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const notifyUrl = `${siteUrl}/api/sl-coin/pay-notify`;
    const outTradeNo = `SL${session.user.id}${Date.now()}`;

    const payResult = await createNativePayOrder({
      outTradeNo,
      totalFee: priceYuan.toFixed(2),
      body: `星柠币充值 - ${displayName}`,
      notifyUrl,
      attach: JSON.stringify({ userId: session.user.id, tierId, coin: coinAmount + bonusCoin }),
    });

    await db.query(
      `INSERT INTO coin_recharge_orders (user_id, tier_id, price_yuan, coin_amount, bonus_coin, out_trade_no, pay_order_no, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'unpaid')`,
      [session.user.id, tierId, priceYuan, coinAmount, bonusCoin, outTradeNo, payResult.orderNo]
    );

    return NextResponse.json({
      qrCodeUrl: payResult.qrCodeUrl,
      codeUrl: payResult.codeUrl,
      outTradeNo,
      priceYuan,
      coinAmount,
      bonusCoin,
    });
  } catch (error: any) {
    console.error('Coin recharge error:', error);
    return NextResponse.json({ error: error.message || '发起充值失败' }, { status: 500 });
  }
}
