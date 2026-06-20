import { NextRequest, NextResponse } from 'next/server';
import { getCeruDiscovery, getCeruOAuthConfig, getCeruRedirectUri } from '@/lib/ceru-oauth';

export async function GET(req: NextRequest) {
    try {
        const config = await getCeruOAuthConfig();

        if (!config.appId) {
            return NextResponse.json({ error: '澜音登录未配置 App ID' }, { status: 500 });
        }

        const returnUrl = req.nextUrl.searchParams.get('state') || '/';
        const discovery = await getCeruDiscovery(config);
        const authUrl = new URL(discovery.authorization_endpoint);

        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', config.appId);
        authUrl.searchParams.set('redirect_uri', getCeruRedirectUri(config.baseUrl));
        authUrl.searchParams.set('scope', 'openid profile email');
        authUrl.searchParams.set('state', `ceru:${returnUrl}`);

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Ceru auth redirect error:', error);
        return NextResponse.json({ error: '澜音登录跳转失败' }, { status: 500 });
    }
}
