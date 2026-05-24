'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { GalleryLightbox } from '../components/image-lightbox';
import { DouyinVideoEmbed } from '../components/douyin-video-embed';
import { DouyinIframeEmbed } from '../components/douyin-iframe-embed';
import { splitContentByDouyin, getDouyinEmbedMode, DouyinEmbedMode } from '@/lib/douyin';
import { getRelativeTime, cn } from '@/lib/utils';
import { RiLoader4Line, RiCalendarLine, RiCloseLine } from '@remixicon/react';
import { Calendar } from '@/components/ui/calendar';
import { zhCN } from 'date-fns/locale';
import { format, isSameDay, parseISO } from 'date-fns';

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

function CalendarCard({
    selectedDate,
    onSelect,
    activeDates,
    onClear,
}: {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    activeDates: Set<string>;
    onClear: () => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sticky top-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <RiCalendarLine className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">日历</span>
                </div>
                {selectedDate && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(selectedDate, 'yyyy年MM月dd日')}
                        </span>
                        <button
                            onClick={onClear}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <RiCloseLine className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    </div>
                )}
            </div>
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onSelect}
                locale={zhCN}
                navLayout="around"
                className="w-full"
                classNames={{
                    month: "flex w-full flex-wrap items-center gap-1",
                    month_caption: "flex-1 flex items-center justify-center",
                    month_grid: "w-full order-last",
                    day: cn(
                        "relative aspect-square h-full w-full rounded-lg p-0 text-center select-none"
                    ),
                }}
                components={{
                    DayButton: ({ day, modifiers, ...props }) => {
                        const dateKey = format(day.date, 'yyyy-MM-dd');
                        const hasMoment = activeDates.has(dateKey);
                        const isSelected = modifiers.selected;
                        return (
                            <button
                                {...props}
                                className={cn(
                                    "relative isolate z-10 flex aspect-square size-auto w-full min-w-8 flex-col items-center justify-center gap-0.5 border-0 leading-none font-normal rounded-lg transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800",
                                    modifiers.today && !isSelected && "bg-gray-50 dark:bg-gray-800/50 font-medium"
                                )}
                            >
                                <span>{day.date.getDate()}</span>
                                {hasMoment && !isSelected && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    }
                }}
            />
        </div>
    );
}

