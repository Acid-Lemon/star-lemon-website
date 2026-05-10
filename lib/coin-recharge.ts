export interface RechargeTier {
  id: string;
  name: string;
  priceYuan: number;
  coinAmount: number;
  bonusCoin: number;
  tag?: string;
  custom?: boolean;
}

export const RECHARGE_TIERS: RechargeTier[] = [
  { id: 't1', name: '入门档', priceYuan: 1, coinAmount: 100, bonusCoin: 0 },
  { id: 't2', name: '小充档', priceYuan: 5, coinAmount: 500, bonusCoin: 0 },
  { id: 't3', name: '标准档', priceYuan: 10, coinAmount: 1000, bonusCoin: 50, tag: '送50' },
  { id: 't4', name: '进阶档', priceYuan: 30, coinAmount: 3000, bonusCoin: 200, tag: '送200' },
  { id: 't5', name: '豪华档', priceYuan: 50, coinAmount: 5000, bonusCoin: 500, tag: '送500' },
  { id: 't6', name: '至尊档', priceYuan: 100, coinAmount: 10000, bonusCoin: 1500, tag: '送1500' },
  { id: 't7', name: '土豪档', priceYuan: 200, coinAmount: 20000, bonusCoin: 4000, tag: '送4000' },
  { id: 'custom', name: '自定义', priceYuan: 0, coinAmount: 0, bonusCoin: 0, custom: true },
];

export function getTierById(id: string): RechargeTier | undefined {
  return RECHARGE_TIERS.find((t) => t.id === id);
}

export function getTotalCoin(tier: RechargeTier): number {
  return tier.coinAmount + tier.bonusCoin;
}

export function calcCustomCoin(yuan: number): number {
  return Math.floor(yuan * 100);
}
