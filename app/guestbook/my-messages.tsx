'use client';

import { useState, useTransition } from 'react';
import { RiDeleteBinLine, RiDoubleQuotesL } from '@remixicon/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

function getRelativeTime(dateStr: any) {
    try {
        if (!dateStr) return '';
        const str = String(dateStr);
        let date: Date;
        if (str.includes('T')) {
            date = new Date(str.endsWith('Z') ? str : str + 'Z');
        } else {
            date = new Date(str.replace(' ', 'T') + 'Z');
        }
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) return '刚刚';
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        if (weeks < 4) return `${weeks}周前`;
        if (months < 12) return `${months}个月前`;
        return `${years}年前`;
    } catch (error) {
        console.error('Error parsing date:', error);
        return '';
    }
}

function hexToLuminance(hex: string): number {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return 0.5;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function isLightColor(color: string): boolean {
    if (!color) return true;
    const hexMatch = color.match(/#[0-9a-fA-F]{6}/);
    if (hexMatch) {
        return hexToLuminance(hexMatch[0]) > 0.4;
    }
    const lightKeywords = ['#fcd34d', '#bfdbfe', '#bbf7d0', '#fef08a', '#67e8f9', '#e9d5ff', '#fecaca', '#fed7aa', '#d9f99d', '#a5f3fc', '#c7d2fe', '#fbcfe8'];
    return lightKeywords.some(c => color.toLowerCase().includes(c.toLowerCase()));
}

export function MyMessages({ message, bgColor, isOwner, onDeleted, onImageClick }: { message: any, bgColor: string, isOwner?: boolean, onDeleted?: (id: number) => void, onImageClick?: (urls: string[], index: number) => void }) {
    const [isPending, startTransition] = useTransition();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isLight = isLightColor(bgColor);

    function handleDelete() {
        startTransition(async () => {
            try {
                const res = await fetch(`/api/messages/${message.id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    toast.success('删除成功');
                    onDeleted?.(message.id);
                } else {
                    toast.error(data.message || '删除失败');
                }
            } catch {
                toast.error('删除失败，请重试');
            }
        });
    }

    const textPrimary = isLight ? 'text-gray-900' : 'text-white';
    const textSecondary = isLight ? 'text-gray-700' : 'text-gray-200';
    const textMuted = isLight ? 'text-gray-600' : 'text-gray-300';
    const avatarBg = isLight ? 'bg-white/70' : 'bg-black/25';
    const borderColor = isLight ? 'border-black/10' : 'border-white/15';
    const topBar = isLight
        ? 'linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0.06))'
        : 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))';

    return (
        <>
            <div
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 dark:border-white/10"
                style={{ backgroundColor: bgColor || '#fcd34d' }}
            >
                <div className="h-1 w-full" style={{ background: topBar }} />

                {message.status === 'pending' && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-500/90 text-white text-xs shadow-sm backdrop-blur-sm">待审核</Badge>
                    </div>
                )}
                {message.status === 'rejected' && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-red-500/90 text-white text-xs shadow-sm backdrop-blur-sm">已拒绝</Badge>
                    </div>
                )}

                {isOwner && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isPending}
                            className={`w-7 h-7 shadow-sm backdrop-blur-sm ${isLight ? 'bg-white/90 hover:bg-red-500 text-gray-500 hover:text-white' : 'bg-black/30 hover:bg-red-500 text-gray-300 hover:text-white'}`}
                        >
                            <RiDeleteBinLine className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                )}

                <div className="p-5 pt-4">
                    {message.content && (
                        <div className={`mb-3 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                            <RiDoubleQuotesL className="w-6 h-6 opacity-30" />
                        </div>
                    )}

                    {message.content && (
                        <p className={`text-sm leading-relaxed mb-3 font-medium ${textPrimary}`}>
                            {message.content}
                        </p>
                    )}

                    {message.image_url && (() => {
                        const urls = (message.image_url as string).split(',').filter((u): u is string => !!u);
                        const count = urls.length;

                        if (count === 1) {
                            return (
                                <div className="mb-3">
                                    <img
                                        src={urls[0]}
                                        alt="留言图片"
                                        className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => onImageClick?.(urls, 0)}
                                    />
                                </div>
                            );
                        }

                        const gridCols = count <= 4 ? 'grid-cols-2' : 'grid-cols-3';
                        return (
                            <div className={`grid ${gridCols} gap-1.5 mb-3`}>
                                {urls.map((url, i) => (
                                    <div key={url + i} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                        <img
                                            src={url}
                                            alt={`图片${i + 1}`}
                                            className="w-full h-full object-cover"
                                            onClick={() => onImageClick?.(urls, i)}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    <div className={`flex items-center justify-between pt-4 border-t ${borderColor}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${avatarBg}`}>
                                <span className={`text-xs font-bold ${textSecondary}`}>
                                    {message.author_name?.[0]?.toUpperCase() || '匿'}
                                </span>
                            </div>
                            <span className={`font-medium text-xs ${textSecondary}`}>
                                {message.author_name || '佚名'}
                            </span>
                            {message.location && (
                                <span className={`text-xs ${textMuted}`}>
                                    · {message.location}
                                </span>
                            )}
                        </div>
                        <span className={`text-xs ${textMuted}`}>
                            {getRelativeTime(message.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>删除留言</AlertDialogTitle>
                        <AlertDialogDescription>确定要删除这条留言吗？此操作无法撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isPending}>
                            {isPending ? '删除中...' : '删除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
