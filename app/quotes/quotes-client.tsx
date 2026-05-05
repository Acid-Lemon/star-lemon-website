'use client';

import { useState, useEffect, useCallback } from 'react';
import { RiFilmLine, RiBook2Line, RiGamepadLine, RiQuillPenLine, RiLightbulbLine, RiGlobalLine, RiMoreLine } from '@remixicon/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Quote {
    id: number;
    content: string;
    source: string | null;
    category: string;
    created_at: string;
    is_active?: boolean;
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

export default function QuotesClient() {
    const [quoteList, setQuoteList] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        try {
            const res = await fetch('/api/quotes');
            if (res.ok) {
                const data = await res.json();
                const active = Array.isArray(data) ? data.filter((q: Quote) => q.is_active !== false) : [];
                setQuoteList(active);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return (
        <div className="max-w-6xl mx-auto">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-5 space-y-3">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-3 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : quoteList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quoteList.map((item) => (
                        <Card
                            key={item.id}
                            className="transition-all hover:shadow-md bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                        >
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className={`text-[10px] flex items-center ${categoryColors[item.category] || categoryColors['其他']}`}>
                                        {categoryIcons[item.category] || categoryIcons['其他']}
                                        {item.category}
                                    </Badge>
                                </div>
                                <p className="text-sm text-foreground dark:text-gray-200 leading-relaxed break-words flex-1 font-serif">
                                    {item.content}
                                </p>
                                {item.source && (
                                    <p className="text-xs text-muted-foreground dark:text-gray-500 mt-3">
                                        —— {item.source}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="max-w-md mx-auto bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground dark:text-gray-500 text-sm">暂无一言</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
