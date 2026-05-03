'use client';

import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GalleryLightbox } from '../components/image-lightbox';

function getRelativeTime(dateStr: string) {
    try {
        const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        return date.toLocaleDateString('zh-CN');
    } catch {
        return '';
    }
}

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
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

    useEffect(() => {
        fetchMoments();
    }, []);

    const fetchMoments = async () => {
        try {
            const res = await fetch('/api/moments');
            const data = await res.json();
            setMoments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch moments:', error);
            setMoments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = useCallback((urls: string[], index: number) => {
        setLightbox({ images: urls, index });
    }, []);

    return (
        <div className="max-w-2xl mx-auto">
            {/* 动态列表 */}
            {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">加载中...</div>
            ) : moments.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-3">&#x1f4ad;</div>
                    <p className="text-sm">还没有动态</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {moments.map((moment) => (
                        <div key={moment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            {/* 头部 */}
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
                                    <span className="font-medium text-sm text-gray-900">{moment.nickname}</span>
                                    <span className="text-xs text-gray-400 ml-2">{getRelativeTime(moment.created_at)}</span>
                                </div>
                            </div>

                            {/* 内容 */}
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {moment.content}
                            </div>

                            {/* 图片 */}
                            {moment.image_url && <MomentImages imageUrl={moment.image_url} onImageClick={handleImageClick} />}
                        </div>
                    ))}
                </div>
            )}

            {/* 图片预览 */}
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
