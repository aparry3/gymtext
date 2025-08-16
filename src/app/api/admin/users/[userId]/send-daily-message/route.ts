import { NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { postgresDb } from '@/server/connections/postgres/postgres';

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { date, dryRun } = body || {};
    const dailyMessageService = new DailyMessageService(
      new UserRepository(),
      new WorkoutInstanceRepository(),
      new MessageService(),
      new FitnessPlanRepository(),
      new MicrocycleRepository(postgresDb)
    );
    const result = await dailyMessageService.sendTestMessage(userId, {
      currentDate: date ? new Date(date) : undefined,
      dryRun: !!dryRun,
      testMode: true,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin users send-daily-message] POST failed', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
