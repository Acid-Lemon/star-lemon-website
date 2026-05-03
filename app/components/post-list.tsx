'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

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
}

export function PostList({ initialPosts }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        
        setLoading(true);
        try {
            const res = await fetch(`/api/posts?offset=${posts.length}&limit=6`);
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
    }, [posts.length, loading, hasMore]);

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

    // 装饰颜色循环
    const accentColors = [
        { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-400 to-blue-500' },
        { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-400 to-purple-500' },
        { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-400 to-green-500' },
        { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-400 to-orange-500' },
        { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', gradient: 'from-pink-400 to-pink-500' },
        { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', gradient: 'from-teal-400 to-teal-500' },
    ];

    return (
        <div className="space-y-6">
            {posts.map((post, index) => {
                const color = accentColors[index % accentColors.length];
                const tags = post.tags || [];

                return (
                    <Link href={`/post/${post.id}`} className="block group" key={post.id}>
                        <article className="relative flex flex-col sm:flex-row items-start gap-6 p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden">
                            {/* 左侧装饰条 */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.gradient} bg-gradient-to-b opacity-60 group-hover:opacity-100 transition-opacity`} />
                            
                            {/* 封面图片 */}
                            <div className="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden shrink-0">
                                {post.cover ? (
                                    <img 
                                        src={post.cover} 
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-orange-200/30 blur-xl" />
                                        <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full bg-blue-200/30 blur-xl" />
                                        <div className="absolute top-4 left-4">
                                            <span className="text-4xl font-bold text-gray-200 group-hover:text-orange-200 transition-colors duration-300">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 内容区域 */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    {/* 标签 */}
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {tags.slice(0, 3).map((tag: string) => (
                                                <span key={tag} className={`px-2.5 py-0.5 text-xs rounded-full ${color.bg} ${color.text} font-medium`}>
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* 标题 */}
                                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {post.title}
                                    </h2>

                                    {/* 摘要 */}
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                                        {post.summary}
                                    </p>
                                </div>

                                {/* 底部信息 */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
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
                                    <span className="text-sm text-gray-600">{post.author_name || '佚名'}</span>
                                </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">{getRelativeTime(post.created_at)}</span>
                                        <div className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300`}>
                                            <svg className={`w-4 h-4 ${color.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Link>
                );
            })}
            
            {posts.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-lg">还没有发布任何文章哦～</p>
                </div>
            )}

            <div ref={loaderRef} className="flex justify-center py-8">
                {loading && (
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        加载中...
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <span className="text-gray-300 font-mono text-sm">没有更多文章了</span>
                )}
            </div>
        </div>
    );
}
