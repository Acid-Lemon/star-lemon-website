import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { deleteUploadedFile } from '@/lib/file';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    
    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
    }

    try {
        // 查询图片 URL
        const msgResult = await db.query('SELECT image_url FROM messages WHERE id = $1 AND user_id = $2', [id, session.user.id]);
        const imageUrl = msgResult.rows[0]?.image_url;

        const result = await db.query(
            'DELETE FROM messages WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, session.user.id]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, message: '留言不存在或无权限删除' }, { status: 403 });
        }

        // 删除关联的图片文件
        await deleteUploadedFile(imageUrl);
        
        revalidatePath('/guestbook');
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Failed to delete message', e);
        return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
    }
}