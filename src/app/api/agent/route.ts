import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { onboardUser } from '../../../server/agents/fitnessOutlineAgent';
import { generateWeeklyPlan } from '@/server/agents/workoutGeneratorAgent';
// import { processUpdate } from '@/server/agents/workoutUpdateAgentt';

export async function POST(req: NextRequest) {
  const { action, ...body } = await req.json();

  try {
    switch (action) {
      case 'onboard': {
        const outline = await onboardUser(body as { userId: string });
        return NextResponse.json({ outline });
      }
      case 'weekly': {
        const { userId } = body;
        const plan = await generateWeeklyPlan(userId);
        return NextResponse.json({ ...plan });
      }
    //   case 'update': {
    //     const { userId, message } = body;
    //     const result = await processUpdate(userId, message);
    //     return NextResponse.json(result);
    //   }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 