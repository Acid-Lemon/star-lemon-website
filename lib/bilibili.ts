interface BilibiliResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface RawUser {
  mid: string;
  name: string;
  face: string;
  sign: string;
  fans?: number;
  level_info?: { current_level?: number };
  Official?: { title?: string };
}

export interface BilibiliUser {
  mid: string;
  name: string;
  face: string;
  sign: string;
  level: number | null;
  fans: number | null;
  officialTitle: string;
}

export async function getBilibiliUser(mid: string): Promise<BilibiliUser> {
  const response = await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}`, {
    headers: {
      Accept: 'application/json',
      Referer: `https://space.bilibili.com/${mid}/`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Bilibili HTTP ${response.status}`);

  const result = await response.json() as BilibiliResponse<{ card: RawUser }>;
  if (result.code !== 0 || !result.data?.card) {
    throw new Error(result.message || `Bilibili API ${result.code}`);
  }

  const user = result.data.card;
  return {
    mid: String(user.mid),
    name: user.name,
    face: user.face,
    sign: user.sign,
    level: user.level_info?.current_level ?? null,
    fans: user.fans ?? null,
    officialTitle: user.Official?.title ?? '',
  };
}
