'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RiAddCircleLine, RiEditBoxLine } from '@remixicon/react';
import { CoverUpload } from '@/app/components/cover-upload';

export function PostPublishForm() {
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

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, tags, content, cover }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('文章发布成功');
                e.currentTarget.reset();
                router.refresh();
            } else {
                toast.error(data.error || '发布失败');
            }
        } catch {
            toast.error('发布失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="lg:col-span-1 h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RiEditBoxLine className="w-5 h-5" />
                    发布新文章
                </CardTitle>
                <CardDescription>编写你的下一篇博客文章</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">文章标题</label>
                        <Input type="text" name="title" placeholder="输入引人注目的标题" required disabled={submitting} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">封面图片</label>
                        <CoverUpload />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">标签</label>
                        <Input type="text" name="tags" placeholder="例如: 前端, React (用逗号分隔)" disabled={submitting} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">正文内容 (Markdown支持)</label>
                        <textarea
                            name="content"
                            rows={12}
                            placeholder="在这里编写你的文章正文，支持Markdown语法..."
                            required
                            disabled={submitting}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y font-mono"
                        />
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={submitting}>
                        <RiAddCircleLine className="w-4 h-4 mr-2" />
                        {submitting ? '发布中...' : '立即发布'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}