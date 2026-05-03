import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';

// 获取单个时间轴项目
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.query('SELECT * FROM timeline WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Timeline item not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch timeline item:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline item' }, { status: 500 });
  }
}

// 更新时间轴项目
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { date, title, description, type, sort_order, is_active } = body;

    const result = await db.query(
      `UPDATE timeline 
       SET date = $1, title = $2, description = $3, type = $4, sort_order = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [date, title, description, type, sort_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Timeline item not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update timeline item:', error);
    return NextResponse.json({ error: 'Failed to update timeline item' }, { status: 500 });
  }
}

// 删除时间轴项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await db.query('DELETE FROM timeline WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Timeline item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Timeline item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete timeline item:', error);
    return NextResponse.json({ error: 'Failed to delete timeline item' }, { status: 500 });
  }
}
