import React from 'react';
import Link from 'next/link';
import db from '../../../lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '../../../lib/auth';
import { generateSummary } from '../../../lib/ai';
import { CoverUpload } from '../../components/cover-upload';
import { deleteUploadedFile } from '../../../lib/file';
import { DeletePostButton } from '../_components/delete-post-button';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiDeleteBinLine, RiAddCircleLine, RiEditBoxLine } from '@remixicon/react';

export const revalidate = 0;

// 删除文章 Server Action
async function deletePost(formData: FormData) {
    'use server';
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') return;
    const id = formData.get('id');
    if (!id) return;
    try {
        // 查询封面图片 URL
        const result = await db.query('SELECT cover FROM posts WHERE id = $1', [id]);
        const cover = result.rows[0]?.cover;

        await db.query('DELETE FROM posts WHERE id = $1', [id]);

        // 删除封面图片文件
        if (cover) {
            await deleteUploadedFile(cover);
        }

        revalidatePath('/admin/posts');
        revalidatePath('/post');
    } catch (e) {
        console.error(e);
    }
}

// 添加文章 Server Action
async function addPost(formData: FormData) {
    'use server';
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') return;

    const title = formData.get('title');
    const tagsString = formData.get('tags')?.toString() || '';
    const content = formData.get('content');
    const cover = formData.get('cover')?.toString() || null;

    if (!title || !content) return;

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
            'INSERT INTO posts (title, author_id, tags, summary, content, cover) VALUES ($1, $2, $3, $4, $5, $6)',
            [title, session.user.id, pgTags, summary, content, cover]
        );
        revalidatePath('/admin/posts');
        revalidatePath('/post');
    } catch (e) {
        console.error(e);
    }
}

export default async function AdminPosts() {
    let posts: any[] = [];
    try {
        const result = await db.query(`
            SELECT posts.id, posts.title, posts.created_at, posts.tags, users.nickname as author_name, users.avatar as author_avatar
            FROM posts 
            LEFT JOIN users ON posts.author_id = users.id
            ORDER BY posts.created_at DESC
        `);
        posts = result.rows;
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
                    <p className="text-muted-foreground mt-2">在这里发布新文章或管理已有文章</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 发布文章表单 */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RiEditBoxLine className="w-5 h-5" />
                            发布新文章
                        </CardTitle>
                        <CardDescription>编写你的下一篇博客文章</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={addPost} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">文章标题</label>
                                <Input type="text" name="title" placeholder="输入引人注目的标题" required />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">封面图片</label>
                                <CoverUpload />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">标签</label>
                                <Input type="text" name="tags" placeholder="例如: 前端, React (用逗号分隔)" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">正文内容 (Markdown支持)</label>
                                <textarea 
                                    name="content" 
                                    rows={12} 
                                    placeholder="在这里编写你的文章正文，支持Markdown语法..." 
                                    required 
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y font-mono"
                                />
                            </div>
                            
                            <Button type="submit" className="w-full mt-2">
                                <RiAddCircleLine className="w-4 h-4 mr-2" />
                                立即发布
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* 文章列表 */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>全部文章</CardTitle>
                        <CardDescription>共 {posts.length} 篇文章</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>标题</TableHead>
                                        <TableHead>作者</TableHead>
                                        <TableHead>发布日期</TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                暂无文章数据
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        posts.map(post => {
                                            const tags = post.tags || [];
                                            return (
                                                <TableRow key={post.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col gap-1">
                                                            <span>{post.title}</span>
                                                            <div className="flex gap-1 flex-wrap">
                                                                {tags.map((tag: string) => (
                                                                    <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{post.author_name || '佚名'}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link href={`/admin/posts/${post.id}/edit`}>
                                                                <Button variant="ghost" size="icon">
                                                                    <RiEditBoxLine className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <DeletePostButton postId={post.id} postTitle={post.title} deleteAction={deletePost} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}