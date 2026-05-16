'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiTaskLine, RiArrowDownSLine } from '@remixicon/react';

const STATUS_OPTIONS = ['待处理', '待开发', '开发中', '待讨论', '已完成', '暂不开发'] as const;
const TYPE_OPTIONS = ['bug', '新功能', '优化', '重构', '文档'] as const;
const PRIORITY_OPTIONS = ['高', '中', '低'] as const;

interface AdminUser {
  id: number;
  nickname: string;
}

interface DevTask {
  id: number;
  content: string;
  assignee_ids: number[] | null;
  status: string;
  type: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

function getStatusVariant(status: string) {
  switch (status) {
    case '待处理':
      return 'secondary' as const;
    case '待开发':
      return 'default' as const;
    case '开发中':
      return 'default' as const;
    case '待讨论':
      return 'outline' as const;
    case '已完成':
      return 'secondary' as const;
    case '暂不开发':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

function getTypeVariant(type: string) {
  switch (type) {
    case 'bug':
      return 'destructive' as const;
    case '新功能':
      return 'default' as const;
    case '优化':
      return 'secondary' as const;
    case '重构':
      return 'outline' as const;
    case '文档':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case '高':
      return 'destructive' as const;
    case '中':
      return 'default' as const;
    case '低':
      return 'secondary' as const;
    default:
      return 'secondary' as const;
  }
}

export default function DevTasksPage() {
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [status, setStatus] = useState('待处理');
  const [type, setType] = useState('新功能');
  const [priority, setPriority] = useState('中');
  const [creating, setCreating] = useState(false);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);

  const [editTask, setEditTask] = useState<DevTask | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editAssignees, setEditAssignees] = useState<number[]>([]);
  const [editStatus, setEditStatus] = useState('待处理');
  const [editType, setEditType] = useState('新功能');
  const [editPriority, setEditPriority] = useState('中');
  const [editAssigneePopoverOpen, setEditAssigneePopoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DevTask | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, adminsRes] = await Promise.all([
        fetch('/api/dev-tasks'),
        fetch('/api/admin/users'),
      ]);
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (adminsRes.ok) setAdmins(await adminsRes.json());
    } catch {
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('请输入任务内容');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/dev-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          assignee_ids: selectedAssignees,
          status,
          type,
          priority,
        }),
      });
      if (res.ok) {
        toast.success('任务创建成功');
        setContent('');
        setSelectedAssignees([]);
        setStatus('待处理');
        setType('新功能');
        setPriority('中');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || '创建失败');
      }
    } catch {
      toast.error('创建失败');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (task: DevTask) => {
    setEditTask(task);
    setEditContent(task.content);
    setEditAssignees(task.assignee_ids || []);
    setEditStatus(task.status);
    setEditType(task.type);
    setEditPriority(task.priority);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    if (!editContent.trim()) {
      toast.error('请输入任务内容');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/dev-tasks/${editTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent.trim(),
          assignee_ids: editAssignees,
          status: editStatus,
          type: editType,
          priority: editPriority,
        }),
      });
      if (res.ok) {
        toast.success('任务更新成功');
        setEditTask(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || '更新失败');
      }
    } catch {
      toast.error('更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dev-tasks/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('任务已删除');
        setDeleteTarget(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const getAssigneeNames = (ids: number[] | null) => {
    if (!ids || ids.length === 0) return '—';
    return ids
      .map((id) => admins.find((a) => a.id === id)?.nickname || `用户#${id}`)
      .join('、');
  };

  const toggleAssignee = (id: number) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleEditAssignee = (id: number) => {
    setEditAssignees((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">开发任务清单</h1>
        <div className="text-sm text-muted-foreground">共 {tasks.length} 条</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiAddLine className="w-5 h-5" />
              添加任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>任务内容</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入任务内容"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>负责人</Label>
                <Popover
                  open={assigneePopoverOpen}
                  onOpenChange={setAssigneePopoverOpen}
                >
                  <PopoverTrigger>
                    <Button variant="outline" className="w-full justify-between" type="button">
                      <span className={selectedAssignees.length === 0 ? 'text-muted-foreground' : ''}>
                        {selectedAssignees.length === 0
                          ? '请选择负责人'
                          : getAssigneeNames(selectedAssignees)}
                      </span>
                      <RiArrowDownSLine className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 max-h-60 overflow-auto">
                    <div className="space-y-1">
                      {admins.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2 text-center">暂无管理员</p>
                      ) : (
                        admins.map((admin) => (
                          <label
                            key={admin.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted"
                          >
                            <Checkbox
                              checked={selectedAssignees.includes(admin.id)}
                              onCheckedChange={() => toggleAssignee(admin.id)}
                            />
                            <span className="text-sm">{admin.nickname}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>状态</Label>
                <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={type} onValueChange={(v) => { if (v) setType(v); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>优先级</Label>
                <Select value={priority} onValueChange={(v) => { if (v) setPriority(v); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? '创建中...' : '创建任务'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>全部任务</CardTitle>
            <CardDescription>共 {tasks.length} 条</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                暂无任务
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务内容</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="max-w-60">
                        <p className="truncate" title={task.content}>
                          {task.content}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{getAssigneeNames(task.assignee_ids)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeVariant(task.type)}>{task.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(task.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(task)}>
                            <RiEditLine className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(task)}>
                            <RiDeleteBinLine className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editTask} onOpenChange={(open) => { if (!open) setEditTask(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>任务内容</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="请输入任务内容"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>负责人</Label>
              <Popover
                open={editAssigneePopoverOpen}
                onOpenChange={setEditAssigneePopoverOpen}
              >
                <PopoverTrigger>
                  <Button variant="outline" className="w-full justify-between" type="button">
                    <span className={editAssignees.length === 0 ? 'text-muted-foreground' : ''}>
                      {editAssignees.length === 0
                        ? '请选择负责人'
                        : getAssigneeNames(editAssignees)}
                    </span>
                    <RiArrowDownSLine className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 max-h-60 overflow-auto">
                  <div className="space-y-1">
                    {admins.map((admin) => (
                      <label
                        key={admin.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted"
                      >
                        <Checkbox
                          checked={editAssignees.includes(admin.id)}
                          onCheckedChange={() => toggleEditAssignee(admin.id)}
                        />
                        <span className="text-sm">{admin.nickname}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={editStatus} onValueChange={(v) => { if (v) setEditStatus(v); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={editType} onValueChange={(v) => { if (v) setEditType(v); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>优先级</Label>
              <Select value={editPriority} onValueChange={(v) => { if (v) setEditPriority(v); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>取消</DialogClose>
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <RiDeleteBinLine className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除该任务吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}