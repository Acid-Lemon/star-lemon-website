import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const result = await db.query(
      'SELECT id FROM file_conversions WHERE id = $1 AND user_id = $2',
      [parseInt(id), session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    await db.query('DELETE FROM file_conversions WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete conversion error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const conversionId = Number(id);
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    if (!Number.isSafeInteger(conversionId) || conversionId <= 0) {
      return NextResponse.json({ error: '无效的转换记录' }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE file_conversions SET status = 'failed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND status = 'uploading'
       RETURNING id`,
      [conversionId, session.user.id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '记录不存在或状态已更新' }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fail conversion upload error:', error);
    return NextResponse.json({ error: '更新上传状态失败' }, { status: 500 });
  }
}
