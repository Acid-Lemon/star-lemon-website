import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getSrcFormat, uploadAndConvert } from '@/lib/convert-service';
import { MAX_CONVERSION_FILE_SIZE } from '@/lib/convert-constants';
import { isConversionFileHeaderValid, readStreamHeader } from '@/lib/convert-file-validation';

const responseEncoder = new TextEncoder();
const HEARTBEAT_CHUNK = responseEncoder.encode(' '.repeat(2048));

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const conversionId = Number(id);
    if (!Number.isSafeInteger(conversionId) || conversionId <= 0) {
      return NextResponse.json({ error: '无效的转换记录' }, { status: 400 });
    }

    const result = await db.query(
      `SELECT * FROM file_conversions WHERE id = $1 AND user_id = $2 AND status = $3`,
      [conversionId, session.user.id, 'uploading']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '转换记录不存在或状态不正确' }, { status: 400 });
    }

    const conversion = result.rows[0];

    const declaredSize = Number(request.headers.get('x-file-size'));
    const contentLengthHeader = request.headers.get('content-length');
    const contentLength = contentLengthHeader === null ? null : Number(contentLengthHeader);
    let declaredName = '';
    try {
      declaredName = decodeURIComponent(request.headers.get('x-file-name') || '');
    } catch {
      await markUploadFailed(conversion.id);
      return NextResponse.json({ error: '文件名编码无效' }, { status: 400 });
    }
    const expectedSize = Number(conversion.file_size);
    if (!request.body) {
      await markUploadFailed(conversion.id);
      return NextResponse.json({ error: '未收到文件' }, { status: 400 });
    }
    if (!Number.isSafeInteger(expectedSize) || expectedSize <= 0 || expectedSize > MAX_CONVERSION_FILE_SIZE) {
      await markUploadFailed(conversion.id);
      return NextResponse.json({ error: '文件大小无效' }, { status: 413 });
    }
    if (declaredSize !== expectedSize || (contentLength !== null && contentLength !== expectedSize)) {
      await markUploadFailed(conversion.id);
      return NextResponse.json({ error: '上传文件大小与记录不一致' }, { status: 400 });
    }
    if (declaredName !== conversion.file_name || getSrcFormat(declaredName) !== conversion.src_format) {
      await markUploadFailed(conversion.id);
      return NextResponse.json({ error: '上传文件与记录不一致' }, { status: 400 });
    }

    const srcFormat = getSrcFormat(conversion.file_name) || conversion.src_format;
    const dstFormat = conversion.dst_format || 'pdf';
    const [inspectionStream, fileStream] = request.body.tee();
    const fileHeader = await readStreamHeader(inspectionStream);
    if (!isConversionFileHeaderValid(srcFormat, fileHeader)) {
      await fileStream.cancel('Invalid file signature');
      await markUploadFailed(conversion.id);
      return NextResponse.json({ error: '文件内容与扩展名不匹配' }, { status: 415 });
    }

    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;
    const responseStream = new ReadableStream<Uint8Array>({
      start(controller) {
        const finish = (payload: object) => {
          if (heartbeat) clearInterval(heartbeat);
          if (cancelled) return;
          controller.enqueue(responseEncoder.encode(JSON.stringify(payload)));
          controller.close();
        };

        controller.enqueue(HEARTBEAT_CHUNK);
        heartbeat = setInterval(() => {
          if (!cancelled) controller.enqueue(HEARTBEAT_CHUNK);
        }, 10_000);

        void (async () => {
          try {
            const task = await uploadAndConvert({
              fileStream,
              fileSize: expectedSize,
              fileName: conversion.file_name,
              contentType: request.headers.get('content-type') || 'application/octet-stream',
              srcFormat,
              dstFormat,
              signal: request.signal,
            });

            await db.query(
              `UPDATE file_conversions SET task_id = $1, status = 'converting', updated_at = CURRENT_TIMESTAMP
               WHERE id = $2 AND status = 'uploading'`,
              [task.taskId, conversion.id]
            );
            finish({ status: 'converting', taskId: task.taskId });
          } catch (err: unknown) {
            console.error('Submit conversion task error:', err);
            await markUploadFailed(conversion.id).catch(updateError =>
              console.error('Mark conversion upload failed error:', updateError)
            );
            finish({ error: err instanceof Error ? err.message : '提交转换任务失败' });
          }
        })();
      },
      cancel() {
        cancelled = true;
        if (heartbeat) clearInterval(heartbeat);
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}

async function markUploadFailed(conversionId: number) {
  await db.query(
    `UPDATE file_conversions SET status = 'failed', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status = 'uploading'`,
    [conversionId]
  );
}
