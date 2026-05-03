import { notFound } from 'next/navigation';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import PostClient from './PostClient';

export const revalidate = 0; // 动态渲染

function extractToc(content: string) {
    const tocItems: Array<{ level: number; text: string; id: string }> = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Markdown ATX 标题: ## 标题
        const atxMatch = line.match(/^(#{2,6})\s+(.+)$/);
        if (atxMatch) {
            const level = atxMatch[1].length;
            const text = atxMatch[2].trim().replace(/\s*#+\s*$/, ''); // 去掉尾部 #
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            tocItems.push({ level, text, id });
            continue;
        }
        
        // HTML 标题: <h2>标题</h2> 或 <h2 class="...">标题</h2>
        const htmlMatch = line.match(/^<h([2-6])(?:\s[^>]*)?>(.+?)<\/h\1>$/i);
        if (htmlMatch) {
            const level = parseInt(htmlMatch[1], 10);
            const text = htmlMatch[2].replace(/<[^>]+>/g, '').trim(); // 去掉内部 HTML 标签
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
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

    let post: any = null;
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
    const user = session?.user || null;

    const authorColor = post.author_name === 'Star' ? 'bg-blue-500' : 'bg-yellow-500';
    const authorTextColor = post.author_name === 'Star' ? 'text-blue-500' : 'text-yellow-500';
    const tags = post.tags || [];
    const tocItems = extractToc(post.content || '');
    const createdAt = formatDateTime(post.created_at);

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
            cover={post.cover}
            postId={post.id}
            user={user}
        />
    );
}