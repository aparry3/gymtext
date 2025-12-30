import { NextRequest, NextResponse } from 'next/server';
import { referralService } from '@/server/services/referral/referralService';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/referral
 *
 * Get referral stats for a user
 * Returns their referral code, link, and credit stats
 *
 * Response:
 * {
 *   referralCode: string,
 *   referralLink: string,
 *   completedReferrals: number,
 *   creditsEarned: number,
 *   creditsRemaining: number
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Check authorization
    const auth = checkAuthorization(request, userId);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    const stats = await referralService.getReferralStats(userId);
    if (!stats) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
