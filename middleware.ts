import { NextRequest, NextResponse } from 'next/server';

// Protect /admin UI and /api/admin endpoints with a simple cookie-based gate
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLoginPath = pathname === '/admin/login' || pathname === '/admin/login/';

  if (!isAdminPath) {
    return NextResponse.next();
  }

  // Allow access to the login page without cookie
  if (isLoginPath) {
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

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
