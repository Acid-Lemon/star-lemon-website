'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RiAddCircleLine, RiEditBoxLine, RiLoader4Line } from '@remixicon/react';
import { CoverUpload, type CoverUploadHandle } from '@/app/components/cover-upload';

type PublishFeedback = {
    type: 'loading' | 'success' | 'error';
    message: string;
};

async function readJsonResponse(response: Response) {
    const text = await response.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        return { error: text };
    }
}

function getResponseField(data: unknown, field: 'error' | 'detail') {
    if (!data || typeof data !== 'object' || !(field in data)) return '';
    const value = (data as Record<string, unknown>)[field];
    return typeof value === 'string' ? value : '';
}

function formatResponseError(response: Response, data: unknown, fallback: string) {
    const reason = [getResponseField(data, 'error'), getResponseField(data, 'detail')]
        .filter(Boolean)
        .join('：') || response.statusText || '未知错误';
    return `${fallback}（HTTP ${response.status}）：${reason}`;
}

function formatUnknownError(error: unknown, fallback: string) {
    return error instanceof Error ? `${fallback}：${error.message}` : fallback;
}

export function PostPublishForm() {
    const router = useRouter();
    const coverUploadRef = useRef<CoverUploadHandle>(null);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<PublishFeedback | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setSubmitting(true);
        setFeedback({
            type: 'loading',
            message: '正在生成 AI 摘要并发布文章，请稍等...',
        });
        const toastId = toast.loading('正在发布文章', {
            description: '正在调用 AI 生成摘要，耗时可能会稍长，请不要重复点击。',
        });

        const fd = new FormData(form);
        const title = fd.get('title') as string;
        const tags = fd.get('tags') as string || '';
        const content = fd.get('content') as string;

        let stage = '创建文章';

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, tags, content, cover: null }),
            });

            const data = await readJsonResponse(res);
            if (res.ok && data.success) {
                let coverUploaded = false;
                if (coverUploadRef.current?.hasPendingCover()) {
                    stage = '上传封面';
                    setFeedback({
                        type: 'loading',
                        message: '文章已创建，正在上传封面...',
                    });
                    toast.loading('正在上传封面', {
                        id: toastId,
                        description: '摘要和文章已保存，正在上传封面图片。',
                    });

                    try {
                        const coverUrl = await coverUploadRef.current.uploadPendingCover();
                        stage = '回写封面';
                        const coverRes = await fetch(`/api/posts/${data.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cover: coverUrl }),
                        });
                        const coverData = await readJsonResponse(coverRes);
                        if (!coverRes.ok || !coverData.success) {
                            throw new Error(formatResponseError(coverRes, coverData, '封面更新失败'));
                        }
                        coverUploaded = true;
                    } catch (error) {
                        const message = error instanceof Error
                            ? `文章已发布，但${error.message}`
                            : '文章已发布，但封面上传失败';
                        setFeedback({
                            type: 'error',
                            message,
                        });
                        toast.dismiss(toastId);
                        toast.error(message);
                        router.refresh();
                        return;
                    }
                }

                const successMessage = coverUploaded
                    ? '文章和封面都已发布成功，列表已刷新。'
                    : '文章发布成功，列表已刷新。';
                setFeedback({
                    type: 'success',
                    message: successMessage,
                });
                toast.dismiss(toastId);
                toast.success(coverUploaded ? '文章和封面发布成功' : '文章发布成功');
                form.reset();
                coverUploadRef.current?.reset();
                router.refresh();
            } else {
                const message = formatResponseError(res, data, '发布失败');
                setFeedback({
                    type: 'error',
                    message,
                });
                toast.dismiss(toastId);
                toast.error(message);
            }
        } catch (error) {
            console.error(`Post publish failed during "${stage}":`, error);
            const message = formatUnknownError(error, `${stage}失败`);
            setFeedback({
                type: 'error',
                message,
            });
            toast.dismiss(toastId);
            toast.error(message);
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
                        <CoverUpload ref={coverUploadRef} deferUpload />
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

                    {feedback && (
                        <div
                            role="status"
                            aria-live="polite"
                            className={`rounded-lg border px-3 py-2 text-xs ${
                                feedback.type === 'loading'
                                    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300'
                                    : feedback.type === 'success'
                                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300'
                                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'
                            }`}
                        >
                            {feedback.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-2" disabled={submitting} aria-busy={submitting}>
                        {submitting ? (
                            <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RiAddCircleLine className="w-4 h-4 mr-2" />
                        )}
                        {submitting ? '生成摘要并发布中...' : '立即发布'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
