import { NextRequest, NextResponse } from 'next/server';
import { onboardUser, processFitnessProgramMesocycles } from '@/server/agents/fitnessOutlineAgent';
import { generateWeeklyPlan } from '@/server/agents/workoutGeneratorAgent';
import { UserRepository } from '@/server/data/repositories/userRepository';
// import { processUpdate } from '@/server/agents/workoutUpdateAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the user from the database
    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'onboard':
        await onboardUser({ userId: user.id });
        return NextResponse.json({ success: true, message: 'User onboarded successfully' });
        
      case 'weekly':
        await generateWeeklyPlan(user.id);
        return NextResponse.json({ success: true, message: 'Weekly plan generated successfully' });
        
      case 'breakdown-mesocycles': {
        const { program, startDate } = body;
        
        if (!program) {
          return NextResponse.json(
            { error: 'Fitness program is required' },
            { status: 400 }
          );
        }
        
        const result = await processFitnessProgramMesocycles({
          userId: user.id,
          program,
          startDate: startDate ? new Date(startDate) : new Date()
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Mesocycles populated successfully',
          program: result
        });
      }
        
      //   case 'update': {
      //     const { userId, message } = body;
      //     const result = await processUpdate(userId, message);
      //     return NextResponse.json(result);
      //   }
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in agent API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 