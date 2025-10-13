import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { dailyMessageService, fitnessPlanService, messageService } from '@/server/services';
import { welcomeMessageAgent } from '@/server/agents';

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

    // Send welcome message immediately after signup, before fitness plan generation
    const welcomeAgentResponse = await welcomeMessageAgent.invoke({ user });
    const welcomeMessage = String(welcomeAgentResponse.value);
    await messageService.sendMessage(user, welcomeMessage);

    // Create fitness plan for the user
    await fitnessPlanService.createFitnessPlan(user);
    // TODO: Update for refactor - generate workout on-demand instead

    void dailyMessageService.sendDailyMessage(user);
    
    return NextResponse.json({ success: true, message: 'User onboarded successfully' })
  } catch (error) {
    console.error('Error in fitness program creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 