'use client';

import React, { useState } from 'react';
import { RiDeleteBinLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface DeletePostButtonProps {
    postId: number;
    postTitle: string;
    deleteAction: (formData: FormData) => Promise<void>;
}

export function DeletePostButton({ postId, postTitle, deleteAction }: DeletePostButtonProps) {
    const [open, setOpen] = useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleConfirm = () => {
        formRef.current?.requestSubmit();
        setOpen(false);
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

            <form ref={formRef} action={deleteAction} className="hidden">
                <input type="hidden" name="id" value={postId} />
            </form>

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
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleConfirm}>
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}