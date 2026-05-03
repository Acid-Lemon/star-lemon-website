import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const code = formData.get('code')?.toString();
    const returnUrl = formData.get('returnUrl')?.toString() || '/';

    if (!email || !code) {
      return NextResponse.json({ error: '请输入邮箱和验证码' }, { status: 400 });
    }

    const codeResult = await db.query(
      'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (codeResult.rows.length === 0) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 });
    }

    await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: '该邮箱未注册' }, { status: 400 });
    }

    const user = userResult.rows[0];
    await loginUser({ id: user.id, nickname: user.nickname, email: user.email, role: user.role, avatar: user.avatar });

    return NextResponse.json({ success: true, returnUrl });
  } catch (error) {
    console.error('Code login error:', error);
    return NextResponse.json({ error: '登录失败，请重试' }, { status: 500 });
  }
}
