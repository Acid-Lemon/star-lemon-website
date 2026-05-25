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
    <div className="mt-3 rounded-xl overflow-hidden w-full aspect-video">
      <iframe
        key={bvid}
        src={src}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        allowFullScreen
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title={`Bilibili ${bvid}`}
        loading="lazy"
      />
    </div>
  );
});

export { BilibiliPlayer };