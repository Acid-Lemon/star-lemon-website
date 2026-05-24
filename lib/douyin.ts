const DOUYIN_SHORT_URL_PATTERN = /https:\/\/v\.douyin\.com\/[^\s]+/g;

export interface ContentSegment {
  type: 'text' | 'douyin';
  content: string;
}

export function parseDouyinShortUrl(text: string): string | null {
  const match = text.match(DOUYIN_SHORT_URL_PATTERN);
  return match ? match[0] : null;
}

export function splitContentByDouyin(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const douyinUrl = parseDouyinShortUrl(line);
    if (douyinUrl) {
      segments.push({ type: 'douyin', content: douyinUrl });
    } else {
      segments.push({ type: 'text', content: line });
    }
  }

  return segments;
}

export type DouyinEmbedMode = 'iframe' | 'proxy';

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