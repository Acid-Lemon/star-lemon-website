import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';

// 获取图形验证码（SVG 图片 + 签名 token）
export async function GET() {
  const { svg, token } = await generateCaptcha();
  return NextResponse.json({ svg, token });
}
