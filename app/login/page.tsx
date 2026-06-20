import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import { getCeruOAuthConfig } from '@/lib/ceru-oauth';
import LoginClientPage from './login-client';

export const metadata: Metadata = {
    title: '登录',
    description: '登录你的账号',
};

export default async function LoginPage({searchParams}: {
    searchParams: Promise<{ error?: string, returnUrl?: string, code?: string, state?: string }>
}) {
    const params = await searchParams;
    const errorMsg = params.error;
    const returnUrl = params.returnUrl || '/';
    const code = params.code;
    const state = params.state;

    const settings = await getSettings();
    const qqAppId = settings.qq_app_id || process.env.QQ_APP_ID || '';
    const ceruConfig = await getCeruOAuthConfig();
    const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const qqRedirectUri = `${siteUrl}/login`;
    const qqAuthUrl = qqAppId
        ? `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${qqAppId}&redirect_uri=${encodeURIComponent(qqRedirectUri)}&state=${encodeURIComponent(`qq:${returnUrl}`)}`
        : null;
    const ceruAuthUrl = ceruConfig.appId
        ? `/api/auth/ceru?state=${encodeURIComponent(returnUrl)}`
        : null;

    return <LoginClientPage qqAuthUrl={qqAuthUrl} ceruAuthUrl={ceruAuthUrl} errorMsg={errorMsg} returnUrl={returnUrl} authCode={code} authState={state} />;
}
