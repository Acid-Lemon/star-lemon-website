import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '../../../lib/settings';

const cache = new Map<string, { videoId: string; iframeCode: string; expiry: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9',
  'Referer': 'https://www.douyin.com/',
};

async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function extractVideoId(text: string): string | null {
  const patterns = [
    /douyin\.com\/video\/(\d+)/,
    /iesdouyin\.com\/share\/video\/(\d+)/,
    /vid[=:]\s*["']?(\d{15,})/,
    /"aweme_id"\s*:\s*"(\d+)/,
    /video_id[=:]\s*["']?(\d{15,})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  const cached = cache.get(url);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json({ videoId: cached.videoId, iframeCode: cached.iframeCode, url });
  }

  // Step 1: extract video ID from short URL
  let videoId: string | null = null;
  try {
    const res = await fetchWithTimeout(url, { redirect: 'follow', headers: BROWSER_HEADERS });
    videoId = extractVideoId(res.url);
    if (!videoId) {
      videoId = extractVideoId(await res.text());
    }
  } catch (error) {
    console.error('Douyin resolve redirect failed:', error);
  }

  if (!videoId) {
    try {
      const douyinApiUrl = await getSetting('douyin_api_url', 'https://api.bugpk.com/api/douyin');
      const parseRes = await fetchWithTimeout(`${douyinApiUrl}?url=${encodeURIComponent(url)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (parseRes.ok) {
        videoId = extractVideoId(JSON.stringify(await parseRes.json()));
      }
    } catch (error) {
      console.error('Douyin resolve parse fallback failed:', error);
    }
  }

  if (!videoId) {
    if (cached) {
      return NextResponse.json({ videoId: cached.videoId, iframeCode: cached.iframeCode, url });
    }
    return NextResponse.json({ error: '无法提取视频 ID' }, { status: 400 });
  }

  // Step 2: call official Douyin iframe API
  let iframeCode: string | undefined;
  try {
    const officialApiRes = await fetchWithTimeout(
      `https://open.douyin.com/api/douyin/v1/video/get_iframe_by_video?video_id=${videoId}`
    );
    if (officialApiRes.ok) {
      const officialData = await officialApiRes.json();
      if (officialData.err_no === 0 && officialData.data?.iframe_code) {
        iframeCode = officialData.data.iframe_code;
      }
    }
  } catch (error) {
    console.error('Douyin official iframe API failed:', error);
  }

  if (!iframeCode) {
    if (cached) {
      return NextResponse.json({ videoId: cached.videoId, iframeCode: cached.iframeCode, url });
    }
    // Fallback: construct iframe URL without official API
    return NextResponse.json({
      videoId,
      iframeCode: `<iframe width="720" height="1280" frameborder="0" src="https://open.douyin.com/player/video?vid=${videoId}&autoplay=0" referrerpolicy="unsafe-url" allowfullscreen></iframe>`,
      url,
    });
  }

  cache.set(url, { videoId, iframeCode, expiry: Date.now() + CACHE_TTL });
  return NextResponse.json({ videoId, iframeCode, url });
}
