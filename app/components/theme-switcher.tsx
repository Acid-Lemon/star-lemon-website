'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
    RiSunLine,
    RiMoonLine,
    RiComputerLine,
    RiHeartLine,
    RiCloseLine
} from '@remixicon/react';

interface ThemeOption {
    id: string;
    label: string;
    icon: React.ReactNode;
    previewBg: string;
    previewAccent: string;
    activeRingClass: string;
}

const themes: ThemeOption[] = [
    {
        id: 'light',
        label: '明亮',
        icon: <RiSunLine className="w-5 h-5" />,
        previewBg: 'bg-gradient-to-br from-orange-50 to-white',
        previewAccent: 'bg-orange-400',
        activeRingClass: 'ring-orange-400',
    },
    {
        id: 'dark',
        label: '深夜',
        icon: <RiMoonLine className="w-5 h-5" />,
        previewBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
        previewAccent: 'bg-indigo-400',
        activeRingClass: 'ring-indigo-400',
    },
    {
        id: 'tech',
        label: '科技',
        icon: <RiComputerLine className="w-5 h-5" />,
        previewBg: 'bg-gradient-to-br from-[#0c1a3a] to-[#060d1f]',
        previewAccent: 'bg-cyan-400',
        activeRingClass: 'ring-cyan-400',
    },
    {
        id: 'pastel',
        label: '梦幻',
        icon: <RiHeartLine className="w-5 h-5" />,
        previewBg: 'bg-gradient-to-br from-pink-100 to-fuchsia-50',
        previewAccent: 'bg-pink-500',
        activeRingClass: 'ring-pink-400',
    },
];

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSelectTheme = (themeId: string) => {
        setTheme(themeId);
        setIsOpen(false);
    };

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            panelRef.current &&
            !panelRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    const currentTheme = themes.find((t) => t.id === theme) || themes[0];

    if (!mounted) {
        return (
            <div className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-white/80 backdrop-blur-xl border border-border shadow-lg" />
        );
    }

    return (
        <div className="fixed bottom-6 left-6 z-50">
            {/* Theme Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute bottom-16 left-0 mb-2 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
                    role="dialog"
                    aria-label="主题选择"
                >
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-sm font-medium text-foreground">选择主题</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-muted transition-colors"
                            aria-label="关闭"
                        >
                            <RiCloseLine className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleSelectTheme(t.id)}
                                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                                    theme === t.id
                                        ? `ring-2 ${t.activeRingClass} border-transparent`
                                        : 'border-border hover:border-muted-foreground/30'
                                }`}
                                aria-label={`切换到${t.label}主题`}
                                aria-pressed={theme === t.id}
                            >
                                {/* Mini preview card */}
                                <div className={`w-full h-8 rounded-lg ${t.previewBg} relative overflow-hidden flex items-center justify-center`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${t.previewAccent} shadow-sm`} />
                                    {t.id === 'tech' && (
                                        <div className="absolute inset-0 opacity-30"
                                             style={{
                                                 backgroundImage: 'linear-gradient(rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px)',
                                                 backgroundSize: '8px 8px'
                                             }} />
                                    )}
                                    {t.id === 'pastel' && (
                                        <span className="absolute text-[6px] opacity-30" style={{ left: '3px', top: '2px' }}>♡</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-foreground">{t.icon}</span>
                                    <span className="text-xs font-medium text-foreground">{t.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className={`w-12 h-12 rounded-full backdrop-blur-xl border shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${
                    theme === 'tech'
                        ? 'bg-[#0c1a3a]/80 border-[#1e3a5f] shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                        : theme === 'pastel'
                        ? 'bg-pink-50/80 border-pink-200 shadow-[0_4px_15px_rgba(244,114,182,0.12)]'
                        : 'bg-card/80 border-border'
                }`}
                aria-label={isOpen ? '关闭主题选择' : '打开主题选择'}
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <RiCloseLine className="w-5 h-5 text-muted-foreground group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                    <span className={
                        theme === 'tech' ? 'text-cyan-400'
                        : theme === 'pastel' ? 'text-pink-500'
                        : theme === 'dark' ? 'text-indigo-400'
                        : 'text-orange-500'
                    }>
                        {currentTheme.icon}
                    </span>
                )}
            </button>
        </div>
    );
}