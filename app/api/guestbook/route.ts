import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getSetting } from '@/lib/settings';
import { revalidatePath } from 'next/cache';

const COLORS = ['#fcd34d', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fef08a', '#fda4af', '#67e8f9'];

export async function POST(req: NextRequest) {
    const session = await getSession();
    console.log('Session:', JSON.stringify(session));
    
    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
    }

    const formData = await req.formData();
    const content = formData.get('content')?.toString()?.trim();
    const imageUrl = formData.get('image_url')?.toString() || null;
    
    if (!content && !imageUrl) {
        return NextResponse.json({ success: false, message: '内容不能为空' }, { status: 400 });
    }

    try {
        const userId = session.user.id;
        const bgColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const isAdmin = session.user.role === 'admin';
        
        // 管理员不需要审核，或者根据配置决定
        const guestbookReview = await getSetting('guestbook_review', 'true');
        const status = isAdmin ? 'approved' : (guestbookReview === 'true' ? 'pending' : 'approved');
        
        console.log('Inserting with user_id:', userId, 'content:', content, 'bg_color:', bgColor);
        
        const result = await db.query(
            `INSERT INTO messages (user_id, content, image_url, status, bg_color, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) 
             RETURNING id, user_id, content, image_url, created_at, bg_color`,
            [userId, content || null, imageUrl, status, bgColor]
        );
        
        if (!result.rows[0]) {
          throw new Error('Insert failed');
        }
        
        const newMessage = result.rows[0];
        revalidatePath('/guestbook');
        return NextResponse.json({ 
            success: true, 
            message: { 
                ...newMessage, 
                author_name: session.user.nickname || session.user.username,
                status: status
            } 
        });
    } catch (e: any) {
        console.error('Failed to submit message:', e);
        return NextResponse.json({ success: false, message: '发送失败: ' + e.message }, { status: 500 });
    }
}