'use client';

import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {toast} from "sonner";
import {EmojiPicker} from "../../components/emoji-picker";

/* ─────────────── 纯文本提取 ─────────────── */
function getTextFromChildren(node: any): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextFromChildren).join('');
    if (node?.props?.children) return getTextFromChildren(node.props.children);
    return '';
}

/* ─────────────── 稳定 B站播放器（memo） ─────────────── */
const BilibiliPlayer = React.memo(function BilibiliPlayer({
                                                              bvid,
                                                              time,
                                                          }: {
    bvid: string;
    time?: string;
}) {
    const params = new URLSearchParams();
    params.set('bvid', bvid);
    params.set('autoplay', '0');
    params.set('danmaku', '0');
    if (time) params.set('t', time);
    const src = `https://player.bilibili.com/player.html?${params.toString()}`;

    return (
        <iframe
            key={bvid}                       /* 稳定 key，防止销毁重建 */
            src={src}
            scrolling="no"
            allowFullScreen
            width="100%"
            height="400"
            style={{borderRadius: 8, margin: '24px 0', border: 'none'}}
            title={`Bilibili ${bvid}`}
            loading="eager"                  /* 立即加载，不要懒加载 */
        />
    );
});

/* ─────────────── 纯文章渲染（无滚动状态） ─────────────── */
function PostContent({content}: { content: string }) {
    const components = useMemo(
        () => ({
            p: ({children, ...props}: any) => {
                const text = getTextFromChildren(children);
                if (!text || text.trim() === '') return <p {...props} className="my-2"/>;
                
                const regex = /(【[^】]+】)(?:\s*【[^】]+】)?\s*(https?:\/\/www\.bilibili\.com\/video\/(BV\w+)[^\s]*)/g;
                const matches = Array.from(text.matchAll(regex));
                if (matches.length === 0) return <p {...props}>{children}</p>;

                const nodes: React.ReactNode[] = [];
                let lastIndex = 0;
                for (const match of matches) {
                    const index = match.index ?? 0;
                    if (index > lastIndex) {
                        nodes.push(text.slice(lastIndex, index));
                    }
                    const bvid = match[3];
                    const timeMatch = match[2].match(/[?\u0026]t=(\d+)/);
                    const time = timeMatch ? timeMatch[1] : undefined;
                    nodes.push(<BilibiliPlayer key={`${bvid}-${index}`} bvid={bvid} time={time}/>);
                    lastIndex = index + match[0].length;
                }
                if (lastIndex < text.length) {
                    nodes.push(text.slice(lastIndex));
                }
                return <p {...props}>{nodes}</p>;
            },
            h1: ({children, ...props}: any) => {
                const text = React.Children.toArray(children).join('');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return (
                    <h1 id={id} {...props} className="scroll-mt-24">
                        {children}
                    </h1>
                );
            },
            h2: ({children, ...props}: any) => {
                const text = React.Children.toArray(children).join('');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return (
                    <h2 id={id} {...props} className="scroll-mt-24">
                        {children}
                    </h2>
                );
            },
            h3: ({children, ...props}: any) => {
                const text = React.Children.toArray(children).join('');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return (
                    <h3 id={id} {...props} className="scroll-mt-24">
                        {children}
                    </h3>
                );
            },
            h4: ({children, ...props}: any) => {
                const text = React.Children.toArray(children).join('');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return (
                    <h4 id={id} {...props} className="scroll-mt-24">
                        {children}
                    </h4>
                );
            },
            h5: ({children, ...props}: any) => {
                const text = React.Children.toArray(children).join('');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return (
                    <h5 id={id} {...props} className="scroll-mt-24">
                        {children}
                    </h5>
                );
            },
            h6: ({children, ...props}: any) => {
                const text = React.Children.toArray(children).join('');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return (
                    <h6 id={id} {...props} className="scroll-mt-24">
                        {children}
                    </h6>
                );
            },
        }),
        [] // content 不变，components 永不需要重建
    );

    return (
        <article className="prose prose-lg max-w-none break-words">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={components}
                urlTransform={(url) => url}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}

/* ─────────────── 类型定义 ─────────────── */
interface TocItem {
    level: number;
    text: string;
    id: string;
}

interface PostClientProps {
    content: string;
    tocItems: TocItem[];
    title: string;
    authorName: string;
    authorColor: string;
    authorTextColor: string;
    createdAt: string;
    tags: string[];
    cover?: string;
    postId: number;
    user?: any;
}

/* ─────────────── 评论表单组件 ─────────────── */
function CommentForm({
    user,
    postId,
    replyTo,
    onSuccess,
    onCancel
}: {
    user: any;
    postId: number;
    replyTo?: any;
    onSuccess: (comment: any) => void;
    onCancel?: () => void;
}) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
                toast.success('图片上传成功');
            } else {
                toast.error('图片上传失败');
            }
        } catch {
            toast.error('图片上传失败');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmoji(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!content.trim() && !imageUrl) || !user) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post_id: postId,
                    content: content.trim(),
                    image_url: imageUrl || null,
                    parent_id: replyTo?.id || null
                })
            });

            if (res.ok) {
                const newComment = await res.json();
                setContent('');
                setImageUrl('');
                
                if (newComment.status === 'approved') {
                    toast.success('评论发表成功');
                    onSuccess(newComment);
                } else {
                    toast.success('评论提交成功，等待审核');
                    onSuccess(newComment); // Optionally add to list anyway
                }
            } else {
                toast.error('评论提交失败');
            }
        } catch (error) {
            toast.error('评论提交失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 rounded-xl mb-6">
            <div className="flex items-center gap-3 mb-4">
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.nickname}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.nickname?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.nickname || '用户'}</p>
                    {replyTo && (
                        <p className="text-xs text-blue-500">
                            回复 {replyTo.nickname}
                            <button 
                                type="button" 
                                onClick={onCancel} 
                                className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                                取消
                            </button>
                        </p>
                    )}
                </div>
            </div>
            <div className="mb-3">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={replyTo ? `回复 ${replyTo.nickname}...` : "写下你的评论..."}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
            </div>
            
            {imageUrl && (
                <div className="mb-3 relative inline-block">
                    <img src={imageUrl} alt="预览" className="max-w-[200px] rounded-lg" />
                    <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                        ×
                    </button>
                </div>
            )}
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowEmoji(!showEmoji)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            😊
                        </button>
                        {showEmoji && (
                            <EmojiPicker 
                                onSelect={handleEmojiSelect} 
                                onClose={() => setShowEmoji(false)} 
                            />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        📷
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    {uploading && <span className="text-xs text-gray-400">上传中...</span>}
                </div>
                <button
                    type="submit"
                    disabled={submitting || (!content.trim() && !imageUrl)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? '提交中...' : '发表评论'}
                </button>
            </div>
        </form>
    );
}

