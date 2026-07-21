import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { loginUser, getSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { storeBindData } from '@/lib/qq-bind-store';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { readOAuthState } from '@/lib/security';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const code = body.code;
        const cookieStore = await cookies();
        const oauthState = readOAuthState(body.state, cookieStore.get('oauth_nonce')?.value, 'qq');
        if (!oauthState) {
            return NextResponse.json({ error: 'OAuth state 无效或已过期', success: false }, { status: 400 });
        }
        cookieStore.delete('oauth_nonce');
        const settings = await getSettings();
        const qqAppId = settings.qq_app_id || process.env.QQ_APP_ID;
        const qqAppKey = settings.qq_app_key || process.env.QQ_APP_KEY;
        const baseUrl = settings.site_url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

        if (!code || !qqAppId || !qqAppKey) {
            return NextResponse.json({ error: 'QQ登录未配置或缺少授权码', success: false }, { status: 400 });
        }

        const tokenRes = await fetch('https://graph.qq.com/oauth2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: qqAppId,
                client_secret: qqAppKey,
                code: code,
                redirect_uri: baseUrl + '/login',
            }).toString(),
        });
        const tokenText = await tokenRes.text();

        const params = new URLSearchParams(tokenText);
        const accessToken = params.get('access_token');

        if (!accessToken) {
            console.error('QQ token error:', tokenText);
            return NextResponse.json({ error: 'QQ授权失败', success: false }, { status: 400 });
        }

        const openIdUrl = `https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`;
        const openIdRes = await fetch(openIdUrl);
        const openIdText = await openIdRes.text();
        const jsonMatch = openIdText.match(/\{.*\}/);
        const openData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        const openId = openData.openid;

        if (!openId) {
            console.error('QQ openid error:', openIdText);
            return NextResponse.json({ error: '获取OpenID失败', success: false }, { status: 400 });
        }

        const userInfoUrl = `https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${qqAppId}&openid=${openId}`;
        const userInfoRes = await fetch(userInfoUrl);
        const userInfo = await userInfoRes.json();

        if (userInfo.ret !== 0) {
            console.error('QQ user info error:', userInfo);
            return NextResponse.json({ error: '获取QQ用户信息失败', success: false }, { status: 400 });
        }

        const qqIdentifier = `qq_${openId}`;
        const action = oauthState.action;

        if (action === 'bind') {
            const session = await getSession();
            if (!session?.user) {
                return NextResponse.json({ error: '请先登录', success: false }, { status: 401 });
            }

            const checkQq = await db.query('SELECT id FROM users WHERE qq_identifier = $1', [qqIdentifier]);
            if (checkQq.rows.length > 0) {
                const bound = checkQq.rows[0];
                if (bound.id === session.user.id) {
                    return NextResponse.json({ error: '该QQ已绑定当前账号', success: false }, { status: 400 });
                }
                return NextResponse.json({ error: '该QQ已绑定其他账号', success: false }, { status: 400 });
            }

            await db.query('UPDATE users SET qq_identifier = $1, updated_at = NOW() WHERE id = $2', [qqIdentifier, session.user.id]);
            return NextResponse.json({ success: true, redirectUrl: oauthState.returnUrl });
        }

        const existingUser = await db.query('SELECT * FROM users WHERE qq_identifier = $1', [qqIdentifier]).then(r => r.rows[0]);

        if (existingUser) {
            await loginUser({ id: existingUser.id, nickname: existingUser.nickname, email: existingUser.email, role: existingUser.role, avatar: existingUser.avatar });
            revalidatePath('/');
            return NextResponse.json({ success: true, redirectUrl: oauthState.returnUrl });
        }

        const bindToken = storeBindData({
            provider: 'qq',
            identifier: openId,
            nickname: userInfo.nickname?.slice(0, 20) || 'QQ用户',
            avatar: userInfo.figureurl_qq_2 || userInfo.figureurl || '',
        });

        return NextResponse.json({ success: true, needs_bind: true, bind_token: bindToken, qq_nickname: userInfo.nickname?.slice(0, 20) || 'QQ用户', qq_avatar: userInfo.figureurl_qq_2 || userInfo.figureurl || '', redirectUrl: oauthState.returnUrl });
    } catch (error) {
        console.error('QQ login error:', error);
        return NextResponse.json({ error: 'QQ登录失败', success: false }, { status: 500 });
    }
}
