import { getSettings } from './settings';

const DEFAULTS = {
  ft_storage_price: 0.12,
  ft_traffic_price: 0.15,
  ft_payment_fee: 0.6,
  ft_service_fee: 0.7,
  ft_profit_rate: 5,
};

export interface PriceParams {
  fileSizeBytes: number;
  retainDays: number;
  maxDownloads: number;
}

export async function calculatePrice(params: PriceParams): Promise<number> {
  const { fileSizeBytes, retainDays, maxDownloads } = params;

  const settings = await getSettings();

  const storagePrice = parseFloat(settings.ft_storage_price as string) || DEFAULTS.ft_storage_price;
  const trafficPrice = parseFloat(settings.ft_traffic_price as string) || DEFAULTS.ft_traffic_price;
  const paymentFee = parseFloat(settings.ft_payment_fee as string) || DEFAULTS.ft_payment_fee;
  const serviceFee = parseFloat(settings.ft_service_fee as string) || DEFAULTS.ft_service_fee;
  const profitRate = parseFloat(settings.ft_profit_rate as string) || DEFAULTS.ft_profit_rate;

  const sizeGB = fileSizeBytes / (1024 * 1024 * 1024);
  const retainMonths = retainDays / 30;

  const storageCost = sizeGB * storagePrice * retainMonths;
  const trafficCost = sizeGB * trafficPrice * maxDownloads;

  const totalCost = storageCost + trafficCost;

  const feeRate = (paymentFee + serviceFee) / 100;
  const profit = profitRate / 100;
  const denominator = 1 - feeRate - profit;

  if (denominator <= 0) return 0.01;

  const price = totalCost / denominator;

  return Math.max(0.01, Math.ceil(price * 100) / 100);
}
