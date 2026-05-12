import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await db.query(
      'SELECT status FROM file_conversion_orders WHERE conversion_id = $1',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    return NextResponse.json({ paid: result.rows[0].status === 'paid' });
  } catch (error) {
    console.error('Check pay status error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
