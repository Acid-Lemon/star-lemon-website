'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../components/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  RiArrowLeftLine,
  RiCoinLine,
  RiWechatPayLine,
  RiCheckLine,
  RiVipCrownLine,
  RiSparklingLine,
  RiStarLine,
  RiTrophyLine,
  RiDiamondLine,
  RiMedalLine,
  RiEditLine,
  RiFundsBoxLine,
} from '@remixicon/react';
import type { RechargeTier } from '@/lib/coin-recharge';
import { calcCustomCoin } from '@/lib/coin-recharge';

const tierIcons: Record<string, React.ReactNode> = {
  t1: <RiCoinLine className="w-6 h-6" />,
  t2: <RiStarLine className="w-6 h-6" />,
  t3: <RiSparklingLine className="w-6 h-6" />,
  t4: <RiVipCrownLine className="w-6 h-6" />,
  t5: <RiMedalLine className="w-6 h-6" />,
  t6: <RiDiamondLine className="w-6 h-6" />,
  t7: <RiTrophyLine className="w-6 h-6" />,
  custom: <RiEditLine className="w-6 h-6" />,
};

const tierColors: Record<string, string> = {
  t1: 'from-gray-100 to-gray-200 text-gray-700 dark:from-gray-800 dark:to-gray-700 dark:text-gray-300',
  t2: 'from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300',
  t3: 'from-green-50 to-green-100 text-green-700 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300',
  t4: 'from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300',
  t5: 'from-orange-50 to-orange-100 text-orange-700 dark:from-orange-900/30 dark:to-orange-800/30 dark:text-orange-300',
  t6: 'from-rose-50 to-rose-100 text-rose-700 dark:from-rose-900/30 dark:to-rose-800/30 dark:text-rose-300',
  t7: 'from-amber-50 to-amber-100 text-amber-700 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-300',
  custom: 'from-slate-50 to-slate-100 text-slate-700 dark:from-slate-900/30 dark:to-slate-800/30 dark:text-slate-300',
};

interface RechargeResult {
  priceYuan: number;
  coinAmount: number;
  bonusCoin: number;
}

