import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';

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
    const { content, assignee_ids, status, type, priority } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json({ error: '任务内容不能为空' }, { status: 400 });
      }
      updates.push(`content = $${paramIndex++}`);
      values.push(content.trim());
    }

    if (assignee_ids !== undefined) {
      const assigneeIds = Array.isArray(assignee_ids)
        ? assignee_ids.filter((id: any) => Number.isInteger(id))
        : [];
      updates.push(`assignee_ids = $${paramIndex++}`);
      values.push(assigneeIds.length > 0 ? `{${assigneeIds.join(',')}}` : '{}');
    }

    if (status !== undefined) {
      const validStatuses = ['待处理', '待开发', '开发中', '待讨论', '已完成', '暂不开发'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: '无效的状态' }, { status: 400 });
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (type !== undefined) {
      const validTypes = ['bug', '新功能', '优化', '重构', '文档'];
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: '无效的类型' }, { status: 400 });
      }
      updates.push(`"type" = $${paramIndex++}`);
      values.push(type);
    }

    if (priority !== undefined) {
      const validPriorities = ['高', '中', '低'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: '无效的优先级' }, { status: 400 });
      }
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: '没有需要更新的字段' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE dev_tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update dev task:', error);
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

    const result = await db.query('DELETE FROM dev_tasks WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete dev task:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}