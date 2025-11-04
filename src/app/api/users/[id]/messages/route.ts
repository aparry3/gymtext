import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { dailyMessageService } from '@/server/services';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
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