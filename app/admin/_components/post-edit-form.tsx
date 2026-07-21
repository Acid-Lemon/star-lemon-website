'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RiSaveLine } from '@remixicon/react';
import { CoverUpload } from '@/app/components/cover-upload';

interface PostEditFormProps {
    post: {
        id: number;
        title: string;
        content: string;
        tags: string;
        cover: string;
    };
}

export function PostEditForm({ post }: PostEditFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const fd = new FormData(e.currentTarget);
        const title = fd.get('title') as string;
        const tags = fd.get('tags') as string || '';
        const content = fd.get('content') as string;
        const cover = fd.get('cover') as string || null;
        const oldCover = fd.get('oldCover') as string || null;

        try {
            const res = await fetch(`/api/posts/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, tags, content, cover, oldCover }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('文章更新成功');
                router.push('/admin/posts');
                router.refresh();
            } else {
                toast.error(data.error || '更新失败');
            }
        } catch {
            toast.error('更新失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>文章信息</CardTitle>
                <CardDescription>编辑文章的所有字段</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input type="hidden" name="id" value={post.id} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">文章标题</label>
                        <Input type="text" name="title" defaultValue={post.title} required disabled={submitting} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">封面图片</label>
                        <CoverUpload defaultValue={post.cover} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">标签</label>
                        <Input type="text" name="tags" defaultValue={post.tags} placeholder="例如: 前端, React (用逗号分隔)" disabled={submitting} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">正文内容 (Markdown支持)</label>
                        <textarea
                            name="content"
                            rows={16}
                            defaultValue={post.content || ''}
                            placeholder="在这里编写你的文章正文，支持Markdown语法..."
                            required
                            disabled={submitting}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y font-mono"
                        />
                    </div>

                    <div className="flex gap-4 mt-2">
                        <Link href="/admin/posts" className="flex-1">
                            <Button type="button" variant="outline" className="w-full">
                                取消
                            </Button>
                        </Link>
                        <Button type="submit" className="flex-1" disabled={submitting}>
                            <RiSaveLine className="w-4 h-4 mr-2" />
                            {submitting ? '保存中...' : '保存修改'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
