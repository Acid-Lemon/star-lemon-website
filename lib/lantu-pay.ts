import crypto from 'crypto';
import { getSettings } from './settings';

function createSign(params: Record<string, string>, key: string): string {
  const sortedKeys = Object.keys(params).filter(k => params[k] !== '' && params[k] !== undefined).sort();
  const stringArr = sortedKeys.map(k => `${k}=${params[k]}`);
  stringArr.push(`key=${key}`);
  const string = stringArr.join('&');
  return crypto.createHash('md5').update(string).digest('hex').toUpperCase();
}

export async function createNativePayOrder(params: {
  outTradeNo: string;
  totalFee: string;
  body: string;
  notifyUrl: string;
  attach?: string;
}): Promise<{ codeUrl: string; qrCodeUrl: string; orderNo: string }> {
  const settings = await getSettings();
  const mchId = settings.lantu_mch_id;
  const key = settings.lantu_key;

  if (!mchId || !key) {
    throw new Error('蓝兔支付未配置，请在管理后台全局配置中填写商户号和密钥');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signParams: Record<string, string> = {
    mch_id: mchId as string,
    out_trade_no: params.outTradeNo,
    total_fee: params.totalFee,
    body: params.body,
    timestamp,
    notify_url: params.notifyUrl,
  };

  const sign = createSign(signParams, key);

  const formData = new URLSearchParams();
  formData.append('mch_id', mchId as string);
  formData.append('out_trade_no', params.outTradeNo);
  formData.append('total_fee', params.totalFee);
  formData.append('body', params.body);
  formData.append('timestamp', timestamp);
  formData.append('notify_url', params.notifyUrl);
  formData.append('sign', sign);
  if (params.attach) {
    formData.append('attach', params.attach);
  }

  console.log('Lantu native pay request:', formData.toString());

  const response = await fetch('https://api.ltzf.cn/api/wxpay/native', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const result = await response.json();
  console.log('Lantu native pay response:', JSON.stringify(result));

  if (result.code !== 0) {
    throw new Error(`蓝兔支付错误: ${result.msg || '未知错误'} (code: ${result.code})`);
  }

  return {
    codeUrl: result.data?.code_url || '',
    qrCodeUrl: result.data?.QRcode_url || '',
    orderNo: result.data?.order_no || '',
  };
}

export async function queryPayOrder(outTradeNo: string): Promise<{ paid: boolean; orderNo?: string }> {
  const settings = await getSettings();
  const mchId = settings.lantu_mch_id;
  const key = settings.lantu_key;

  if (!mchId || !key) {
    return { paid: false };
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signParams: Record<string, string> = {
    mch_id: mchId as string,
    out_trade_no: outTradeNo,
    timestamp,
  };

  const sign = createSign(signParams, key);

  const formData = new URLSearchParams();
  formData.append('mch_id', mchId as string);
  formData.append('out_trade_no', outTradeNo);
  formData.append('timestamp', timestamp);
  formData.append('sign', sign);

  try {
    const response = await fetch('https://api.ltzf.cn/api/wxpay/get_pay_order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result.code === 0 && result.data?.trade_state === 'SUCCESS') {
      return { paid: true, orderNo: result.data?.order_no };
    }

    return { paid: false };
  } catch {
    return { paid: false };
  }
}

export async function verifyPayNotify(params: Record<string, string>): Promise<boolean> {
  const settings = await getSettings();
  const key = settings.lantu_key;
  if (!key) return false;

  const sign = params.sign;
  if (!sign) return false;

  const signFields = ['code', 'timestamp', 'mch_id', 'order_no', 'out_trade_no', 'pay_no', 'total_fee'];
  const filtered: Record<string, string> = {};
  for (const field of signFields) {
    if (params[field] !== undefined && params[field] !== '') {
      filtered[field] = params[field];
    }
  }

  const expectedSign = createSign(filtered, key as string);
  console.log('Verify sign - params:', JSON.stringify(filtered), 'expected:', expectedSign, 'actual:', sign);
  return sign === expectedSign;
}

export async function refundPayOrder(params: {
  outTradeNo: string;
  refundFee: string;
  outRefundNo: string;
  notifyUrl: string;
}): Promise<{ success: boolean }> {
  const settings = await getSettings();
  const mchId = settings.lantu_mch_id;
  const key = settings.lantu_key;

  if (!mchId || !key) {
    throw new Error('蓝兔支付未配置');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signParams: Record<string, string> = {
    mch_id: mchId as string,
    out_trade_no: params.outTradeNo,
    out_refund_no: params.outRefundNo,
    refund_fee: params.refundFee,
    notify_url: params.notifyUrl,
    timestamp,
  };

  const sign = createSign(signParams, key);

  const formData = new URLSearchParams();
  formData.append('mch_id', mchId as string);
  formData.append('out_trade_no', params.outTradeNo);
  formData.append('out_refund_no', params.outRefundNo);
  formData.append('refund_fee', params.refundFee);
  formData.append('notify_url', params.notifyUrl);
  formData.append('timestamp', timestamp);
  formData.append('sign', sign);

  console.log('Lantu refund request:', formData.toString());

  const response = await fetch('https://api.ltzf.cn/api/wxpay/refund_order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const result = await response.json();
  console.log('Lantu refund response:', JSON.stringify(result));

  if (result.code !== 0) {
    throw new Error(`退款失败: ${result.msg || '未知错误'} (code: ${result.code})`);
  }

  return { success: true };
}
