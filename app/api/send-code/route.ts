import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { sendVerificationCode, generateVerificationCode } from '../../../lib/mail';
import { verifyCaptcha } from '../../../lib/captcha';

export async function POST(request: Request) {
  try {
    const { email, captchaToken, captchaText } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '请提供邮箱地址' }, { status: 400 });
    }

    if (!await verifyCaptcha(captchaToken, captchaText)) {
      return NextResponse.json({ error: '图形验证码错误或已过期' }, { status: 400 });
    }

    // 检查邮箱是否已注册
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
    }

    // 生成验证码
    const code = generateVerificationCode();
    // 有效期 10 分钟
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 保存验证码到 verification_codes 表
    await db.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    // 发送邮件
    await sendVerificationCode(email, code);

    return NextResponse.json({ success: true, message: '验证码发送成功' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json({ error: '发送验证码失败，请稍后重试' }, { status: 500 });
  }
}
