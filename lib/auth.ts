import {JWTPayload, jwtVerify, SignJWT} from 'jose';
import {cookies} from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'star-lemon-secret-key-182566';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: { user: any; time: number }) {
    return await new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<JWTPayload> {
    const {payload} = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function loginUser(user: any) {
    const session = await encrypt({user, time: Date.now()});
    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.set('session', '', {expires: new Date(0)});
}

export async function getSession(): Promise<any> {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (error) {
        return null;
    }
}
