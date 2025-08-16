import { NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { FitnessPlanService } from '@/server/services/fitnessPlanService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { AdminActivityLogRepository } from '@/server/repositories/adminActivityLogRepository';

export async function POST(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const service = new FitnessPlanService(new FitnessPlanRepository());
    const plan = await service.createFitnessPlan(user);
    await new AdminActivityLogRepository().log({ targetUserId: userId, action: 'admin.generate_plan', payload: {}, result: 'success' });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (err) {
    console.error('[admin users plans] POST failed', err);
    try {
      const { userId } = await context.params;
      await new AdminActivityLogRepository().log({ targetUserId: userId, action: 'admin.generate_plan', result: 'failure', errorMessage: err instanceof Error ? err.message : 'unknown' });
    } catch {}
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
