import type {Metadata} from "next";
import {DM_Mono, Noto_Serif_SC} from 'next/font/google'
import "./globals.css";
import { getSession, logoutUser } from "../lib/auth";
import { getSettings } from "../lib/settings";
import { Navigation, Footer } from "./components/navigation";
import { MainWrapper } from "./components/main-wrapper";
import { Toaster } from "@/components/ui/sonner";
import db from "../lib/db";

const notoSerifSC = Noto_Serif_SC({
    weight: ['300', '400'],
    subsets: ['latin', 'chinese-simplified'] as never,
    display: 'swap',
    variable: '--font-serif',
})

const dmMono = DM_Mono({
    weight: ['400'],
    subsets: ['latin', 'chinese-simplified'] as never,
    display: 'swap',
    variable: '--font-mono',
})

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: settings.site_title || "star和lemon的小站",
        description: settings.site_description || "欢迎访问我们的小站~！",
        keywords: settings.site_keywords ? settings.site_keywords.split(',') : undefined,
    };
}

export default async function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const session = await getSession();
    let user = session?.user;
    
    // 如果用户已登录，从数据库获取最新信息（包含 avatar）
    if (user?.id) {
        try {
            const result = await db.query(
                'SELECT id, nickname, email, role, avatar, bio, birthday FROM users WHERE id = $1',
                [user.id]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        } catch (error) {
            console.error('Failed to fetch latest user info:', error);
        }
    }
    
    const settings = await getSettings();

    async function handleLogout() {
        'use server';
        await logoutUser();
    }

    return (
        <html lang="zh-CN" className="h-full antialiased " suppressHydrationWarning>
        <body className={`min-h-full flex flex-col bg-[#fdfcfb] text-gray-800 selection:bg-orange-100 ${notoSerifSC.variable} ${dmMono.variable}`}
              suppressHydrationWarning>
            <Navigation user={user} handleLogout={handleLogout} />
            <MainWrapper>
                {children}
            </MainWrapper>
            <Footer icpNumber={settings.icp_number} />
            <Toaster position="top-center" />
        </body>
        </html>
    );
}
