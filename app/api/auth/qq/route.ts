import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET(req: NextRequest) {
    const settings = await getSettings();
    const qqAppId = settings.qq_app_id || process.env.QQ_APP_ID;
    const qqAppKey = settings.qq_app_key || process.env.QQ_APP_KEY;
    const baseUrl = settings.site_url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    if (!qqAppId || !qqAppKey) {
        return NextResponse.json({ error: 'QQ登录未配置' }, { status: 500 });
    }

    const redirectUri = `${baseUrl}/api/auth/qq/callback`;
    const state = req.nextUrl.searchParams.get('state') || '/';
    
    const authUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${qqAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
    
    return NextResponse.redirect(authUrl);
}
