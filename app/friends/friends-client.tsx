'use client';

import { Card, CardContent } from '@/components/ui/card';
import { RiLinksLine, RiExternalLinkLine } from '@remixicon/react';

interface FriendLink {
    id: number;
    name: string;
    url: string;
    avatar: string | null;
    description: string | null;
}

export default function FriendsClient({ links }: { links: FriendLink[] }) {
    return (
        <div className="flex-1 flex flex-col gap-8 pt-8 pb-16 max-w-6xl mx-auto px-4">
            <div className="text-center">
                <h1 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">友情链接</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm">
                    海内存知己，天涯若比邻。这里收录了我们朋友们的站点，欢迎互访。
                </p>
            </div>

            <section className="w-full">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                        <RiLinksLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-serif text-gray-800 dark:text-gray-100">朋友们</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">共 {links.length} 个友链</p>
                    </div>
                </div>

                {links.length === 0 ? (
                    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50">
                        <CardContent className="py-20 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <RiLinksLine className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">暂无友链</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">期待与更多朋友建立链接</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {links.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block"
                            >
                                <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0">
                                                {link.avatar ? (
                                                    <img
                                                        src={link.avatar}
                                                        alt={link.name}
                                                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-orange-200 dark:group-hover:ring-orange-800 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                        {link.name[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                        {link.name}
                                                    </h3>
                                                    <RiExternalLinkLine className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                </div>
                                                {link.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                        {link.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </a>
                        ))}
                    </div>
                )}
            </section>

            <section className="w-full max-w-2xl mx-auto">
                <Card className="border-0 bg-gradient-to-r from-orange-50 via-white to-yellow-50 dark:from-orange-950/20 dark:via-gray-900 dark:to-yellow-950/20 shadow-lg overflow-hidden">
                    <CardContent className="p-6 md:p-8 text-center">
                        <h2 className="text-lg font-serif text-gray-800 dark:text-gray-100 mb-3">申请友链</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            如果你也想和我们一起建立友情链接，请通过留言板或邮件联系我们，附上你的站点信息。
                        </p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                            <p>需要提供：站点名称、站点链接、站点描述、头像/Logo 地址</p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
