'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RiQqFill, RiEyeLine, RiEyeOffLine } from '@remixicon/react';

interface QqBindDialogProps {
    open: boolean;
    onClose: () => void;
    bindToken: string;
    qqNickname: string;
    qqAvatar: string;
    redirectUrl: string;
}

export function QqBindDialog({ open, onClose, bindToken, qqNickname, qqAvatar, redirectUrl }: QqBindDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [nickname, setNickname] = useState(qqNickname || '');
    const [loading, setLoading] = useState(false);

    const handleBind = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('请填写邮箱和密码');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/qq/bind-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, bind_token: bindToken, action: 'bind', redirectUrl }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                window.location.href = data.redirectUrl || redirectUrl;
            } else {
                toast.error(data.error || '绑定失败');
            }
        } catch {
            toast.error('绑定失败');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !nickname) {
            toast.error('请填写完整信息');
            return;
        }
        if (password.length < 6) {
            toast.error('密码至少需要6位');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/qq/bind-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, nickname, bind_token: bindToken, action: 'register', redirectUrl }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                window.location.href = data.redirectUrl || redirectUrl;
            } else {
                toast.error(data.error || '注册失败');
            }
        } catch {
            toast.error('注册失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="sm:max-w-md" showCloseButton>
                <DialogHeader>
                    <DialogTitle>完成QQ登录</DialogTitle>
                    <DialogDescription>将你的QQ账号与网站账号关联</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-2">
                    <Avatar className="w-12 h-12 shrink-0">
                        {qqAvatar ? <AvatarImage src={qqAvatar} alt="QQ头像" /> : null}
                        <AvatarFallback className="bg-[#12B7F5] text-white">
                            <RiQqFill className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">QQ：{qqNickname}</p>
                        <p className="text-xs text-muted-foreground">请选择关联方式</p>
                    </div>
                </div>

                <Tabs defaultValue="bind">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="bind">绑定已有账号</TabsTrigger>
                        <TabsTrigger value="register">注册新账号</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bind">
                        <form onSubmit={handleBind} className="space-y-4">
                            <div className="space-y-2">
                                <Label>邮箱地址</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>密码</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="输入密码"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                输入已有账号的邮箱和密码，将QQ绑定到此账号
                            </p>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? '绑定中...' : '确认绑定'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label>邮箱地址</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>昵称</Label>
                                <Input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="网站上的昵称"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>密码</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="设置密码（至少6位）"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                使用QQ信息创建新账号，后续可通过QQ快捷登录
                            </p>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? '注册中...' : '确认注册'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
