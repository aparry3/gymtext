import { NextRequest, NextResponse } from 'next/server';
import { onboardingDataService } from '@/server/services/user/onboardingDataService';
import { SubscriptionRepository } from '@/server/repositories/subscriptionRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
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

    const subscriptionRepo = new SubscriptionRepository();
    const fitnessPlanRepo = new FitnessPlanRepository();

    // Get onboarding record
    const onboarding = await onboardingDataService.findByUserId(userId);
    if (!onboarding) {
      return NextResponse.json({
        onboardingStatus: 'pending',
        hasProgram: false,
        hasActiveSubscription: false,
      });
    }

    // Check for fitness plan
    const fitnessPlan = await fitnessPlanRepo.getCurrentPlan(userId);

    // Check for active subscription
    const hasActiveSubscription = await subscriptionRepo.hasActiveSubscription(userId);

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
