import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';

// 获取所有时间轴项目
export async function GET() {
  try {
    const result = await db.query(
      'SELECT * FROM timeline ORDER BY sort_order ASC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

// 创建时间轴项目
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, title, description, type, sort_order, is_active } = body;

    const result = await db.query(
      `INSERT INTO timeline (date, title, description, type, sort_order, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [date, title, description, type || 'milestone', sort_order || 0, is_active !== false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create timeline item:', error);
    return NextResponse.json({ error: 'Failed to create timeline item' }, { status: 500 });
  }
}
