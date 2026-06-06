import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { getSession } from '../../../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nickname, role, password, sl_coin } = body;

    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (nickname !== undefined) {
      updates.push(`nickname = $${paramIndex++}`);
      values.push(nickname.trim());
    }

    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        return NextResponse.json({ error: '无效的角色' }, { status: 400 });
      }
      if (String(session.user.id) === id && role !== 'admin') {
        return NextResponse.json({ error: '不能取消自己的管理员权限' }, { status: 400 });
      }
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (password !== undefined && password) {
      if (password.length < 6) {
        return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (sl_coin !== undefined) {
      const coin = parseInt(sl_coin, 10);
      if (isNaN(coin) || coin < 0) {
        return NextResponse.json({ error: '无效的星柠币数量' }, { status: 400 });
      }
      updates.push(`sl_coin = $${paramIndex++}`);
      values.push(coin);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: '没有需要更新的字段' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, nickname, email, role, avatar, bio, birthday, qq_identifier, sl_coin, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const { id } = await params;

    if (String(session.user.id) === id) {
      return NextResponse.json({ error: '不能删除自己' }, { status: 400 });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
