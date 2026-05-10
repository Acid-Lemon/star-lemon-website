'use client';

import {useState, useRef, useCallback, useEffect} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {DatePicker} from '@/components/ui/date-picker';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose} from '@/components/ui/dialog';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {RiLockLine, RiMailLine, RiArrowRightSLine, RiQqFill, RiLinksLine} from '@remixicon/react';

import {UserInfo} from './user-context';

interface UserProfileModalProps {
    user: UserInfo | null;
    onClose: () => void;
    onUpdate?: (updatedUser: any) => void;
}

export function UserProfileModal({user, onClose, onUpdate}: UserProfileModalProps) {
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [birthday, setBirthday] = useState(user?.birthday ? (() => { const d = new Date(user.birthday); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() : '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setNickname(user?.nickname || '');
        setAvatar(user?.avatar || '');
        setBio(user?.bio || '');
        setBirthday(user?.birthday ? (() => { const d = new Date(user.birthday); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() : '');
    }, [user]);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [securityAction, setSecurityAction] = useState<'password' | 'email' | null>(null);
    const [qqUnbinding, setQqUnbinding] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {method: 'POST', body: formData});
            if (res.ok) {
                const data = await res.json();
                setAvatar(data.url);
                toast.success('头像上传成功');
            } else {
                toast.error('头像上传失败');
            }
        } catch {
            toast.error('头像上传失败');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleProfileSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            toast.error('昵称不能为空');
            return;
        }

        setProfileLoading(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    nickname: nickname.trim(),
                    avatar: avatar || null,
                    bio: bio.trim() || null,
                    birthday: birthday || null,
                }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                toast.success('资料更新成功');
                onUpdate?.(updatedUser);
                onClose();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || '更新失败');
            }
        } catch {
            toast.error('更新失败，请重试');
        } finally {
            setProfileLoading(false);
        }
    }, [nickname, avatar, bio, birthday, onClose, onUpdate]);

    const handleSendEmailCode = async () => {
        if (!newEmail) {
            toast.error('请输入新邮箱地址');
            return;
        }

        setSendingCode(true);
        try {
            const res = await fetch('/api/user/send-email-code', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: newEmail}),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('验证码已发送');
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                toast.error(data.error || '发送失败');
            }
        } catch {
            toast.error('发送失败，请重试');
        } finally {
            setSendingCode(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error('请填写完整信息');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('新密码至少 6 位');
            return;
        }

        setSecurityLoading(true);
        try {
            const res = await fetch('/api/user/security', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: 'password', newPassword}),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('密码修改成功');
                setNewPassword('');
                setConfirmPassword('');
                setSecurityAction(null);
            } else {
                toast.error(data.error || '修改失败');
            }
        } catch {
            toast.error('修改失败，请重试');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !emailCode) {
            toast.error('请填写完整信息');
            return;
        }

        setSecurityLoading(true);
        try {
            const res = await fetch('/api/user/security', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: 'email', newEmail, code: emailCode}),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('邮箱修改成功');
                setNewEmail('');
                setEmailCode('');
                setSecurityAction(null);
                onUpdate?.(data);
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.error || '修改失败');
            }
        } catch {
            toast.error('修改失败，请重试');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleQqUnbind = async () => {
        setQqUnbinding(true);
        try {
            const res = await fetch('/api/user/qq/unbind', { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                toast.success('QQ已解绑');
                onUpdate?.({ ...user, qq_identifier: null });
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.error || '解绑失败');
            }
        } catch {
            toast.error('解绑失败，请重试');
        } finally {
            setQqUnbinding(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col" showCloseButton>
                <DialogHeader>
                    <DialogTitle>个人设置</DialogTitle>
                    <DialogDescription>管理你的个人资料和账号安全</DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0">
                <Tabs defaultValue="profile" onValueChange={(v) => { if (v === 'security') setSecurityAction(null); }}>
                    <TabsList variant="line" className="w-full">
                        <TabsTrigger value="profile" className="flex-1">个人资料</TabsTrigger>
                        <TabsTrigger value="security" className="flex-1">账号与安全</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <form onSubmit={handleProfileSubmit} className="space-y-2 pt-2">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative group">
                                    <Avatar className="w-20 h-20">
                                        {avatar ? (
                                            <AvatarImage src={avatar} alt="头像" />
                                        ) : (
                                            <AvatarFallback className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold text-2xl">
                                                {nickname?.[0]?.toUpperCase() || user?.nickname?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
                                    >
                                        {uploading ? '上传中...' : '更换'}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>昵称</Label>
                                <Input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="请输入昵称"
                                    maxLength={50}
                                />
                                <p className="text-xs text-muted-foreground text-right">{nickname.length}/50</p>
                            </div>

                            <div className="space-y-1">
                                <Label>个性签名</Label>
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="写点什么介绍自己..."
                                    maxLength={200}
                                    rows={2}
                                />
                                <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
                            </div>

                            <div className="space-y-1">
                                <Label>生日</Label>
                                <DatePicker
                                    value={birthday}
                                    onChange={setBirthday}
                                    placeholder="选择生日"
                                />
                            </div>

                            <DialogFooter>
                                <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
                                <Button type="submit" disabled={profileLoading || uploading}>
                                    {profileLoading ? '保存中...' : '保存'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="space-y-4 pt-4">
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="text-xs text-muted-foreground mb-1">当前邮箱</p>
                                <p className="text-sm font-medium">{user?.email}</p>
                            </div>

                            {securityAction === 'password' ? (
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>新密码</Label>
                                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少 6 位" minLength={6} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>确认新密码</Label>
                                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入新密码" minLength={6} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setSecurityAction(null)}>取消</Button>
                                        <Button type="submit" disabled={securityLoading}>
                                            {securityLoading ? '修改中...' : '确认修改'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : securityAction === 'email' ? (
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>新邮箱</Label>
                                        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="your.email@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>验证码</Label>
                                        <div className="flex gap-2">
                                            <Input value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="6位验证码" className="flex-1" />
                                            <Button type="button" variant="outline" onClick={handleSendEmailCode} disabled={sendingCode || countdown > 0} className="shrink-0">
                                                {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                                            </Button>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setSecurityAction(null)}>取消</Button>
                                        <Button type="submit" disabled={securityLoading}>
                                            {securityLoading ? '修改中...' : '确认修改'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto bg-muted/50 hover:bg-muted rounded-xl" onClick={() => setSecurityAction('password')}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <RiLockLine className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium">修改密码</p>
                                                <p className="text-xs text-muted-foreground">定期修改密码可以保护账号安全</p>
                                            </div>
                                        </div>
                                        <RiArrowRightSLine className="w-5 h-5 text-muted-foreground" />
                                    </Button>

                                    <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto bg-muted/50 hover:bg-muted rounded-xl" onClick={() => setSecurityAction('email')}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                                <RiMailLine className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium">修改邮箱</p>
                                                <p className="text-xs text-muted-foreground">更换绑定的邮箱地址</p>
                                            </div>
                                        </div>
                                        <RiArrowRightSLine className="w-5 h-5 text-muted-foreground" />
                                    </Button>

                                    {user?.qq_identifier ? (
                                        <div className="p-4 bg-muted/50 rounded-xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-[#e6f7ff] flex items-center justify-center">
                                                    <RiQqFill className="w-5 h-5 text-[#12B7F5]" />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-sm font-medium">已绑定 QQ</p>
                                                    <p className="text-xs text-muted-foreground">可通过QQ快捷登录</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-destructive hover:bg-destructive/10"
                                                onClick={handleQqUnbind}
                                                disabled={qqUnbinding}
                                            >
                                                {qqUnbinding ? '解绑中...' : '解除绑定'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <a
                                            href="/api/auth/qq/bind"
                                            className="w-full flex items-center justify-between p-4 h-auto bg-muted/50 hover:bg-muted rounded-xl no-underline cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#e6f7ff] flex items-center justify-center">
                                                    <RiQqFill className="w-5 h-5 text-[#12B7F5]" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-foreground">绑定 QQ 账号</p>
                                                    <p className="text-xs text-muted-foreground">绑定后可通过QQ快捷登录</p>
                                                </div>
                                            </div>
                                            <RiLinksLine className="w-5 h-5 text-muted-foreground" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
