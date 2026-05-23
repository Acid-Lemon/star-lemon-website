'use client';

import { useState, useEffect } from 'react';
import { RiLoader4Line, RiVideoLine, RiUserLine, RiMusic2Line } from '@remixicon/react';

interface DouyinData {
  type: string;
  title: string;
  desc: string;
  author: { name: string; id: number; avatar: string };
  cover: string;
  url: string | null;
  video_backup: string | null;
  images: string[] | null;
  live_photo: { image: string; video: string }[] | null;
  music: { title: string; author: string; url: string; cover: string } | null;
}

interface DouyinVideoEmbedProps {
  shortUrl: string;
}

export function DouyinVideoEmbed({ shortUrl }: DouyinVideoEmbedProps) {
  const [data, setData] = useState<DouyinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/douyin-parse?url=${encodeURIComponent(shortUrl)}`)
      .then(res => res.json())
      .then(json => {
        if (cancelled) return;
        if (json.code === 200 && json.data) {
          setData(json.data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [shortUrl]);

  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <RiLoader4Line className="w-4 h-4 animate-spin" />
        解析视频中...
      </div>
    );
  }

  if (error || !data) {
    return (
      <a
        href={shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-blue-500 hover:underline text-sm break-all"
      >
        {shortUrl}
      </a>
    );
  }

  if (data.type === 'video' && data.url) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="relative bg-black rounded-t-xl">
          {!playing && data.cover && (
            <div
              className="relative cursor-pointer group"
              onClick={() => setPlaying(true)}
            >
              <img src={data.cover} alt={data.title} className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <RiVideoLine className="w-6 h-6 text-gray-800" />
                </div>
              </div>
            </div>
          )}
          {playing && (
            <video
              src={data.url}
              controls
              autoPlay
              poster={data.cover}
              className="w-full aspect-video object-contain"
              playsInline
            />
          )}
        </div>
        <div className="px-3 py-2 bg-white dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{data.title}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <RiUserLine className="w-3.5 h-3.5" />
            <span>{data.author.name}</span>
          </div>
        </div>
      </div>
    );
  }

  if (data.type === 'live' && data.live_photo && data.live_photo.length > 0) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="relative bg-black rounded-t-xl">
          {!playing && (
            <div
              className="relative cursor-pointer group"
              onClick={() => setPlaying(true)}
            >
              <img src={data.live_photo[0].image} alt={data.title} className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <RiVideoLine className="w-6 h-6 text-gray-800" />
                </div>
              </div>
            </div>
          )}
          {playing && (
            <video
              src={data.live_photo[0].video}
              controls
              autoPlay
              className="w-full aspect-video object-contain"
              playsInline
            />
          )}
        </div>
        <div className="px-3 py-2 bg-white dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{data.title}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <RiUserLine className="w-3.5 h-3.5" />
            <span>{data.author.name}</span>
          </div>
        </div>
      </div>
    );
  }

  if (data.type === 'images' && data.images && data.images.length > 0) {
    const count = data.images.length;
    const gridCols = count <= 4 ? 'grid-cols-2' : 'grid-cols-3';
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <p className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 line-clamp-2">{data.title}</p>
        <div className={`grid ${gridCols} gap-1 p-2 bg-white dark:bg-gray-900`}>
          {data.images.map((img, i) => (
            <div key={img + i} className="aspect-square rounded-lg overflow-hidden">
              <img src={img} alt={`图片${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="px-3 py-1.5 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <RiUserLine className="w-3.5 h-3.5" />
            <span>{data.author.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={shortUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 text-blue-500 hover:underline text-sm break-all"
    >
      {shortUrl}
    </a>
  );
}