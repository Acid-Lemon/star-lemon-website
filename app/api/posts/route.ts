import { NextResponse } from 'next/server';
import db from '../../../lib/db';

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

        return NextResponse.json({ posts: result.rows });
    } catch (e) {
        console.error('Failed to fetch posts', e);
        return NextResponse.json({ posts: [], error: 'Failed to fetch posts' }, { status: 500 });
    }
}