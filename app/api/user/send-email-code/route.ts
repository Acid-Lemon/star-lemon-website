import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';
import { sendVerificationCode, generateVerificationCode } from '../../../../lib/mail';

// 发送修改邮箱的验证码
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '请提供邮箱地址' }, { status: 400 });
    }

    // 检查是否和当前邮箱相同
    if (email === session.user.email) {
      return NextResponse.json({ error: '新邮箱不能与当前邮箱相同' }, { status: 400 });
    }

    // 检查邮箱是否已被其他用户使用
    const userResult = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, session.user.id]);
    if (userResult.rows.length > 0) {
      return NextResponse.json({ error: '该邮箱已被其他用户使用' }, { status: 400 });
    }

    // 生成验证码
    const code = generateVerificationCode();
    // 有效期 10 分钟
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 清除该邮箱之前的所有验证码，避免冲突
    await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);

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
