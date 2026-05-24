'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { RiDeleteBinLine, RiSendPlaneLine, RiImageLine } from '@remixicon/react';
import { GalleryLightbox } from '../../components/image-lightbox';
import { DouyinVideoEmbed } from '../../components/douyin-video-embed';
import { DouyinIframeEmbed } from '../../components/douyin-iframe-embed';
import { BilibiliPlayer } from '../../components/bilibili-player';
import { splitContentByVideo, getDouyinEmbedMode } from '@/lib/video-embed';
import { DouyinEmbedMode } from '@/lib/douyin';

const MAX_IMAGES = 9;

interface Moment {
    id: number;
    user_id: number;
    content: string;
    image_url: string | null;
    nickname: string;
    avatar: string | null;
    created_at: string;
}

function MomentImages({ imageUrl, onImageClick }: { imageUrl: string; onImageClick: (urls: string[], index: number) => void }) {
    const urls = imageUrl.split(',').filter(Boolean);
    const count = urls.length;
    if (count === 0) return null;

    if (count === 1) {
        return (
            <div className="mt-3">
                <img
                    src={urls[0]}
                    alt="动态图片"
                    className="max-w-[200px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageClick(urls, 0)}
                />
            </div>
        );
    }

    const gridCols = count <= 4 ? 'grid-cols-2' : 'grid-cols-3';
    return (
        <div className={`grid ${gridCols} gap-1.5 mt-3 max-w-[300px]`}>
            {urls.map((url, i) => (
                <div key={url + i} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                        src={url}
                        alt={`图片${i + 1}`}
                        className="w-full h-full object-cover"
                        onClick={() => onImageClick(urls, i)}
                    />
                </div>
            ))}
        </div>
    );
}

function getRelativeTime(dateStr: string) {
    try {
        const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        return date.toLocaleDateString('zh-CN');
    } catch {
        return '';
    }
}

export default function AdminMomentsPage() {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [embedMode, setEmbedMode] = useState<DouyinEmbedMode>('iframe');
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMoments = useCallback(async () => {
        try {
            const res = await fetch('/api/moments?limit=50');
            const data = await res.json();
            if (Array.isArray(data)) {
                setMoments(data);
            } else {
                setMoments([]);
            }
        } catch (error) {
            console.error('Failed to fetch moments:', error);
            toast.error('获取动态列表失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMoments();
        getDouyinEmbedMode().then(setEmbedMode);
    }, [fetchMoments]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remaining = MAX_IMAGES - imageUrls.length;
        if (remaining <= 0) {
            toast.error(`最多上传${MAX_IMAGES}张图片`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remaining);
        setUploading(true);

        const uploaded: string[] = [];
        for (const file of filesToUpload) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    uploaded.push(data.url);
                } else {
                    toast.error(`${file.name} 上传失败`);
                }
            } catch {
                toast.error(`${file.name} 上传失败`);
            }
        }

        if (uploaded.length > 0) {
            setImageUrls(prev => [...prev, ...uploaded]);
            toast.success(`已上传${uploaded.length}张图片`);
        }
        setUploading(false);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && imageUrls.length === 0) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/moments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
                }),
            });
            if (res.ok) {
                const newMoment = await res.json();
                setMoments(prev => [newMoment, ...prev]);
                setContent('');
                setImageUrls([]);
                toast.success('动态发布成功');
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || '发布失败');
            }
        } catch {
            toast.error('发布失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/moments?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMoments(prev => prev.filter(m => m.id !== id));
                toast.success('删除成功');
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || '删除失败');
            }
        } catch {
            toast.error('删除失败');
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">动态管理</h1>
                <p className="text-muted-foreground mt-2">发布新动态或管理已有动态</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RiSendPlaneLine className="w-5 h-5" />
                            发布动态
                        </CardTitle>
                        <CardDescription>分享生活里的点滴星光</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="说说你的生活..."
                                rows={5}
                            />

                            {imageUrls.length > 0 && (
                                <div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {imageUrls.map((url, i) => (
                                            <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden">
                                                <img src={url} alt={`图片${i + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1.5">{imageUrls.length}/{MAX_IMAGES}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={imageUrls.length >= MAX_IMAGES || uploading}
                                    >
                                        <RiImageLine className="w-4 h-4 mr-1" />
                                        {uploading ? '上传中...' : '图片'}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple={true}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={submitting || (!content.trim() && imageUrls.length === 0)}
                                >
                                    <RiSendPlaneLine className="w-4 h-4 mr-1" />
                                    {submitting ? '发布中...' : '发布'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>全部动态</CardTitle>
                        <CardDescription>共 {moments.length} 条动态</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-10 text-muted-foreground">加载中...</div>
                        ) : moments.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <div className="text-5xl mb-3">💭</div>
                                <p className="text-sm">还没有动态，快来发布第一条吧</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {moments.map((moment) => (
                                    <div key={moment.id} className="p-5 rounded-lg border shadow-sm transition-colors bg-background border-border group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar size="sm">
                                                    {moment.avatar ? (
                                                        <AvatarImage src={moment.avatar} alt={moment.nickname} />
                                                    ) : (
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold text-xs">
                                                            {moment.nickname?.[0]?.toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <span className="font-semibold text-foreground">{moment.nickname}</span>
                                                <span className="text-xs text-muted-foreground">{getRelativeTime(moment.created_at)}</span>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => setDeleteTarget(moment.id)}
                                            >
                                                <RiDeleteBinLine className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-foreground/90 leading-relaxed break-words">
                                            {splitContentByVideo(moment.content).map((seg, i, arr) =>
                                                seg.type === 'douyin'
                                                    ? <div key={i} className="mt-2">{embedMode === 'iframe' ? <DouyinIframeEmbed shortUrl={seg.content} /> : <DouyinVideoEmbed shortUrl={seg.content} />}</div>
                                                    : seg.type === 'bilibili'
                                                        ? <div key={i} className="mt-2"><BilibiliPlayer bvid={seg.bvid!} time={seg.time} /></div>
                                                        : <span key={i} className="whitespace-pre-wrap">{seg.content}{i < arr.length - 1 ? '\n' : ''}</span>
                                            )}
                                        </p>
                                        {moment.image_url && <MomentImages imageUrl={moment.image_url} onImageClick={(urls, index) => setLightbox({ images: urls, index })} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>确定要删除这条动态吗？此操作无法撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => { if (deleteTarget !== null) handleDelete(deleteTarget); }}>删除</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {lightbox && (
                <GalleryLightbox
                    images={lightbox.images}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    );
}
