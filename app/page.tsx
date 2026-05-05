import Image from 'next/image'
import Link from 'next/link'
import { RiDoubleQuotesL, RiDoubleQuotesR, RiArrowRightSLine, RiBookOpenLine, RiArticleLine, RiUserAddLine, RiChat3Line, RiTeamLine, RiSettings3Line } from '@remixicon/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturedPosts } from './components/featured-posts'
import { JsonLd } from './components/json-ld'
import { getSettings } from '../lib/settings'
import db from '../lib/db'

export const revalidate = 60;

async function getRandomQuote() {
  try {
    const result = await db.query(
      'SELECT content, source FROM quotes WHERE is_active = true ORDER BY RANDOM() LIMIT 1'
    );
    return result.rows[0] || null;
  } catch (e) {
    console.error('Failed to fetch random quote', e);
    return null;
  }
}

async function getStats() {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM posts) as posts,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM messages) as comments
    `);
    return {
      posts: parseInt(result.rows[0]?.posts || '0'),
      users: parseInt(result.rows[0]?.users || '0'),
      comments: parseInt(result.rows[0]?.comments || '0'),
    };
  } catch (e) {
    console.error('Failed to fetch stats', e);
    return { posts: 0, users: 0, comments: 0 };
  }
}

export default async function Home() {
    const settings = await getSettings();

    const siteTitle = settings.site_title || 'Star & Lemon 的小站';
    const siteDescription = settings.site_description || '两个开发者的代码世界';
    const quoteEnabled = settings.quote_enabled !== 'false';

    let quote = { content: '欢迎来到star和lemon的小站！', source: 'Star & Lemon' };

    if (quoteEnabled) {
      const randomQuote = await getRandomQuote();
      if (randomQuote) {
        quote = randomQuote;
      }
    }

    const stats = await getStats();

    return (
        <div className="flex-1 flex flex-col gap-16 w-full max-w-7xl mx-auto px-4 pb-20 pt-8">
            <JsonLd />
            <section className="w-full">
                <Card className="border-0 bg-gradient-to-r from-orange-50 via-white to-blue-50 dark:from-orange-950/20 dark:via-gray-900 dark:to-blue-950/20 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="flex-1 p-8 md:p-12 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100/60 dark:bg-orange-900/30 rounded-full text-sm text-orange-600 dark:text-orange-400 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    欢迎来到我们的小站
                                </div>
                                <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-800 dark:text-gray-100 mb-4 leading-tight">
                                    {siteTitle}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
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
                                        className="px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300"
                                    >
                                        了解更多
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-1 p-8 md:p-12 flex items-center justify-center relative">
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-gradient-to-br from-orange-200/30 to-blue-200/30 dark:from-orange-800/20 dark:to-blue-800/20 rounded-full blur-3xl animate-blob" />
                                    <div className="absolute -inset-12 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-800/10 dark:to-purple-800/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

                                    <div className="relative flex items-center gap-4">
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
                                            <Image
                                                className="relative rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover w-20 h-20 md:w-28 md:h-28"
                                                width={112}
                                                height={112}
                                                src="/avatar/star.jpg"
                                                alt="Star的头像"
                                            />
                                        </div>
                                        <div className="text-4xl md:text-5xl text-orange-400 dark:text-orange-500 font-display italic animate-pulse">&</div>
                                        <div className="relative group">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
                                            <Image
                                                className="relative rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover w-20 h-20 md:w-28 md:h-28"
                                                width={112}
                                                height={112}
                                                src="/avatar/lemon.jpg"
                                                alt="Lemon的头像"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <span className="text-base font-display font-bold text-gray-400 dark:text-gray-500 tracking-[0.3em]">STAR & LEMON</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {quoteEnabled && (
            <section className="w-full max-w-4xl mx-auto">
                <Card className="border-0 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10 shadow-lg hover:shadow-xl transition-shadow duration-500">
                    <CardContent className="p-8 md:p-12 text-center relative">
                        <div className="absolute top-6 left-8 text-gray-200 dark:text-gray-700 opacity-30"><RiDoubleQuotesL className="w-12 h-12" /></div>
                        <div className="absolute bottom-2 right-8 text-gray-200 dark:text-gray-700 opacity-30"><RiDoubleQuotesR className="w-12 h-12" /></div>

                        <div className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl font-serif leading-loose relative z-10 px-8 min-h-[4rem] flex items-center justify-center">
                            {quote.content}
                        </div>

                        <div className="text-gray-400 dark:text-gray-500 text-sm font-mono mt-8 relative z-10 flex items-center justify-center gap-3">
                            <span className="w-8 h-px bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600"></span>
                            {quote.source || "未知"}
                            <span className="w-8 h-px bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600"></span>
                        </div>
                    </CardContent>
                </Card>
            </section>
            )}

            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">精选文章</h2>
                    <p className="text-gray-500 dark:text-gray-400">探索我们的最新创作</p>
                </div>
                <FeaturedPosts />
                <div className="text-center mt-8">
                    <Link
                        href="/post"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        查看所有文章
                        <RiArrowRightSLine className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">网站数据</h2>
                    <p className="text-gray-500 dark:text-gray-400">记录我们的成长与进步</p>
                </div>

                {stats.posts === 0 && stats.users === 0 && stats.comments === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                            <RiBookOpenLine className="w-10 h-10 text-orange-300 dark:text-orange-700" />
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">小站刚刚起步</p>
                        <p className="text-gray-400 dark:text-gray-600 text-sm">精彩内容正在路上，敬请期待！</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: '文章数量', value: stats.posts, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', Icon: RiArticleLine },
                            { label: '注册用户', value: stats.users, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30', Icon: RiUserAddLine },
                            { label: '留言数量', value: stats.comments, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', Icon: RiChat3Line },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
                            >
                                <div className="relative flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.bgColor} text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-300`}>
                                        <item.Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="w-full">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-3">探索更多</h2>
                    <p className="text-gray-500 dark:text-gray-400">发现网站的更多精彩功能</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                        { href: '/post', title: '文章', desc: '阅读技术文章', bg: 'from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400', hoverColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400', Icon: RiArticleLine },
                        { href: '/guestbook', title: '留言板', desc: '与我们互动', bg: 'from-white to-yellow-50/30 dark:from-gray-900 dark:to-yellow-950/20', iconBg: 'bg-yellow-100 dark:bg-yellow-900/40', iconColor: 'text-yellow-600 dark:text-yellow-400', hoverColor: 'group-hover:text-yellow-600 dark:group-hover:text-yellow-400', Icon: RiChat3Line },
                        { href: '/about', title: '关于', desc: '了解我们', bg: 'from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20', iconBg: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600 dark:text-green-400', hoverColor: 'group-hover:text-green-600 dark:group-hover:text-green-400', Icon: RiTeamLine },
                        { href: '/tools', title: '工具', desc: '实用小工具', bg: 'from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20', iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400', hoverColor: 'group-hover:text-purple-600 dark:group-hover:text-purple-400', Icon: RiSettings3Line },
                    ].map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-0 bg-gradient-to-br ${item.bg}`}>
                                <CardHeader className="text-center">
                                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${item.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                                    </div>
                                    <CardTitle className={`text-lg font-bold text-gray-800 dark:text-gray-100 ${item.hoverColor} transition-colors`}>
                                        {item.title}
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">
                                        {item.desc}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
