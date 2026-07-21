'use client';

import React from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {RiTimeLine, RiFileTextLine, RiHomeLine, RiLogoutBoxLine, RiChat3Line, RiChat4Line, RiSideBarLine, RiSettings3Line, RiFlashlightLine, RiDoubleQuotesL, RiUserLine, RiFolderTransferLine, RiLinksLine, RiFilePdf2Line, RiTaskLine, RiMenuLine} from '@remixicon/react';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';

export function MobileSidebar() {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();

    React.useEffect(() => {
        setOpen(false);
    }, [pathname]);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="sm:hidden" />}>
                <RiMenuLine className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
            </SheetTrigger>
            <SheetContent side="left" className="data-[side=left]:w-48 sm:data-[side=left]:w-64 p-0">
                <SheetHeader className="h-16 flex flex-row items-center px-6 border-b shrink-0">
                    <SheetTitle className="flex items-center gap-2">
                        <RiSideBarLine className="h-5 w-5 text-primary"/>
                        后台管理系统
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 min-h-0">
                    <nav className="flex flex-col gap-1 p-4">
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
                        <Link href="/admin/dev-tasks"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                            <RiTaskLine className="h-4 w-4"/>
                            开发任务清单
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
                </ScrollArea>
                <div className="p-4 border-t shrink-0">
                    <Link href="/"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                        <RiHomeLine className="h-4 w-4"/>
                        返回前台
                    </Link>
                    <button onClick={() => { fetch('/api/auth/logout', { method: 'POST' }).then(() => { window.location.href = '/'; }); }}
                            className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left">
                        <RiLogoutBoxLine className="h-4 w-4"/>
                        退出登录
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
