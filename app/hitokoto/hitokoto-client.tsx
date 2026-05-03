'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Hitokoto {
    id: number;
    content: string;
    source: string | null;
    category: string;
    created_at: string;
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

export default function HitokotoClient() {
    const [hitokotoList, setHitokotoList] = useState<Hitokoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState<Hitokoto | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            const res = await fetch('/api/hitokoto');
            if (res.ok) {
                const data = await res.json();
                const active = Array.isArray(data) ? data.filter((h: Hitokoto) => h.is_active !== false) : [];
                setHitokotoList(active);
                if (active.length > 0) {
                    setCurrent(active[Math.floor(Math.random() * active.length)]);
                }
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

    const handleRandom = () => {
        if (hitokotoList.length === 0) return;
        let next: Hitokoto;
        if (hitokotoList.length === 1) {
            next = hitokotoList[0];
        } else {
            do {
                next = hitokotoList[Math.floor(Math.random() * hitokotoList.length)];
            } while (next.id === current?.id);
        }
        setCurrent(next);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {loading ? (
                <Card className="mb-6">
                    <CardContent className="p-8 space-y-4">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                </Card>
            ) : current ? (
                <Card className="mb-6">
                    <CardContent className="p-8 text-center">
                        <div className="mb-4">
                            <span className="text-3xl">{categoryIcons[current.category] || '💬'}</span>
                        </div>
                        <p className="text-lg text-foreground leading-relaxed break-words">
                            {current.content}
                        </p>
                        {current.source && (
                            <p className="text-sm text-muted-foreground mt-4">
                                —— {current.source}
                            </p>
                        )}
                        <div className="mt-4">
                            <Badge variant="outline" className={`text-[11px] ${categoryColors[current.category] || categoryColors['其他']}`}>
                                {current.category}
                            </Badge>
                        </div>
                        <Button onClick={handleRandom} className="mt-6 rounded-full">
                            换一条
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="mb-6">
                    <CardContent className="p-8 text-center">
                        <div className="text-5xl mb-3">💬</div>
                        <p className="text-muted-foreground text-sm">暂无一言</p>
                    </CardContent>
                </Card>
            )}

            {!loading && hitokotoList.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">全部一言</h3>
                    {hitokotoList.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-lg shrink-0 mt-0.5">{categoryIcons[item.category] || '💬'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground leading-relaxed break-words">
                                            {item.content}
                                        </p>
                                        {item.source && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                —— {item.source}
                                            </p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className={`shrink-0 text-[10px] ${categoryColors[item.category] || categoryColors['其他']}`}>
                                        {item.category}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
