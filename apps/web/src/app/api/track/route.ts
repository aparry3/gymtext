import { NextRequest, NextResponse } from 'next/server';
import { PageVisitRepository } from '@/server/repositories/pageVisitRepository';

/**
 * POST /api/track
 *
 * Record a page visit for analytics.
 * Called by middleware for centralized tracking.
 *
 * Request body:
 * - page: string - Normalized page path (e.g., /me?workout=:id)
 * - source?: string - Marketing source attribution
 *
 * Headers are extracted for visitor metadata:
 * - x-forwarded-for / x-real-ip: Visitor IP
 * - user-agent: Browser/device info
 * - referer: Referring page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, source } = body;

    if (!page || typeof page !== 'string') {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Extract visitor metadata from headers
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      null;
    const userAgent = request.headers.get('user-agent') ?? null;
    const referrer = request.headers.get('referer') ?? null;

    // Fire-and-forget: record the visit but don't wait for it
    const repository = new PageVisitRepository();
    repository
      .record({
        page,
        ipAddress,
        userAgent,
        referrer,
        source: source ?? null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmContent: null,
        utmTerm: null,
      })
      .catch((err) => console.error('[Tracking] Error recording page visit:', err));

    // Return immediately
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Tracking] Error in track endpoint:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
