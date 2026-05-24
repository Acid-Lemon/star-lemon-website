import React from 'react';
import Link from 'next/link';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { DeletePostButton } from '../_components/delete-post-button';
import { PostPublishForm } from '../_components/post-publish-form';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiEditBoxLine } from '@remixicon/react';

export const revalidate = 0;

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
                <PostPublishForm />

                {/* 文章列表 */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>全部文章</CardTitle>
                        <CardDescription>共 {posts.length} 篇文章</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
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
                                                            <DeletePostButton postId={post.id} postTitle={post.title} />
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