import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

            {/* 介绍卡片 */}
            <section className="w-full">
                <Card className="border-0 bg-gradient-to-r from-orange-50 via-white to-blue-50 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="flex-1 p-8 md:p-12">
                                <h2 className="text-2xl font-serif text-gray-800 mb-4">我们的故事</h2>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    Star 和 Lemon 是两个热爱编程的开发者，我们在技术社区相识，因为共同的兴趣走到了一起。
                                </p>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    我们相信技术可以改变世界，也相信分享可以让知识传递得更远。这个小站就是我们分享的平台。
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    在这里，你会看到我们的技术文章、项目经验和生活感悟。希望这些内容能对你有所帮助。
                                </p>
                            </div>
                            <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-gradient-to-br from-orange-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
                                    <div className="relative flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                            <Image
                                                className="relative rounded-full border-4 border-white shadow-lg object-cover w-24 h-24 md:w-32 md:h-32"
                                                width={128}
                                                height={128}
                                                src="/avatar/star.jpg"
                                                alt="Star"
                                            />
                                        </div>
                                        <div className="text-5xl text-orange-400 font-serif">&</div>
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                            <Image
                                                className="relative rounded-full border-4 border-white shadow-lg object-cover w-24 h-24 md:w-32 md:h-32"
                                                width={128}
                                                height={128}
                                                src="/avatar/lemon.jpg"
                                                alt="Lemon"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* 个人介绍 */}
            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 mb-3">团队成员</h2>
                    <p className="text-gray-500">认识一下我们</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Star 的卡片 */}
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
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                热爱编程，专注于 Web 开发和系统架构。喜欢探索新技术，用代码解决实际问题。
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">React</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Node.js</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">TypeScript</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lemon 的卡片 */}
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
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                热爱技术，擅长前端开发和用户体验设计。追求代码的优雅与高效。
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Vue</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Python</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">UI/UX</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* 联系方式 */}
            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 mb-3">联系我们</h2>
                    <p className="text-gray-500">有想法？欢迎联系我们</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <a href="mailto:star@example.com" className="group">
                        <Card className="h-full border-0 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Star</p>
                                    <p className="text-sm text-gray-500">star@example.com</p>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                    
                    <a href="mailto:lemon@example.com" className="group">
                        <Card className="h-full border-0 bg-gradient-to-br from-white to-yellow-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 group-hover:text-yellow-600 transition-colors">Lemon</p>
                                    <p className="text-sm text-gray-500">lemon@example.com</p>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                </div>
            </section>
        </div>
    );
}
