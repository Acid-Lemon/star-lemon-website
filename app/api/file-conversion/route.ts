import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isFormatSupported, getSrcFormat, isValidOutputFormat } from '@/lib/convert-service';
import { MAX_CONVERSION_FILE_SIZE } from '@/lib/convert-constants';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileSize, dstFormat } = body;

    if (typeof fileName !== 'string' || !fileName || fileName.length > 500 || !Number.isSafeInteger(fileSize) || fileSize <= 0) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    if (fileSize > MAX_CONVERSION_FILE_SIZE) {
      return NextResponse.json({ error: '文件不能超过 100 MB' }, { status: 413 });
    }

    if (!isFormatSupported(fileName)) {
      return NextResponse.json({ error: '不支持的文件格式' }, { status: 400 });
    }

    const srcFormat = getSrcFormat(fileName)!;
    const resolvedDst = dstFormat === undefined ? 'pdf' : dstFormat;

    if (typeof resolvedDst !== 'string' || !isValidOutputFormat(srcFormat, resolvedDst)) {
      return NextResponse.json({ error: `不支持转换为 ${resolvedDst} 格式` }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO file_conversions (user_id, file_name, file_size, src_format, dst_format, status)
       VALUES ($1, $2, $3, $4, $5, 'uploading')
       RETURNING id`,
      [session.user.id, fileName, fileSize, srcFormat, resolvedDst]
    );

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Create conversion error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
