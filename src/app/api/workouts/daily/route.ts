import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateDailyWorkout } from '@/server/agents/workoutGeneratorAgent';
import { getUserById } from '@/server/db/postgres/users';

const DailyWorkoutSchema = z.object({
  userId: z.string().uuid(),
  regenerate: z.boolean().optional(), // Force regeneration even if already sent today
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DailyWorkoutSchema.parse(body);
    
    // Verify user exists
    const user = await getUserById(validated.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // TODO: Check if workout already sent today (unless regenerate flag is set)
    if (!validated.regenerate) {
      // Check database for today's workout
      // If exists, return cached version
    }
    
    // Generate and send daily workout
    const workout = await generateDailyWorkout(validated.userId);
    
    // TODO: Store workout in database for tracking
    
    return NextResponse.json({
      success: true,
      message: 'Daily workout delivered successfully',
      workout
    });
    
  } catch (error) {
    console.error('Daily workout generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}