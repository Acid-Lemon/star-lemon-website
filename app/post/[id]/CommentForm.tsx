'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { EmojiPicker } from '../../components/emoji-picker';
import type { UserInfo } from '../../components/user-context';

interface CommentItem {
    id: number;
    user_id: number;
    nickname: string;
    avatar: string | null;
    content: string;
    image_url: string | null;
    parent_id: number | null;
    created_at: string;
    location?: string | null;
}

export function CommentForm({
    user,
    postId,
    replyTo,
    onSuccess,
    onCancel
}: {
    user: UserInfo | null;
    postId: number;
    replyTo?: CommentItem | null;
    onSuccess: (comment: CommentItem) => void;
    onCancel?: () => void;
}) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
                toast.success('图片上传成功');
            } else {
                toast.error('图片上传失败');
            }
        } catch {
            toast.error('图片上传失败');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmoji(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!content.trim() && !imageUrl) || !user) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post_id: postId,
                    content: content.trim(),
                    image_url: imageUrl || null,
                    parent_id: replyTo?.id || null
                })
            });

            if (res.ok) {
                const newComment = await res.json();
                setContent('');
                setImageUrl('');

                if (newComment.status === 'approved') {
                    toast.success('评论发表成功');
                    onSuccess(newComment);
                } else {
                    toast.success('评论提交成功，等待审核');
                    onSuccess(newComment);
                }
            } else {
                toast.error('评论提交失败');
            }
        } catch (error) {
            toast.error('评论提交失败');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-6">
            <div className="flex items-center gap-3 mb-4">
                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.nickname}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {user?.nickname?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user?.nickname || '用户'}</p>
                    {replyTo && (
                        <p className="text-xs text-blue-500">
                            回复 {replyTo.nickname}
                            <button
                                type="button"
                                onClick={onCancel}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                                取消
                            </button>
                        </p>
                    )}
                </div>
            </div>
            <div className="mb-3">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={replyTo ? `回复 ${replyTo.nickname}...` : "写下你的评论..."}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
            </div>

            {imageUrl && (
                <div className="mb-3 relative inline-block">
                    <img src={imageUrl} alt="预览" className="max-w-[200px] rounded-lg" />
                    <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowEmoji(!showEmoji)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            😊
                        </button>
                        {showEmoji && (
                            <EmojiPicker
                                onSelect={handleEmojiSelect}
                                onClose={() => setShowEmoji(false)}
                            />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        📷
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    {uploading && <span className="text-xs text-gray-400">上传中...</span>}
                </div>
                <button
                    type="submit"
                    disabled={submitting || (!content.trim() && !imageUrl)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? '提交中...' : '发表评论'}
                </button>
            </div>
        </form>
    );
}
