import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const random = searchParams.get('random');

    if (random === '1') {
      const countResult = await db.query('SELECT COUNT(*) FROM hitokoto WHERE is_active = true');
      const count = parseInt(countResult.rows[0].count);
      if (count === 0) {
        return NextResponse.json(null);
      }
      const offset = Math.floor(Math.random() * count);
      const result = await db.query(
        'SELECT * FROM hitokoto WHERE is_active = true OFFSET $1 LIMIT 1',
        [offset]
      );
      return NextResponse.json(result.rows[0] || null);
    }

    const result = await db.query(
      'SELECT * FROM hitokoto ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch hitokoto:', error);
    return NextResponse.json({ error: 'Failed to fetch hitokoto' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: '没有权限' }, { status: 403 });
    }

    const body = await request.json();
    const { content, source, category, is_active } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO hitokoto (content, source, category, is_active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [content.trim(), source?.trim() || null, category || '其他', is_active !== false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create hitokoto:', error);
    return NextResponse.json({ error: 'Failed to create hitokoto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: '没有权限' }, { status: 403 });
    }

    const body = await request.json();
    const { id, content, source, category, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID 不能为空' }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE hitokoto 
       SET content = $1, source = $2, category = $3, is_active = $4, updated_at = NOW() 
       WHERE id = $5 
       RETURNING *`,
      [content.trim(), source?.trim() || null, category || '其他', is_active !== false, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '一言不存在' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update hitokoto:', error);
    return NextResponse.json({ error: 'Failed to update hitokoto' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: '没有权限' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID 不能为空' }, { status: 400 });
    }

    await db.query('DELETE FROM hitokoto WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete hitokoto:', error);
    return NextResponse.json({ error: 'Failed to delete hitokoto' }, { status: 500 });
  }
}
