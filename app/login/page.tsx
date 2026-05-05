import { getSettings } from '@/lib/settings';
import LoginClientPage from './login-client';

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
    const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const qqRedirectUri = `${siteUrl}/login`;
    const qqAuthUrl = qqAppId
        ? `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${qqAppId}&redirect_uri=${encodeURIComponent(qqRedirectUri)}&state=${encodeURIComponent(returnUrl)}`
        : null;

    return <LoginClientPage qqAuthUrl={qqAuthUrl} errorMsg={errorMsg} returnUrl={returnUrl} qqCode={code} qqState={state} />;
}
