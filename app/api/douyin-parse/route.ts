import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '../../../lib/settings';

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  const cached = cache.get(url);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const douyinApiUrl = await getSetting('douyin_api_url', 'https://api.bugpk.com/api/douyin');

  try {
    const res = await fetch(`${douyinApiUrl}?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      if (res.status === 429 && cached) {
        return NextResponse.json(cached.data);
      }
      return NextResponse.json({ error: `解析服务返回 ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    cache.set(url, { data, expiry: Date.now() + CACHE_TTL });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Douyin parse failed:', error);
    if (cached) {
      return NextResponse.json(cached.data);
    }
    return NextResponse.json({ error: '解析失败' }, { status: 500 });
  }
}
