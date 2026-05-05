'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    RiDeleteBinLine, RiEditLine, RiLinksLine, RiSaveLine,
    RiArrowUpSLine, RiArrowDownSLine, RiAddLine
} from '@remixicon/react';
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';

interface FriendLink {
    id: number;
    name: string;
    url: string;
    avatar: string | null;
    description: string | null;
    status: string;
    sort_order: number;
    created_at: string;
}

const emptyForm = {
    name: '',
    url: '',
    avatar: '',
    description: '',
    status: 'approved',
    sort_order: 0,
};

export default function AdminFriendsPage() {
    const [links, setLinks] = useState<FriendLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const [editingItem, setEditingItem] = useState<FriendLink | null>(null);
    const [editForm, setEditForm] = useState(emptyForm);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchLinks = useCallback(async () => {
        try {
            const res = await fetch('/api/friend-links?all=true');
            const data = await res.json();
            setLinks(Array.isArray(data) ? data : []);
        } catch {
            toast.error('获取友链列表失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.url.trim()) {
            toast.error('名称和链接不能为空');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/friend-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    avatar: form.avatar.trim() || null,
                    description: form.description.trim() || null,
                }),
            });

            if (res.ok) {
                toast.success('添加成功');
                setForm(emptyForm);
                fetchLinks();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || '添加失败');
            }
        } catch {
            toast.error('添加失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (link: FriendLink) => {
        setEditingItem(link);
        setEditForm({
            name: link.name,
            url: link.url,
            avatar: link.avatar || '',
            description: link.description || '',
            status: link.status,
            sort_order: link.sort_order,
        });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !editForm.name.trim() || !editForm.url.trim()) {
            toast.error('名称和链接不能为空');
            return;
        }

        setEditSubmitting(true);
        try {
            const res = await fetch(`/api/friend-links/${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editForm,
                    avatar: editForm.avatar.trim() || null,
                    description: editForm.description.trim() || null,
                }),
            });

            if (res.ok) {
                toast.success('更新成功');
                setEditingItem(null);
                fetchLinks();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || '更新失败');
            }
        } catch {
            toast.error('更新失败');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/friend-links/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('删除成功');
                fetchLinks();
            } else {
                toast.error('删除失败');
            }
        } catch {
            toast.error('删除失败');
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleStatusToggle = async (link: FriendLink) => {
        const newStatus = link.status === 'approved' ? 'hidden' : 'approved';
        try {
            const res = await fetch(`/api/friend-links/${link.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(newStatus === 'approved' ? '已显示' : '已隐藏');
                fetchLinks();
            } else {
                toast.error('操作失败');
            }
        } catch {
            toast.error('操作失败');
        }
    };

    const handleSortChange = async (link: FriendLink, direction: 'up' | 'down') => {
        const sortedLinks = [...links].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
        const idx = sortedLinks.findIndex(l => l.id === link.id);
        if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sortedLinks.length - 1)) return;

        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        const swapLink = sortedLinks[swapIdx];

        try {
            await Promise.all([
                fetch(`/api/friend-links/${link.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sort_order: swapLink.sort_order }),
                }),
                fetch(`/api/friend-links/${swapLink.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sort_order: link.sort_order }),
                }),
            ]);
            fetchLinks();
        } catch {
            toast.error('排序失败');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">加载中...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">友链管理</h1>
                <p className="text-muted-foreground mt-2">管理友情链接，添加、编辑或排序</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RiAddLine className="w-5 h-5" />
                            添加友链
                        </CardTitle>
                        <CardDescription>添加一个新的友情链接</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">站点名称 *</label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="例如：张三的小站"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">站点链接 *</label>
                                <Input
                                    value={form.url}
                                    onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">头像/Logo 地址</label>
                                <Input
                                    value={form.avatar}
                                    onChange={(e) => setForm(prev => ({ ...prev, avatar: e.target.value }))}
                                    placeholder="https://example.com/avatar.png"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">站点描述</label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="简单介绍一下这个站点..."
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">排序权重</label>
                                    <Input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">状态</label>
                                    <div className="flex gap-2 mt-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={form.status === 'approved' ? 'default' : 'outline'}
                                            onClick={() => setForm(prev => ({ ...prev, status: 'approved' }))}
                                        >
                                            显示
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={form.status === 'hidden' ? 'default' : 'outline'}
                                            onClick={() => setForm(prev => ({ ...prev, status: 'hidden' }))}
                                        >
                                            隐藏
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full">
                                <RiSaveLine className="w-4 h-4 mr-1" />
                                {submitting ? '添加中...' : '添加'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RiLinksLine className="w-5 h-5" />
                            全部友链
                        </CardTitle>
                        <CardDescription>共 {links.length} 个友链</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {links.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <div className="text-5xl mb-3">🔗</div>
                                <p className="text-sm">暂无友链，在左侧添加第一个</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {links.map((link) => (
                                    <div
                                        key={link.id}
                                        className="flex items-center gap-4 p-4 rounded-lg border shadow-sm bg-background border-border group"
                                    >
                                        <div className="shrink-0">
                                            {link.avatar ? (
                                                <img
                                                    src={link.avatar}
                                                    alt={link.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-sm">
                                                    {link.name[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-medium text-foreground truncate">{link.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${link.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {link.status === 'approved' ? '显示' : '隐藏'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                            {link.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleSortChange(link, 'up')}
                                                title="上移"
                                            >
                                                <RiArrowUpSLine className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleSortChange(link, 'down')}
                                                title="下移"
                                            >
                                                <RiArrowDownSLine className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusToggle(link)}
                                            >
                                                {link.status === 'approved' ? '隐藏' : '显示'}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(link)}
                                                title="编辑"
                                            >
                                                <RiEditLine className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setDeleteTarget(link.id)}
                                                title="删除"
                                            >
                                                <RiDeleteBinLine className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={editingItem !== null} onOpenChange={(open) => { if (!open) setEditingItem(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>编辑友链</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">站点名称 *</label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">站点链接 *</label>
                            <Input
                                value={editForm.url}
                                onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">头像/Logo 地址</label>
                            <Input
                                value={editForm.avatar}
                                onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">站点描述</label>
                            <Textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">排序权重</label>
                                <Input
                                    type="number"
                                    value={editForm.sort_order}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">状态</label>
                                <div className="flex gap-2 mt-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={editForm.status === 'approved' ? 'default' : 'outline'}
                                        onClick={() => setEditForm(prev => ({ ...prev, status: 'approved' }))}
                                    >
                                        显示
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={editForm.status === 'hidden' ? 'default' : 'outline'}
                                        onClick={() => setEditForm(prev => ({ ...prev, status: 'hidden' }))}
                                    >
                                        隐藏
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
                            <Button type="submit" disabled={editSubmitting}>
                                <RiSaveLine className="w-4 h-4 mr-1" />
                                {editSubmitting ? '保存中...' : '更新'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>确定要删除这个友链吗？此操作无法撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => { if (deleteTarget !== null) handleDelete(deleteTarget); }}>
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
