import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { WorkoutOrchestrator } from '@/server/agents/orchestrator';
import { getUserById } from '@/server/db/postgres/users';

const GenerateProgramSchema = z.object({
  userId: z.string().uuid(),
  regenerate: z.boolean().optional(),
  preferences: z.object({
    programType: z.enum(['strength', 'hypertrophy', 'endurance', 'hybrid']).optional(),
    duration: z.number().min(4).max(16).optional(),
    startDate: z.string().optional()
  }).optional()
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = GenerateProgramSchema.parse(body);
    
    // Verify user exists
    const user = await getUserById(validated.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Initialize orchestrator and generate program
    const orchestrator = new WorkoutOrchestrator();
    const result = await orchestrator.orchestrate({
      userId: validated.userId,
      mode: 'program_generation'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate program' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      program: result.data.program,
      message: 'Program generated successfully'
    });

  } catch (error) {
    console.error('Program generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}