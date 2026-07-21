import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import db from '../../../../../lib/db';
import { getPublicUrl } from '../../../../../lib/oss';
import { PostEditForm } from '../../../_components/post-edit-form';

import { Button } from "@/components/ui/button";
import { RiArrowLeftLine } from '@remixicon/react';

export const revalidate = 0;

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let post: { id: number; title: string; content: string; tags: string; cover: string } | null = null;
    try {
        const result = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            post = result.rows[0];
        }
    } catch (e) {
        console.error(e);
    }

    if (!post) {
        return notFound();
    }

    const tagsString = Array.isArray(post.tags)
        ? post.tags.join(', ')
        : (post.tags || '').toString().replace(/[{}]/g, '').replace(/"/g, '');
    const coverUrl = await getPublicUrl(post.cover) || '';

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/posts">
                    <Button variant="outline" size="icon">
                        <RiArrowLeftLine className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">编辑文章</h1>
                    <p className="text-muted-foreground mt-2">修改并更新文章内容</p>
                </div>
            </div>

            <PostEditForm
                post={{
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    tags: tagsString,
                    cover: coverUrl,
                }}
            />
        </div>
    );
}
