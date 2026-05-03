import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession, loginUser } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

// 修改密码或邮箱
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'password') {
      const { newPassword } = body;

      if (!newPassword) {
        return NextResponse.json({ error: '请填写新密码' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: '新密码至少 6 位' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, session.user.id]);

      return NextResponse.json({ success: true, message: '密码修改成功' });

    } else if (action === 'email') {
      // 修改邮箱
      const { newEmail, code } = body;

      if (!newEmail || !code) {
        return NextResponse.json({ error: '请填写完整信息' }, { status: 400 });
      }

      // 验证验证码
      const codeResult = await db.query(
        'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [newEmail, code]
      );

      if (codeResult.rows.length === 0) {
        return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 });
      }

      // 检查邮箱是否已被其他用户使用
      const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, session.user.id]);
      if (emailCheck.rows.length > 0) {
        return NextResponse.json({ error: '该邮箱已被其他用户使用' }, { status: 400 });
      }

      // 更新邮箱
      const updateResult = await db.query(
        'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nickname, email, role, avatar',
        [newEmail, session.user.id]
      );

      if (updateResult.rows.length === 0) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }

      // 清除已使用的验证码
      await db.query('DELETE FROM verification_codes WHERE email = $1', [newEmail]);

      // 更新 session
      const updatedUser = updateResult.rows[0];
      await loginUser({
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      });

      return NextResponse.json({ success: true, message: '邮箱修改成功' });

    } else {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

  } catch (error) {
    console.error('Failed to update security settings:', error);
    return NextResponse.json({ error: '操作失败，请稍后重试' }, { status: 500 });
  }
}
