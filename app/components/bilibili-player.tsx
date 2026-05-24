import React from 'react';

const BilibiliPlayer = React.memo(function BilibiliPlayer({
  bvid,
  time,
}: {
  bvid: string;
  time?: string;
}) {
  const params = new URLSearchParams();
  params.set('bvid', bvid);
  params.set('autoplay', '0');
  params.set('danmaku', '0');
  if (time) params.set('t', time);
  const src = `https://player.bilibili.com/player.html?${params.toString()}`;

  return (
    <iframe
      key={bvid}
      src={src}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      allowFullScreen
      width="100%"
      height="400"
      style={{ borderRadius: 8, margin: '24px 0', border: 'none' }}
      title={`Bilibili ${bvid}`}
      loading="lazy"
    />
  );
});

export { BilibiliPlayer };