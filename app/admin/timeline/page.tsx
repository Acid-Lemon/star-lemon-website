'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { RiEditLine, RiDeleteBinLine, RiAddCircleLine } from '@remixicon/react';
import { toast } from 'sonner';

interface TimelineItem {
  id: number;
  date: string;
  title: string;
  description: string;
  type: string;
  is_active: boolean;
}

const typeOptions = [
  { value: 'milestone', label: '里程碑' },
  { value: 'update', label: '更新' },
  { value: 'post', label: '文章' },
];

const typeColors: Record<string, string> = {
  milestone: 'bg-orange-100 text-orange-700',
  update: 'bg-green-100 text-green-700',
  post: 'bg-blue-100 text-blue-700',
};

function generateYearOptions() {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 5; year--) {
    options.push(year);
  }
  return options;
}

const yearOptions = generateYearOptions();

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}月`,
}));

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<TimelineItem | null>(null);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);

  const [addFormData, setAddFormData] = useState({
    year: String(yearOptions[0]),
    month: String(new Date().getMonth() + 1),
    title: '',
    description: '',
    type: 'milestone',
    is_active: true,
  });

  const [editFormData, setEditFormData] = useState({
    year: String(yearOptions[0]),
    month: '1',
    title: '',
    description: '',
    type: 'milestone',
    is_active: true,
  });

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const res = await fetch('/api/timeline');
      const data = await res.json();
      data.sort((a: TimelineItem, b: TimelineItem) => a.date.localeCompare(b.date));
      setTimeline(data);
    } catch {
      toast.error('获取时间轴失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return { year: String(yearOptions[0]), month: '1' };
    const [year, month] = dateStr.split('-');
    return { year, month };
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const date = `${addFormData.year}-${String(addFormData.month).padStart(2, '0')}`;
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title: addFormData.title, description: addFormData.description, type: addFormData.type, is_active: addFormData.is_active }),
      });
      if (res.ok) {
        toast.success('创建成功');
        setAddFormData({ year: String(yearOptions[0]), month: String(new Date().getMonth() + 1), title: '', description: '', type: 'milestone', is_active: true });
        fetchTimeline();
      } else {
        toast.error('操作失败');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const handleEdit = (item: TimelineItem) => {
    const { year, month } = parseDate(item.date);
    setEditingItem(item);
    setEditFormData({ year, month, title: item.title, description: item.description, type: item.type, is_active: item.is_active });
    setShowDialog(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const date = `${editFormData.year}-${String(editFormData.month).padStart(2, '0')}`;
    try {
      const res = await fetch(`/api/timeline/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, title: editFormData.title, description: editFormData.description, type: editFormData.type, is_active: editFormData.is_active }),
      });
      if (res.ok) {
        toast.success('更新成功');
        setShowDialog(false);
        setEditingItem(null);
        fetchTimeline();
      } else {
        toast.error('操作失败');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      const res = await fetch(`/api/timeline/${deletingItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('删除成功');
        setDeletingItem(null);
        fetchTimeline();
      } else {
        toast.error('删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">时间轴管理</h1>
        <p className="text-muted-foreground mt-2">管理网站时间轴上的里程碑和更新</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiAddCircleLine className="w-5 h-5" />
              添加项目
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>年份</Label>
                  <Select value={addFormData.year} onValueChange={(v) => { if (v) setAddFormData({ ...addFormData, year: v }); }} itemToStringLabel={(v) => `${v}年`}>
                    <SelectTrigger><SelectValue placeholder="选择年份" /></SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={String(year)}>{year}年</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>月份</Label>
                  <Select value={addFormData.month} onValueChange={(v) => { if (v) setAddFormData({ ...addFormData, month: v }); }} itemToStringLabel={(v) => `${parseInt(v)}月`}>
                    <SelectTrigger><SelectValue placeholder="选择月份" /></SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>标题</Label>
                <Input value={addFormData.title} onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })} required placeholder="输入标题" />
              </div>

              <div className="space-y-2">
                <Label>描述</Label>
                <Input value={addFormData.description} onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })} placeholder="输入描述（可选）" />
              </div>

              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={addFormData.type} onValueChange={(v) => { if (v) setAddFormData({ ...addFormData, type: v }); }} itemToStringLabel={(v) => typeOptions.find((t) => t.value === v)?.label || v}>
                  <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox checked={addFormData.is_active} onCheckedChange={(checked) => setAddFormData({ ...addFormData, is_active: checked === true })} />
                <Label>启用</Label>
              </div>

              <Button type="submit" className="w-full">
                <RiAddCircleLine className="w-4 h-4 mr-1" />
                添加
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>全部项目</CardTitle>
            <CardDescription>共 {timeline.length} 条时间轴项目</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-sm">暂无时间轴项目</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeline.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border shadow-sm bg-background border-border group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-sm font-mono text-muted-foreground shrink-0 w-20 text-center">
                          {formatDate(item.date)}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-[10px] ${typeColors[item.type] || 'bg-gray-100 text-gray-700'}`}>
                          {typeOptions.find((t) => t.value === item.type)?.label || item.type}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_active ? '启用' : '禁用'}
                        </Badge>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)}>
                            <RiEditLine className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeletingItem(item)}>
                            <RiDeleteBinLine className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑时间轴项目</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>年份</Label>
                <Select value={editFormData.year} onValueChange={(v) => { if (v) setEditFormData({ ...editFormData, year: v }); }} itemToStringLabel={(v) => `${v}年`}>
                  <SelectTrigger><SelectValue placeholder="选择年份" /></SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>{year}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>月份</Label>
                <Select value={editFormData.month} onValueChange={(v) => { if (v) setEditFormData({ ...editFormData, month: v }); }} itemToStringLabel={(v) => `${parseInt(v)}月`}>
                  <SelectTrigger><SelectValue placeholder="选择月份" /></SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>标题</Label>
              <Input value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={editFormData.type} onValueChange={(v) => { if (v) setEditFormData({ ...editFormData, type: v }); }} itemToStringLabel={(v) => typeOptions.find((t) => t.value === v)?.label || v}>
                  <SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox checked={editFormData.is_active} onCheckedChange={(checked) => setEditFormData({ ...editFormData, is_active: checked === true })} />
                <Label>启用</Label>
              </div>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
              <Button type="submit">更新</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingItem !== null} onOpenChange={(open) => { if (!open) setDeletingItem(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{deletingItem?.title}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
