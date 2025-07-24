import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { onboardUser } from '@/server/agents/fitnessPlan/chain';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { programId, startDate, userId } = body;
        
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

      const programRepository = new FitnessPlanRepository();
      const program = await programRepository.findById(programId);
      


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
} catch (error) {
    console.error('Error in fitness program creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 