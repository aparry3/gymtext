import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseFloat(searchParams.get('threshold') || '0');

    const { repos } = await getAdminContext();
    const exercises = await repos.exercise.listActiveAbovePopularity(threshold);

    return NextResponse.json({ success: true, data: exercises });
  } catch (error) {
    console.error('Error fetching exercises for ranking:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { repos } = await getAdminContext();
    const count = await repos.exercise.resetAllPopularity();
    return NextResponse.json({ success: true, data: { reset: count } });
  } catch (error) {
    console.error('Error resetting exercise popularity:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { exerciseId, delta } = await request.json();

    if (!exerciseId || typeof delta !== 'number') {
      return NextResponse.json(
        { success: false, message: 'exerciseId and delta are required' },
        { status: 400 }
      );
    }

    const { repos } = await getAdminContext();
    const result = await repos.exercise.adjustPopularity(exerciseId, delta);

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating exercise popularity:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
