import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { WorkoutOrchestrator } from '@/server/agents/orchestrator';
import { getUserById } from '@/server/db/postgres/users';

const RegenerateWeekSchema = z.object({
  userId: z.string().uuid(),
  weekNumber: z.number().min(1),
  reason: z.string().optional(),
  constraints: z.object({
    equipment: z.array(z.string()).optional(),
    timeLimit: z.number().optional(),
    excludeExercises: z.array(z.string()).optional()
  }).optional()
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programId = params.id;
    const body = await req.json();
    const validated = RegenerateWeekSchema.parse(body);
    
    // Verify user exists
    const user = await getUserById(validated.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // TODO: Verify user owns the program
    // TODO: Fetch program details from database
    
    // For now, generate a standalone week using the orchestrator
    const orchestrator = new WorkoutOrchestrator();
    
    // Generate sessions for the week
    const weekSessions = [];
    const daysInWeek = 7;
    
    for (let dayOfWeek = 0; dayOfWeek < daysInWeek; dayOfWeek++) {
      const result = await orchestrator.orchestrate({
        userId: validated.userId,
        mode: 'session_generation',
        programId,
        weekNumber: validated.weekNumber,
        dayOfWeek
      });
      
      if (result.success) {
        weekSessions.push({
          dayOfWeek,
          session: result.data.session
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      programId,
      weekNumber: validated.weekNumber,
      sessions: weekSessions,
      message: 'Week regenerated successfully'
    });

  } catch (error) {
    console.error('Error regenerating week:', error);
    
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