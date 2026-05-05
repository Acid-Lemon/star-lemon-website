'use client';

import Link from 'next/link';
import { RiHomeLine, RiArrowLeftLine } from '@remixicon/react';

export default function NotFound() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <span className="text-[120px] sm:text-[160px] font-display font-black leading-none text-gray-100 dark:text-gray-800 select-none">
                        404
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl sm:text-7xl">🍋</span>
                    </span>
                </div>
                <h1 className="text-2xl font-serif text-gray-800 dark:text-gray-100 mb-3">
                    页面走丢了
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    你访问的页面不存在，可能已被移动或删除。<br />
                    不如回到首页，重新探索吧。
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        <RiHomeLine className="w-4 h-4" />
                        回到首页
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        <RiArrowLeftLine className="w-4 h-4" />
                        返回上页
                    </button>
                </div>
            </div>
        </div>
    );
}
