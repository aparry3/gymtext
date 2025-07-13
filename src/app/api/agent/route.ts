import { NextRequest, NextResponse } from 'next/server';
import { onboardUser } from '@/server/agents/fitnessOutlineAgent';
import { generateDailyWorkout } from '@/server/agents/workoutGeneratorAgent';
import { getUserById } from '@/server/db/postgres/users';
import { WorkoutOrchestrator } from '@/server/agents/orchestrator';

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
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'onboard':
        // Onboarding now includes program generation
        await onboardUser({ userId: user.id });
        
        // Generate initial program for the user
        const orchestrator = new WorkoutOrchestrator();
        const programResult = await orchestrator.orchestrate({
          userId: user.id,
          mode: 'program_generation'
        });
        
        if (!programResult.success) {
          return NextResponse.json(
            { error: 'User onboarded but program generation failed' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'User onboarded and program generated successfully',
          programId: programResult.data?.program?.id
        });
        
      case 'daily-workout':
        const workout = await generateDailyWorkout(user.id);
        return NextResponse.json({ 
          success: true, 
          message: 'Daily workout delivered successfully',
          workout
        });
        
      case 'adapt-program': {
        const { programId, reason, feedback } = body;
        
        if (!programId || !reason) {
          return NextResponse.json(
            { error: 'Program ID and adaptation reason are required' },
            { status: 400 }
          );
        }
        
        const adaptOrchestrator = new WorkoutOrchestrator();
        const adaptResult = await adaptOrchestrator.orchestrate({
          userId: user.id,
          mode: 'adapt_program',
          programId,
          adaptationRequest: reason,
          userFeedback: feedback
        });
        
        if (!adaptResult.success) {
          return NextResponse.json(
            { error: adaptResult.error || 'Failed to adapt program' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Program adapted successfully',
          program: adaptResult.data?.program
        });
      }
        
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