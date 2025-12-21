import { NextRequest, NextResponse } from 'next/server';
import { normalizePath, extractSource } from '@/server/utils/pathNormalizer';

/**
 * Paths that should be tracked for analytics.
 * Dynamic segments will be normalized to placeholders.
 */
const TRACKED_PATH_PREFIXES = ['/', '/me', '/l'];

/**
 * Check if a path should be tracked.
 */
function shouldTrack(pathname: string): boolean {
  // Track root path exactly
  if (pathname === '/') return true;

  // Track paths starting with tracked prefixes
  return TRACKED_PATH_PREFIXES.some(
    (prefix) => prefix !== '/' && pathname.startsWith(prefix)
  );
}

/**
 * Fire tracking event (non-blocking).
 */
function trackPageVisit(request: NextRequest): void {
  const url = request.nextUrl;
  const fullPath = url.pathname + url.search;

  // Normalize the path for analytics
  const normalizedPage = normalizePath(fullPath);
  const source = extractSource(fullPath);

  // Build absolute URL for the tracking endpoint
  const trackUrl = new URL('/api/track', request.url);

  // Fire-and-forget: don't await, just catch errors
  fetch(trackUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward visitor metadata
      'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
      'x-real-ip': request.headers.get('x-real-ip') ?? '',
      'user-agent': request.headers.get('user-agent') ?? '',
      referer: request.headers.get('referer') ?? '',
    },
    body: JSON.stringify({ page: normalizedPage, source }),
  }).catch((err) => console.error('[Middleware] Tracking error:', err));
}

// Protect /admin UI and /api/admin endpoints with a simple cookie-based gate
// Protect /me UI with user session cookie
// Track page visits for analytics
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fire tracking for relevant pages (non-blocking)
  if (shouldTrack(pathname)) {
    trackPageVisit(request);
  }

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
  // Include all routes that need auth protection or tracking
  // Note: /admin/:path* catches /admin/users, /admin/users/123, etc.
  // Note: Short links (/l/:code) are route handlers, not pages
  matcher: [
    // Home page (tracking)
    '/',
    // Admin routes (auth + tracking)
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    // User routes (auth + tracking)
    '/me',
    '/me/:path*',
    // Short links (tracking)
    '/l/:path*',
  ],
};
