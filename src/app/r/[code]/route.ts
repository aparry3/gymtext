import { NextRequest, NextResponse } from 'next/server';
import { referralService } from '@/server/services/referral/referralService';
import { isProductionEnvironment } from '@/shared/config/public';

/**
 * GET /r/:code
 *
 * Referral link handler
 * Validates the referral code, sets a cookie, and redirects to the landing page
 *
 * Flow:
 * 1. Validate the referral code exists
 * 2. Set gt_ref cookie with the code (7 days expiry)
 * 3. Redirect to landing page with ?ref= query param
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validate code format (6 alphanumeric characters)
  if (!code || code.length !== 6 || !/^[A-Za-z0-9]{6}$/.test(code)) {
    // Invalid format - redirect to landing page without ref
    return NextResponse.redirect(new URL('/', request.url));
  }

  const upperCode = code.toUpperCase();

  try {
    // Validate the referral code exists
    const validation = await referralService.validateReferralCode(upperCode);

    // Create redirect URL
    const redirectUrl = new URL('/', request.url);

    if (validation.valid) {
      // Add ref param to URL
      redirectUrl.searchParams.set('ref', upperCode);
    }

    const response = NextResponse.redirect(redirectUrl, { status: 307 });

    // Set referral cookie if valid (7 days expiry)
    if (validation.valid) {
      response.cookies.set('gt_ref', upperCode, {
        httpOnly: false, // Needs to be readable by client JS
        secure: isProductionEnvironment(),
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      console.log(`[Referral] Set referral cookie for code ${upperCode}`);
    }

    return response;
  } catch (error) {
    console.error('[Referral] Error validating referral code:', error);
    // On error, redirect to landing page without ref
    return NextResponse.redirect(new URL('/', request.url));
  }
}
