import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { FitnessPlanService } from '@/server/services/fitnessPlanService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MessageService } from '@/server/services/messageService';
import { MesocycleService } from '@/server/services/mesocycleService';

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

    const fitnessPlanService = new FitnessPlanService(new FitnessPlanRepository());
    const fitnessPlan = await fitnessPlanService.createFitnessPlan(user);

    const messageService = new MessageService();
    const welcomeMessage = await messageService.buildWelcomeMessage(user, fitnessPlan);
    await messageService.sendMessage(user, welcomeMessage);

    const mesocycleService = new MesocycleService();
    const nextMesocycle = await mesocycleService.getNextMesocycle(user, fitnessPlan);
    const workout = nextMesocycle.microcycles[0].workouts[0];
    await messageService.sendMessage(user, welcomeMessage);

    return NextResponse.json({ success: true, message: 'User onboarded successfully' })
  } catch (error) {
    console.error('Error in fitness program creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 