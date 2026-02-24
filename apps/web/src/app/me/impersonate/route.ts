import { NextRequest, NextResponse } from 'next/server';
import { encryptUserId, validateImpersonationToken } from '@/server/utils/sessionCrypto';
import { isProductionEnvironment } from '@/shared/config/public';

/**
 * GET /me/impersonate?token=xxx
 *
 * Validates an impersonation token from the admin app,
 * sets session cookies, and redirects to /me.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Missing token' },
      { status: 400 }
    );
  }

  const payload = validateImpersonationToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  const sessionToken = encryptUserId(payload.userId);
  const redirectUrl = new URL('/me', request.url);
  const response = NextResponse.redirect(redirectUrl);

  // Set user session cookie (matches verify-code pattern)
  response.cookies.set('gt_user_session', sessionToken, {
    httpOnly: true,
    secure: isProductionEnvironment(),
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  // Set impersonation cookie with admin back URL
  if (payload.adminBackUrl) {
    response.cookies.set('gt_impersonation', payload.adminBackUrl, {
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
  }

  return response;
}
