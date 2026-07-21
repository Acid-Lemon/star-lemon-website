import { randomBytes, timingSafeEqual } from 'crypto';

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export function safeReturnUrl(value: unknown): string {
  if (typeof value !== 'string' || !/^\/(?!\/)[^\u0000-\u001f\\]*$/.test(value)) return '/';
  return value;
}

export function createOAuthState(provider: 'qq' | 'ceru', action: 'login' | 'bind', returnUrl: string) {
  const nonce = randomBytes(24).toString('base64url');
  const target = Buffer.from(safeReturnUrl(returnUrl)).toString('base64url');
  return { nonce, state: `${provider}:${action}:${nonce}:${target}` };
}

export function readOAuthState(state: unknown, cookieNonce: string | undefined, provider: 'qq' | 'ceru') {
  if (typeof state !== 'string' || !cookieNonce) return null;
  const [stateProvider, action, nonce, target] = state.split(':');
  if (stateProvider !== provider || !['login', 'bind'].includes(action) || !nonce || !target) return null;
  const actual = Buffer.from(nonce);
  const expected = Buffer.from(cookieNonce);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return {
    action: action as 'login' | 'bind',
    returnUrl: safeReturnUrl(Buffer.from(target, 'base64url').toString()),
  };
}

type RateEntry = { count: number; resetAt: number };
const rateEntries = new Map<string, RateEntry>();

export function consumeRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (rateEntries.size > 10_000) {
    for (const [entryKey, entry] of rateEntries) {
      if (entry.resetAt <= now) rateEntries.delete(entryKey);
    }
  }
  const current = rateEntries.get(key);
  if (!current || current.resetAt <= now) {
    rateEntries.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function requestClientKey(request: Request, scope: string, identity = ''): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}:${identity.trim().toLowerCase()}`;
}
