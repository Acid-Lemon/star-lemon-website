'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState('');
    const [email, setEmail] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleSendCode = async () => {
        if (!email) {
            setErrorMsg('请先填写邮箱地址');
            return;
        }

        setSendingCode(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{errorMsg}</span>
                    </div>
                )}

                <form action="/api/register" method="POST" className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">邮箱地址</label>
                        <Input 
                            type="email" 
                            name="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            placeholder="your.email@example.com" 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">验证码</label>
                        <div className="flex gap-2">
                            <Input 
                                type="text" 
                                name="code" 
                                required 
                                className="flex-1"
                                placeholder="6位验证码" 
                            />
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={handleSendCode}
                                disabled={sendingCode || countdown > 0}
                            >
                                {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">密码</label>
                        <Input 
                            type="password" 
                            name="password" 
                            required 
                            minLength={6}
                            placeholder="设置你的密码（至少 6 位）" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">昵称</label>
                        <Input 
                            type="text" 
                            name="nickname" 
                            required
                            placeholder="网站上的昵称" 
                        />
                    </div>
                    
                    <Button type="submit" className="w-full mt-4">
                        完 成 注 册
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    已有账号？ <Link href="/login" className="text-foreground font-medium hover:underline underline-offset-4 decoration-border">直接登录</Link>
                </div>
            </div>
        </div>
    );
}