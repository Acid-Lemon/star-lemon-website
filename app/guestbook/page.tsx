import React from 'react';
import type { Metadata } from 'next';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getPublicUrl } from '@/lib/oss';
import GuestbookClient from './guestbook-client';

export const metadata: Metadata = {
    title: '留言',
    description: '在这里留下你的足迹，与我们交流互动',
};

export default async function Guestbook() {
    const session = await getSession();
    
    let messages: any[] = [];
    try {
        let result;
        if (session?.user?.id) {
            result = await db.query(`
                SELECT messages.*, users.nickname as author_name 
                FROM messages 
                JOIN users ON messages.user_id = users.id 
                WHERE status = 'approved' OR messages.user_id = $1
                ORDER BY created_at DESC
            `, [session.user.id]);
        } else {
            result = await db.query(`
                SELECT messages.*, users.nickname as author_name 
                FROM messages 
                JOIN users ON messages.user_id = users.id 
                WHERE status = 'approved'
                ORDER BY created_at DESC
            `);
        }
        messages = await Promise.all(
            result.rows.map(async (row: any) => ({
                ...row,
                image_url: row.image_url
                    ? (await Promise.all(
                        row.image_url.split(',').map((url: string) => getPublicUrl(url.trim()))
                      )).filter(Boolean).join(',')
                    : null,
            }))
        );
    } catch (e) {
        console.error('Failed to fetch messages', e);
    }

    return <GuestbookClient initialMessages={messages} session={session?.user} />;
}