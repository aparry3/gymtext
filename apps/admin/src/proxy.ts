import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin app proxy
 * - Protects admin routes with admin auth
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth check for all routes except login and auth API
  const isLoginPath = pathname === '/login' || pathname === '/login/';
  const isAuthApiPath = pathname.startsWith('/api/auth/');

  if (!isLoginPath && !isAuthApiPath) {
    const adminCookie = request.cookies.get('gt_admin')?.value;

    if (!adminCookie) {
      // Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Explicit routes that need proxy (auth check)
    '/',
    '/login',
    '/blog/:path*',
    '/calendar/:path*',
    '/users/:path*',
    '/api/:path*',
  ],
};
