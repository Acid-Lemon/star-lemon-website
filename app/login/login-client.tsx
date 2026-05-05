'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { RiQqFill, RiMailLine, RiLockLine } from '@remixicon/react';

export default function LoginClientPage({ qqAuthUrl, errorMsg, returnUrl, qqCode, qqState }: {
    qqAuthUrl: string | null;
    errorMsg?: string;
    returnUrl: string;
    qqCode?: string;
    qqState?: string;
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [codeSending, setCodeSending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [qqLoading, setQqLoading] = useState(false);
    const router = useRouter();

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('请输入邮箱和密码');
            return;
        }
        setLoginLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                window.location.href = returnUrl;
            } else {
                toast.error(data.error || '登录失败');
            }
        } catch {
            toast.error('登录失败');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSendCode = async () => {
        if (!email) {
            toast.error('请先输入邮箱');
            return;
        }
        setCodeSending(true);
        try {
            const res = await fetch('/api/send-login-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('验证码已发送');
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown(prev => {
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
            toast.error('发送失败');
        } finally {
            setCodeSending(false);
        }
    };

    const handleCodeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !code) {
            toast.error('请输入邮箱和验证码');
            return;
        }
        setLoginLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('code', code);
            formData.append('returnUrl', returnUrl);

            const res = await fetch('/api/auth/code-login', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.success) {
                window.location.href = returnUrl;
            } else {
                toast.error(data.error || '登录失败');
            }
        } catch {
            toast.error('登录失败');
        } finally {
            setLoginLoading(false);
        }
    };

    useEffect(() => {
        if (qqCode) {
            setQqLoading(true);
            fetch('/api/auth/qq/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: qqCode, state: qqState || '/' }),
            })
                .then(async (res) => {
                    const data = await res.json();
                    if (res.ok && data.success) {
                        window.location.href = qqState || returnUrl;
                    } else {
                        toast.error(data.error || 'QQ登录失败');
                        setQqLoading(false);
                    }
                })
                .catch(() => {
                    toast.error('QQ登录失败');
                    setQqLoading(false);
                });
        }
    }, [qqCode, qqState, returnUrl]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
            <Card className="w-full max-w-[400px]">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl tracking-tight">欢迎回来</CardTitle>
                    <CardDescription>登录你的账号，继续未完的故事</CardDescription>
                </CardHeader>
                <CardContent>
                    {errorMsg && (
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm mb-4 border border-destructive/20">
                            {decodeURIComponent(errorMsg)}
                        </div>
                    )}

                    <Tabs defaultValue="password">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="password" className="gap-1.5">
                                <RiLockLine className="w-4 h-4" />
                                密码登录
                            </TabsTrigger>
                            <TabsTrigger value="code" className="gap-1.5">
                                <RiMailLine className="w-4 h-4" />
                                验证码登录
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="password">
                            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loginLoading}>
                                    {loginLoading ? '登录中...' : '登 录'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="code">
                            <form onSubmit={handleCodeLogin} className="space-y-4">
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
                                    <Label>验证码</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="6位验证码"
                                            className="font-mono tracking-widest"
                                            maxLength={6}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleSendCode}
                                            disabled={codeSending || countdown > 0 || !email}
                                            className="shrink-0 whitespace-nowrap"
                                        >
                                            {countdown > 0 ? `${countdown}s` : codeSending ? '发送中...' : '获取验证码'}
                                        </Button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loginLoading}>
                                    {loginLoading ? '登录中...' : '登 录'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {qqAuthUrl && (
                        <div className="mt-6 flex justify-center">
                            <a href={qqAuthUrl}
                                className={`w-10 h-10 flex items-center justify-center bg-[#12B7F5] hover:bg-[#0aa3e8] text-white rounded-full transition-colors ${qqLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                {qqLoading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <RiQqFill className="w-5 h-5" />
                                )}
                            </a>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        还没有账号？ <Link href="/register"
                            className="text-foreground font-medium hover:underline underline-offset-4">立即注册</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
