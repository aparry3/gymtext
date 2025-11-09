import { NextRequest, NextResponse } from 'next/server';
import { shortLinkService } from '@/server/services/links/shortLinkService';
import { encryptUserId } from '@/server/utils/sessionCrypto';

/**
 * GET /l/:code
 *
 * Short link redirect handler
 * Resolves the short link, sets authentication cookie if needed, and redirects to target
 *
 * This is a Route Handler (not a page) because we need to set cookies,
 * which is only allowed in Route Handlers and Server Actions, not in Server Components.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validate code format (5 alphanumeric characters)
  if (!code || code.length !== 5 || !/^[A-Za-z0-9]{5}$/.test(code)) {
    return NextResponse.redirect(new URL('/me/login?error=invalid-link', request.url));
  }

  try {
    // Resolve the short link
    const resolved = await shortLinkService.resolveShortLink(code);

    // Link not found
    if (!resolved) {
      return NextResponse.redirect(new URL('/me/login?error=invalid-link', request.url));
    }

    // Link expired
    if (resolved.isExpired) {
      return NextResponse.redirect(new URL('/me/login?error=expired-link', request.url));
    }

    const { link } = resolved;

    // Create redirect URL
    const targetUrl = new URL(link.targetPath, request.url);
    const response = NextResponse.redirect(targetUrl, { status: 307 });

    // Set auth cookie if link has associated user
    // This allows users who receive links via SMS to be automatically authenticated
    if (link.userId) {
      const sessionToken = encryptUserId(link.userId);

      response.cookies.set('gt_user_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      console.log(`[ShortLink] Set session cookie for user ${link.userId} via link ${code}`);
    }

    return response;
  } catch (error) {
    console.error('[ShortLink] Error resolving short link:', error);
    return NextResponse.redirect(new URL('/me/login?error=link-error', request.url));
  }
}
