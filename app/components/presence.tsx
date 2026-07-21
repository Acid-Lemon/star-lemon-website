'use client';

import { useState, useEffect, useRef } from 'react';
import { RiEyeLine } from '@remixicon/react';

function getOrCreateVisitorId(): string {
    if (typeof window === 'undefined') return '';
    const KEY = 'sl_visitor_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(KEY, id);
    }
    return id;
}

export function usePresence(page?: string) {
    const [online, setOnline] = useState(0);
    const [readers, setReaders] = useState(0);
    const visitorIdRef = useRef('');
    const pageRef = useRef(page || '/');

    useEffect(() => {
        pageRef.current = page || '/';
    }, [page]);

    useEffect(() => {
        visitorIdRef.current = getOrCreateVisitorId();

        const sendHeartbeat = async () => {
            try {
                const res = await fetch('/api/presence', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitorId: visitorIdRef.current,
                        page: pageRef.current,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setOnline(data.online);
                    setReaders(data.readers);
                }
            } catch {}
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 15_000);

        const handleLeave = () => {
            const data = JSON.stringify({
                visitorId: visitorIdRef.current,
                page: pageRef.current,
                action: 'leave',
            });
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/presence', new Blob([data], { type: 'application/json' }));
            }
        };

        window.addEventListener('beforeunload', handleLeave);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleLeave);
            handleLeave();
        };
    }, []);

    return { online, readers };
}

export function OnlineBadge({ online }: { online: number }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {online > 0 ? `${online} 人在线` : '在线'}
        </span>
    );
}

export function ArticleReaders({ readers }: { readers: number }) {
    if (readers <= 0) return null;
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <RiEyeLine className="w-3.5 h-3.5" />
            {readers} 人正在阅读
        </span>
    );
}
