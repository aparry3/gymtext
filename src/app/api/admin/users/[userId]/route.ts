import { NextResponse } from 'next/server';
import { UserModel } from '@/server/models/userModel';

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const userModel = new UserModel();
    const user = await userModel.getUserWithProfile(userId);
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error('[admin users detail] GET failed', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
