'use client';

import {useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {UserProfileModal} from './user-profile-modal';

export function Navigation({user, handleLogout}: { user: any, handleLogout: (formData: FormData) => void }) {
    const pathname = usePathname();
    const [showProfile, setShowProfile] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <header className="sticky top-6 z-50 w-full flex justify-center px-4 pointer-events-none">
                <nav
                    className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 py-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full font-serif text-gray-600 relative">
                    <Link href="/"
                          className={`relative px-3 py-2 text-sm sm:text-base font-bold rounded-full transition-all duration-300 whitespace-nowrap ${pathname === '/' ? 'text-orange-500 bg-gray-100/50' : 'text-gray-800 hover:text-orange-500 hover:bg-gray-100/50'}`}>
                        star和lemon的小站
                    </Link>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <Link href="/post"
                          className={`relative px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 group ${pathname === '/post' ? 'text-blue-500 bg-gray-100/50' : 'hover:text-gray-900 hover:bg-gray-100/50'}`}>
                        文章
                        <span
                            className={`absolute inset-x-4 -bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent transition-opacity ${pathname === '/post' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                    </Link>
                    <Link href="/moments"
                          className={`relative px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 group ${pathname === '/moments' ? 'text-rose-500 bg-gray-100/50' : 'hover:text-gray-900 hover:bg-gray-100/50'}`}>
                        动态
                        <span
                            className={`absolute inset-x-4 -bottom-0 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent transition-opacity ${pathname === '/moments' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                    </Link>
                    <Link href="/quotes"
                          className={`relative px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 group ${pathname === '/quotes' ? 'text-indigo-500 bg-gray-100/50' : 'hover:text-gray-900 hover:bg-gray-100/50'}`}>
                        一言
                        <span
                            className={`absolute inset-x-4 -bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent transition-opacity ${pathname === '/quotes' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                    </Link>
                    <Link href="/guestbook"
                          className={`relative px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 group ${pathname === '/guestbook' ? 'text-yellow-500 bg-gray-100/50' : 'hover:text-gray-900 hover:bg-gray-100/50'}`}>
                        留言
                        <span
                            className={`absolute inset-x-4 -bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent transition-opacity ${pathname === '/guestbook' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                    </Link>
                    <Link href="/about"
                          className={`relative px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 group ${pathname === '/about' ? 'text-green-500 bg-gray-100/50' : 'hover:text-gray-900 hover:bg-gray-100/50'}`}>
                        关于
                        <span
                            className={`absolute inset-x-4 -bottom-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent transition-opacity ${pathname === '/about' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                    </Link>
                    <Link href="/tools"
                          className={`relative px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 group ${pathname === '/tools' ? 'text-purple-500 bg-gray-100/50' : 'hover:text-gray-900 hover:bg-gray-100/50'}`}>
                        工具
                        <span
                            className={`absolute inset-x-4 -bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent transition-opacity ${pathname === '/tools' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></span>
                    </Link>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>

                    {/* 登录/登出 动态显示区块 */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100/50 transition-all duration-300"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.nickname}
                                        className="w-7 h-7 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                        {user.nickname?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className="text-sm font-bold text-gray-700 hidden sm:inline">
                                    {user.nickname || user.username}
                                </span>
                                <svg
                                    className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>

                            {/* 下拉菜单 */}
                            {showDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}/>
                                    <div
                                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                </svg>
                                                管理后台
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                setShowProfile(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                            个人设置
                                        </button>
                                        <div className="border-t border-gray-100 my-1"/>
                                        <form action={handleLogout} className="w-full">
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                                </svg>
                                                退出登录
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link href="/login"
                              className="px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 hover:text-gray-900 hover:bg-gray-100/50">
                            登录
                        </Link>
                    )}
                </nav>
            </header>

            {/* 用户资料编辑弹窗 */}
            {showProfile && (
                <UserProfileModal
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUpdate={(updatedUser) => {
                        // 刷新页面以获取最新的 session 信息
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
        <footer className="py-10 text-center text-gray-400 font-mono">
            <div className="flex flex-col items-center gap-2">
                {icpNumber && (
                    <a href="https://beian.miit.gov.cn/" target="_blank"
                       className="text-sm hover:text-orange-400 transition-colors">{icpNumber}</a>
                )}
                <div className="text-xs text-gray-300">
                    © {new Date().getFullYear()} Star & Lemon.
                </div>
            </div>
        </footer>
    );
}
