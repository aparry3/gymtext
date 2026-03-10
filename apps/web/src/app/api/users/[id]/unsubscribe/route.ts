import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const auth = checkAuthorization(request, userId);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    const services = getServices();
    const user = await services.user.getUser(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const result = await services.subscription.processUnsubscribe(userId);

    if (!result.alreadyInactive) {
      await services.messagingOrchestrator.sendImmediate(user, result.responseMessage);
    }

    return NextResponse.json({
      success: result.success,
      periodEndDate: result.periodEndDate
        ? result.periodEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        : undefined,
    });
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
