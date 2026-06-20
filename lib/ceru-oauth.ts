import { getSettings } from '@/lib/settings';

export interface CeruOAuthConfig {
    issuer: string;
    appId: string;
    appSecret: string;
    baseUrl: string;
}

export interface CeruDiscovery {
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
}

const DEFAULT_CERU_ISSUER = 'https://auth.shiqianjiang.cn/oidc';
const DEFAULT_CERU_APP_ID = 'wg0mdkakeio0g8obf6iy5';
const DEFAULT_CERU_APP_SECRET = 'YJxlAYpgAyZkZMjpWfRelI5pT6SUA0R6';

function trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
}

export async function getCeruOAuthConfig(): Promise<CeruOAuthConfig> {
    const settings = await getSettings();

    return {
        issuer: trimTrailingSlash(settings.ceru_endpoint || process.env.CERU_ISSUER || process.env.CERU_ENDPOINT || DEFAULT_CERU_ISSUER),
        appId: settings.ceru_app_id || process.env.CERU_APP_ID || DEFAULT_CERU_APP_ID,
        appSecret: settings.ceru_app_secret || process.env.CERU_APP_SECRET || DEFAULT_CERU_APP_SECRET,
        baseUrl: trimTrailingSlash(settings.site_url || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
    };
}

export async function getCeruDiscovery(config: Pick<CeruOAuthConfig, 'issuer'>): Promise<CeruDiscovery> {
    const discoveryUrl = `${config.issuer}/.well-known/openid-configuration`;
    const res = await fetch(discoveryUrl, {
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
        throw new Error(`Ceru discovery failed: ${discoveryUrl} returned ${res.status}`);
    }

    const data = await res.json();
    if (!data.authorization_endpoint || !data.token_endpoint || !data.userinfo_endpoint) {
        throw new Error(`Ceru discovery response is missing OIDC endpoints: ${discoveryUrl}`);
    }

    return {
        authorization_endpoint: data.authorization_endpoint,
        token_endpoint: data.token_endpoint,
        userinfo_endpoint: data.userinfo_endpoint,
    };
}

export function getCeruRedirectUri(baseUrl: string): string {
    return `${baseUrl}/login`;
}
