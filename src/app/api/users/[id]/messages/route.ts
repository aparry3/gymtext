import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { dailyMessageService } from '@/server/services';
import { checkAuthorization } from '@/server/utils/authMiddleware';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check authorization - admin can send messages for any user
    const auth = checkAuthorization(request, userId);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch the user from the database
    const userRepository = new UserRepository();
    const user = await userRepository.findWithProfile(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await dailyMessageService.sendDailyMessage(user);

    return NextResponse.json({ success: true, message: 'dailyMessage sent successfully' })
  } catch (error) {
    console.error('Error in fitness program creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 