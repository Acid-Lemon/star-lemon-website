'use client';

import { RiLogoutBoxLine } from '@remixicon/react';

export function LogoutButton() {
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        window.location.href = '/';
    };

    return (
        <button onClick={handleLogout}
                className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left">
            <RiLogoutBoxLine className="h-4 w-4"/>
            退出登录
        </button>
    );
}