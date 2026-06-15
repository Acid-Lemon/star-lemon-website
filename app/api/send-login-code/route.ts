import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendVerificationCode, generateVerificationCode } from '@/lib/mail';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(request: NextRequest) {
  try {
    const { email, captchaToken, captchaText } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '请提供邮箱地址' }, { status: 400 });
    }

    if (!await verifyCaptcha(captchaToken, captchaText)) {
      return NextResponse.json({ error: '图形验证码错误或已过期' }, { status: 400 });
    }

    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: '该邮箱未注册' }, { status: 400 });
    }

    const recentCount = await db.query(
      "SELECT COUNT(*) FROM verification_codes WHERE email = $1 AND created_at > NOW() - INTERVAL '1 minute'",
      [email]
    );
    if (parseInt(recentCount.rows[0].count) >= 1) {
      return NextResponse.json({ error: '发送过于频繁，请稍后再试' }, { status: 429 });
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);
    await db.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    await sendVerificationCode(email, code);

    return NextResponse.json({ success: true, message: '验证码发送成功' });
  } catch (error) {
    console.error('发送登录验证码失败:', error);
    return NextResponse.json({ error: '发送验证码失败，请稍后重试' }, { status: 500 });
  }
}
