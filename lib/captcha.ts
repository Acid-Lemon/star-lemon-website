import svgCaptcha from 'svg-captcha';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'star-lemon-secret-key-182566';
const key = new TextEncoder().encode(secretKey);

// 图形验证码有效期：5 分钟
const CAPTCHA_TTL = '5m';

export interface CaptchaResult {
  // SVG 图片字符串，前端直接渲染
  svg: string;
  // 签名 token，存放验证码答案（HMAC 签名，无状态）
  token: string;
}

// 生成图形验证码：返回 SVG 图片和一个携带答案的签名 token
export async function generateCaptcha(): Promise<CaptchaResult> {
  const captcha = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: false,
    ignoreChars: '0o1ilI', // 去掉易混淆字符
    width: 120,
    height: 40,
  });

  const token = await new SignJWT({ text: captcha.text.toLowerCase() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(CAPTCHA_TTL)
    .sign(key);

  return { svg: captcha.data, token };
}

// 校验图形验证码：成功返回 true。验证码不区分大小写。
export async function verifyCaptcha(token: string | undefined, input: string | undefined): Promise<boolean> {
  if (!token || !input) return false;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return typeof payload.text === 'string' && payload.text === input.trim().toLowerCase();
  } catch {
    return false;
  }
}
