import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { loginUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state') || '/';
    const settings = await getSettings();
    const qqAppId = settings.qq_app_id || process.env.QQ_APP_ID;
    const qqAppKey = settings.qq_app_key || process.env.QQ_APP_KEY;
    const baseUrl = settings.site_url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    if (!code || !qqAppId || !qqAppKey) {
        return NextResponse.redirect(`${baseUrl}/login?error=QQ登录失败`);
    }

    try {
        const tokenUrl = `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${qqAppId}&client_secret=${qqAppKey}&code=${code}&redirect_uri=${encodeURIComponent(baseUrl + '/api/auth/qq/callback')}`;
        
        const tokenRes = await fetch(tokenUrl, { method: 'POST' });
        const tokenText = await tokenRes.text();
        
        const params = new URLSearchParams(tokenText);
        const accessToken = params.get('access_token');
        
        if (!accessToken) {
            console.error('QQ token error:', tokenText);
            return NextResponse.redirect(`${baseUrl}/login?error=QQ授权失败`);
        }

        const userInfoUrl = `https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${qqAppId}`;
        const userInfoRes = await fetch(userInfoUrl);
        const userInfo = await userInfoRes.json();
        
        if (userInfo.ret !== 0) {
            console.error('QQ user info error:', userInfo);
            return NextResponse.redirect(`${baseUrl}/login?error=获取QQ用户信息失败`);
        }

        const openIdUrl = `https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`;
        const openIdRes = await fetch(openIdUrl);
        const openIdText = await openIdRes.text();
        const openIdParams = new URLSearchParams(openIdText.split('(')[1]?.split(')')[0] || '');
        const openId = openIdParams.get('openid');

        if (!openId) {
            console.error('QQ openid error:', openIdText);
            return NextResponse.redirect(`${baseUrl}/login?error=获取OpenID失败`);
        }

        const qqIdentifier = `qq_${openId}`;
        let user = await db.query('SELECT * FROM users WHERE qq_identifier = $1', [qqIdentifier]).then(r => r.rows[0]);

        if (!user) {
            const nickname = `QQ_${userInfo.nickname?.slice(0, 20) || '用户'}`;
            const avatar = userInfo.figureurl_qq_2 || userInfo.figureurl || '';
            
            user = await db.query(
                `INSERT INTO users (email, nickname, password, role, qq_identifier, avatar) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [`${qqIdentifier}@qq.local`, nickname, '', 'user', qqIdentifier, avatar]
            ).then(r => r.rows[0]);
        }

        await loginUser({ id: user.id, nickname: user.nickname, email: user.email, role: user.role, avatar: user.avatar });
        revalidatePath('/');
        
        return NextResponse.redirect(`${baseUrl}${state}`);
    } catch (error) {
        console.error('QQ login error:', error);
        return NextResponse.redirect(`${baseUrl}/login?error=QQ登录失败`);
    }
}
