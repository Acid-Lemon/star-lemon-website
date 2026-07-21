import {JWTPayload, jwtVerify, SignJWT} from 'jose';
import {cookies} from 'next/headers';
import {getJwtSecret} from './security';


export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_DURATION_S = 7 * 24 * 60 * 60;
export const RENEW_THRESHOLD_S = SESSION_DURATION_S / 2;

export interface SessionUser {
    id: number;
    nickname: string;
    email: string;
    role: string;
    avatar?: string | null;
}

export interface SessionPayload extends JWTPayload {
    user?: SessionUser;
    time?: number;
}

export async function encrypt(payload: { user: SessionUser; time: number }) {
    return await new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getJwtSecret());
}

export async function decrypt(input: string): Promise<SessionPayload> {
    const {payload} = await jwtVerify(input, getJwtSecret(), {
        algorithms: ['HS256'],
    });
    return payload as SessionPayload;
}

export async function loginUser(user: SessionUser) {
    const session = await encrypt({user, time: Date.now()});
    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        expires: new Date(Date.now() + SESSION_DURATION_MS),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.set('session', '', {expires: new Date(0)});
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch {
        return null;
    }
}
