'use client';

import { useEffect, useState } from 'react';
import { RiExternalLinkLine } from '@remixicon/react';

interface BilibiliUser {
  mid: string;
  name: string;
  face: string;
  sign: string;
  level: number | null;
  fans: number | null;
  officialTitle: string;
}

function formatFans(fans: number) {
  if (fans >= 10000) return `${(fans / 10000).toFixed(fans >= 100000 ? 1 : 2)}万粉丝`;
  return `${fans} 粉丝`;
}

export function BilibiliUserCard({ mid }: { mid: string }) {
  const [user, setUser] = useState<BilibiliUser | null>(null);
  const [failed, setFailed] = useState(false);
  const spaceUrl = `https://space.bilibili.com/${mid}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/bilibili/user?mid=${mid}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Profile request failed');
        return response.json();
      })
      .then(setUser)
      .catch((error) => {
        if (error.name !== 'AbortError') setFailed(true);
      });
    return () => controller.abort();
  }, [mid]);

  if (failed) {
    return <a href={spaceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{spaceUrl}</a>;
  }

  if (!user) {
    return <div className="mt-2 h-28 animate-pulse rounded-lg border border-border bg-muted/50" aria-label="正在加载 UP 主信息" />;
  }

  return (
    <a
      href={spaceUrl}
      target="_blank"
      rel="noreferrer"
      className="group mt-2 flex min-h-28 items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`前往 ${user.name} 的哔哩哔哩空间`}
    >
      <img src={user.face} alt="" className="size-16 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <strong className="truncate text-sm font-semibold">{user.name}</strong>
          {user.level !== null && <span className="shrink-0 text-xs font-medium text-[#fb7299]">LV{user.level}</span>}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {[user.officialTitle, user.fans !== null ? formatFans(user.fans) : ''].filter(Boolean).join(' · ') || `UID ${user.mid}`}
        </span>
        {user.sign && <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">{user.sign}</span>}
      </span>
      <RiExternalLinkLine className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
    </a>
  );
}
