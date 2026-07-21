'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { RiQqFill, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import { QqBindDialog } from '@/app/components/qq-bind-dialog';
import { CaptchaInput } from '@/app/components/captcha-input';

export default function LoginClientPage({ qqAuthUrl, ceruAuthUrl, errorMsg, returnUrl, authCode, authState }: {
    qqAuthUrl: string | null;
    ceruAuthUrl: string | null;
    errorMsg?: string;
    returnUrl: string;
    authCode?: string;
    authState?: string;
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [code, setCode] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [codeSending, setCodeSending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [qqLoading, setQqLoading] = useState(false);
    const [ceruLoading, setCeruLoading] = useState(false);
    const [showBindDialog, setShowBindDialog] = useState(false);
    const [bindToken, setBindToken] = useState('');
    const [oauthProvider, setOauthProvider] = useState<'qq' | 'ceru'>('qq');
    const [oauthNickname, setOauthNickname] = useState('');
    const [oauthAvatar, setOauthAvatar] = useState('');
    const [oauthEmail, setOauthEmail] = useState('');
    const [oauthRedirectUrl, setOauthRedirectUrl] = useState('/');

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
        if (!captchaText) {
            toast.error('请先填写图形验证码');
            return;
        }
        setCodeSending(true);
        try {
            const res = await fetch('/api/send-login-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, captchaToken, captchaText }),
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

    const handleQqCallback = useCallback((code: string, state: string | undefined) => {
        if (!code) return;
        setQqLoading(true);

        fetch('/api/auth/qq/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.ok && data.success) {
                    if (data.needs_bind) {
                        setBindToken(data.bind_token);
                        setOauthProvider('qq');
                        setOauthNickname(data.qq_nickname);
                        setOauthAvatar(data.qq_avatar);
                        setOauthEmail('');
                        setOauthRedirectUrl(data.redirectUrl || '/');
                        setShowBindDialog(true);
                        setQqLoading(false);
                    } else {
                        window.location.href = data.redirectUrl || '/';
                    }
                } else {
                    toast.error(data.error || 'QQ登录失败');
                    setQqLoading(false);
                }
            })
            .catch(() => {
                toast.error('QQ登录失败');
                setQqLoading(false);
            });
    }, []);

    useEffect(() => {
        if (authState?.startsWith('ceru:')) return;
        handleQqCallback(authCode || '', authState);
    }, [authCode, authState, handleQqCallback]);

    const handleCeruCallback = useCallback((code: string, state: string | undefined) => {
        if (!code || !state?.startsWith('ceru:')) return;
        setCeruLoading(true);

        fetch('/api/auth/ceru/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.ok && data.success) {
                    if (data.needs_bind) {
                        setBindToken(data.bind_token);
                        setOauthProvider(data.oauth_provider || 'ceru');
                        setOauthNickname(data.oauth_nickname);
                        setOauthAvatar(data.oauth_avatar);
                        setOauthEmail(data.oauth_email || '');
                        setOauthRedirectUrl(data.redirectUrl || '/');
                        setShowBindDialog(true);
                        setCeruLoading(false);
                    } else {
                        window.location.href = data.redirectUrl || '/';
                    }
                } else {
                    toast.error(data.error || '澜音登录失败');
                    setCeruLoading(false);
                }
            })
            .catch(() => {
                toast.error('澜音登录失败');
                setCeruLoading(false);
            });
    }, []);

    useEffect(() => {
        handleCeruCallback(authCode || '', authState);
    }, [authCode, authState, handleCeruCallback]);

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
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
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
                                    <Label>图形验证码</Label>
                                    <CaptchaInput
                                        value={captchaText}
                                        onChange={setCaptchaText}
                                        onTokenChange={setCaptchaToken}
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

                    {(qqAuthUrl || ceruAuthUrl) && (
                        <div className="mt-6 flex justify-center gap-3">
                            {ceruAuthUrl && (
                                <a href={ceruAuthUrl}
                                    aria-label="使用澜音登录"
                                    title="使用澜音登录"
                                    className={`w-10 h-10 flex items-center justify-center bg-[#f8fffb] hover:bg-[#eefbf4] text-foreground rounded-full border border-border transition-colors ${ceruLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {ceruLoading ? (
                                        <span className="w-5 h-5 border-2 border-foreground/60 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Image src="/logo/ceru-music.svg" alt="" width={24} height={24} className="rounded-md" />
                                    )}
                                </a>
                            )}
                            {qqAuthUrl && (
                                <a href={qqAuthUrl}
                                    aria-label="使用QQ登录"
                                    title="使用QQ登录"
                                    className={`w-10 h-10 flex items-center justify-center bg-[#12B7F5] hover:bg-[#0aa3e8] text-white rounded-full transition-colors ${qqLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {qqLoading ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <RiQqFill className="w-5 h-5" />
                                    )}
                                </a>
                            )}
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        还没有账号？ <Link href="/register"
                            className="text-foreground font-medium hover:underline underline-offset-4">立即注册</Link>
                    </div>
                </CardContent>
            </Card>

            {showBindDialog && (
                <QqBindDialog
                    open={showBindDialog}
                    onClose={() => setShowBindDialog(false)}
                    bindToken={bindToken}
                    oauthProvider={oauthProvider}
                    oauthNickname={oauthNickname}
                    oauthAvatar={oauthAvatar}
                    oauthEmail={oauthEmail}
                    redirectUrl={oauthRedirectUrl}
                />
            )}
        </div>
    );
}
