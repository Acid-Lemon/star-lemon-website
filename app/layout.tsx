import type {Metadata} from "next";
import {DM_Mono, Inter, Noto_Serif_SC, Playfair_Display} from 'next/font/google'
import "./globals.css";
import { getSession } from "../lib/auth";
import { getSettings } from "../lib/settings";
import { getPublicUrl } from "../lib/oss";
import { Navigation, Footer } from "./components/navigation";
import { MainWrapper } from "./components/main-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeSwitcher } from "./components/theme-switcher";
import { UserProvider } from "./components/user-context";
import { AssistantProvider } from "./components/assistant-store";
import { AiAssistant } from "./components/ai-assistant";
import db from "../lib/db";
import { isInitialized } from "../lib/migrate";
import SetupForm from "./setup/setup-form";

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans',
})

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-display',
})

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
        title: {
            default: settings.site_title || "star和lemon的小站",
            template: `%s | ${settings.site_title || "star和lemon的小站"}`,
        },
        description: settings.site_description || "欢迎访问我们的小站~！",
        keywords: settings.site_keywords ? settings.site_keywords.split(',') : undefined,
        openGraph: {
            title: settings.site_title || "star和lemon的小站",
            description: settings.site_description || "欢迎访问我们的小站~！",
            type: 'website',
            locale: 'zh_CN',
            siteName: settings.site_title || "star和lemon的小站",
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const initialized = await isInitialized();

    if (!initialized) {
        return (
            <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
            <body className={`min-h-full flex flex-col bg-background text-foreground ${inter.variable} ${playfair.variable} ${notoSerifSC.variable} ${dmMono.variable}`}
                  suppressHydrationWarning>
                <ThemeProvider>
                    <SetupForm />
                </ThemeProvider>
                <Toaster position="top-center" />
            </body>
            </html>
        );
    }

    const session = await getSession();
    let user = null;

    if (session?.user?.id) {
        try {
            const result = await db.query(
                'SELECT id, nickname, email, role, avatar, bio, birthday, qq_identifier, sl_coin FROM users WHERE id = $1',
                [session.user.id]
            );
            if (result.rows.length > 0) {
                const row = result.rows[0];
                user = {
                    ...row,
                    avatar: await getPublicUrl(row.avatar),
                };
            }
        } catch (error) {
            console.error('Failed to fetch latest user info:', error);
        }
    }

    const settings = await getSettings();

    return (
        <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
        <head>
            {settings.baidu_site_verification && (
            <meta name="baidu-site-verification" content={settings.baidu_site_verification} />
          )}
          {settings.google_site_verification && (
            <meta name="google-site-verification" content={settings.google_site_verification} />
          )}
          {settings.bing_site_verification && (
            <meta name="msvalidate.01" content={settings.bing_site_verification} />
          )}
        </head>
        <body className={`min-h-full flex flex-col bg-background text-foreground ${inter.variable} ${playfair.variable} ${notoSerifSC.variable} ${dmMono.variable}`}
              suppressHydrationWarning>
            <ThemeProvider>
                <UserProvider user={user}>
                    <AssistantProvider>
                    <Navigation user={user} />
                    <MainWrapper>
                        {children}
                    </MainWrapper>
                    <Footer icpNumber={settings.icp_number} />
                    <ThemeSwitcher />
                    <AiAssistant />
                    </AssistantProvider>
                </UserProvider>
            </ThemeProvider>
            <Toaster position="top-center" />
        </body>
        </html>
    );
}