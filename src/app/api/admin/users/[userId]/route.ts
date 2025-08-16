import { NextResponse } from 'next/server';
import { UserModel } from '@/server/models/userModel';

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const userModel = new UserModel();
    const user = await userModel.getUserWithProfile(params.userId);
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error('[admin users detail] GET failed', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
