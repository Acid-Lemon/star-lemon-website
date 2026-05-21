import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, encrypt, SESSION_DURATION_MS, RENEW_THRESHOLD_S } from './lib/auth';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  let sessionPayload: any = null;
  let newSessionToken: string | null = null;
  let clearSession = false;

  if (sessionCookie) {
    try {
      sessionPayload = await decrypt(sessionCookie);
      const now = Math.floor(Date.now() / 1000);
      const remaining = (sessionPayload.exp as number) - now;
      if (remaining > 0 && remaining < RENEW_THRESHOLD_S) {
        newSessionToken = await encrypt({ user: sessionPayload.user, time: sessionPayload.time });
      }
    } catch {
      clearSession = true;
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!sessionPayload || !sessionPayload.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      const redirect = NextResponse.redirect(loginUrl);
      if (clearSession) redirect.cookies.set('session', '', { expires: new Date(0) });
      return redirect;
    }

    if (sessionPayload.user?.role !== 'admin') {
      return new NextResponse("没有权限访问后台，该页面仅限管理员访问。", { status: 403 });
    }
  }

  const response = NextResponse.next();
  if (newSessionToken) {
    response.cookies.set('session', newSessionToken, {
      expires: new Date(Date.now() + SESSION_DURATION_MS),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  } else if (clearSession) {
    response.cookies.set('session', '', { expires: new Date(0) });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};