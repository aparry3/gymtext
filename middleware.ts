import { NextRequest, NextResponse } from 'next/server';
import { shortLinkService } from '@/server/services/links/shortLinkService';
import { encryptUserId } from '@/server/utils/sessionCrypto';

// Protect /admin UI and /api/admin endpoints with a simple cookie-based gate
// Protect /me UI with user session cookie
// Handle short link resolution with automatic authentication
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Short link resolution: /l/:code
  // Must be checked BEFORE other route protection
  if (pathname.startsWith('/l/')) {
    const code = pathname.slice(3); // Remove '/l/' prefix

    // Only process if code looks valid (5 alphanumeric chars)
    if (code.length === 5 && /^[A-Za-z0-9]{5}$/.test(code)) {
      try {
        const resolved = await shortLinkService.resolveShortLink(code);

        if (!resolved) {
          // Link not found - redirect to login with error
          const url = request.nextUrl.clone();
          url.pathname = '/me/login';
          url.searchParams.set('error', 'invalid-link');
          return NextResponse.redirect(url);
        }

        if (resolved.isExpired) {
          // Link expired - redirect to login with error
          const url = request.nextUrl.clone();
          url.pathname = '/me/login';
          url.searchParams.set('error', 'expired-link');
          return NextResponse.redirect(url);
        }

        const { link } = resolved;

        // Create session token for the user
        if (link.userId) {
          const sessionToken = encryptUserId(link.userId);

          // Redirect to target with session cookie
          const url = request.nextUrl.clone();
          url.pathname = link.targetPath;
          url.search = ''; // Clear search params

          const response = NextResponse.redirect(url);
          response.cookies.set('gt_user_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
          });

          return response;
        } else {
          // Link has no associated user - just redirect
          const url = request.nextUrl.clone();
          url.pathname = link.targetPath;
          url.search = '';
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error('[Middleware] Error resolving short link:', error);
        // On error, redirect to login
        const url = request.nextUrl.clone();
        url.pathname = '/me/login';
        url.searchParams.set('error', 'link-error');
        return NextResponse.redirect(url);
      }
    }
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
  // Explicitly include all admin, user, and short link routes
  // Note: /admin/:path* catches /admin/users, /admin/users/123, etc.
  // Note: /l/:path* catches all short link codes
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/me',
    '/me/:path*',
    '/l/:path*',
  ],
};
