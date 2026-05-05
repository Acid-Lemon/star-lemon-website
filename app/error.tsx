'use client';

import { RiRefreshLine, RiHomeLine } from '@remixicon/react';
import Link from 'next/link';

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <span className="text-[100px] sm:text-[140px] font-display font-black leading-none text-gray-100 dark:text-gray-800 select-none">
                        :(
                    </span>
                </div>
                <h1 className="text-2xl font-serif text-gray-800 dark:text-gray-100 mb-3">
                    出了点问题
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    页面加载时遇到了意外错误，请稍后再试。
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        <RiRefreshLine className="w-4 h-4" />
                        重新加载
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        <RiHomeLine className="w-4 h-4" />
                        回到首页
                    </Link>
                </div>
            </div>
        </div>
    );
}
