import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '../../../lib/settings';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  const douyinApiUrl = await getSetting('douyin_api_url', 'https://api.bugpk.com/api/douyin');

  try {
    const res = await fetch(`${douyinApiUrl}?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: '解析服务返回错误' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Douyin parse failed:', error);
    return NextResponse.json({ error: '解析失败' }, { status: 500 });
  }
}