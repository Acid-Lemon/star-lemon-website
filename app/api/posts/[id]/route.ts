import { NextResponse, NextRequest } from 'next/server';
import db from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';
import { generateSummary } from '../../../../lib/ai';
import { deleteUploadedFile } from '../../../../lib/file';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: '无权限' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, content, tags, cover, oldCover } = body;

        if (!title || !content) {
            return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
        }

        const tagsArray = (tags || '').split(',').map((t: string) => t.trim()).filter((t: string) => t);
        const pgTags = tagsArray.length > 0 ? `{${tagsArray.join(',')}}` : '{}';

        // Delete old cover if changed
        if (oldCover && cover !== oldCover) {
            await deleteUploadedFile(oldCover);
        }

        const summary = await generateSummary({ title, content });

        await db.query(
            'UPDATE posts SET title = $1, tags = $2, summary = $3, content = $4, cover = $5 WHERE id = $6',
            [title, pgTags, summary, content, cover || null, id]
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Update post error:', e);
        return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let stage = '初始化';
    try {
        stage = '校验登录';
        const session = await getSession();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: '无权限' }, { status: 403 });
        }

        stage = '解析请求';
        const { id } = await params;
        const body = await request.json();
        const { cover, oldCover } = body;

        stage = '删除旧封面';
        if (oldCover && cover !== oldCover) {
            await deleteUploadedFile(oldCover);
        }

        stage = '更新封面';
        const result = await db.query(
            'UPDATE posts SET cover = $1 WHERE id = $2 RETURNING id',
            [cover || null, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: '文章不存在' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        console.error(`Update post cover error at stage "${stage}":`, e);
        return NextResponse.json({ error: `${stage}失败`, detail }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: '无权限' }, { status: 403 });
        }

        const { id } = await params;

        const result = await db.query('SELECT cover FROM posts WHERE id = $1', [id]);
        const cover = result.rows[0]?.cover;

        await db.query('DELETE FROM posts WHERE id = $1', [id]);

        if (cover) {
            await deleteUploadedFile(cover);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Delete post error:', e);
        return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }
}
