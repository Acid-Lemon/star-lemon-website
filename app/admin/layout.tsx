import React from 'react';
import Link from 'next/link';
import {RiTimeLine, RiFileTextLine, RiHomeLine, RiLogoutBoxLine, RiChat3Line, RiChat4Line, RiSideBarLine, RiSettings3Line, RiFlashlightLine, RiDoubleQuotesL, RiUserLine, RiFolderTransferLine, RiLinksLine, RiFilePdf2Line} from '@remixicon/react';
import {getSession, logoutUser} from '../../lib/auth';
import {redirect} from 'next/navigation';
import { getPublicUrl } from '../../lib/oss';
import db from '../../lib/db';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function AdminLayout({children}: { children: React.ReactNode }) {
    const session: any = await getSession();
    if (!session || session.user?.role !== 'admin') {
        redirect('/');
    }

    // 从数据库获取最新的管理员信息
    let admin = session.user;
    try {
        const result = await db.query(
            'SELECT id, nickname, email, role, avatar FROM users WHERE id = $1',
            [session.user.id]
        );
        if (result.rows.length > 0) {
            const row = result.rows[0];
            admin = {
                ...row,
                avatar: await getPublicUrl(row.avatar),
            };
        }
    } catch (error) {
        console.error('Failed to fetch admin info:', error);
    }

    async function handleLogout() {
        'use server';
        await logoutUser();
        redirect('/');
    }

    return (
        <div className="flex w-full min-h-screen bg-muted/40">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background sm:flex shrink-0 shadow-sm z-10">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <RiSideBarLine className="h-5 w-5 text-primary"/>
                        后台管理系统
                    </span>
                </div>
                <nav className="flex flex-col gap-1 p-4 flex-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        内容管理
                    </div>
                    <Link href="/admin/posts"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiFileTextLine className="h-4 w-4"/>
                        文章管理
                    </Link>
                    <Link href="/admin/moments"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiFlashlightLine className="h-4 w-4"/>
                        动态管理
                    </Link>
                    <Link href="/admin/quotes"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiDoubleQuotesL className="h-4 w-4"/>
                        一言管理
                    </Link>
                    <Link href="/admin/timeline"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiTimeLine className="h-4 w-4"/>
                        时间轴管理
                    </Link>
                    <Link href="/admin/friends"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiLinksLine className="h-4 w-4"/>
                        友链管理
                    </Link>

                    <div
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-2">
                        互动审核
                    </div>
                    <Link href="/admin/messages"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiChat4Line className="h-4 w-4"/>
                        留言审核
                    </Link>
                    <Link href="/admin/comments"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiChat3Line className="h-4 w-4"/>
                        评论审核
                    </Link>

                    <div
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-2">
                        系统管理
                    </div>
                    <Link href="/admin/users"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiUserLine className="h-4 w-4"/>
                        用户管理
                    </Link>
                    <Link href="/admin/file-transfers"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiFolderTransferLine className="h-4 w-4"/>
                        文件快传
                    </Link>
                    <Link href="/admin/file-conversions"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiFilePdf2Line className="h-4 w-4"/>
                        文件转换
                    </Link>
                    <Link href="/admin/settings"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiSettings3Line className="h-4 w-4"/>
                        全局配置
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Link href="/"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiHomeLine className="h-4 w-4"/>
                        返回前台
                    </Link>
                    <form action={handleLogout}>
                        <button type="submit"
                                className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left">
                            <RiLogoutBoxLine className="h-4 w-4"/>
                            退出登录
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header
                    className="h-16 flex items-center justify-between px-6 border-b bg-background shadow-sm shrink-0">
                    <div className="flex items-center gap-2">
                        {/* Mobile menu button could go here */}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {admin.avatar ? (
                                <img
                                    src={admin.avatar}
                                    alt={admin.nickname}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                    {admin.nickname?.[0]?.toUpperCase() || 'A'}
                                </div>
                            )}
                            <span className="text-sm font-medium hidden md:block">
                                {admin.nickname || 'Administrator'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <ScrollArea className="flex-1 min-h-0">
                    <main className="p-6 md:p-8">
                        <div className="mx-auto max-w-6xl">
                            {children}
                        </div>
                    </main>
                </ScrollArea>
            </div>
        </div>
    );
}
