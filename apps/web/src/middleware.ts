import { NextRequest, NextResponse } from 'next/server';

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
 * Normalize path for analytics (replace dynamic segments with placeholders)
 */
function normalizePath(fullPath: string): string {
  // Remove query string for normalization
  const pathOnly = fullPath.split('?')[0];

  // Replace UUID-like segments with placeholder
  return pathOnly.replace(/\/[a-f0-9-]{36}/gi, '/:id');
}

/**
 * Fire tracking event (non-blocking).
 */
function trackPageVisit(request: NextRequest): void {
  const url = request.nextUrl;
  const fullPath = url.pathname + url.search;

  // Normalize the path for analytics
  const normalizedPage = normalizePath(fullPath);
  const source = url.searchParams.get('utm_source') || url.searchParams.get('ref') || null;

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

/**
 * Web app middleware
 * - Tracks page visits for analytics
 * - Protects /me routes with user session
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fire tracking for relevant pages (non-blocking)
  if (shouldTrack(pathname)) {
    trackPageVisit(request);
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
  matcher: [
    // Home page (tracking)
    '/',
    // User routes (auth + tracking)
    '/me',
    '/me/:path*',
    // Short links (tracking)
    '/l/:path*',
  ],
};
