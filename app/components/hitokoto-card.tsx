'use client';

import { useState, useEffect, useCallback } from 'react';

interface Hitokoto {
    id: number;
    content: string;
    source: string | null;
    category: string;
}

const categoryColors: Record<string, string> = {
    '动画': 'bg-pink-50 text-pink-600 border-pink-200',
    '漫画': 'bg-purple-50 text-purple-600 border-purple-200',
    '游戏': 'bg-green-50 text-green-600 border-green-200',
    '文学': 'bg-amber-50 text-amber-600 border-amber-200',
    '原创': 'bg-blue-50 text-blue-600 border-blue-200',
    '网络': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    '其他': 'bg-gray-50 text-gray-600 border-gray-200',
};

export function HitokotoCard() {
    const [hitokoto, setHitokoto] = useState<Hitokoto | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRandom = useCallback(async () => {
        try {
            const res = await fetch('/api/hitokoto?random=1');
            if (res.ok) {
                const data = await res.json();
                setHitokoto(data);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRandom();
    }, [fetchRandom]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
            </div>
        );
    }

    if (!hitokoto) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">一言</h3>
                <button
                    onClick={fetchRandom}
                    className="text-xs text-blue-500 hover:text-blue-600 transition-colors font-medium"
                >
                    换一条
                </button>
            </div>

            <div className="relative pl-4 border-l-2 border-blue-200">
                <p className="text-sm text-gray-700 leading-relaxed break-words">
                    {hitokoto.content}
                </p>
                {hitokoto.source && (
                    <p className="text-xs text-gray-400 mt-2">
                        —— {hitokoto.source}
                    </p>
                )}
            </div>

            <div className="mt-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryColors[hitokoto.category] || categoryColors['其他']}`}>
                    {hitokoto.category}
                </span>
            </div>
        </div>
    );
}
