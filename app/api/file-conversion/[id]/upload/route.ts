import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getSrcFormat, uploadAndConvert } from '@/lib/convert-service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const result = await db.query(
      `SELECT * FROM file_conversions WHERE id = $1 AND user_id = $2 AND status = $3`,
      [parseInt(id), session.user.id, 'uploading']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '转换记录不存在或状态不正确' }, { status: 400 });
    }

    const conversion = result.rows[0];

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: '未收到文件' }, { status: 400 });
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(await file.arrayBuffer());
    } catch (err) {
      console.error('Failed to read uploaded file buffer', err);
      return NextResponse.json({ error: '读取文件失败' }, { status: 500 });
    }

    const srcFormat = getSrcFormat(conversion.file_name) || conversion.src_format;
    const dstFormat = conversion.dst_format || 'pdf';

    try {
      const task = await uploadAndConvert({
        fileBuffer,
        fileName: conversion.file_name,
        srcFormat,
        dstFormat,
      });

      await db.query(
        `UPDATE file_conversions SET task_id = $1, status = 'converting', updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [task.taskId, conversion.id]
      );

      return NextResponse.json({ status: 'converting', taskId: task.taskId });
    } catch (err: any) {
      console.error('Submit conversion task error:', err);
      await db.query(
        `UPDATE file_conversions SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [conversion.id]
      );
      return NextResponse.json({ error: err.message || '提交转换任务失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}