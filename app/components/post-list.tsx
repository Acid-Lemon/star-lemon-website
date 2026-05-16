'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { RiArrowRightLine, RiArticleLine, RiLoader4Line } from '@remixicon/react';

interface Post {
    id: number;
    title: string;
    summary: string;
    cover?: string;
    created_at: string;
    tags: string[];
    author_name: string;
    author_avatar?: string | null;
}

interface PostListProps {
    initialPosts: Post[];
    allTags: string[];
}

export function PostList({ initialPosts, allTags }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const loaderRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                offset: posts.length.toString(),
                limit: '6',
            });
            if (selectedTag) params.set('tag', selectedTag);

            const res = await fetch(`/api/posts?${params}`);
            const data = await res.json();

            if (data.posts.length === 0) {
                setHasMore(false);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }
        } catch (e) {
            console.error('Failed to load more posts', e);
        }
        setLoading(false);
    }, [posts.length, loading, hasMore, selectedTag]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, hasMore, loading]);

    useEffect(() => {
        setPosts([]);
        setHasMore(true);
        setLoading(true);

        const params = new URLSearchParams({ offset: '0', limit: '6' });
        if (selectedTag) params.set('tag', selectedTag);

        fetch(`/api/posts?${params}`)
            .then(res => res.json())
            .then(data => {
                setPosts(data.posts || []);
                setHasMore((data.posts || []).length >= 6);
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [selectedTag]);

    const getRelativeTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now.getTime() - date.getTime();

            if (diff < 86400000) return '今天';
            if (diff < 172800000) return '昨天';
            if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
            return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    const accentColors = [
        { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', gradient: 'from-blue-400 to-blue-500' },
        { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', gradient: 'from-purple-400 to-purple-500' },
        { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', gradient: 'from-green-400 to-green-500' },
        { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', gradient: 'from-orange-400 to-orange-500' },
        { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', gradient: 'from-pink-400 to-pink-500' },
        { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', gradient: 'from-teal-400 to-teal-500' },
    ];

    return (
        <div>
            {allTags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedTag('')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                            selectedTag === ''
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        全部
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                selectedTag === tag
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-6">
                {posts.map((post, index) => {
                    const color = accentColors[index % accentColors.length];
                    const tags = post.tags || [];

                    return (
                        <Link href={`/post/${post.id}`} className="block group" key={`post-${post.id}`}>
                            <article className="relative flex flex-col sm:flex-row items-start gap-6 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.gradient} bg-gradient-to-b opacity-60 group-hover:opacity-100 transition-opacity`} />

                                <div className="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden shrink-0">
                                    {post.cover ? (
                                        <img
                                            src={post.cover}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-orange-200/30 dark:bg-orange-800/20 blur-xl" />
                                            <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-xl" />
                                            <div className="absolute top-4 left-4">
                                                <span className="text-4xl font-bold text-gray-200 dark:text-gray-700 group-hover:text-orange-200 dark:group-hover:text-orange-700 transition-colors duration-300">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {tags.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className={`px-2.5 py-0.5 text-xs rounded-full ${color.bg} ${color.text} font-medium`}>
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {post.title}
                                        </h2>

                                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                                            {post.summary}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2">
                                            {post.author_avatar ? (
                                                <img src={post.author_avatar} alt={post.author_name} className="w-7 h-7 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${color.gradient} flex items-center justify-center`}>
                                                    <span className="text-white text-xs font-bold">
                                                        {post.author_name?.[0]?.toUpperCase() || 'A'}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{post.author_name || '佚名'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">{getRelativeTime(post.created_at)}</span>
                                            <div className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300`}>
                                                <RiArrowRightLine className={`w-4 h-4 ${color.text}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    );
                })}

                {posts.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <RiArticleLine className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-lg">
                            {selectedTag ? `没有找到标签为"${selectedTag}"的文章` : '还没有发布任何文章哦～'}
                        </p>
                    </div>
                )}

                <div ref={loaderRef} className="flex justify-center py-8">
                    {loading && (
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-mono text-sm">
                            <RiLoader4Line className="animate-spin h-4 w-4" />
                            加载中...
                        </div>
                    )}
                    {!hasMore && posts.length > 0 && (
                        <span className="text-gray-300 dark:text-gray-600 font-mono text-sm">没有更多文章了</span>
                    )}
                </div>
            </div>
        </div>
    );
}
