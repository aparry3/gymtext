import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin app proxy
 * - Protects admin routes with admin auth
 * - Injects X-Gymtext-Env header for environment switching
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get environment from cookie (default to production)
  const envMode = request.cookies.get('gt_env')?.value || 'production';

  // Admin auth check for all routes except login and auth API
  const isLoginPath = pathname === '/login' || pathname === '/login/';
  const isAuthApiPath = pathname.startsWith('/api/auth/');

  if (!isLoginPath && !isAuthApiPath) {
    const adminCookie = request.cookies.get('gt_admin')?.value;

    if (adminCookie !== 'ok') {
      // Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // For API routes, inject the environment header
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // Set the environment header for downstream context creation
    response.headers.set('x-gymtext-env', envMode);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Explicit routes that need proxy (auth + env header injection)
    '/',
    '/login',
    '/calendar/:path*',
    '/prompts/:path*',
    '/users/:path*',
    '/api/:path*',
  ],
};
