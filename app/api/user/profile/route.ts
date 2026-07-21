import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession, loginUser } from '../../../../lib/auth';
import { getPublicUrl } from '../../../../lib/oss';

// 获取当前用户信息
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const result = await db.query(
      'SELECT id, nickname, email, role, avatar, bio, birthday, qq_identifier, sl_coin, created_at FROM users WHERE id = $1',
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      ...row,
      avatar: await getPublicUrl(row.avatar),
    });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 });
  }
}

// 更新当前用户信息
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { nickname, avatar, bio, birthday } = body;

    if (!nickname || nickname.trim() === '') {
      return NextResponse.json({ error: '昵称不能为空' }, { status: 400 });
    }

    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length > 50) {
      return NextResponse.json({ error: '昵称不能超过50个字符' }, { status: 400 });
    }

    const trimmedBio = bio ? bio.trim() : null;
    if (trimmedBio && trimmedBio.length > 200) {
      return NextResponse.json({ error: '个性签名不能超过200个字符' }, { status: 400 });
    }

    // 更新用户信息
    const result = await db.query(
      `UPDATE users 
       SET nickname = $1, avatar = $2, bio = $3, birthday = $4, updated_at = NOW() 
       WHERE id = $5 
        RETURNING id, nickname, email, role, avatar, bio, birthday, qq_identifier, sl_coin, created_at`,
      [trimmedNickname, avatar || null, trimmedBio, birthday || null, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const updatedUser = result.rows[0];

    // 更新 session 中的用户信息
    await loginUser({
      id: updatedUser.id,
      nickname: updatedUser.nickname,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
