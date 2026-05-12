import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateDownloadUrl } from '@/lib/oss';

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

    if (!conversion.pdf_oss_key) {
      return NextResponse.json({ error: '转换文件不存在' }, { status: 400 });
    }

    const pdfFileName = conversion.file_name.replace(/\.[^.]+$/, '.pdf');
    const downloadUrl = await generateDownloadUrl(conversion.pdf_oss_key, pdfFileName);

    return NextResponse.json({
      downloadUrl,
      fileName: pdfFileName,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}
