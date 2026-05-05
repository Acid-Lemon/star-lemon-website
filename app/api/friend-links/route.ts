import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getPublicUrl } from '@/lib/oss';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get('all');

        if (all === 'true') {
            const session = await getSession();
            if (!session || session.user?.role !== 'admin') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const result = await db.query(
                `SELECT * FROM friend_links ORDER BY sort_order ASC, created_at DESC`
            );

            const rows = await Promise.all(
                result.rows.map(async (row: any) => ({
                    ...row,
                    avatar: await getPublicUrl(row.avatar),
                }))
            );

            return NextResponse.json(rows);
        }

        const result = await db.query(
            `SELECT * FROM friend_links WHERE status = 'approved' ORDER BY sort_order ASC, created_at DESC`
        );

        const rows = await Promise.all(
            result.rows.map(async (row: any) => ({
                ...row,
                avatar: await getPublicUrl(row.avatar),
            }))
        );

        return NextResponse.json(rows);
    } catch (e: any) {
        console.error('Failed to fetch friend links:', e);
        return NextResponse.json({ error: 'Failed to fetch friend links' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, url, avatar, description, status, sort_order } = body;

        if (!name || !url) {
            return NextResponse.json({ error: '名称和链接不能为空' }, { status: 400 });
        }

        const result = await db.query(
            `INSERT INTO friend_links (name, url, avatar, description, status, sort_order, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING *`,
            [name, url, avatar || null, description || null, status || 'approved', sort_order || 0]
        );

        revalidatePath('/friends');
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create friend link:', error);
        return NextResponse.json({ error: 'Failed to create friend link' }, { status: 500 });
    }
}
