import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { isProductionEnvironment } from '@/shared/config/public';

/**
 * GET /r/:code
 *
 * Referral / promo link handler.
 * Checks user referral codes first, then promo codes.
 * Sets the appropriate cookie and redirects to /start.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validate code format (2-30 alphanumeric characters)
  if (!code || code.length < 2 || code.length > 30 || !/^[A-Za-z0-9]+$/.test(code)) {
    return NextResponse.redirect(new URL('/start', request.url));
  }

  const upperCode = code.toUpperCase();
  const redirectUrl = new URL('/start', request.url);

  try {
    const services = getServices();

    // 1. Try user referral code (6-char codes tied to users)
    if (upperCode.length === 6) {
      const validation = await services.referral.validateReferralCode(upperCode);
      if (validation.valid) {
        redirectUrl.searchParams.set('ref', upperCode);
        const response = NextResponse.redirect(redirectUrl, { status: 307 });
        response.cookies.set('gt_ref', upperCode, {
          httpOnly: false,
          secure: isProductionEnvironment(),
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
        console.log(`[Referral] Set referral cookie for code ${upperCode}`);
        return response;
      }
    }

    // 2. Try promo code
    const promoValidation = await services.promoCode.validatePromoCode(upperCode);
    if (promoValidation.valid) {
      redirectUrl.searchParams.set('promo', upperCode);
      const response = NextResponse.redirect(redirectUrl, { status: 307 });
      response.cookies.set('gt_promo', upperCode, {
        httpOnly: false,
        secure: isProductionEnvironment(),
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      console.log(`[Promo] Set promo cookie for code ${upperCode}`);
      return response;
    }

    // Neither valid — redirect without code
    return NextResponse.redirect(redirectUrl, { status: 307 });
  } catch (error) {
    console.error('[Referral/Promo] Error validating code:', error);
    return NextResponse.redirect(new URL('/start', request.url));
  }
}
