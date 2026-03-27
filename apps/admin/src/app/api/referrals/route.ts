import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/referrals
 *
 * Lists all referral records with referrer/referee user info.
 */
export async function GET() {
  try {
    const { db } = await getAdminContext();

    const referrals = await db
      .selectFrom('referrals')
      .innerJoin('users as referrer', 'referrer.id', 'referrals.referrerId')
      .innerJoin('users as referee', 'referee.id', 'referrals.refereeId')
      .select([
        'referrals.id',
        'referrals.creditApplied',
        'referrals.creditAmountCents',
        'referrals.createdAt',
        'referrals.creditedAt',
        'referrer.name as referrerName',
        'referrer.phoneNumber as referrerPhone',
        'referrer.referralCode as referrerCode',
        'referee.name as refereeName',
        'referee.phoneNumber as refereePhone',
      ])
      .orderBy('referrals.createdAt', 'desc')
      .execute();

    const stats = {
      total: referrals.length,
      credited: referrals.filter((r) => r.creditApplied).length,
      pending: referrals.filter((r) => !r.creditApplied).length,
      totalCreditsCents: referrals.reduce((sum, r) => sum + (r.creditAmountCents || 0), 0),
    };

    return NextResponse.json({ success: true, data: { referrals, stats } });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
