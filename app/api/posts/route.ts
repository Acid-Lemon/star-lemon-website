import { NextResponse, NextRequest } from 'next/server';
import db from '../../../lib/db';
import { getPublicUrl } from '../../../lib/oss';
import { getSession } from '../../../lib/auth';
import { generateSummary } from '../../../lib/ai';

interface PostListRow {
    cover: string | null;
    author_avatar: string | null;
    [key: string]: unknown;
}

export async function POST(request: NextRequest) {
    let stage = '初始化';
    try {
        stage = '校验登录';
        const session = await getSession();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: '无权限' }, { status: 403 });
        }

        stage = '解析请求';
        const body = await request.json();
        const { title, content, tags, cover } = body;

        if (!title || !content) {
            return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
        }

        const tagsArray = (tags || '').split(',').map((t: string) => t.trim()).filter((t: string) => t);
        const pgTags = tagsArray.length > 0 ? `{${tagsArray.join(',')}}` : '{}';

        stage = '生成文章摘要';
        const summary = await generateSummary({ title, content });

        stage = '写入文章数据';
        const result = await db.query(
            'INSERT INTO posts (title, author_id, tags, summary, content, cover) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [title, session.user.id, pgTags, summary, content, cover || null]
        );

        return NextResponse.json({ success: true, id: result.rows[0].id });
    } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        console.error(`Create post error at stage "${stage}":`, e);
        return NextResponse.json({ error: `${stage}失败`, detail }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '6');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';

    try {
        let query = `
            SELECT posts.id, posts.title, posts.summary, posts.cover, posts.created_at, posts.tags, users.nickname as author_name, users.avatar as author_avatar
            FROM posts 
            LEFT JOIN users ON posts.author_id = users.id 
        `;
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        let paramIndex = 1;

        if (search) {
            conditions.push(`(posts.title ILIKE $${paramIndex} OR posts.summary ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (tag) {
            conditions.push(`($${paramIndex} = ANY(posts.tags) OR posts.tags::text LIKE $${paramIndex + 1})`);
            params.push(tag);
            params.push(`%"${tag}"%`);
            paramIndex += 2;
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY posts.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        const posts = await Promise.all(
            result.rows.map(async (row: PostListRow) => ({
                ...row,
                cover: await getPublicUrl(row.cover),
                author_avatar: await getPublicUrl(row.author_avatar),
            }))
        );

        return NextResponse.json({ posts });
    } catch (e) {
        console.error('Failed to fetch posts', e);
        return NextResponse.json({ posts: [], error: 'Failed to fetch posts' }, { status: 500 });
    }
}
