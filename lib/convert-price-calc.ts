const DEFAULTS = {
  fc_price_per_file: 0.01,
  fc_payment_fee: 0.6,
  fc_service_fee: 0.7,
  fc_profit_rate: 5,
};

export interface ConversionPriceParams {
  pageCount: number;
  srcFormat?: string;
  dstFormat?: string;
}

export async function calculateConversionPrice(params: ConversionPriceParams): Promise<number> {
  void params;
  const settings = await (await import('./settings')).getSettings();

  const perFile = parseFloat(settings.fc_price_per_file as string) || DEFAULTS.fc_price_per_file;
  const paymentFee = parseFloat(settings.fc_payment_fee as string) || DEFAULTS.fc_payment_fee;
  const serviceFee = parseFloat(settings.fc_service_fee as string) || DEFAULTS.fc_service_fee;
  const profitRate = parseFloat(settings.fc_profit_rate as string) || DEFAULTS.fc_profit_rate;

  const feeRate = (paymentFee + serviceFee) / 100;
  const profit = profitRate / 100;
  const denominator = 1 - feeRate - profit;

  if (denominator <= 0) return 0.01;

  const price = perFile / denominator;

  return Math.max(0.01, Math.ceil(price * 100) / 100);
}