export default function MomentsClient() {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [allMoments, setAllMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
    const [embedMode, setEmbedMode] = useState<DouyinEmbedMode>('iframe');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const PAGE_SIZE = 20;

    const fetchMoments = useCallback(async (offset: number, date?: string) => {
        try {
            let url = `/api/moments?limit=${PAGE_SIZE}&offset=${offset}`;
            if (date) url += `&date=${date}`;
            const res = await fetch(url);
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
            setAllMoments(data);
            offsetRef.current = data.length;
            setHasMore(data.length >= PAGE_SIZE);
            setLoading(false);
        })();
        getDouyinEmbedMode().then(setEmbedMode);
    }, [fetchMoments]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || selectedDate) return;
        setLoadingMore(true);
        const data = await fetchMoments(offsetRef.current);
        setMoments(prev => [...prev, ...data]);
        setAllMoments(prev => [...prev, ...data]);
        offsetRef.current += data.length;
        setHasMore(data.length >= PAGE_SIZE);
        setLoadingMore(false);
    }, [loadingMore, hasMore, fetchMoments, selectedDate]);

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

    useEffect(() => {
        if (!selectedDate) {
            setMoments(allMoments);
            return;
        }

        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const filtered = allMoments.filter(m => {
            const mDate = parseISO(m.created_at);
            return isSameDay(mDate, selectedDate);
        });

        if (filtered.length === 0) {
            (async () => {
                setLoading(true);
                const data = await fetchMoments(0, dateStr);
                setMoments(data);
                setLoading(false);
            })();
        } else {
            setMoments(filtered);
        }
    }, [selectedDate, allMoments, fetchMoments]);

    const handleImageClick = useCallback((urls: string[], index: number) => {
        setLightbox({ images: urls, index });
    }, []);

    const activeDates = allMoments.reduce((acc, moment) => {
        const date = parseISO(moment.created_at);
        const key = format(date, 'yyyy-MM-dd');
        acc.add(key);
        return acc;
    }, new Set<string>());

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            setCalendarOpen(false);
        }
    };

    const clearDateFilter = () => {
        setSelectedDate(undefined);
        setMoments(allMoments);
    };

    const MomentList = (
        <>
            {loading ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">加载中...</div>
            ) : moments.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <div className="text-5xl mb-3">💭</div>
                    <p className="text-sm">
                        {selectedDate ? '这一天还没有动态' : '还没有动态'}
                    </p>
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

                            <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words">
                                {splitContentByDouyin(moment.content).map((seg, i, arr) =>
                                    seg.type === 'douyin'
                                        ? <div key={i} className="mt-2">{embedMode === 'iframe' ? <DouyinIframeEmbed shortUrl={seg.content} /> : <DouyinVideoEmbed shortUrl={seg.content} />}</div>
                                        : <span key={i} className="whitespace-pre-wrap">{seg.content}{i < arr.length - 1 ? '\n' : ''}</span>
                                )}
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
                        {!hasMore && moments.length > 0 && !selectedDate && (
                            <p className="text-gray-400 dark:text-gray-500 text-xs">没有更多了</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="max-w-6xl w-full mx-auto">
            {/* 移动端：折叠日历 + 动态列表 */}
            <div className="lg:hidden">
                <div className="mb-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                        <button
                            onClick={() => setCalendarOpen(!calendarOpen)}
                            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400"
                        >
                            <span className="flex items-center gap-2">
                                <RiCalendarLine className="w-4 h-4" />
                                {selectedDate ? format(selectedDate, 'yyyy年MM月dd日') : '选择日期查看动态'}
                            </span>
                            <RiCalendarLine className="w-4 h-4" />
                        </button>
                        {calendarOpen && (
                            <div className="mt-3">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    locale={zhCN}
                                    navLayout="around"
                                    className="w-full"
                                    classNames={{
                                        month: "flex w-full flex-wrap items-center gap-1",
                                        month_caption: "flex-1 flex items-center justify-center",
                                        month_grid: "w-full order-last",
                                    }}
                                    components={{
                                        DayButton: ({ day, modifiers, ...props }) => {
                                            const dateKey = format(day.date, 'yyyy-MM-dd');
                                            const hasMoment = activeDates.has(dateKey);
                                            const isSelected = modifiers.selected;
                                            return (
                                                <button
                                                    {...props}
                                                    className={cn(
                                                        "relative isolate z-10 flex aspect-square size-auto w-full min-w-8 flex-col items-center justify-center gap-0.5 border-0 leading-none font-normal rounded-lg transition-colors",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground"
                                                            : "hover:bg-gray-100 dark:hover:bg-gray-800",
                                                        modifiers.today && !isSelected && "bg-gray-50 dark:bg-gray-800/50 font-medium"
                                                    )}
                                                >
                                                    <span>{day.date.getDate()}</span>
                                                    {hasMoment && !isSelected && (
                                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                                    )}
                                                </button>
                                            );
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="max-w-xl mx-auto">
                    {MomentList}
                </div>
            </div>

            {/* 桌面端：侧边栏布局 */}
            <div className="hidden lg:flex gap-6 items-start justify-center">
                {/* 左侧动态列表 */}
                <div className="max-w-xl flex-1 min-w-0">
                    {MomentList}
                </div>

                {/* 右侧日历 */}
                <div className="w-72 shrink-0">
                    <CalendarCard
                        selectedDate={selectedDate}
                        onSelect={handleDateSelect}
                        activeDates={activeDates}
                        onClear={clearDateFilter}
                    />
                </div>
            </div>

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
