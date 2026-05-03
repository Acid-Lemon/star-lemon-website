'use client';

import { useState, useEffect, useCallback } from 'react';
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
    '动画': 'bg-pink-50 text-pink-600 border-pink-200',
    '漫画': 'bg-purple-50 text-purple-600 border-purple-200',
    '游戏': 'bg-green-50 text-green-600 border-green-200',
    '文学': 'bg-amber-50 text-amber-600 border-amber-200',
    '原创': 'bg-blue-50 text-blue-600 border-blue-200',
    '网络': 'bg-cyan-50 text-cyan-600 border-cyan-200',
    '其他': 'bg-gray-50 text-gray-600 border-gray-200',
};

const categoryIcons: Record<string, string> = {
    '动画': '🎬',
    '漫画': '📖',
    '游戏': '🎮',
    '文学': '✒️',
    '原创': '💡',
    '网络': '🌐',
    '其他': '💬',
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
                            className="transition-all hover:shadow-md"
                        >
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className={`text-[10px] ${categoryColors[item.category] || categoryColors['其他']}`}>
                                        {item.category}
                                    </Badge>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed break-words flex-1 font-serif">
                                    {item.content}
                                </p>
                                {item.source && (
                                    <p className="text-xs text-muted-foreground mt-3">
                                        —— {item.source}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground text-sm">暂无一言</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
