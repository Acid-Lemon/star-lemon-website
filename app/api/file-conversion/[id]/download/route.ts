import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { downloadConvertedFile } from '@/lib/convert-service';

function getConvertedFileName(fileName: string, dstFormat: string) {
  const cleanFormat = dstFormat.replace(/^\.+/, '').toLowerCase() || 'pdf';
  const baseName = fileName.replace(/\.[^./\\]+$/, '');
  return `${baseName}_formated.${cleanFormat}`;
}

function getContentDisposition(fileName: string) {
  const fallbackName = fileName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT fc.*, fco.status as order_status
       FROM file_conversions fc
       JOIN file_conversion_orders fco ON fco.conversion_id = fc.id
       WHERE fc.id = $1`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '转换记录不存在' }, { status: 404 });
    }

    const conversion = result.rows[0];

    if (conversion.status !== 'completed') {
      return NextResponse.json({ error: '文件尚未转换完成' }, { status: 400 });
    }

    if (conversion.order_status !== 'paid') {
      return NextResponse.json({ error: '尚未完成支付' }, { status: 400 });
    }

    if (!conversion.task_id) {
      return NextResponse.json({ error: '转换任务不存在' }, { status: 400 });
    }

    const dstFormat = conversion.dst_format || 'pdf';
    const outputFileName = getConvertedFileName(conversion.file_name, dstFormat);
    const fileBuffer = await downloadConvertedFile(conversion.task_id);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': getContentDisposition(outputFileName),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}
