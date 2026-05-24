'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RiLoader4Line } from '@remixicon/react';

interface DouyinIframeEmbedProps {
  shortUrl: string;
}

function parseIframeDimensions(code: string): { width: number; height: number } | null {
  const w = code.match(/width="(\d+)"/);
  const h = code.match(/height="(\d+)"/);
  if (!w || !h) return null;
  return { width: parseInt(w[1]), height: parseInt(h[1]) };
}

export function DouyinIframeEmbed({ shortUrl }: DouyinIframeEmbedProps) {
  const [iframeCode, setIframeCode] = useState<string | null>(null);
  const [iframeSize, setIframeSize] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLDivElement>(null);

  // Inject iframe HTML via DOM manipulation (not dangerouslySetInnerHTML)
  // so React won't re-inject and reload the iframe on re-renders
  useEffect(() => {
    if (iframeRef.current && iframeCode) {
      iframeRef.current.innerHTML = iframeCode;
    }
  }, [iframeCode]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/douyin-resolve?url=${encodeURIComponent(shortUrl)}`)
      .then(res => res.json())
      .then(json => {
        if (cancelled) return;
        if (json.iframeCode) {
          const sandboxedCode = json.iframeCode.replace('<iframe', '<iframe sandbox="allow-scripts allow-same-origin allow-popups allow-forms"');
          setIframeCode(sandboxedCode);
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
    const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
    const scaleW = cw / iframeSize.width;
    const scaleH = ch / iframeSize.height;
    setScale(Math.max(scaleW, scaleH));
  }, [iframeSize]);

  useEffect(() => {
    updateScale();
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
    <div ref={containerRef} className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 w-full aspect-video relative">
      <div
        ref={iframeRef}
        style={{
          width: iframeSize.width,
          height: iframeSize.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute top-0 left-0"
      />
    </div>
  );
}

