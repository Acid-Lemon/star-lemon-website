'use client';

import { usePathname } from 'next/navigation';

export function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return (
            <main className="flex-1 flex bg-muted/40 w-full h-full min-h-screen">
                {children}
            </main>
        );
    }

    return (
        <main className="flex-1 flex mt-2 sm:mt-4">
            {children}
        </main>
    );
}
