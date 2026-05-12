const DEFAULTS = {
  fc_price_per_page: 0.1,
  fc_payment_fee: 0.6,
  fc_service_fee: 0.7,
  fc_profit_rate: 5,
};

export interface ConversionPriceParams {
  pageCount: number;
}

export async function calculateConversionPrice(params: ConversionPriceParams): Promise<number> {
  const { pageCount } = params;

  if (pageCount <= 0) return 0;

  const settings = await (await import('./settings')).getSettings();

  const pricePerPage = parseFloat(settings.fc_price_per_page as string) || DEFAULTS.fc_price_per_page;
  const paymentFee = parseFloat(settings.fc_payment_fee as string) || DEFAULTS.fc_payment_fee;
  const serviceFee = parseFloat(settings.fc_service_fee as string) || DEFAULTS.fc_service_fee;
  const profitRate = parseFloat(settings.fc_profit_rate as string) || DEFAULTS.fc_profit_rate;

  const basePrice = pageCount * pricePerPage;

  const feeRate = (paymentFee + serviceFee) / 100;
  const profit = profitRate / 100;
  const denominator = 1 - feeRate - profit;

  if (denominator <= 0) return 0.01;

  const price = basePrice / denominator;

  return Math.max(0.01, Math.ceil(price * 100) / 100);
}
