import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, url, avatar, description, status, sort_order } = body;

        const setClauses: string[] = ['updated_at = NOW()'];
        const values: any[] = [];
        let paramIndex = 1;

        if (name !== undefined) { setClauses.push(`name = $${paramIndex++}`); values.push(name); }
        if (url !== undefined) { setClauses.push(`url = $${paramIndex++}`); values.push(url); }
        if (avatar !== undefined) { setClauses.push(`avatar = $${paramIndex++}`); values.push(avatar); }
        if (description !== undefined) { setClauses.push(`description = $${paramIndex++}`); values.push(description); }
        if (status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(status); }
        if (sort_order !== undefined) { setClauses.push(`sort_order = $${paramIndex++}`); values.push(sort_order); }

        if (setClauses.length === 1) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(id);
        const result = await db.query(
            `UPDATE friend_links SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Friend link not found' }, { status: 404 });
        }

        revalidatePath('/friends');
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update friend link:', error);
        return NextResponse.json({ error: 'Failed to update friend link' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const result = await db.query(
            'DELETE FROM friend_links WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Friend link not found' }, { status: 404 });
        }

        revalidatePath('/friends');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete friend link:', error);
        return NextResponse.json({ error: 'Failed to delete friend link' }, { status: 500 });
    }
}
