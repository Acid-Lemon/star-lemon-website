import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { loginUser } from '@/lib/auth';
import { migrate, insertDefaultSettings, isInitialized } from '@/lib/migrate';

export async function GET() {
  const initialized = await isInitialized();
  if (initialized) {
    return NextResponse.json({ initialized: true });
  }
  return NextResponse.json({ initialized: false });
}

export async function POST(request: NextRequest) {
  const initialized = await isInitialized();
  if (initialized) {
    return NextResponse.json({ error: '站点已初始化，无需再次设置' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const nickname = body.nickname?.toString();
    const email = body.email?.toString();
    const password = body.password?.toString();

    if (!nickname || !email || !password) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    }

    // Create tables and apply migrations
    await migrate();

    // Insert default settings
    await insertDefaultSettings();

    // Create admin account
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (nickname, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, nickname, email, role, avatar',
      [nickname, email, hashedPassword, 'admin']
    );

    const admin = result.rows[0];
    await loginUser({ id: admin.id, nickname: admin.nickname, email: admin.email, role: admin.role, avatar: admin.avatar });

    return NextResponse.json({ success: true, message: '站点初始化完成' });
  } catch (error) {
    console.error('Setup failed:', error);
    return NextResponse.json({ error: '初始化失败: ' + (error as Error).message }, { status: 500 });
  }
}