import { NextRequest, NextResponse } from 'next/server';
import { getCeruDiscovery, getCeruOAuthConfig, getCeruRedirectUri } from '@/lib/ceru-oauth';
import { createOAuthState, safeReturnUrl } from '@/lib/security';

export async function GET(req: NextRequest) {
    try {
        const config = await getCeruOAuthConfig();

        if (!config.appId) {
            return NextResponse.json({ error: '澜音登录未配置 App ID' }, { status: 500 });
        }

        const returnUrl = safeReturnUrl(req.nextUrl.searchParams.get('state'));
        const { nonce, state } = createOAuthState('ceru', 'login', returnUrl);
        const discovery = await getCeruDiscovery(config);
        const authUrl = new URL(discovery.authorization_endpoint);

        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', config.appId);
        authUrl.searchParams.set('redirect_uri', getCeruRedirectUri(config.baseUrl));
        authUrl.searchParams.set('scope', 'openid profile email');
        authUrl.searchParams.set('state', state);

        const response = NextResponse.redirect(authUrl);
        response.cookies.set('oauth_nonce', nonce, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
        return response;
    } catch (error) {
        console.error('Ceru auth redirect error:', error);
        return NextResponse.json({ error: '澜音登录跳转失败' }, { status: 500 });
    }
}
