'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RiCloseCircleLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaptchaInput } from "@/app/components/captcha-input";

export default function RegisterClient() {
    const [errorMsg, setErrorMsg] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [code, setCode] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSendCode = async () => {
        if (!email) {
            setErrorMsg('请先填写邮箱地址');
            return;
        }

        if (!captchaText) {
            setErrorMsg('请先填写图形验证码');
            return;
        }

        setSendingCode(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, captchaToken, captchaText }),
            });
            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || '验证码发送失败');
            } else {
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
            }
        } catch (e) {
            setErrorMsg('发送请求失败，请检查网络');
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (password !== confirmPassword) {
            setErrorMsg('两次输入的密码不一致');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('密码至少需要 6 位');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password, nickname }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                window.location.href = '/login?registered=1';
            } else {
                setErrorMsg(data.error || '注册失败');
            }
        } catch {
            setErrorMsg('注册请求失败，请检查网络');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
            <div className="w-full max-w-[400px] bg-card p-8 sm:p-10 rounded-2xl shadow-sm border border-border">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
                        加入我们
                    </h1>
                    <p className="text-muted-foreground text-sm">填写下方信息，开启你的旅程</p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm mb-6 border border-destructive/20 flex items-center gap-2">
                        <RiCloseCircleLine className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label htmlFor="reg-email" className="text-sm font-medium leading-none">邮箱地址</label>
                        <Input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="reg-captcha" className="text-sm font-medium leading-none">图形验证码</label>
                        <CaptchaInput
                            value={captchaText}
                            onChange={setCaptchaText}
                            onTokenChange={setCaptchaToken}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="reg-code" className="text-sm font-medium leading-none">验证码</label>
                        <div className="flex gap-2">
                            <Input
                                id="reg-code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                className="flex-1 font-mono tracking-widest"
                                placeholder="6位验证码"
                                maxLength={6}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendCode}
                                disabled={sendingCode || countdown > 0 || !email}
                            >
                                {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="reg-password" className="text-sm font-medium leading-none">密码</label>
                        <div className="relative">
                            <Input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="设置你的密码（至少 6 位）"
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

                    <div className="space-y-2">
                        <label htmlFor="reg-confirm" className="text-sm font-medium leading-none">确认密码</label>
                        <Input
                            id="reg-confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="再次输入密码"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="reg-nickname" className="text-sm font-medium leading-none">昵称</label>
                        <Input
                            id="reg-nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            placeholder="网站上的昵称"
                        />
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={submitting}>
                        {submitting ? '注册中...' : '完 成 注 册'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    已有账号？ <Link href="/login" className="text-foreground font-medium hover:underline underline-offset-4 decoration-border">直接登录</Link>
                </div>
            </div>
        </div>
    );
}
