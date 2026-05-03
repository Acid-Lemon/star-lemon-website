import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      // Not logged in, redirect to login page with returnUrl
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await decrypt(session);
      if (!payload || !payload.user) {
        throw new Error('Invalid session');
      }
      
      // Check if user role is 'admin'
      const payloadAny = payload as any;
      const role = payloadAny.user?.role;
      if (role !== 'admin') {
         return new NextResponse("没有权限访问后台，该页面仅限管理员访问。", { status: 403 });
      }

    } catch (e) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};