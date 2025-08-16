import { NextResponse } from 'next/server';
import { UserModel, type CreateFitnessProfileData } from '@/server/models/userModel';

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

    const userModel = new UserModel();
    const profile = await userModel.createFitnessProfile(userId, input);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    console.error('[admin users profile] POST failed', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
