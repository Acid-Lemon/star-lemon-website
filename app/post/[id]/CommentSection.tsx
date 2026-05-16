'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getRelativeTime } from '@/lib/utils';
import { CommentForm } from './CommentForm';
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog';
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
    children?: CommentItem[];
    _level?: number;
    _parentName?: string;
}

export function CommentSection({ postId, user }: { postId: number; user: UserInfo | null }) {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?post_id=${postId}`);
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const buildCommentTree = (comments: CommentItem[]) => {
        const map: Record<number, CommentItem> = {};
        const roots: CommentItem[] = [];

        comments.forEach(comment => {
            map[comment.id] = { ...comment, children: [] };
        });

        comments.forEach(comment => {
            if (comment.parent_id && map[comment.parent_id]) {
                map[comment.parent_id].children!.push(map[comment.id]);
            } else {
                roots.push(map[comment.id]);
            }
        });

        return roots;
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;

        try {
            const res = await fetch(`/api/comments?id=${deleteTarget}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('删除成功');
                await fetchComments();
            } else {
                toast.error('删除失败');
            }
        } catch {
            toast.error('删除失败');
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleCommentSuccess = (newComment: CommentItem) => {
        setComments(prev => [...prev, newComment]);
        setReplyTo(null);
    };

    const renderCommentContent = (comment: CommentItem) => (
        <div key={comment.id} className="flex gap-3 group">
            {comment.avatar ? (
                <img src={comment.avatar} alt={comment.nickname} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {comment.nickname?.[0]?.toUpperCase() || '匿'}
                </div>
            )}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.nickname}</span>
                    {comment._level! > 2 && comment._parentName && (
                        <span className="text-xs text-gray-400">
                            回复 <span className="text-blue-500">{comment._parentName}</span>
                        </span>
                    )}
                    <span className="text-xs text-gray-400">{getRelativeTime(comment.created_at)}</span>
                </div>
                {comment.content && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-2">{comment.content}</p>
                )}
                {comment.image_url && (
                    <div className="mb-2">
                        <img
                            src={comment.image_url}
                            alt="评论图片"
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(comment.image_url!, '_blank', 'noopener,noreferrer')}
                        />
                    </div>
                )}
                <div className="flex items-center gap-4 text-xs mb-3">
                    {user && (
                        <button
                            onClick={() => setReplyTo(replyTo?.id === comment.id ? null : comment)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            {replyTo?.id === comment.id ? '取消回复' : '回复'}
                        </button>
                    )}
                    {user && (user.id === comment.user_id || user.role === 'admin') && (
                        <button
                            onClick={() => setDeleteTarget(comment.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            删除
                        </button>
                    )}
                </div>

                {replyTo?.id === comment.id && (
                    <div className="mt-2 mb-4">
                        <CommentForm
                            user={user}
                            postId={postId}
                            replyTo={replyTo}
                            onSuccess={handleCommentSuccess}
                            onCancel={() => setReplyTo(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const flattenReplies = (comment: CommentItem): CommentItem[] => {
        const result: CommentItem[] = [];
        const walk = (node: CommentItem, level: number) => {
            if (node.children) {
                for (const child of node.children) {
                    result.push({ ...child, _level: level, _parentName: node.nickname });
                    walk(child, level + 1);
                }
            }
        };
        walk(comment, 2);
        return result;
    };

    const renderCommentThread = (comment: CommentItem) => {
        const allReplies = flattenReplies(comment);
        return (
            <div key={comment.id} className="space-y-3">
                {renderCommentContent(comment)}
                {allReplies.length > 0 && (
                    <div className="ml-12 space-y-3">
                        {allReplies.map(reply => renderCommentContent(reply))}
                    </div>
                )}
            </div>
        );
    };

    const commentTree = buildCommentTree(comments);

    return (
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">评论</h3>

            {user ? (
                <CommentForm
                    user={user}
                    postId={postId}
                    onSuccess={handleCommentSuccess}
                />
            ) : (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">登录后即可评论</p>
                    <a
                        href="/login"
                        className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        去登录
                    </a>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-400">加载中...</div>
            ) : commentTree.length === 0 ? (
                <div className="text-center py-8 text-gray-400">暂无评论，快来抢沙发吧！</div>
            ) : (
                <div className="space-y-6">
                    {commentTree.map((comment) => renderCommentThread(comment))}
                </div>
            )}

            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>确定要删除这条评论吗？此操作不可撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={executeDelete}>删除</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
