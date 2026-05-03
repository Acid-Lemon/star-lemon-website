import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import db from '../../../../../lib/db';
import { getSession } from '../../../../../lib/auth';
import { revalidatePath } from 'next/cache';
import { generateSummary } from '../../../../../lib/ai';
import { CoverUpload } from '../../../../components/cover-upload';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiArrowLeftLine, RiSaveLine } from '@remixicon/react';

export const revalidate = 0;

// 更新文章 Server Action
async function updatePost(formData: FormData) {
    'use server';
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') return;

    const id = formData.get('id');
    const title = formData.get('title');
    const tagsString = formData.get('tags')?.toString() || '';
    const content = formData.get('content');
    const cover = formData.get('cover')?.toString() || null;

    if (!id || !title || !content) return;

    // Convert comma separated string to array for Postgres
    const tagsArray = tagsString.split(',').map(t => t.trim()).filter(t => t);
    
    // Postgres array format: {tag1,tag2}
    const pgTags = tagsArray.length > 0 ? `{${tagsArray.join(',')}}` : '{}';

    // 调用 AI 生成摘要
    const summary = await generateSummary({ 
        title: title.toString(), 
        content: content.toString() 
    });

    try {
        await db.query(
            'UPDATE posts SET title = $1, tags = $2, summary = $3, content = $4, cover = $5 WHERE id = $6',
            [title, pgTags, summary, content, cover, id]
        );
        revalidatePath('/admin/posts');
        revalidatePath('/post');
        revalidatePath(`/post/${id}`);
    } catch (e) {
        console.error(e);
    }
    redirect('/admin/posts');
}

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    let post: any = null;
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

    // Tags might be returned as JS array from pg driver, or as string
    const tagsString = Array.isArray(post.tags) 
        ? post.tags.join(', ') 
        : (post.tags || '').toString().replace(/[{}]/g, '').replace(/"/g, '');

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

            <Card>
                <CardHeader>
                    <CardTitle>文章信息</CardTitle>
                    <CardDescription>编辑文章的所有字段</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updatePost} className="flex flex-col gap-4">
                        <input type="hidden" name="id" value={post.id} />
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">文章标题</label>
                            <Input type="text" name="title" defaultValue={post.title} required />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">封面图片</label>
                            <CoverUpload defaultValue={post.cover || ''} />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">标签</label>
                            <Input type="text" name="tags" defaultValue={tagsString} placeholder="例如: 前端, React (用逗号分隔)" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">正文内容 (Markdown支持)</label>
                            <textarea 
                                name="content" 
                                rows={16} 
                                defaultValue={post.content || ''}
                                placeholder="在这里编写你的文章正文，支持Markdown语法..." 
                                required 
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y font-mono"
                            />
                        </div>
                        
                        <div className="flex gap-4 mt-2">
                            <Link href="/admin/posts" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    取消
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1">
                                <RiSaveLine className="w-4 h-4 mr-2" />
                                保存修改
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
