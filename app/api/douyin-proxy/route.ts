import { NextRequest, NextResponse } from 'next/server';

const DOUYIN_CDN_HOSTS = [
  'v3-web.douyinvod.com',
  'v5-dy-o-abtest.zjcdn.com',
  'v3-dy-o.zjcdn.com',
  'v26-web.douyinvod.com',
  'v5-web.douyinvod.com',
  'p3-pc-sign.douyinpic.com',
  'p9-pc-sign.douyinpic.com',
  'p3-pc.douyinpic.com',
  'p9-pc.douyinpic.com',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  const parsedUrl = new URL(url);
  if (!DOUYIN_CDN_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: '仅允许代理抖音 CDN 地址' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Referer': 'https://www.douyin.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `CDN 返回 ${res.status}` }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'video/mp4';
    const body = res.body;

    if (!body) {
      return NextResponse.json({ error: 'CDN 无响应体' }, { status: 500 });
    }

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Douyin proxy failed:', error);
    return NextResponse.json({ error: '代理请求失败' }, { status: 500 });
  }
}