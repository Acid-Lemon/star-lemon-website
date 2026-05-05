'use client';

import { useState, useEffect, useCallback } from 'react';
import { RiFilmLine, RiBook2Line, RiGamepadLine, RiQuillPenLine, RiLightbulbLine, RiGlobalLine, RiMoreLine } from '@remixicon/react';

interface Quote {
    id: number;
    content: string;
    source: string | null;
    category: string;
}

const categoryColors: Record<string, string> = {
    '动画': 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800',
    '漫画': 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    '游戏': 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    '文学': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    '原创': 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    '网络': 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    '其他': 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const categoryIcons: Record<string, React.ReactNode> = {
    '动画': <RiFilmLine className="w-3 h-3 mr-1" />,
    '漫画': <RiBook2Line className="w-3 h-3 mr-1" />,
    '游戏': <RiGamepadLine className="w-3 h-3 mr-1" />,
    '文学': <RiQuillPenLine className="w-3 h-3 mr-1" />,
    '原创': <RiLightbulbLine className="w-3 h-3 mr-1" />,
    '网络': <RiGlobalLine className="w-3 h-3 mr-1" />,
    '其他': <RiMoreLine className="w-3 h-3 mr-1" />,
};

export function QuoteCard() {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRandom = useCallback(async () => {
        try {
            const res = await fetch('/api/quotes?random=1');
            if (res.ok) {
                const data = await res.json();
                setQuote(data);
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                </div>
            </div>
        );
    }

    if (!quote) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">一言</h3>
                <button
                    onClick={fetchRandom}
                    className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-medium"
                >
                    换一条
                </button>
            </div>

            <div className="relative pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words font-serif">
                    {quote.content}
                </p>
                {quote.source && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        —— {quote.source}
                    </p>
                )}
            </div>

            <div className="mt-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryColors[quote.category] || categoryColors['其他']}`}>
                    {categoryIcons[quote.category] || categoryIcons['其他']}
                    {quote.category}
                </span>
            </div>
        </div>
    );
}
