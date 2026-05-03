'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RiDeleteBinLine, RiAddCircleLine, RiEditLine } from '@remixicon/react';

interface Hitokoto {
    id: number;
    content: string;
    source: string | null;
    category: string;
    is_active: boolean;
    created_at: string;
}

const categoryOptions = [
    { value: '动画', label: '动画' },
    { value: '漫画', label: '漫画' },
    { value: '游戏', label: '游戏' },
    { value: '文学', label: '文学' },
    { value: '原创', label: '原创' },
    { value: '网络', label: '网络' },
    { value: '其他', label: '其他' },
];

const categoryColors: Record<string, string> = {
    '动画': 'bg-pink-100 text-pink-700',
    '漫画': 'bg-purple-100 text-purple-700',
    '游戏': 'bg-green-100 text-green-700',
    '文学': 'bg-amber-100 text-amber-700',
    '原创': 'bg-blue-100 text-blue-700',
    '网络': 'bg-cyan-100 text-cyan-700',
    '其他': 'bg-gray-100 text-gray-700',
};

export default function AdminHitokotoPage() {
    const [hitokotoList, setHitokotoList] = useState<Hitokoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [source, setSource] = useState('');
    const [category, setCategory] = useState('其他');
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<Hitokoto | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editSource, setEditSource] = useState('');
    const [editCategory, setEditCategory] = useState('其他');
    const [editIsActive, setEditIsActive] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const fetchHitokoto = useCallback(async () => {
        try {
            const res = await fetch('/api/hitokoto');
            const data = await res.json();
            setHitokotoList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch hitokoto:', error);
            toast.error('获取一言列表失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHitokoto();
    }, [fetchHitokoto]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/hitokoto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content.trim(), source: source.trim() || null, category, is_active: isActive }),
            });
            if (res.ok) {
                const newItem = await res.json();
                setHitokotoList(prev => [newItem, ...prev]);
                setContent('');
                setSource('');
                setCategory('其他');
                setIsActive(true);
                toast.success('添加成功');
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

    const handleEdit = (item: Hitokoto) => {
        setEditingItem(item);
        setEditContent(item.content);
        setEditSource(item.source || '');
        setEditCategory(item.category);
        setEditIsActive(item.is_active);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !editContent.trim()) return;

        try {
            const res = await fetch('/api/hitokoto', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingItem.id,
                    content: editContent.trim(),
                    source: editSource.trim() || null,
                    category: editCategory,
                    is_active: editIsActive,
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setHitokotoList(prev => prev.map(h => h.id === editingItem.id ? updated : h));
                setEditingItem(null);
                toast.success('更新成功');
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || '更新失败');
            }
        } catch {
            toast.error('更新失败');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/hitokoto?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setHitokotoList(prev => prev.filter(h => h.id !== id));
                toast.success('删除成功');
            } else {
                toast.error('删除失败');
            }
        } catch {
            toast.error('删除失败');
        } finally {
            setDeleteTarget(null);
        }
    };

    const activeCount = hitokotoList.filter(h => h.is_active).length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">一言管理</h1>
                <p className="text-muted-foreground mt-2">添加和管理一言，在动态页随机展示</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RiAddCircleLine className="w-5 h-5" />
                            添加一言
                        </CardTitle>
                        <CardDescription>共 {hitokotoList.length} 条，启用 {activeCount} 条</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label>内容</Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="一言内容..."
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>来源</Label>
                                <Input
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    placeholder="例如：某部作品名 / 某人"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>分类</Label>
                                <Select value={category} onValueChange={(v) => { if (v) setCategory(v); }} itemToStringLabel={(v) => categoryOptions.find(o => o.value === v)?.label || v}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="选择分类" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
                                <Label>启用</Label>
                            </div>
                            <Button type="submit" disabled={submitting || !content.trim()}>
                                <RiAddCircleLine className="w-4 h-4 mr-1" />
                                {submitting ? '添加中...' : '添加'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>全部一言</CardTitle>
                        <CardDescription>共 {hitokotoList.length} 条记录</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-10 text-muted-foreground">加载中...</div>
                        ) : hitokotoList.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <div className="text-5xl mb-3">💬</div>
                                <p className="text-sm">还没有一言，快来添加第一条吧</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {hitokotoList.map((item) => (
                                    <div key={item.id} className="p-4 rounded-lg border shadow-sm bg-background border-border group">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground/90 leading-relaxed break-words">
                                                    {item.content}
                                                </p>
                                                {item.source && (
                                                    <p className="text-xs text-muted-foreground mt-1.5">
                                                        —— {item.source}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className={`text-[10px] ${categoryColors[item.category] || categoryColors['其他']}`}>
                                                    {item.category}
                                                </Badge>
                                                <Badge variant="outline" className={`text-[10px] ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {item.is_active ? '启用' : '禁用'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)}>
                                                    <RiEditLine className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(item.id)}>
                                                    <RiDeleteBinLine className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
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
                        <DialogTitle>编辑一言</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>内容</Label>
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>来源</Label>
                            <Input value={editSource} onChange={(e) => setEditSource(e.target.value)} placeholder="例如：某部作品名 / 某人" />
                        </div>
                        <div className="space-y-2">
                            <Label>分类</Label>
                            <Select value={editCategory} onValueChange={(v) => { if (v) setEditCategory(v); }} itemToStringLabel={(v) => categoryOptions.find(o => o.value === v)?.label || v}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="选择分类" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox checked={editIsActive} onCheckedChange={(checked) => setEditIsActive(checked === true)} />
                            <Label>启用</Label>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
                            <Button type="submit">更新</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>确定要删除这条一言吗？此操作无法撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => { if (deleteTarget !== null) handleDelete(deleteTarget); }}>删除</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
