import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/userService';
import { type CreateFitnessProfileData } from '@/server/models/userModel';

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const input: CreateFitnessProfileData = {
      fitnessGoals: body.fitnessGoals,
      skillLevel: body.skillLevel,
      exerciseFrequency: body.exerciseFrequency,
      gender: body.gender,
      age: body.age,
    } as CreateFitnessProfileData;

    const userService = UserService.getInstance();
    const profile = await userService.updateFitnessProfile(userId, input);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    console.error('[admin users profile] POST failed', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
