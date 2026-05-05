'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { RiSunLine, RiMoonLine } from '@remixicon/react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg" />
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        >
            {theme === 'dark' ? (
                <RiSunLine className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
                <RiMoonLine className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
            )}
        </button>
    );
}
