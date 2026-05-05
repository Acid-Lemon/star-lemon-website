'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { SubmitMessageForm } from './submit-form';
import { MyMessages } from './my-messages';
import { Card, CardContent } from '@/components/ui/card';
import { GalleryLightbox } from '../components/image-lightbox';

export default function GuestbookClient({ initialMessages, session }: { initialMessages: any[], session: any }) {
    const [messages, setMessages] = useState(initialMessages);
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

    function handleNewMessage(message: any) {
        setMessages(prev => [message, ...prev]);
    }

    const handleImageClick = useCallback((urls: string[], index: number) => {
        setLightbox({ images: urls, index });
    }, []);

    return (
        <div className="flex-1 flex flex-col gap-8 pt-8 pb-16 max-w-6xl mx-auto px-4">
            <div className="text-center">
                <h1 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">留言板</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm">
                    在这里留下你的足迹，分享你的想法和建议。每一条留言都是珍贵的回忆。
                </p>
            </div>

            <section className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{messages.length}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">总留言数</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        {messages.filter(m => m.status === 'approved').length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">已显示</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        {new Set(messages.map(m => m.user_id)).size}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">参与人数</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="w-full">
                <Card className="border-0 bg-gradient-to-r from-orange-50 via-white to-yellow-50 dark:from-orange-950/20 dark:via-gray-900 dark:to-yellow-950/20 shadow-lg overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex items-center justify-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-serif text-gray-800 dark:text-gray-100">写下你想说的话</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">分享你的想法、建议或问候</p>
                            </div>
                        </div>
                        {session ? (
                            <SubmitMessageForm onSuccess={handleNewMessage} />
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">登录后即可留言</p>
                                <Link
                                    href="/login?returnUrl=/guestbook"
                                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    登录后留言
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            <section className="w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif text-gray-800 dark:text-gray-100 mb-2">留言墙</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">共 {messages.length} 条留言</p>
                </div>

                {messages.length === 0 ? (
                    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50">
                        <CardContent className="py-20 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">还没有留言</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">快来写下第一条吧！</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className="transform transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <MyMessages
                                    message={msg}
                                    bgColor={msg.bg_color}
                                    isOwner={session?.id === msg.user_id}
                                    onDeleted={(id: number) => setMessages(prev => prev.filter(m => m.id !== id))}
                                    onImageClick={handleImageClick}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
            `}</style>

            {lightbox && (
                <GalleryLightbox
                    images={lightbox.images}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
            )}
        </div>
    );
}
