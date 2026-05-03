'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { RiDeleteBinLine } from '@remixicon/react';

interface Comment {
  id: number;
  post_id: number;
  nickname: string;
  content: string;
  status: string;
  created_at: string;
  post_title?: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments/all');
      const data = await res.json();
      setComments(data);
    } catch (error) {
      toast.error('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success('状态更新成功');
        fetchComments();
      } else {
        toast.error('更新失败');
      }
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const handleDelete = (comment: Comment) => {
    setDeletingComment(comment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingComment) return;
    
    try {
      const res = await fetch(`/api/comments/${deletingComment.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('删除成功');
        setShowDeleteDialog(false);
        setDeletingComment(null);
        fetchComments();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const filteredComments = filter === 'all' 
    ? comments 
    : comments.filter(c => c.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">已通过</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">已拒绝</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">待审核</span>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">评论审核</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待审核' : f === 'approved' ? '已通过' : '已拒绝'}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        共 {filteredComments.length} 条评论
      </div>

      {filteredComments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            暂无评论数据
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{comment.nickname}</span>
                      {getStatusBadge(comment.status)}
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{comment.content}</p>
                    <p className="text-xs text-gray-400">文章 ID: {comment.post_id}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {comment.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                      >
                        通过
                      </Button>
                    )}
                    {comment.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:text-orange-700"
                        onClick={() => handleStatusChange(comment.id, 'rejected')}
                      >
                        拒绝
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(comment)}
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteDialog && deletingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <RiDeleteBinLine className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2">确认删除</h2>
              <p className="text-gray-500 mb-6">
                确定要删除这条评论吗？此操作无法撤销。
              </p>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)} 
                  className="flex-1"
                >
                  取消
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={confirmDelete} 
                  className="flex-1"
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
