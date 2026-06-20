import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session?.user) {
        return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const settings = await getSettings();
    const qqAppId = settings.qq_app_id || process.env.QQ_APP_ID;
    if (!qqAppId) {
        return NextResponse.json({ error: 'QQ登录未配置' }, { status: 500 });
    }

    const baseUrl = settings.site_url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const returnUrl = req.nextUrl.searchParams.get('returnUrl') || '/';
    const redirectUri = `${baseUrl}/login`;
    const state = encodeURIComponent(`qq-bind:${returnUrl}`);

    const authUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${qqAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.redirect(authUrl);
}
