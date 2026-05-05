'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GalleryLightbox } from '../components/image-lightbox';
import { getRelativeTime } from '@/lib/utils';
import { RiLoader4Line } from '@remixicon/react';

interface Moment {
    id: number;
    user_id: number;
    content: string;
    image_url: string | null;
    nickname: string;
    avatar: string | null;
    created_at: string;
}

function MomentImages({ imageUrl, onImageClick }: { imageUrl: string; onImageClick: (urls: string[], index: number) => void }) {
    const urls = imageUrl.split(',').filter(Boolean);
    const count = urls.length;

    if (count === 0) return null;

    if (count === 1) {
        return (
            <div className="mt-3">
                <img
                    src={urls[0]}
                    alt="动态图片"
                    loading="lazy"
                    className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageClick(urls, 0)}
                />
            </div>
        );
    }

    const gridCols = count <= 4 ? 'grid-cols-2' : 'grid-cols-3';
    return (
        <div className={`grid ${gridCols} gap-1.5 mt-3`}>
            {urls.map((url, i) => (
                <div key={url + i} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                        src={url}
                        alt={`图片${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onClick={() => onImageClick(urls, i)}
                    />
                </div>
            ))}
        </div>
    );
}

export default function MomentsClient() {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const PAGE_SIZE = 20;

    const fetchMoments = useCallback(async (offset: number) => {
        try {
            const res = await fetch(`/api/moments?limit=${PAGE_SIZE}&offset=${offset}`);
            const data = await res.json();
            const items = Array.isArray(data) ? data : [];
            return items;
        } catch (error) {
            console.error('Failed to fetch moments:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        (async () => {
            const data = await fetchMoments(0);
            setMoments(data);
            offsetRef.current = data.length;
            setHasMore(data.length >= PAGE_SIZE);
            setLoading(false);
        })();
    }, [fetchMoments]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const data = await fetchMoments(offsetRef.current);
        setMoments(prev => [...prev, ...data]);
        offsetRef.current += data.length;
        setHasMore(data.length >= PAGE_SIZE);
        setLoadingMore(false);
    }, [loadingMore, hasMore, fetchMoments]);

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );

        if (sentinelRef.current) {
            observerRef.current.observe(sentinelRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [loadMore, hasMore, loadingMore]);

    const handleImageClick = useCallback((urls: string[], index: number) => {
        setLightbox({ images: urls, index });
    }, []);

    return (
        <div className="max-w-2xl mx-auto">
            {loading ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">加载中...</div>
            ) : moments.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <div className="text-5xl mb-3">💭</div>
                    <p className="text-sm">还没有动态</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {moments.map((moment) => (
                        <div key={moment.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <Avatar size="default">
                                    {moment.avatar ? (
                                        <AvatarImage src={moment.avatar} alt={moment.nickname} />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold text-xs">
                                            {moment.nickname?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex-1">
                                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{moment.nickname}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{getRelativeTime(moment.created_at)}</span>
                                </div>
                            </div>

                            <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {moment.content}
                            </div>

                            {moment.image_url && <MomentImages imageUrl={moment.image_url} onImageClick={handleImageClick} />}
                        </div>
                    ))}

                    <div ref={sentinelRef} className="h-10 flex items-center justify-center">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <RiLoader4Line className="w-4 h-4 animate-spin" />
                                加载中...
                            </div>
                        )}
                        {!hasMore && moments.length > 0 && (
                            <p className="text-gray-400 dark:text-gray-500 text-xs">没有更多了</p>
                        )}
                    </div>
                </div>
            )}

            {lightbox && (
                <GalleryLightbox
                    images={lightbox.images}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    );
}
