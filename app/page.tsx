import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timeline } from './components/timeline'
import { StatsCards } from './components/stats-cards'
import { FeaturedPosts } from './components/featured-posts'
import { getSettings } from '../lib/settings'

export const revalidate = 0;

export default async function Home() {
    const settings = await getSettings();
    
    const siteTitle = settings.site_title || 'Star & Lemon 的小站';
    const siteDescription = settings.site_description || '两个开发者的代码世界';
    const hitokotoEnabled = settings.hitokoto_enabled !== 'false';
    const hitokotoApi = settings.hitokoto_api || 'https://v1.hitokoto.cn?c=d&c=i&c=j&c=k';

    let hitokoto = {hitokoto: '欢迎来到star和lemon的小站！', from_who: 'Star & Lemon', from: 'Our Space'};

    if (hitokotoEnabled) {
        try {
            const res = await fetch(hitokotoApi, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            });
            if (res.ok) {
                hitokoto = await res.json();
            }
        } catch (e) {
            console.error("Failed to fetch hitokoto", e);
        }
    }

    return (
        <div className="flex-1 flex flex-col gap-12 w-full max-w-7xl mx-auto px-4 pb-20 pt-8">
            {/* 顶部欢迎卡片 */}
            <section className="w-full">
                <Card className="border-0 bg-gradient-to-r from-orange-50 via-white to-blue-50 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-center">
                            {/* 左侧文字 */}
                            <div className="flex-1 p-8 md:p-12 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
                                    {siteTitle}
                                </h1>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {siteDescription}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                    <Link
                                        href="/post"
                                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-md"
                                    >
                                        探索文章
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="px-6 py-2.5 bg-white text-gray-700 rounded-full font-medium border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all duration-300"
                                    >
                                        了解更多
                                    </Link>
                                </div>
                            </div>
                            
                            {/* 右侧装饰 */}
                            <div className="flex-1 p-8 md:p-12 flex items-center justify-center relative">
                                <div className="relative">
                                    {/* 装饰性背景 */}
                                    <div className="absolute -inset-8 bg-gradient-to-br from-orange-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
                                    
                                    {/* 头像组合 */}
                                    <div className="relative flex items-center gap-4">
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                            <Image
                                                className="relative rounded-full border-4 border-white shadow-lg object-cover w-20 h-20 md:w-28 md:h-28"
                                                width={112}
                                                height={112}
                                                src="/avatar/star.jpg"
                                                alt="Star"
                                            />
                                        </div>
                                        <div className="text-4xl text-orange-400 font-serif">&</div>
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                            <Image
                                                className="relative rounded-full border-4 border-white shadow-lg object-cover w-20 h-20 md:w-28 md:h-28"
                                                width={112}
                                                height={112}
                                                src="/avatar/lemon.jpg"
                                                alt="Lemon"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* 装饰性文字 */}
                                    <div className="mt-4 text-center">
                                        <span className="text-sm font-mono text-gray-400 tracking-widest">STAR & LEMON</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* 一言/诗句卡片 */}
            {hitokotoEnabled && (
            <section className="w-full max-w-4xl mx-auto">
                <Card className="border-0 bg-gradient-to-br from-white to-orange-50/30 shadow-lg hover:shadow-xl transition-shadow duration-500">
                    <CardContent className="p-8 md:p-12 text-center relative">
                        <div className="absolute top-6 left-8 text-6xl text-gray-200 font-serif opacity-30">&ldquo;</div>
                        <div className="absolute bottom-2 right-8 text-6xl text-gray-200 font-serif opacity-30 rotate-180">&rdquo;</div>
                        
                        <div className="text-gray-700 text-xl md:text-2xl font-serif leading-loose relative z-10 px-8 min-h-[4rem] flex items-center justify-center">
                            {hitokoto.hitokoto}
                        </div>
                        
                        <div className="text-gray-400 text-sm font-mono mt-8 relative z-10 flex items-center justify-center gap-3">
                            <span className="w-8 h-px bg-gradient-to-r from-transparent to-gray-300"></span>
                            {hitokoto.from_who || hitokoto.from || "未知"}
                            <span className="w-8 h-px bg-gradient-to-l from-transparent to-gray-300"></span>
                        </div>
                    </CardContent>
                </Card>
            </section>
            )}

            {/* 统计数据 */}
            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 mb-3">网站数据</h2>
                    <p className="text-gray-500">记录我们的成长与进步</p>
                </div>
                <StatsCards />
            </section>

            {/* 精选文章 */}
            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 mb-3">精选文章</h2>
                    <p className="text-gray-500">探索我们的最新创作</p>
                </div>
                <FeaturedPosts />
                <div className="text-center mt-8">
                    <Link
                        href="/post"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        查看所有文章
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* 时间轴 */}
            <section className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 mb-3">发展时间轴</h2>
                    <p className="text-gray-500">记录我们的成长历程</p>
                </div>
                <Timeline />
            </section>

            {/* 功能入口 */}
            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 mb-3">探索更多</h2>
                    <p className="text-gray-500">发现网站的更多精彩功能</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {/* 文章卡片 */}
                    <Link href="/post">
                        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-0 bg-gradient-to-br from-white to-blue-50/30">
                            <CardHeader className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    文章
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    阅读技术文章
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* 留言板卡片 */}
                    <Link href="/guestbook">
                        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-0 bg-gradient-to-br from-white to-yellow-50/30">
                            <CardHeader className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">
                                    留言板
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    与我们互动
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* 关于卡片 */}
                    <Link href="/about">
                        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-0 bg-gradient-to-br from-white to-green-50/30">
                            <CardHeader className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                                    关于
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    了解我们
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* 工具卡片 */}
                    <Link href="/tools">
                        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-0 bg-gradient-to-br from-white to-purple-50/30">
                            <CardHeader className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                                    工具
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    实用小工具
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </section>
        </div>
    );
}
