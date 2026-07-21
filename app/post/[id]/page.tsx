import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { getPublicUrl } from '../../../lib/oss';
import { getSettings } from '../../../lib/settings';
import PostClient from './PostClient';

export const revalidate = 60;

interface Post {
    id: number;
    title: string;
    summary: string;
    cover: string;
    tags: string[];
    content: string;
    author_id: number;
    created_at: string;
    author_name: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const result = await db.query(
            'SELECT title, summary, cover, tags, created_at FROM posts WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) return { title: '文章未找到' };

        const post: { title: string; summary: string; cover: string; tags: string[]; created_at: string } = result.rows[0];
        const settings = await getSettings();
        const siteTitle = settings.site_title || 'star和lemon的小站';
        const coverUrl = post.cover ? await getPublicUrl(post.cover) : undefined;

        return {
            title: post.title,
            description: post.summary || `${post.title} - ${siteTitle}`,
            keywords: post.tags || undefined,
            openGraph: {
                title: post.title,
                description: post.summary || undefined,
                type: 'article',
                publishedTime: post.created_at,
                tags: post.tags || undefined,
                images: coverUrl ? [{ url: coverUrl, width: 1200, height: 630, alt: post.title }] : undefined,
            },
        };
    } catch {
        return { title: '文章' };
    }
}

function stripMarkdownInline(text: string) {
    return text
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
}

function extractToc(content: string) {
    const tocItems: Array<{ level: number; text: string; id: string }> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const atxMatch = line.match(/^(#{2,6})\s+(.+)$/);
        if (atxMatch) {
            const level = atxMatch[1].length;
            const rawText = atxMatch[2].trim().replace(/\s*#+\s*$/, '');
            const text = stripMarkdownInline(rawText);
            const id = (text.replace(/\s+/g, '-').toLowerCase() || 'heading') + `-${level}`;
            tocItems.push({ level, text, id });
            continue;
        }

        const htmlMatch = line.match(/^<h([2-6])(?:\s[^>]*)?>(.+?)<\/h\1>$/i);
        if (htmlMatch) {
            const level = parseInt(htmlMatch[1], 10);
            const text = htmlMatch[2].replace(/<[^>]+>/g, '').trim();
            const id = (text.replace(/\s+/g, '-').toLowerCase() || 'heading') + `-${level}`;
            tocItems.push({ level, text, id });
            continue;
        }
    }

    return tocItems;
}

function formatDateTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let post: Post | null = null;
    try {
        const result = await db.query(`
            SELECT posts.*, users.nickname as author_name
            FROM posts
            LEFT JOIN users ON posts.author_id = users.id
            WHERE posts.id = $1
        `, [id]);
        if (result.rows.length > 0) {
            post = result.rows[0];
        }
    } catch (e) {
        console.error('Failed to fetch post', e);
    }

    if (!post) {
        return notFound();
    }

    const session = await getSession();
    const rawUser = session?.user;
    const user = rawUser ? {
        ...rawUser,
        avatar: await getPublicUrl(rawUser.avatar),
        bio: null,
        birthday: null,
        qq_identifier: null,
        sl_coin: 0,
    } : null;

    const authorColor = post.author_name === 'Star' ? 'bg-blue-500' : 'bg-yellow-500';
    const authorTextColor = post.author_name === 'Star' ? 'text-blue-500' : 'text-yellow-500';
    const tags = post.tags || [];
    const tocItems = extractToc(post.content || '');
    const createdAt = formatDateTime(post.created_at);
    const settings = await getSettings();
    const siteTitle = settings.site_title || 'star和lemon的小站';

    return (
        <PostClient
            content={post.content || ''}
            tocItems={tocItems}
            title={post.title}
            authorName={post.author_name}
            authorColor={authorColor}
            authorTextColor={authorTextColor}
            createdAt={createdAt}
            tags={tags}
            cover={(await getPublicUrl(post.cover)) || undefined}
            postId={post.id}
            user={user}
            siteTitle={siteTitle}
        />
    );
}
