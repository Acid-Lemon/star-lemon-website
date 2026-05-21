'use client';

import React, { useState } from 'react';
import { RiDeleteBinLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeletePostButtonProps {
    postId: number;
    postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('文章已删除');
                router.refresh();
            } else {
                toast.error(data.error || '删除失败');
            }
        } catch {
            toast.error('删除失败');
        } finally {
            setDeleting(false);
            setOpen(false);
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setOpen(true)}
            >
                <RiDeleteBinLine className="w-4 h-4" />
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <RiDeleteBinLine className="text-destructive" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除文章「{postTitle}」吗？此操作会同时删除封面图片，且无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={deleting}>
                            {deleting ? '删除中...' : '删除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}