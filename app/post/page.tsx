import React from 'react';
import db from '../../lib/db';
import { getPublicUrl } from '../../lib/oss';
import {PostList} from '../components/post-list';

export const revalidate = 0;

export default async function Post() {
    let posts: any[] = [];
    try {
        const result = await db.query(`
            SELECT posts.id, posts.title, posts.summary, posts.cover, posts.created_at, posts.tags, users.nickname as author_name, users.avatar as author_avatar
            FROM posts
                     LEFT JOIN users ON posts.author_id = users.id
            ORDER BY posts.created_at DESC LIMIT 6
        `);
        posts = await Promise.all(
            result.rows.map(async (row: any) => ({
                ...row,
                cover: await getPublicUrl(row.cover),
                author_avatar: await getPublicUrl(row.author_avatar),
            }))
        );
    } catch (e) {
        console.error('Failed to fetch posts', e);
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* 背景装饰 */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-[100px] opacity-40" />
                <div className="absolute top-60 -left-20 w-60 h-60 bg-purple-200 rounded-full blur-[80px] opacity-40" />
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200 rounded-full blur-[60px] opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full blur-[120px] opacity-20" />
            </div>

            <div className="relative flex-1 flex flex-col pt-10 pb-20 max-w-4xl mx-auto px-4">
                {/* 页面标题 */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        共 {posts.length} 篇文章
                    </div>
                    <h1 className="text-4xl font-serif text-gray-800 mb-4">文章</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        记录技术探索与生活感悟，分享我们的点点滴滴。
                    </p>
                </div>

                <PostList initialPosts={posts}/>
            </div>
        </div>
    );
}
