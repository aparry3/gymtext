import { NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { AdminActivityLogRepository } from '@/server/repositories/adminActivityLogRepository';

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    let date: string | undefined;
    let dryRun = false;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body: { date?: string; dryRun?: boolean } = await request.json().catch(() => ({}));
      date = body?.date;
      dryRun = Boolean(body?.dryRun);
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      date = (form.get('date') as string) || undefined;
      dryRun = (form.get('dryRun') as string) === 'true';
    }
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
    await new AdminActivityLogRepository().log({ targetUserId: userId, action: 'admin.send_daily_message', payload: { dryRun: !!dryRun, date: date ?? null }, result: result.success ? 'success' : 'failure', errorMessage: result.success ? null : result.error });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin users send-daily-message] POST failed', err);
    try {
      const { userId } = await context.params;
      await new AdminActivityLogRepository().log({ targetUserId: userId, action: 'admin.send_daily_message', result: 'failure', errorMessage: err instanceof Error ? err.message : 'unknown' });
    } catch {}
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
