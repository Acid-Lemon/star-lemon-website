'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { RiRefreshLine } from '@remixicon/react';

interface CaptchaInputProps {
    // 用户输入的验证码文本
    value: string;
    onChange: (text: string) => void;
    // 当前图形验证码对应的签名 token
    onTokenChange: (token: string) => void;
}

// 图形验证码输入框：自动拉取 SVG 图片，点击图片可刷新
export function CaptchaInput({ value, onChange, onTokenChange }: CaptchaInputProps) {
    const [svg, setSvg] = useState('');
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/captcha', { cache: 'no-store' });
            const data = await res.json();
            setSvg(data.svg);
            onTokenChange(data.token);
            onChange('');
        } catch {
            setSvg('');
        } finally {
            setLoading(false);
        }
    }, [onTokenChange, onChange]);

    useEffect(() => {
        refresh();
        // 仅首次挂载时拉取
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex gap-2">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="图形验证码"
                className="flex-1"
                autoComplete="off"
                maxLength={8}
            />
            <button
                type="button"
                onClick={refresh}
                title="点击刷新验证码"
                className="shrink-0 h-9 w-[120px] rounded-md border border-input bg-background flex items-center justify-center overflow-hidden hover:border-ring transition-colors relative"
            >
                {svg ? (
                    <span
                        className="flex items-center justify-center [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                ) : (
                    <RiRefreshLine className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                )}
            </button>
        </div>
    );
}
