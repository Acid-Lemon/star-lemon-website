import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { RiComputerLine, RiServerLine, RiSettings3Line, RiFlashlightLine } from '@remixicon/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactLinks } from './contact-links';
import { Timeline } from '../components/timeline';
import { StatsCards } from '../components/stats-cards';

export const metadata: Metadata = {
    title: '关于',
    description: '了解 Star & Lemon 小站的故事与团队',
};

export default function About() {
    return (
        <div className="flex-1 flex flex-col gap-12 pt-10 pb-20 max-w-6xl mx-auto px-4">
            <div className="text-center">
                <h1 className="text-4xl font-serif text-gray-800 dark:text-gray-100 mb-4">关于我们</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    我们是两个热爱开发的朋友，一起探索技术的世界。在这里分享我们的代码、经验和思考。
                </p>
            </div>

            <section className="w-full">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                    <Card className="h-full group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20">
                        <CardHeader className="text-center pb-0">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <Image
                                        className="relative rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover w-24 h-24 md:w-32 md:h-32"
                                        width={128}
                                        height={128}
                                        src="/avatar/star.jpg"
                                        alt="Star的头像"
                                    />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-widest group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                STAR
                            </CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                                全栈开发者
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                热爱编程，专注于 Web 开发和系统架构。喜欢探索新技术，用代码解决实际问题。
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">React</span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">Node.js</span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">TypeScript</span>
                            </div>
                            <ContactLinks
                                email="1598624985@qq.com"
                                bilibili="https://space.bilibili.com/25124707"
                                github="https://github.com/star-starry-sea"
                            />
                    </CardContent>
                    </Card>
                    </div>

                    <div className="group">
                    <Card className="h-full group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-yellow-50/50 dark:from-gray-900 dark:to-yellow-950/20">
                        <CardHeader className="text-center pb-0">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <Image
                                        className="relative rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover w-24 h-24 md:w-32 md:h-32"
                                        width={128}
                                        height={128}
                                        src="/avatar/lemon.jpg"
                                        alt="Lemon的头像"
                                    />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-widest group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                                LEMON
                            </CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                                全栈开发者
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                热爱技术，擅长前端开发和用户体验设计。追求代码的优雅与高效。
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">Vue</span>
                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">Python</span>
                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">UI/UX</span>
                            </div>
                            <ContactLinks
                                email="3573045100@qq.com"
                                bilibili="https://space.bilibili.com/400932209"
                                github="https://github.com/Acid-Lemon"
                            />
                        </CardContent>
                    </Card>
                    </div>
                </div>
            </section>

            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">网站数据</h2>
                    <p className="text-gray-500 dark:text-gray-400">记录我们的成长与进步</p>
                </div>
                <StatsCards />
            </section>

            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">技术栈</h2>
                    <p className="text-gray-500 dark:text-gray-400">本项目使用的技术</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
                                <RiComputerLine className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-lg text-gray-800 dark:text-gray-100">前端</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">Next.js 16</span>
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">React 19</span>
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">TypeScript</span>
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">Tailwind CSS</span>
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">shadcn/ui</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
                                <RiServerLine className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-lg text-gray-800 dark:text-gray-100">后端</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">Next.js API</span>
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">PostgreSQL</span>
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">JWT</span>
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">bcryptjs</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/20 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-3">
                                <RiSettings3Line className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <CardTitle className="text-lg text-gray-800 dark:text-gray-100">开发工具</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">pnpm</span>
                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">ESLint</span>
                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">PostCSS</span>
                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">Turbopack</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-3">
                                <RiFlashlightLine className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <CardTitle className="text-lg text-gray-800 dark:text-gray-100">主要功能</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">博客系统</span>
                                <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">留言板</span>
                                <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">用户认证</span>
                                <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">后台管理</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">发展时间轴</h2>
                    <p className="text-gray-500 dark:text-gray-400">记录我们的成长历程</p>
                </div>
                <Timeline />
            </section>
        </div>
    );
}
