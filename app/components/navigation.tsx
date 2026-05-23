'use client';

import {useState, useEffect} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import { RiSearchLine, RiArrowDownSLine, RiSettings3Line, RiUserLine, RiLogoutBoxRLine, RiCloseLine, RiMenuLine, RiCoinLine } from '@remixicon/react';
import {UserProfileModal} from './user-profile-modal';
import {type UserInfo} from './user-context';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavigationProps {
    user: UserInfo | null;
}

const navItems = [
    { href: '/post', label: '文章', activeColor: 'text-blue-500', hoverLine: 'via-blue-400' },
    { href: '/moments', label: '动态', activeColor: 'text-rose-500', hoverLine: 'via-rose-400' },
    { href: '/quotes', label: '一言', activeColor: 'text-indigo-500', hoverLine: 'via-indigo-400' },
    { href: '/guestbook', label: '留言', activeColor: 'text-yellow-500', hoverLine: 'via-yellow-400' },
    { href: '/friends', label: '友链', activeColor: 'text-cyan-500', hoverLine: 'via-cyan-400' },
    { href: '/about', label: '关于', activeColor: 'text-green-500', hoverLine: 'via-green-400' },
    { href: '/tools', label: '工具', activeColor: 'text-purple-500', hoverLine: 'via-purple-400' },
];

export function Navigation({user}: NavigationProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [showProfile, setShowProfile] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        router.push('/');
        router.refresh();
    };

    useEffect(() => {
        setMobileMenuOpen(false);
        setShowDropdown(false);
        setSearchOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await fetch(`/api/posts?search=${encodeURIComponent(searchQuery)}&limit=5`);
                const data = await res.json();
                setSearchResults(data.posts || []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <header className="sticky top-4 sm:top-6 z-50 w-full flex justify-center px-2 sm:px-4 pointer-events-none">
                <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-full font-serif text-gray-600 dark:text-gray-400 relative max-w-full">
                    <Link href="/"
                          className={`px-2 sm:px-3 py-2 text-sm sm:text-base font-bold rounded-full transition-all duration-300 whitespace-nowrap ${pathname === '/' ? 'text-orange-500 dark:text-orange-400 bg-gray-100/50 dark:bg-gray-800/50' : 'text-gray-800 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'}`}>
                        star和lemon的小站
                    </Link>
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1"></div>

                    <div className="hidden md:flex items-center gap-0.5">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}
                                  className={`relative px-3 py-2 text-sm sm:text-base rounded-full transition-all duration-300 group ${pathname === item.href ? `${item.activeColor} bg-gray-100/50 dark:bg-gray-800/50` : 'hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'}`}>
                                {item.label}
                                <span className={`absolute inset-x-3 -bottom-0 h-px bg-gradient-to-r from-transparent ${item.hoverLine} to-transparent transition-opacity ${pathname === item.href ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-0.5">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                            aria-label="搜索"
                        >
                            <RiSearchLine className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1 hidden md:block"></div>

                    <div className="hidden md:block">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.nickname} className="w-7 h-7 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                            {user.nickname?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 hidden sm:inline">
                                        {user.nickname || '用户'}
                                    </span>
                                    <RiArrowDownSLine className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}/>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50 overflow-hidden">
                                            {user.role === 'admin' && (
                                                <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setShowDropdown(false)}>
                                                    <RiSettings3Line className="w-4 h-4" />
                                                    管理后台
                                                </Link>
                                            )}
                                            <Link href="/recharge" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setShowDropdown(false)}>
                                                <RiCoinLine className="w-4 h-4 text-yellow-500" />
                                                星柠币充值
                                            </Link>
                                            <button onClick={() => { setShowDropdown(false); setShowProfile(true); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left">
                                                <RiUserLine className="w-4 h-4" />
                                                个人设置
                                            </button>
                                            <div className="border-t border-gray-100 dark:border-gray-800 my-1"/>
                                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left">
                                                    <RiLogoutBoxRLine className="w-4 h-4" />
                                                    退出登录
                                                </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                                登录
                            </Link>
                        )}
                    </div>

                    <div className="flex md:hidden items-center gap-0.5">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                            aria-label="搜索"
                        >
                            <RiSearchLine className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                            aria-label="菜单"
                        >
                            {mobileMenuOpen ? (
                                <RiCloseLine className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <RiMenuLine className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                </nav>
            </header>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute top-16 left-2 right-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden p-4">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}
                                      className={`px-4 py-3 rounded-xl text-base transition-all duration-300 ${pathname === item.href ? `${item.activeColor} bg-gray-50 dark:bg-gray-800 font-medium` : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 dark:border-gray-800 my-3" />
                        {user ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 px-4 py-2">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.nickname} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                            {user.nickname?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.nickname}</span>
                                </div>
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        管理后台
                                    </Link>
                                )}
                                <Link href="/recharge" className="px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                                    <RiCoinLine className="w-4 h-4 text-yellow-500" />
                                    星柠币充值
                                </Link>
                                <button onClick={() => { setMobileMenuOpen(false); setShowProfile(true); }} className="px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                                    个人设置
                                </button>
                                <button onClick={handleLogout} className="px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left">
                                        退出登录
                                    </button>
                            </div>
                        ) : (
                            <Link href="/login" className="block px-4 py-3 rounded-xl text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                登录
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {searchOpen && (
                <div className="fixed inset-0 z-[60]">
                    <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} />
                    <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <RiSearchLine className="w-5 h-5 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="搜索文章..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base"
                                autoFocus
                            />
                            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                ESC
                            </button>
                        </div>

                        {searchQuery.trim() && (
                            <ScrollArea className="max-h-80">
                                {searchLoading ? (
                                    <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                        搜索中...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="py-2">
                                        {searchResults.map((post: any) => (
                                            <Link key={post.id} href={`/post/${post.id}`}
                                                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{post.title}</p>
                                                {post.summary && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{post.summary}</p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                        未找到相关文章
                                    </div>
                                )}
                            </ScrollArea>
                        )}

                        {!searchQuery.trim() && (
                            <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                输入关键词搜索文章
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showProfile && (
                <UserProfileModal
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUpdate={() => {
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
}

export function Footer({icpNumber}: { icpNumber?: string }) {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="py-10 text-center text-gray-400 dark:text-gray-600 font-mono">
            <div className="flex flex-col items-center gap-2">
                {icpNumber && (
                    <a href="https://beian.miit.gov.cn/" target="_blank"
                       className="text-sm hover:text-orange-400 dark:hover:text-orange-500 transition-colors">{icpNumber}</a>
                )}
                <div className="text-xs text-gray-300 dark:text-gray-700">
                    © {new Date().getFullYear()} Star & Lemon.
                </div>
            </div>
        </footer>
    );
}
