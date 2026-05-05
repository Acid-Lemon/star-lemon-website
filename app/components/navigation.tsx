'use client';

import {useState, useEffect} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {UserProfileModal} from './user-profile-modal';
import {type UserInfo} from './user-context';

interface NavigationProps {
    user: UserInfo | null;
    handleLogout: (formData: FormData) => void;
}

const navItems = [
    { href: '/post', label: '文章', activeColor: 'text-blue-500', hoverLine: 'via-blue-400' },
    { href: '/moments', label: '动态', activeColor: 'text-rose-500', hoverLine: 'via-rose-400' },
    { href: '/quotes', label: '一言', activeColor: 'text-indigo-500', hoverLine: 'via-indigo-400' },
    { href: '/guestbook', label: '留言', activeColor: 'text-yellow-500', hoverLine: 'via-yellow-400' },
    { href: '/about', label: '关于', activeColor: 'text-green-500', hoverLine: 'via-green-400' },
    { href: '/tools', label: '工具', activeColor: 'text-purple-500', hoverLine: 'via-purple-400' },
];

export function Navigation({user, handleLogout}: NavigationProps) {
    const pathname = usePathname();
    const [showProfile, setShowProfile] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

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
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
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
                                    <svg className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </button>

                                {showDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}/>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50 overflow-hidden">
                                            {user.role === 'admin' && (
                                                <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setShowDropdown(false)}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    </svg>
                                                    管理后台
                                                </Link>
                                            )}
                                            <button onClick={() => { setShowDropdown(false); setShowProfile(true); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                </svg>
                                                个人设置
                                            </button>
                                            <div className="border-t border-gray-100 dark:border-gray-800 my-1"/>
                                            <form action={handleLogout} className="w-full">
                                                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                                    </svg>
                                                    退出登录
                                                </button>
                                            </form>
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
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                            aria-label="菜单"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
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
                                <button onClick={() => { setMobileMenuOpen(false); setShowProfile(true); }} className="px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                                    个人设置
                                </button>
                                <form action={handleLogout} className="w-full">
                                    <button type="submit" className="px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left">
                                        退出登录
                                    </button>
                                </form>
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
                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
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
                            <div className="max-h-80 overflow-y-auto">
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
                            </div>
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
