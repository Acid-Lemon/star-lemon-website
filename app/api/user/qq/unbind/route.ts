import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 });
        }

        const result = await db.query(
            'UPDATE users SET qq_identifier = NULL, updated_at = NOW() WHERE id = $1 RETURNING id',
            [session.user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'QQ已解绑' });
    } catch (error) {
        console.error('QQ unbind error:', error);
        return NextResponse.json({ error: '解绑失败，请重试' }, { status: 500 });
    }
}
