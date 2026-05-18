import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getSetting } from '@/lib/settings';
import { sendReviewNotification } from '@/lib/mail';
import { getPublicUrl } from '@/lib/oss';
import { revalidatePath } from 'next/cache';
import { getClientIP, lookupLocation } from '@/lib/ip-location';

const COLORS = ['#fcd34d', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fef08a', '#fda4af', '#67e8f9'];

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
                `SELECT m.*, u.nickname as author_name
                 FROM messages m
                 LEFT JOIN users u ON m.user_id = u.id
                 ORDER BY m.created_at DESC`
            );

            const rows = await Promise.all(
                result.rows.map(async (row: any) => ({
                    ...row,
                    image_url: row.image_url
                        ? (await Promise.all(
                            row.image_url.split(',').map((url: string) => getPublicUrl(url.trim()))
                          )).filter(Boolean).join(',')
                        : null,
                }))
            );

            return NextResponse.json(rows);
        }

        const session = await getSession();
        let result;
        if (session?.user?.id) {
            result = await db.query(
                `SELECT m.*, u.nickname as author_name
                 FROM messages m
                 JOIN users u ON m.user_id = u.id
                 WHERE m.status = 'approved' OR m.user_id = $1
                 ORDER BY m.created_at DESC`,
                [session.user.id]
            );
        } else {
            result = await db.query(
                `SELECT m.*, u.nickname as author_name
                 FROM messages m
                 JOIN users u ON m.user_id = u.id
                 WHERE m.status = 'approved'
                 ORDER BY m.created_at DESC`
            );
        }

        const rows = await Promise.all(
            result.rows.map(async (row: any) => {
                const { ip_address, ...rest } = row;
                return {
                    ...rest,
                    image_url: rest.image_url
                        ? (await Promise.all(
                            rest.image_url.split(',').map((url: string) => getPublicUrl(url.trim()))
                          )).filter(Boolean).join(',')
                        : null,
                };
            })
        );

        return NextResponse.json(rows);
    } catch (e: any) {
        console.error('Failed to fetch messages:', e);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

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

        const ip = getClientIP(req);
        let ipAddress: string | null = null;
        let locationText: string | null = null;
        if (ip) {
            const locResult = await lookupLocation(ip);
            if (locResult) {
                ipAddress = locResult.ip_address;
                locationText = locResult.location;
            }
        }
        
        // 管理员不需要审核，或者根据配置决定
        const guestbookReview = await getSetting('guestbook_review', 'true');
        const status = isAdmin ? 'approved' : (guestbookReview === 'true' ? 'pending' : 'approved');
        
        console.log('Inserting with user_id:', userId, 'content:', content, 'bg_color:', bgColor);
        
        const result = await db.query(
            `INSERT INTO messages (user_id, content, image_url, status, bg_color, ip_address, location, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             RETURNING id, user_id, content, image_url, created_at, bg_color, location`,
            [userId, content || null, imageUrl, status, bgColor, ipAddress, locationText]
        );
        
        if (!result.rows[0]) {
          throw new Error('Insert failed');
        }
        
        const newMessage = result.rows[0];
        revalidatePath('/guestbook');

        if (status === 'pending') {
            const authorName = session.user.nickname || '用户';
            sendReviewNotification('message', content || '[图片]', authorName).catch(() => {});
        }

        const avatarUrl = await getPublicUrl(session.user.avatar);

        return NextResponse.json({
            success: true,
            message: {
                ...newMessage,
                author_name: session.user.nickname || '用户',
                avatar: avatarUrl,
                status: status,
                location: locationText,
            }
        });
    } catch (e: any) {
        console.error('Failed to submit message:', e);
        return NextResponse.json({ success: false, message: '发送失败: ' + e.message }, { status: 500 });
    }
}