import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import { getCeruOAuthConfig } from '@/lib/ceru-oauth';
import LoginClientPage from './login-client';
import { safeReturnUrl } from '@/lib/security';

export const metadata: Metadata = {
    title: '登录',
    description: '登录你的账号',
};

export default async function LoginPage({searchParams}: {
    searchParams: Promise<{ error?: string, returnUrl?: string, code?: string, state?: string }>
}) {
    const params = await searchParams;
    const errorMsg = params.error;
    const returnUrl = safeReturnUrl(params.returnUrl);
    const code = params.code;
    const state = params.state;

    const settings = await getSettings();
    const qqAppId = settings.qq_app_id || process.env.QQ_APP_ID || '';
    const ceruConfig = await getCeruOAuthConfig();
    const qqAuthUrl = qqAppId
        ? `/api/auth/qq?state=${encodeURIComponent(returnUrl)}`
        : null;
    const ceruAuthUrl = ceruConfig.appId
        ? `/api/auth/ceru?state=${encodeURIComponent(returnUrl)}`
        : null;

    return <LoginClientPage qqAuthUrl={qqAuthUrl} ceruAuthUrl={ceruAuthUrl} errorMsg={errorMsg} returnUrl={returnUrl} authCode={code} authState={state} />;
}
