import React from 'react';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import GuestbookClient from './guestbook-client';

export default async function Guestbook() {
    const session = await getSession();
    
    let messages: any[] = [];
    try {
        if (session?.user?.id) {
            const result = await db.query(`
                SELECT messages.*, users.nickname as author_name 
                FROM messages 
                JOIN users ON messages.user_id = users.id 
                WHERE status = 'approved' OR messages.user_id = $1
                ORDER BY created_at DESC
            `, [session.user.id]);
            messages = result.rows;
        } else {
            const result = await db.query(`
                SELECT messages.*, users.nickname as author_name 
                FROM messages 
                JOIN users ON messages.user_id = users.id 
                WHERE status = 'approved'
                ORDER BY created_at DESC
            `);
            messages = result.rows;
        }
    } catch (e) {
        console.error('Failed to fetch messages', e);
    }

    return <GuestbookClient initialMessages={messages} session={session?.user} />;
}