/* ─────────────── 评论组件 ─────────────── */
function CommentSection({ postId, user }: { postId: number; user: any }) {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyTo, setReplyTo] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?post_id=${postId}`);
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    // 构建评论树
    const buildCommentTree = (comments: any[]) => {
        const map: any = {};
        const roots: any[] = [];
        
        comments.forEach(comment => {
            map[comment.id] = { ...comment, children: [] };
        });
        
        comments.forEach(comment => {
            if (comment.parent_id && map[comment.parent_id]) {
                map[comment.parent_id].children.push(map[comment.id]);
            } else {
                roots.push(map[comment.id]);
            }
        });
        
        return roots;
    };

    const handleDelete = (commentId: number) => {
        setDeleteTarget(commentId);
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;
        
        try {
            const res = await fetch(`/api/comments?id=${deleteTarget}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('删除成功');
                await fetchComments();
            } else {
                toast.error('删除失败');
            }
        } catch {
            toast.error('删除失败');
        } finally {
            setDeleteTarget(null);
        }
    };

    const getRelativeTime = (dateStr: string) => {
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
    };

    const handleCommentSuccess = (newComment: any) => {
        setComments(prev => [...prev, newComment]);
        setReplyTo(null);
    };

    // 渲染单条评论内容
    const renderCommentContent = (comment: any) => (
        <div key={comment.id} className="flex gap-3 group">
            {comment.avatar ? (
                <img src={comment.avatar} alt={comment.nickname} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {comment.nickname?.[0]?.toUpperCase() || '匿'}
                </div>
            )}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.nickname}</span>
                    {comment._level > 2 && comment._parentName && (
                        <span className="text-xs text-gray-400">
                            回复 <span className="text-blue-500">{comment._parentName}</span>
                        </span>
                    )}
                    <span className="text-xs text-gray-400">{getRelativeTime(comment.created_at)}</span>
                </div>
                {comment.content && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-2">{comment.content}</p>
                )}
                {comment.image_url && (
                    <div className="mb-2">
                        <img
                            src={comment.image_url}
                            alt="评论图片"
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(comment.image_url, '_blank')}
                        />
                    </div>
                )}
                <div className="flex items-center gap-4 text-xs mb-3">
                    {user && (
                        <button
                            onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            {replyTo?.id === comment.id ? '取消回复' : '回复'}
                        </button>
                    )}
                    {user && (user.id === comment.user_id || user.role === 'admin') && (
                        <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            删除
                        </button>
                    )}
                </div>

                {/* Inline reply form */}
                {replyTo?.id === comment.id && (
                    <div className="mt-2 mb-4">
                        <CommentForm
                            user={user}
                            postId={postId}
                            replyTo={replyTo}
                            onSuccess={handleCommentSuccess}
                            onCancel={() => setReplyTo(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    // 平铺渲染评论树：所有子评论只缩进一次，类似抖音
    const renderCommentThread = (comment: any) => {
        const allReplies = flattenReplies(comment);
        return (
            <div key={comment.id} className="space-y-3">
                {/* 主评论 */}
                {renderCommentContent(comment)}
                {/* 所有回复统一缩进一次 */}
                {allReplies.length > 0 && (
                    <div className="ml-12 space-y-3">
                        {allReplies.map(reply => renderCommentContent(reply))}
                    </div>
                )}
            </div>
        );
    };

    // 递归收集所有后代回复，平铺成一层，并标记层级
    const flattenReplies = (comment: any): any[] => {
        const result: any[] = [];
        const walk = (node: any, level: number) => {
            if (node.children) {
                for (const child of node.children) {
                    result.push({ ...child, _level: level, _parentName: node.nickname });
                    walk(child, level + 1);
                }
            }
        };
        walk(comment, 2);
        return result;
    };

    const commentTree = buildCommentTree(comments);

    return (
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">评论</h3>

            {/* 顶层评论表单 */}
            {user ? (
                <CommentForm
                    user={user}
                    postId={postId}
                    onSuccess={handleCommentSuccess}
                />
            ) : (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">登录后即可评论</p>
                    <a
                        href="/login"
                        className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        去登录
                    </a>
                </div>
            )}

            {/* 评论列表 */}
            {loading ? (
                <div className="text-center py-8 text-gray-400">加载中...</div>
            ) : commentTree.length === 0 ? (
                <div className="text-center py-8 text-gray-400">暂无评论，快来抢沙发吧！</div>
            ) : (
                <div className="space-y-6">
                    {commentTree.map((comment) => renderCommentThread(comment))}
                </div>
            )}

            {/* 删除确认对话框 */}
            {deleteTarget !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">确认删除</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">确定要删除这条评论吗？此操作不可撤销。</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={executeDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────── 主组件（交互层） ─────────────── */
export default function PostClient({
                                           content,
                                           tocItems,
                                           title,
                                           authorName,
                                           authorColor,
                                           authorTextColor,
                                           createdAt,
                                           tags,
                                           cover,
                                           postId,
                                           user,
                                       }: PostClientProps) {
    const [activeId, setActiveId] = useState('');
    const [readPercent, setReadPercent] = useState(0);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [dynamicToc, setDynamicToc] = useState<TocItem[]>(tocItems);

    const wordsPerMinute = 200;
    const textLength = content.replace(/[#`*\[\]]/g, '').length;
    const readTime = Math.max(1, Math.ceil(textLength / wordsPerMinute));

    /* 客户端二次提取 TOC */
    useEffect(() => {
        const timer = setTimeout(() => {
            const headings = document.querySelectorAll(
                'article h2, article h3, article h4, article h5, article h6'
            );
            const items = Array.from(headings).map((h) => ({
                level: parseInt(h.tagName[1], 10),
                text: h.textContent || '',
                id: h.id,
            }));
            if (items.length > 0) setDynamicToc(items);
        }, 100);
        return () => clearTimeout(timer);
    }, [content]);

    const finalToc = dynamicToc.length > 0 ? dynamicToc : tocItems;

    /* Scroll spy */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            {rootMargin: '-20% 0px -60% 0px'}
        );
        finalToc.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [finalToc]);

    /* 阅读进度 + 回到顶部 */
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
            setReadPercent(Math.min(100, percent));
            setShowBackToTop(scrollTop > 300);
        };
        window.addEventListener('scroll', handleScroll, {passive: true});
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToHeading = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({top, behavior: 'smooth'});
        }
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, []);

    const handleShare = useCallback(() => {
        const url = window.location.href;
        const shareText = `【star和lemon的小站】${title}\n${url}`;
        navigator.clipboard
            .writeText(shareText)
            .then(() => toast.success('已复制到剪贴板'))
            .catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = shareText;
                textarea.style.cssText = 'position:fixed;opacity:0;';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                toast.success('已复制到剪贴板');
            });
    }, [title]);

    return (
        <div className="flex-1 flex flex-col pt-12 pb-20 gap-8">
            <div className="max-w-7xl mx-auto w-full flex gap-12">
                {/* 左侧：文章内容 */}
                <div className="flex-1 max-w-3xl min-w-0">
                    <Link
                        href="/post"
                        className="inline-flex items-center text-gray-400 hover:text-blue-500 transition-colors font-mono text-sm w-fit group"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                        </svg>
                        返回文章列表
                    </Link>

                    <header className="space-y-6 mt-6">
                        {cover && (
                            <div className="w-full aspect-video rounded-xl overflow-hidden">
                                <img
                                    src={cover}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-mono">
                            <span>{createdAt}</span>
                            <span>•</span>
                            <span>{readTime} 分钟阅读</span>
                            <span>•</span>
                            <span className={`flex items-center gap-1 ${authorTextColor}`}>
                                <span className={`w-2 h-2 rounded-full ${authorColor}`}/>
                                {authorName || '佚名'}
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                            {title}
                        </h1>
                        <div className="flex gap-2">
                            {tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full border border-gray-100 dark:border-gray-700 font-mono"
                                >
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    </header>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"/>

                    <PostContent content={content}/>

                    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <p className="text-gray-400 dark:text-gray-500 font-serif italic">Thanks for reading.</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm"
                                aria-label="分享"
                                title="分享"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={scrollToTop}
                                className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                                aria-label="回到顶部"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 评论区 */}
                    <CommentSection postId={postId} user={user} />
                </div>

                {/* 右侧：大纲 + 阅读进度 */}
                <aside
                    className="hidden lg:block w-64 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm"
                >
                    <div className="sticky top-24 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                                <span>阅读进度</span>
                                <span>{readPercent}%</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                                    style={{width: `${readPercent}%`}}
                                />
                            </div>
                        </div>

                        {finalToc.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 font-mono">目录</h3>
                                <nav className="space-y-1">
                                    {finalToc.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToHeading(item.id)}
                                            className={`block w-full text-left text-sm transition-colors py-1 pr-2 border-l-2 ${
                                                activeId === item.id
                                                    ? 'border-blue-500 text-blue-600 font-medium'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                            style={{paddingLeft: `${(item.level - 2) * 12 + 12}px`}}
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* 浮动回到顶部按钮 */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400 transition-all shadow-md z-50"
                    aria-label="回到顶部"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
                    </svg>
                </button>
            )}
        </div>
    );
}
