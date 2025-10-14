import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { onboardingService } from '@/server/services';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

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

    // Orchestrate complete onboarding flow via OnboardingService
    await onboardingService.onboardUser(user);

    return NextResponse.json({ success: true, message: 'User onboarded successfully' })
  } catch (error) {
    console.error('Error in fitness program creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 