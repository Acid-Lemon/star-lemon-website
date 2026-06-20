import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { loginUser } from '@/lib/auth';
import { getCeruDiscovery, getCeruOAuthConfig, getCeruRedirectUri } from '@/lib/ceru-oauth';
import { storeBindData } from '@/lib/qq-bind-store';

interface CeruUserInfo {
    sub?: string;
    email?: string;
    name?: string;
    nickname?: string;
    username?: string;
    picture?: string;
}

function normalizeNickname(userInfo: CeruUserInfo): string {
    return (userInfo.nickname || userInfo.name || userInfo.username || '澜音用户').slice(0, 20);
}

function normalizeEmail(email: string | undefined): string {
    const value = email?.trim().toLowerCase() || '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : '';
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const code = body.code;
        const state = body.state || '/';
        const config = await getCeruOAuthConfig();

        if (!code || !config.appId || !config.appSecret) {
            return NextResponse.json({ error: '澜音登录未配置或缺少授权码', success: false }, { status: 400 });
        }

        const discovery = await getCeruDiscovery(config);
        const tokenRes = await fetch(discovery.token_endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: config.appId,
                client_secret: config.appSecret,
                code,
                redirect_uri: getCeruRedirectUri(config.baseUrl),
            }).toString(),
        });

        const tokenText = await tokenRes.text();
        let tokenData: Record<string, string> = {};
        try {
            tokenData = JSON.parse(tokenText);
        } catch {
            tokenData = Object.fromEntries(new URLSearchParams(tokenText));
        }

        const accessToken = tokenData.access_token;
        if (!tokenRes.ok || !accessToken) {
            console.error('Ceru token error:', tokenText);
            return NextResponse.json({ error: '澜音授权失败', success: false }, { status: 400 });
        }

        const userInfoRes = await fetch(discovery.userinfo_endpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        const userInfo = await userInfoRes.json() as CeruUserInfo;

        if (!userInfoRes.ok || !userInfo.sub) {
            console.error('Ceru user info error:', userInfo);
            return NextResponse.json({ error: '获取澜音用户信息失败', success: false }, { status: 400 });
        }

        const ceruIdentifier = `ceru_${userInfo.sub}`;
        const existingUser = await db.query('SELECT * FROM users WHERE ceru_identifier = $1', [ceruIdentifier]).then(r => r.rows[0]);

        if (existingUser) {
            await loginUser({ id: existingUser.id, nickname: existingUser.nickname, email: existingUser.email, role: existingUser.role, avatar: existingUser.avatar });
            revalidatePath('/');
            return NextResponse.json({ success: true, redirectUrl: state });
        }

        const nickname = normalizeNickname(userInfo);
        const avatar = userInfo.picture || '';
        const email = normalizeEmail(userInfo.email);
        const bindToken = storeBindData({
            provider: 'ceru',
            identifier: userInfo.sub,
            nickname,
            avatar,
            email,
        });

        return NextResponse.json({ success: true, needs_bind: true, bind_token: bindToken, oauth_provider: 'ceru', oauth_nickname: nickname, oauth_avatar: avatar, oauth_email: email });
    } catch (error) {
        console.error('Ceru login error:', error);
        return NextResponse.json({ error: '澜音登录失败', success: false }, { status: 500 });
    }
}
