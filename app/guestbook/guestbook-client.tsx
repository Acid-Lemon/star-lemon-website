'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { RiChat3Line, RiCheckboxCircleLine, RiTeamLine, RiEditLine, RiLoginBoxLine } from '@remixicon/react';
import { SubmitMessageForm } from './submit-form';
import { MyMessages } from './my-messages';
import { Card, CardContent } from '@/components/ui/card';
import { GalleryLightbox } from '../components/image-lightbox';
import type { GuestbookMessage, GuestbookSession } from './types';

export default function GuestbookClient({ initialMessages, session }: { initialMessages: GuestbookMessage[]; session?: GuestbookSession }) {
    const [messages, setMessages] = useState(initialMessages);
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

    function handleNewMessage(message: GuestbookMessage) {
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
                <div className="grid grid-cols-3 gap-3">
                    <div className="group">
                    <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 h-full">
                        <CardContent className="p-3 md:p-5">
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <RiChat3Line className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{messages.length}</div>
                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">总留言数</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </div>

                    <div className="group">
                    <Card className="border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/20 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 h-full">
                        <CardContent className="p-3 md:p-5">
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                    <RiCheckboxCircleLine className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        {messages.filter(m => m.status === 'approved').length}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">已显示</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </div>

                    <div className="group">
                    <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 h-full">
                        <CardContent className="p-3 md:p-5">
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                                    <RiTeamLine className="w-4 h-4 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        {new Set(messages.map(m => m.user_id)).size}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">参与人数</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
            </section>

            <section className="w-full">
                <Card className="border-0 bg-gradient-to-r from-orange-50 via-white to-yellow-50 dark:from-orange-950/20 dark:via-gray-900 dark:to-yellow-950/20 shadow-lg overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex items-center justify-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                                <RiEditLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
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
                                    <RiLoginBoxLine className="w-5 h-5" />
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
                                <RiChat3Line className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">还没有留言</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">快来写下第一条吧！</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {messages.map((msg, index) => (
                            <div key={msg.id} className="group">
                                <div
                                    className="transform transition-all duration-300 group-hover:-translate-y-2 animate-fadeInUp h-full"
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
