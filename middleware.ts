import { NextRequest, NextResponse } from 'next/server';

// Protect /admin UI and /api/admin endpoints with a simple cookie-based gate
// Protect /me UI with user session cookie
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin path protection
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAdminLoginPath = pathname === '/admin/login' || pathname === '/admin/login/';

  if (isAdminPath) {
    // Allow access to the login page without cookie
    if (isAdminLoginPath) {
      return NextResponse.next();
    }

    const adminCookie = request.cookies.get('gt_admin')?.value;

    if (adminCookie === 'ok') {
      return NextResponse.next();
    }

    // Redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // User /me path protection
  const isClientPath = pathname.startsWith('/me');
  const isClientLoginPath = pathname === '/me/login' || pathname === '/me/login/';

  if (isClientPath) {
    // Allow access to the login page without cookie
    if (isClientLoginPath) {
      return NextResponse.next();
    }

    const userSession = request.cookies.get('gt_user_session')?.value;

    if (userSession) {
      return NextResponse.next();
    }

    // Redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/me/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Explicitly include all admin and user routes
  // Note: /admin/:path* catches /admin/users, /admin/users/123, etc.
  // Note: Short links (/l/:code) are now handled by app/l/[code]/page.tsx
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/me',
    '/me/:path*',
  ],
};
