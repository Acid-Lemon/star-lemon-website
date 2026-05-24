import { DouyinEmbedMode } from './douyin';

export interface VideoSegment {
  type: 'text' | 'douyin' | 'bilibili';
  content: string;
  bvid?: string;
  time?: string;
}

export function splitContentByVideo(content: string): VideoSegment[] {
  const segments: VideoSegment[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Douyin: line contains a douyin short URL
    const douyinMatch = line.match(/https:\/\/v\.douyin\.com\/[^\s]+/);
    if (douyinMatch) {
      segments.push({ type: 'douyin', content: douyinMatch[0] });
      continue;
    }

    // Bilibili: line contains a bilibili video URL
    const biliMatch = line.match(/https?:\/\/www\.bilibili\.com\/video\/(BV\w+)/);
    if (biliMatch) {
      const bvid = biliMatch[1];
      const timeMatch = line.match(/[?&]t=(\d+)/);
      segments.push({ type: 'bilibili', content: bvid, bvid, time: timeMatch?.[1] });
      continue;
    }

    segments.push({ type: 'text', content: line });
  }

  return segments;
}

export async function getDouyinEmbedMode(): Promise<DouyinEmbedMode> {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    const douyinFields = data.douyin;
    if (douyinFields) {
      const modeField = douyinFields.find((f: { key: string; value: string }) => f.key === 'douyin_embed_mode');
      if (modeField && modeField.value === 'proxy') return 'proxy';
    }
    return 'iframe';
  } catch {
    return 'iframe';
  }
}