'use client';

import Image from 'next/image'
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {RiArrowLeftLine, RiArrowUpSLine, RiShareForwardLine} from '@remixicon/react';
import ReactMarkdown, {type Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import {toast} from "sonner";
import {CommentSection} from './CommentSection';
import {ArticleReaders, usePresence} from '../../components/presence';
import {BilibiliPlayer} from '../../components/bilibili-player';
import {DouyinIframeEmbed} from '../../components/douyin-iframe-embed';
import {DouyinVideoEmbed} from '../../components/douyin-video-embed';
import {getDouyinEmbedMode, DouyinEmbedMode} from '@/lib/douyin';
import type {UserInfo} from '../../components/user-context';

function getTextFromChildren(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextFromChildren).join('');
    if (typeof node === 'object' && node !== null && 'props' in node) {
        const element = node as React.ReactElement<{ children?: React.ReactNode }>;
        if (element.props?.children) return getTextFromChildren(element.props.children);
    }
    return '';
}

function PostContent({content, douyinMode}: { content: string; douyinMode: DouyinEmbedMode }) {
    function createHeading(Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
        const level = parseInt(Tag[1], 10);
        return function Heading({children, ...props}: React.HTMLAttributes<HTMLHeadingElement>) {
            const text = getTextFromChildren(children);
            const id = (text.replace(/\s+/g, '-').toLowerCase() || 'heading') + `-${level}`;
            return <Tag id={id} {...props} className="scroll-mt-24">{children}</Tag>;
        };
    }

    const components = useMemo<Components>(
        () => ({
            a: ({href, children, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
                const isExternal = href && /^https?:\/\//i.test(href);
                if (isExternal) {
                    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                }
                return <a href={href} {...props}>{children}</a>;
            },
            p: ({children, ...props}: React.HTMLAttributes<HTMLParagraphElement>) => {
                const text = getTextFromChildren(children);
                if (!text || text.trim() === '') return <p {...props} className="my-2"/>;

                // Douyin: line is a pure douyin short URL
                const douyinRegex = /^https:\/\/v\.douyin\.com\/[^\s]+$/;
                if (douyinRegex.test(text.trim())) {
                    return <p {...props}>{douyinMode === 'iframe' ? <DouyinIframeEmbed shortUrl={text.trim()} /> : <DouyinVideoEmbed shortUrl={text.trim()} />}</p>;
                }

                // Bilibili: 【title】URL format
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
            h1: createHeading('h1'),
            h2: createHeading('h2'),
            h3: createHeading('h3'),
            h4: createHeading('h4'),
            h5: createHeading('h5'),
            h6: createHeading('h6'),
        }),
        []
    );

    return (
        <article className="prose prose-lg max-w-none break-words">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}

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
    user?: UserInfo | null;
    siteTitle: string;
}

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
                                       siteTitle,
                                   }: PostClientProps) {
    const [activeId, setActiveId] = useState('');
    const [readPercent, setReadPercent] = useState(0);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [dynamicToc, setDynamicToc] = useState<TocItem[]>(tocItems);
    const {readers} = usePresence(`/post/${postId}`);

    const [douyinMode, setDouyinMode] = useState<DouyinEmbedMode>('iframe');

    useEffect(() => {
        getDouyinEmbedMode().then(setDouyinMode);
    }, []);

    const wordsPerMinute = 200;
    const textLength = content.replace(/[#`*\[\]]/g, '').length;
    const readTime = Math.max(1, Math.ceil(textLength / wordsPerMinute));

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

    useEffect(() => {
        const headingEls = finalToc
            .map((item) => document.getElementById(item.id))
            .filter((el): el is HTMLElement => el !== null);

        if (headingEls.length === 0) return;

        const handleScroll = () => {
            let currentId = '';
            for (let i = headingEls.length - 1; i >= 0; i--) {
                const rect = headingEls[i].getBoundingClientRect();
                if (rect.top <= 120) {
                    currentId = headingEls[i].id;
                    break;
                }
            }
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                currentId = headingEls[headingEls.length - 1].id;
            }
            setActiveId(currentId);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [finalToc]);

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
        const shareText = `【${title}】- ${siteTitle}\n${url}`;
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
    }, [title, siteTitle]);

    return (
        <div className="flex-1 flex flex-col pt-12 pb-20 gap-8">
            <div className="max-w-7xl mx-auto w-full flex gap-12">
                <div className="flex-1 max-w-3xl min-w-0">
                    <Link
                        href="/post"
                        className="inline-flex items-center text-gray-400 hover:text-blue-500 transition-colors font-mono text-sm w-fit group"
                    >
                        <RiArrowLeftLine className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"/>
                        返回文章列表
                    </Link>

                    <header className="space-y-6 mt-6">
                        {cover && (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                <Image src={cover} alt={title} fill className="object-cover"/>
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
                            <ArticleReaders readers={readers}/>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
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

                    <PostContent content={content} douyinMode={douyinMode}/>

                    <div
                        className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <p className="text-gray-400 dark:text-gray-500 font-serif italic">Thanks for reading.</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm"
                                aria-label="分享"
                                title="分享"
                            >
                                <RiShareForwardLine className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={scrollToTop}
                                className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                                aria-label="回到顶部"
                            >
                                <RiArrowUpSLine className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>

                    <CommentSection postId={postId} user={user ?? null}/>
                </div>

                <aside
                    className="hidden lg:block w-64 flex-shrink-0 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
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
                                    {finalToc.map((item, i) => (
                                        <button
                                            key={`${item.id}-${i}`}
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

            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400 transition-all shadow-md z-50"
                    aria-label="回到顶部"
                >
                    <RiArrowUpSLine className="w-5 h-5"/>
                </button>
            )}
        </div>
    );
}
