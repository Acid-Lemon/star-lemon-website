import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';
import { getPublicUrl } from '../../../../lib/oss';
import bcrypt from 'bcryptjs';

interface AdminUserRow {
  avatar: string | null;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const result = await db.query(
      'SELECT id, nickname, email, role, avatar, bio, birthday, qq_identifier, sl_coin, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    const rows = await Promise.all(
      result.rows.map(async (row: AdminUserRow) => ({
        ...row,
        avatar: await getPublicUrl(row.avatar),
      }))
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const email = body.email?.toString().trim().toLowerCase();
    const nickname = body.nickname?.toString().trim();
    const password = body.password?.toString();
    const role = body.role?.toString() || 'user';
    const coin = parseInt(body.sl_coin ?? 0, 10);

    if (!email || !nickname || !password) {
      return NextResponse.json({ error: '请填写邮箱、昵称和密码' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
    }

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: '无效的角色' }, { status: 400 });
    }

    if (Number.isNaN(coin) || coin < 0) {
      return NextResponse.json({ error: '无效的星柠币数量' }, { status: 400 });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (email, nickname, password, role, sl_coin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nickname, email, role, avatar, bio, birthday, qq_identifier, sl_coin, created_at, updated_at`,
      [email, nickname, hashedPassword, role, coin]
    );

    const user = result.rows[0] as AdminUserRow;
    return NextResponse.json({
      ...user,
      avatar: await getPublicUrl(user.avatar),
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: '新增用户失败' }, { status: 500 });
  }
}
