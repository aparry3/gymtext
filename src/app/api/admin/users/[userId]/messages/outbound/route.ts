import { NextResponse } from 'next/server';
import { UserRepository } from '@/server/repositories/userRepository';
import { MessageService } from '@/server/services/messageService';
import { AdminActivityLogRepository } from '@/server/repositories/adminActivityLogRepository';

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const message = String(body?.message || '').trim();
    const dryRun = Boolean(body?.dryRun);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dryRun) {
      await new AdminActivityLogRepository().log({ targetUserId: userId, action: 'admin.send_outbound_sms', payload: { dryRun: true, message }, result: 'success' });
      return NextResponse.json({ success: true, dryRun: true });
    }

    const svc = new MessageService();
    await svc.sendMessage(user, message);
    await new AdminActivityLogRepository().log({ targetUserId: userId, action: 'admin.send_outbound_sms', payload: { dryRun: false }, result: 'success' });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin outbound sms] POST failed', err);
    try {
      const { userId } = await context.params;
      await new AdminActivityLogRepository().log({ targetUserId: userId, action: 'admin.send_outbound_sms', result: 'failure', errorMessage: err instanceof Error ? err.message : 'unknown' });
    } catch {}
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
