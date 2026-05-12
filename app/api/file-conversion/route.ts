import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isFormatSupported, getSrcFormat } from '@/lib/convert-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileSize } = body;

    if (!fileName || !fileSize) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    if (!isFormatSupported(fileName)) {
      return NextResponse.json({ error: '不支持的文件格式' }, { status: 400 });
    }

    const srcFormat = getSrcFormat(fileName)!;

    const result = await db.query(
      `INSERT INTO file_conversions (user_id, file_name, file_size, src_format, status)
       VALUES ($1, $2, $3, $4, 'uploading')
       RETURNING id`,
      [session.user.id, fileName, fileSize, srcFormat]
    );

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Create conversion error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
