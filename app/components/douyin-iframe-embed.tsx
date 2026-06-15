'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RiLoader4Line } from '@remixicon/react';

interface DouyinIframeEmbedProps {
  shortUrl: string;
}

const DOUYIN_IFRAME_WIDTH = 736;
const DOUYIN_IFRAME_HEIGHT = 414;

function parseIframeDimensions(code: string): { width: number; height: number } | null {
  const w = code.match(/width=["']?(\d+)/);
  const h = code.match(/height=["']?(\d+)/);
  if (!w || !h) return null;
  return { width: DOUYIN_IFRAME_WIDTH, height: DOUYIN_IFRAME_HEIGHT };
}

export function DouyinIframeEmbed({ shortUrl }: DouyinIframeEmbedProps) {
  const [iframeCode, setIframeCode] = useState<string | null>(null);
  const [iframeSize, setIframeSize] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLDivElement>(null);

  // Inject iframe HTML via DOM manipulation (not dangerouslySetInnerHTML)
  // so React won't re-inject and reload the iframe on re-renders
  useEffect(() => {
    if (iframeRef.current && iframeCode) {
      iframeRef.current.innerHTML = iframeCode;
      const iframe = iframeRef.current.querySelector('iframe');
      if (iframe) {
        if (iframeSize) {
          iframe.setAttribute('width', String(iframeSize.width));
          iframe.setAttribute('height', String(iframeSize.height));
          iframe.style.width = `${iframeSize.width}px`;
          iframe.style.height = `${iframeSize.height}px`;
        }
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('border', '0');
        iframe.setAttribute('frameborder', 'no');
        iframe.setAttribute('framespacing', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.style.overflow = 'hidden';
        iframe.style.border = '0';
        iframe.style.display = 'block';
      }
    }
  }, [iframeCode, iframeSize]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(false);
    });

    fetch(`/api/douyin-resolve?url=${encodeURIComponent(shortUrl)}`)
      .then(res => res.json())
      .then(json => {
        if (cancelled) return;
        if (json.iframeCode) {
          setIframeCode(json.iframeCode);
          setIframeSize(parseIframeDimensions(json.iframeCode));
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

  const updateScale = useCallback(() => {
    if (!containerRef.current || !iframeSize) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const scaleW = cw / iframeSize.width;
    const scaleH = ch / iframeSize.height;
    const nextScale = Math.min(scaleW, scaleH);
    setScale(nextScale);
    setOffset({
      x: (cw - iframeSize.width * nextScale) / 2,
      y: (ch - iframeSize.height * nextScale) / 2,
    });
  }, [iframeSize]);

  useEffect(() => {
    queueMicrotask(updateScale);
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <RiLoader4Line className="w-4 h-4 animate-spin" />
        加载视频播放器...
      </div>
    );
  }

  if (error || !iframeCode || !iframeSize) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-gray-500 dark:text-gray-400">
        加载失败
        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline break-all">{shortUrl}</a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative bg-black w-full aspect-video"
    >
      <div
        ref={iframeRef}
        style={{
          width: iframeSize.width,
          height: iframeSize.height,
          left: offset.x,
          top: offset.y,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute"
      />
    </div>
  );
}
