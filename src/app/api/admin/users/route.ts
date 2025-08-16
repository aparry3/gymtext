import { NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { UserModel, type CreateUserData, type CreateFitnessProfileData } from '@/server/models/userModel';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const sort = url.searchParams.get('sort') || 'createdAt:desc';
    const createdFrom = url.searchParams.get('createdFrom') || undefined;
    const createdTo = url.searchParams.get('createdTo') || undefined;

    const repo = new UserRepository();
    const { users, total } = await repo.list({ q, page, pageSize, sort, createdFrom, createdTo });

    return NextResponse.json({ users, total, page, pageSize });
  } catch (err) {
    console.error('[admin users] GET failed', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phoneNumber,
      email,
      timezone,
      preferredSendHour,
      fitnessGoals,
      skillLevel,
      exerciseFrequency,
      gender,
      age,
    } = body || {};

    const userInput: CreateUserData = {
      name,
      phoneNumber,
      email: email ?? null,
      stripeCustomerId: null,
      timezone,
      preferredSendHour,
      // createdAt/updatedAt/id are DB-managed; omit here
    } as CreateUserData;

    const userModel = new UserModel();
    const user = await userModel.createUser(userInput);

    // Optionally create a fitness profile when fields are provided
    if (fitnessGoals || skillLevel || exerciseFrequency || gender || age) {
      const profileInput: CreateFitnessProfileData = {
        fitnessGoals: fitnessGoals ?? '',
        skillLevel: skillLevel ?? 'beginner',
        exerciseFrequency: exerciseFrequency ?? '3-4 times per week',
        gender: gender ?? 'other',
        age: age ?? '30',
      } as CreateFitnessProfileData;
      try {
        await userModel.createFitnessProfile(user.id, profileInput);
      } catch (e) {
        // Ignore profile errors to not block user creation
        console.warn('Profile creation failed for new user', e);
      }
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error('[admin users] POST failed', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
