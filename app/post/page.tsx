import React from 'react';
import type { Metadata } from 'next';
import { RiArticleLine } from '@remixicon/react';
import db from '../../lib/db';
import { getPublicUrl } from '../../lib/oss';
import {PostList} from '../components/post-list';

export const revalidate = 60;

export const metadata: Metadata = {
    title: '文章',
    description: '记录技术探索与生活感悟，分享我们的点点滴滴。',
};

async function getAllTags(): Promise<string[]> {
    try {
        const result = await db.query('SELECT DISTINCT unnest(tags) as tag FROM posts ORDER BY tag');
        return result.rows.map((row: any) => row.tag);
    } catch (e) {
        console.error('Failed to fetch tags', e);
        return [];
    }
}

export default async function Post() {
    let posts: any[] = [];
    let tags: string[] = [];

    try {
        const [postsResult, tagsResult] = await Promise.all([
            db.query(`
                SELECT posts.id, posts.title, posts.summary, posts.cover, posts.created_at, posts.tags, users.nickname as author_name, users.avatar as author_avatar
                FROM posts
                LEFT JOIN users ON posts.author_id = users.id
                ORDER BY posts.created_at DESC LIMIT 6
            `),
            getAllTags(),
        ]);

        posts = await Promise.all(
            postsResult.rows.map(async (row: any) => ({
                ...row,
                cover: await getPublicUrl(row.cover),
                author_avatar: await getPublicUrl(row.author_avatar),
            }))
        );
        tags = tagsResult;
    } catch (e) {
        console.error('Failed to fetch posts', e);
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full blur-[100px] opacity-40 dark:opacity-20" />
                <div className="absolute top-60 -left-20 w-60 h-60 bg-purple-200 dark:bg-purple-900 rounded-full blur-[80px] opacity-40 dark:opacity-20" />
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200 dark:bg-orange-900 rounded-full blur-[60px] opacity-40 dark:opacity-20" />
            </div>

            <div className="relative flex-1 flex flex-col pt-10 pb-20 max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
                        <RiArticleLine className="w-4 h-4" />
                        共 {posts.length} 篇文章
                    </div>
                    <h1 className="text-4xl font-serif text-gray-800 dark:text-gray-100 mb-4">文章</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        记录技术探索与生活感悟，分享我们的点点滴滴。
                    </p>
                </div>

                <PostList initialPosts={posts} allTags={tags} />
            </div>
        </div>
    );
}
