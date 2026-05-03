import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactLinks } from './contact-links';

export default function About() {
    return (
        <div className="flex-1 flex flex-col gap-12 pt-10 pb-20 max-w-6xl mx-auto px-4">
            {/* 页面标题 */}
            <div className="text-center">
                <h1 className="text-4xl font-serif text-gray-800 mb-4">关于我们</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    我们是两个热爱开发的朋友，一起探索技术的世界。在这里分享我们的代码、经验和思考。
                </p>
            </div>

            {/* 团队介绍 */}
            <section className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Star */}
                    <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-blue-50/50">
                        <CardHeader className="text-center pb-0">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <Image
                                        className="relative rounded-full border-4 border-white shadow-lg object-cover w-24 h-24 md:w-32 md:h-32"
                                        width={128}
                                        height={128}
                                        src="/avatar/star.jpg"
                                        alt="Star的头像"
                                    />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800 tracking-widest group-hover:text-blue-600 transition-colors">
                                STAR
                            </CardTitle>
                            <CardDescription className="text-gray-500 font-mono text-sm">
                                全栈开发者
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                热爱编程，专注于 Web 开发和系统架构。喜欢探索新技术，用代码解决实际问题。
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">React</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Node.js</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">TypeScript</span>
                            </div>
                            <ContactLinks
                                email="1598624985@qq.com"
                                bilibili="https://space.bilibili.com/25124707"
                                github="https://github.com/star-starry-sea"
                            />
                        </CardContent>
                    </Card>

                    {/* Lemon */}
                    <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-yellow-50/50">
                        <CardHeader className="text-center pb-0">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <Image
                                        className="relative rounded-full border-4 border-white shadow-lg object-cover w-24 h-24 md:w-32 md:h-32"
                                        width={128}
                                        height={128}
                                        src="/avatar/lemon.jpg"
                                        alt="Lemon的头像"
                                    />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800 tracking-widest group-hover:text-yellow-600 transition-colors">
                                LEMON
                            </CardTitle>
                            <CardDescription className="text-gray-500 font-mono text-sm">
                                全栈开发者
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                热爱技术，擅长前端开发和用户体验设计。追求代码的优雅与高效。
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Vue</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Python</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">UI/UX</span>
                            </div>
                            <ContactLinks
                                email="3573045100@qq.com"
                                bilibili="https://space.bilibili.com/400932209"
                                github="https://github.com/Acid-Lemon"
                            />
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* 技术栈 */}
            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 mb-3">技术栈</h2>
                    <p className="text-gray-500">本项目使用的技术</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 前端 */}
                    <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <CardTitle className="text-lg">前端</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Next.js 16</span>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">React 19</span>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">TypeScript</span>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Tailwind CSS</span>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">shadcn/ui</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 后端 */}
                    <Card className="border-0 bg-gradient-to-br from-white to-green-50/30 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                            </div>
                            <CardTitle className="text-lg">后端</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Next.js API</span>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">PostgreSQL</span>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">JWT</span>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">bcryptjs</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 工具 */}
                    <Card className="border-0 bg-gradient-to-br from-white to-orange-50/30 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <CardTitle className="text-lg">开发工具</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">pnpm</span>
                                <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">ESLint</span>
                                <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">PostCSS</span>
                                <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">Turbopack</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 功能 */}
                    <Card className="border-0 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <CardTitle className="text-lg">主要功能</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">博客系统</span>
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">留言板</span>
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">用户认证</span>
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">后台管理</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
