import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getPublicUrl } from '../../../lib/oss';

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
        const params: any[] = [];
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
            result.rows.map(async (row: any) => ({
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
