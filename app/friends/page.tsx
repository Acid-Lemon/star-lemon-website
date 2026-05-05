import React from 'react';
import type { Metadata } from 'next';
import db from '@/lib/db';
import { getPublicUrl } from '@/lib/oss';
import FriendsClient from './friends-client';

export const revalidate = 60;

export const metadata: Metadata = {
    title: '友链',
    description: '海内存知己，天涯若比邻。这里收录了我们朋友们的站点。',
};

export default async function FriendsPage() {
    let links: any[] = [];
    try {
        const result = await db.query(
            `SELECT * FROM friend_links WHERE status = 'approved' ORDER BY sort_order ASC, created_at DESC`
        );
        links = await Promise.all(
            result.rows.map(async (row: any) => ({
                ...row,
                avatar: await getPublicUrl(row.avatar),
            }))
        );
    } catch (e) {
        console.error('Failed to fetch friend links', e);
    }

    return <FriendsClient links={links} />;
}
