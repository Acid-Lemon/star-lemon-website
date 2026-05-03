import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getPublicUrl } from '../../../lib/oss';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '6');

    try {
        const result = await db.query(`
            SELECT posts.id, posts.title, posts.summary, posts.cover, posts.created_at, posts.tags, users.nickname as author_name 
            FROM posts 
            LEFT JOIN users ON posts.author_id = users.id 
            ORDER BY posts.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const posts = await Promise.all(
            result.rows.map(async (row: any) => ({
                ...row,
                cover: await getPublicUrl(row.cover),
            }))
        );

        return NextResponse.json({ posts });
    } catch (e) {
        console.error('Failed to fetch posts', e);
        return NextResponse.json({ posts: [], error: 'Failed to fetch posts' }, { status: 500 });
    }
}