export default function RechargePage() {
  const user = useUser();
  const [tiers, setTiers] = useState<RechargeTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [slCoin, setSlCoin] = useState<number>(user?.sl_coin || 0);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'paying' | 'success'>('select');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [outTradeNo, setOutTradeNo] = useState('');
  const [rechargeResult, setRechargeResult] = useState<RechargeResult | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/user/coin/recharge')
      .then((res) => res.json())
      .then((data) => {
        if (data.tiers) setTiers(data.tiers);
      })
      .catch(() => toast.error('获取充值档位失败'));
  }, []);

  useEffect(() => {
    if (user?.sl_coin !== undefined) {
      setSlCoin(user.sl_coin);
    }
  }, [user]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startPolling = useCallback((oto: string) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/user/coin/recharge/status?outTradeNo=${oto}`);
        const data = await res.json();
        if (data.paid) {
          stopPolling();
          setStep('success');
          setSlCoin((prev) => prev + (data.coinAmount || 0) + (data.bonusCoin || 0));
          toast.success(`充值成功！获得 ${(data.coinAmount || 0) + (data.bonusCoin || 0)} 星柠币`);
        }
      } catch {}
    }, 3000);
  }, [stopPolling]);

  const isCustom = selectedTier === 'custom';
  const customYuan = parseFloat(customAmount) || 0;
  const customCoin = calcCustomCoin(customYuan);
  const customValid = customYuan >= 0.01;

  const selectedTierData = tiers.find((t) => t.id === selectedTier);

  const displayPrice = isCustom ? customYuan : (selectedTierData?.priceYuan ?? 0);
  const displayCoin = isCustom ? customCoin : ((selectedTierData?.coinAmount ?? 0) + (selectedTierData?.bonusCoin ?? 0));

  const handleRecharge = async () => {
    if (!selectedTier) {
      toast.error('请选择充值档位');
      return;
    }
    if (!user) {
      toast.error('请先登录');
      return;
    }
    if (isCustom && !customValid) {
      toast.error('自定义金额最少0.01元');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string | number> = { tierId: selectedTier };
      if (isCustom) {
        payload.customAmount = customYuan;
      }

      const res = await fetch('/api/user/coin/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '发起充值失败');
        return;
      }

      setRechargeResult({
        priceYuan: data.priceYuan ?? displayPrice,
        coinAmount: data.coinAmount ?? (isCustom ? customCoin : (selectedTierData?.coinAmount ?? 0)),
        bonusCoin: data.bonusCoin ?? (selectedTierData?.bonusCoin ?? 0),
      });
      setQrCodeUrl(data.qrCodeUrl);
      setOutTradeNo(data.outTradeNo);
      setStep('paying');
      startPolling(data.outTradeNo);
    } catch {
      toast.error('发起充值失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPaid = async () => {
    if (!outTradeNo) return;
    try {
      const res = await fetch(`/api/user/coin/recharge/status?outTradeNo=${outTradeNo}`);
      const data = await res.json();
      if (data.paid) {
        stopPolling();
        setStep('success');
        setSlCoin((prev) => prev + (data.coinAmount || 0) + (data.bonusCoin || 0));
        toast.success(`充值成功！获得 ${(data.coinAmount || 0) + (data.bonusCoin || 0)} 星柠币`);
      } else {
        toast.info('尚未检测到支付，请完成扫码支付后重试');
      }
    } catch {
      toast.error('查询支付状态失败');
    }
  };

  const handleReset = () => {
    stopPolling();
    setStep('select');
    setSelectedTier(null);
    setCustomAmount('');
    setQrCodeUrl('');
    setOutTradeNo('');
    setRechargeResult(null);
  };

  if (step === 'success') {
    const result = rechargeResult;
    return (
      <div className="flex-1 flex flex-col items-center pt-16 pb-10 gap-8 px-4 w-full">
        <div className="w-full max-w-lg">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <RiArrowLeftLine className="w-4 h-4" />
            返回首页
          </Link>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <RiCheckLine className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>充值成功</CardTitle>
              <CardDescription>星柠币已到账，感谢您的支持</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">当前星柠币余额</p>
                <p className="text-4xl font-bold text-primary">{slCoin.toLocaleString()}</p>
              </div>
              {result && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付金额</span>
                    <span>¥{result.priceYuan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">基础星柠币</span>
                    <span>{result.coinAmount.toLocaleString()}</span>
                  </div>
                  {result.bonusCoin > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>赠送星柠币</span>
                      <span>+{result.bonusCoin.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>合计获得</span>
                    <span className="text-primary">{(result.coinAmount + result.bonusCoin).toLocaleString()} 星柠币</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  继续充值
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full">返回首页</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'paying') {
    const result = rechargeResult;
    return (
      <div className="flex-1 flex flex-col items-center pt-16 pb-10 gap-8 px-4 w-full">
        <div className="w-full max-w-lg">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <RiArrowLeftLine className="w-4 h-4" />
            返回首页
          </Link>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <RiWechatPayLine className="w-5 h-5 text-green-500" />
                微信扫码支付
              </CardTitle>
              <CardDescription>请使用微信扫描下方二维码完成支付</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                {qrCodeUrl && (
                  <div className="border rounded-lg p-3 bg-white">
                    <img src={qrCodeUrl} alt="支付二维码" width={200} height={200} />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-lg font-medium">¥{result?.priceYuan ?? displayPrice}</p>
                  <p className="text-xs text-muted-foreground">
                    获得 {result ? (result.coinAmount + result.bonusCoin) : displayCoin} 星柠币
                  </p>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckPaid}>
                我已支付
              </Button>
              <Button variant="outline" className="w-full" onClick={handleReset}>
                取消
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center pt-16 pb-10 gap-8 px-4 w-full">
      <div className="w-full max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <RiArrowLeftLine className="w-4 h-4" />
          返回首页
        </Link>

        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <RiFundsBoxLine className="w-8 h-8 text-primary" />
            星柠币充值
          </h1>
          <p className="text-muted-foreground">1 元 = 100 星柠币，充值越多优惠越多</p>
        </div>

        {user && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <RiCoinLine className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">当前余额</p>
                    <p className="text-xl font-bold">{slCoin.toLocaleString()} 星柠币</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {user.nickname}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="mb-6">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-3">请先登录后再进行充值</p>
              <Link href="/login">
                <Button>去登录</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                disabled={!user}
                className={`relative rounded-xl p-4 text-left transition-all duration-200 border-2 ${
                  isSelected
                    ? 'border-primary shadow-md scale-[1.02]'
                    : 'border-transparent hover:border-muted hover:shadow-sm'
                } bg-gradient-to-br ${tierColors[tier.id]} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {tier.tag && (
                  <Badge
                    variant="default"
                    className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground"
                  >
                    {tier.tag}
                  </Badge>
                )}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="opacity-80">{tierIcons[tier.id]}</div>
                  <div>
                    <p className="font-bold text-sm">{tier.name}</p>
                    {tier.custom ? (
                      <p className="text-xs opacity-70">自选金额</p>
                    ) : (
                      <p className="text-xs opacity-70">{tier.coinAmount.toLocaleString()} 星柠币</p>
                    )}
                  </div>
                  {tier.custom ? (
                    <div className="mt-1">
                      <span className="text-sm font-medium opacity-80">¥ 自定义</span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className="text-lg font-bold">¥{tier.priceYuan}</span>
                    </div>
                  )}
                  {!tier.custom && tier.bonusCoin > 0 && (
                    <p className="text-[10px] opacity-60">+{tier.bonusCoin} 赠送</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isCustom && (
          <Card className="mb-6 border-primary/30">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">¥</span>
                    <Input
                      type="number"
                      min="0.01"
                      max="99999"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0.01"
                      className="pl-8 text-lg font-medium"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">最少充值 0.01 元，1 元 = 100 星柠币</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary">
                    {customValid ? customCoin.toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">星柠币</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isCustom && selectedTierData && (
          <Card className="mb-6 border-primary/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">已选择：{selectedTierData.name}</p>
                  <p className="text-xs text-muted-foreground">
                    基础 {selectedTierData.coinAmount.toLocaleString()} 星柠币
                    {selectedTierData.bonusCoin > 0 && (
                      <span className="text-green-600"> + 赠送 {selectedTierData.bonusCoin.toLocaleString()} 星柠币</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {(selectedTierData.coinAmount + selectedTierData.bonusCoin).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">星柠币</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={!selectedTier || !user || loading || (isCustom && !customValid)}
          onClick={handleRecharge}
        >
          {loading ? '处理中...' : selectedTier ? '微信扫码支付' : '请选择充值档位'}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1 mt-6">
          <p>支付由蓝兔支付提供技术支持，安全有保障</p>
          <p>充值成功后星柠币将立即到账，如有问题请联系管理员</p>
        </div>
      </div>
    </div>
  );
}
