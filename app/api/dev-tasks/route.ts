import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const { rows } = await db.query(
      'SELECT * FROM dev_tasks ORDER BY created_at DESC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch dev tasks:', error);
    return NextResponse.json({ error: '获取任务列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { content, assignee_ids, status, type, priority } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '任务内容不能为空' }, { status: 400 });
    }

    const validStatuses = ['待处理', '待开发', '开发中', '待讨论', '已完成', '暂不开发'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    const validTypes = ['bug', '新功能', '优化', '重构', '文档'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: '无效的类型' }, { status: 400 });
    }

    const validPriorities = ['高', '中', '低'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: '无效的优先级' }, { status: 400 });
    }

    const assigneeIds = Array.isArray(assignee_ids)
      ? assignee_ids.filter((id: unknown) => Number.isInteger(id))
      : [];
    const pgAssignees = assigneeIds.length > 0 ? `{${assigneeIds.join(',')}}` : '{}';

    const { rows } = await db.query(
      `INSERT INTO dev_tasks (content, assignee_ids, status, "type", priority)
       VALUES ($1, $2::integer[], $3, $4, $5)
       RETURNING *`,
      [content.trim(), pgAssignees, status || '待处理', type || '新功能', priority || '中']
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create dev task:', error);
    const message = error instanceof Error ? error.message : '创建任务失败';
    return NextResponse.json({ error: `创建任务失败: ${message}` }, { status: 500 });
  }
}
