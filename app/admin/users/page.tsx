'use client';

import {useState, useEffect} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent} from '@/components/ui/card';
import {Table, TableHeader, TableBody, TableRow, TableHead, TableCell} from '@/components/ui/table';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose} from '@/components/ui/dialog';
import {AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction} from '@/components/ui/alert-dialog';
import {Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import {RiAddLine, RiEditLine, RiDeleteBinLine, RiShieldUserLine} from '@remixicon/react';

interface User {
    id: number;
    nickname: string;
    email: string;
    role: string;
    avatar: string | null;
    bio: string | null;
    birthday: string | null;
    qq_identifier: string | null;
    sl_coin: number;
    created_at: string;
    updated_at: string;
}

function getRoleLabel(role: string) {
    return role === 'admin' ? '管理员' : '普通用户';
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editNickname, setEditNickname] = useState('');
    const [editRole, setEditRole] = useState('user');
    const [editPassword, setEditPassword] = useState('');
    const [editSlCoin, setEditSlCoin] = useState(0);
    const [saving, setSaving] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [createEmail, setCreateEmail] = useState('');
    const [createNickname, setCreateNickname] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createRole, setCreateRole] = useState('user');
    const [createSlCoin, setCreateSlCoin] = useState(0);
    const [creating, setCreating] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error('获取用户列表失败');
            }
        } catch {
            toast.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (user: User) => {
        setEditUser(user);
        setEditNickname(user.nickname);
        setEditRole(user.role);
        setEditPassword('');
        setEditSlCoin(user.sl_coin || 0);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;

        if (!editNickname.trim()) {
            toast.error('昵称不能为空');
            return;
        }

        setSaving(true);
        try {
            const body: { nickname: string; role: string; sl_coin: number; password?: string } = {
                nickname: editNickname.trim(),
                role: editRole,
                sl_coin: editSlCoin,
            };
            if (editPassword) {
                body.password = editPassword;
            }

            const res = await fetch(`/api/admin/users/${editUser.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('用户更新成功');
                setEditUser(null);
                fetchUsers();
            } else {
                toast.error(data.error || '更新失败');
            }
        } catch {
            toast.error('更新失败');
        } finally {
            setSaving(false);
        }
    };

    const resetCreateForm = () => {
        setCreateEmail('');
        setCreateNickname('');
        setCreatePassword('');
        setCreateRole('user');
        setCreateSlCoin(0);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!createEmail.trim() || !createNickname.trim() || !createPassword) {
            toast.error('请填写邮箱、昵称和密码');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: createEmail.trim(),
                    nickname: createNickname.trim(),
                    password: createPassword,
                    role: createRole,
                    sl_coin: createSlCoin,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                toast.success('用户创建成功');
                setCreateOpen(false);
                resetCreateForm();
                fetchUsers();
            } else {
                toast.error(data.error || '创建失败');
            }
        } catch {
            toast.error('创建失败');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteUser) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/users/${deleteUser.id}`, {method: 'DELETE'});
            const data = await res.json();
            if (res.ok) {
                toast.success('用户已删除');
                setDeleteUser(null);
                fetchUsers();
            } else {
                toast.error(data.error || '删除失败');
            }
        } catch {
            toast.error('删除失败');
        } finally {
            setDeleting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === 'admin') {
            return <Badge variant="default" className="gap-1"><RiShieldUserLine className="w-3 h-3"/>{getRoleLabel(role)}</Badge>;
        }
        return <Badge variant="secondary">{getRoleLabel(role)}</Badge>;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">加载中...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">用户管理</h1>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">共 {users.length} 个用户</div>
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <RiAddLine className="w-4 h-4"/>
                        新增用户
                    </Button>
                </div>
            </div>

            {users.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        暂无用户数据
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>用户</TableHead>
                                    <TableHead>邮箱</TableHead>
                                    <TableHead>角色</TableHead>
                                    <TableHead>星柠币</TableHead>
                                    <TableHead>注册时间</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    {user.avatar ? (
                                                        <AvatarImage src={user.avatar} alt={user.nickname}/>
                                                    ) : (
                                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                            {user.nickname?.[0]?.toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.nickname}</p>
                                                    {user.qq_identifier && (
                                                        <p className="text-xs text-muted-foreground">已绑定 QQ</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell className="text-sm font-mono">{user.sl_coin || 0}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString('zh-CN')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>
                                                    <RiEditLine className="w-4 h-4"/>
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteUser(user)}>
                                                    <RiDeleteBinLine className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>新增用户</DialogTitle>
                        <DialogDescription>管理员创建用户无需邮箱验证</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>邮箱</Label>
                            <Input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="user@example.com" required/>
                        </div>
                        <div className="space-y-2">
                            <Label>昵称</Label>
                            <Input value={createNickname} onChange={(e) => setCreateNickname(e.target.value)} placeholder="用户昵称" required/>
                        </div>
                        <div className="space-y-2">
                            <Label>初始密码</Label>
                            <Input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="至少 6 位" minLength={6} required/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>角色</Label>
                                <Select value={createRole} onValueChange={(v) => { if (v) setCreateRole(v); }}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue>{getRoleLabel(createRole)}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">管理员</SelectItem>
                                        <SelectItem value="user">普通用户</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>星柠币</Label>
                                <Input type="number" value={createSlCoin} onChange={(e) => setCreateSlCoin(parseInt(e.target.value) || 0)} min={0}/>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button variant="outline" type="button"/>}>取消</DialogClose>
                            <Button type="submit" disabled={creating}>
                                {creating ? '创建中...' : '创建用户'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>编辑用户</DialogTitle>
                        <DialogDescription>修改用户信息，留空密码则不修改</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>昵称</Label>
                            <Input value={editNickname} onChange={(e) => setEditNickname(e.target.value)} placeholder="用户昵称"/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>角色</Label>
                                <Select value={editRole} onValueChange={(v) => { if (v) setEditRole(v); }}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue>{getRoleLabel(editRole)}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">管理员</SelectItem>
                                        <SelectItem value="user">普通用户</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>星柠币</Label>
                                <Input type="number" value={editSlCoin} onChange={(e) => setEditSlCoin(parseInt(e.target.value) || 0)} min={0}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>重置密码</Label>
                            <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="留空则不修改" minLength={6}/>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button variant="outline" type="button"/>}>取消</DialogClose>
                            <Button type="submit" disabled={saving}>
                                {saving ? '保存中...' : '保存'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <RiDeleteBinLine className="text-destructive"/>
                        </AlertDialogMedia>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除用户「{deleteUser?.nickname}」吗？此操作无法撤销，该用户的所有数据将被永久删除。
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
