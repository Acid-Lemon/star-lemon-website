import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { deleteUploadedFile } from '@/lib/file';

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
        const { status } = body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const result = await db.query(
            'UPDATE messages SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        revalidatePath('/guestbook');
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update message:', error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
    }

    try {
        const isAdmin = session.user.role === 'admin';

        const msgResult = await db.query('SELECT image_url, user_id FROM messages WHERE id = $1', [id]);
        if (msgResult.rows.length === 0) {
            return NextResponse.json({ success: false, message: '留言不存在' }, { status: 404 });
        }

        const msg = msgResult.rows[0];
        if (!isAdmin && msg.user_id !== session.user.id) {
            return NextResponse.json({ success: false, message: '无权限删除' }, { status: 403 });
        }

        const result = await db.query(
            'DELETE FROM messages WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
        }

        await deleteUploadedFile(msg.image_url);

        revalidatePath('/guestbook');
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Failed to delete message', e);
        return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
    }
}
