import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/onboarding-status
 *
 * Get onboarding status for a user
 * Used by /me dashboard to show loading state or full dashboard
 *
 * Response:
 * {
 *   onboardingStatus: 'pending' | 'in_progress' | 'completed' | 'failed',
 *   currentStep?: number,
 *   hasProgram: boolean,
 *   hasActiveSubscription: boolean,
 *   completedAt?: string,
 *   errorMessage?: string
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

    const services = getServices();

    // Get onboarding record
    const onboarding = await services.onboardingData.findByClientId(userId);
    if (!onboarding) {
      return NextResponse.json({
        onboardingStatus: 'pending',
        hasProgram: false,
        hasActiveSubscription: false,
      });
    }

    // Check for fitness plan
    const fitnessPlan = await services.fitnessPlan.getCurrentPlan(userId);

    // Check for active subscription
    const hasActiveSubscription = await services.subscription.hasActiveSubscription(userId);

    return NextResponse.json({
      onboardingStatus: onboarding.status,
      currentStep: onboarding.currentStep,
      hasProgram: !!fitnessPlan,
      hasActiveSubscription,
      completedAt: onboarding.completedAt?.toISOString(),
      errorMessage: onboarding.errorMessage,
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
