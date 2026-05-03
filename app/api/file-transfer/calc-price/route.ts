import { NextRequest, NextResponse } from 'next/server';
import { calculatePrice } from '@/lib/price-calc';

export async function POST(request: NextRequest) {
  try {
    const { fileSize, retainDays, maxDownloads } = await request.json();

    if (!fileSize || !retainDays || !maxDownloads) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const price = await calculatePrice({
      fileSizeBytes: fileSize,
      retainDays,
      maxDownloads,
    });

    return NextResponse.json({ price });
  } catch (error) {
    console.error('Calculate price error:', error);
    return NextResponse.json({ error: '计算失败' }, { status: 500 });
  }
}
