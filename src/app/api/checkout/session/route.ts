import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/checkout/session
 *
 * DEPRECATED: This route is no longer used in the new signup flow.
 * The Stripe checkout success_url now points directly to /me.
 *
 * Kept for backward compatibility - just redirects to /me
 */
export async function GET(req: NextRequest) {
  console.log('[Checkout Session] Deprecated route called, redirecting to /me');

  // Create the base URL for redirect
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  // Redirect to /me (session cookie already set during signup)
  const redirectUrl = new URL('/me', baseUrl);
  return NextResponse.redirect(redirectUrl);
} 