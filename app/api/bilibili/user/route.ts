import { NextRequest, NextResponse } from 'next/server';
import { getBilibiliUser } from '@/lib/bilibili';

export async function GET(request: NextRequest) {
  const mid = request.nextUrl.searchParams.get('mid') ?? '';
  if (!/^\d{1,20}$/.test(mid)) {
    return NextResponse.json({ error: '无效的 B 站用户 ID' }, { status: 400 });
  }

  try {
    const user = await getBilibiliUser(mid);
    return NextResponse.json(user, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error(`Failed to fetch Bilibili user ${mid}:`, error);
    return NextResponse.json({ error: '暂时无法获取 UP 主信息' }, { status: 502 });
  }
}
