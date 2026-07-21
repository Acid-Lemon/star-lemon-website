'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { RiDeleteBinLine } from '@remixicon/react';

interface Message {
  id: number;
  user_id: number;
  content: string;
  image_url: string | null;
  status: string;
  bg_color: string;
  created_at: string;
  author_name: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/guestbook?all=true');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('获取留言失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(status === 'approved' ? '已通过' : '已拒绝');
        fetchMessages();
      } else {
        toast.error('更新失败');
      }
    } catch {
      toast.error('更新失败');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (message: Message) => {
    setDeletingMessage(message);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingMessage) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/messages/${deletingMessage.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('删除成功');
        setShowDeleteDialog(false);
        setDeletingMessage(null);
        fetchMessages();
      } else {
        toast.error('删除失败');
      }
    } catch {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter(m => m.status === filter);

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
        <h1 className="text-2xl font-bold">留言审核</h1>
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
        共 {filteredMessages.length} 条留言
      </div>

      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            暂无留言数据
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{msg.author_name || '佚名'}</span>
                      {getStatusBadge(msg.status)}
                      <span className="text-xs text-gray-400">
                        {new Date(msg.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{msg.content}</p>
                    {msg.image_url && (
                      <div className="flex gap-2">
                        {msg.image_url.split(',').filter(Boolean).map((url, i) => (
                          <img key={i} src={url} alt={`图片${i+1}`} className="w-16 h-16 rounded object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {msg.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusChange(msg.id, 'approved')}
                        disabled={updatingId === msg.id}
                      >
                        {updatingId === msg.id ? '处理中...' : '通过'}
                      </Button>
                    )}
                    {msg.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:text-orange-700"
                        onClick={() => handleStatusChange(msg.id, 'rejected')}
                        disabled={updatingId === msg.id}
                      >
                        {updatingId === msg.id ? '处理中...' : '拒绝'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(msg)}
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

      {showDeleteDialog && deletingMessage && (
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
                确定要删除这条留言吗？此操作无法撤销。
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1"
                  disabled={deleting}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1"
                  disabled={deleting}
                >
                  {deleting ? '删除中...' : '删除'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
