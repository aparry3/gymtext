import { NextResponse } from 'next/server';
import { AdminActivityLogRepository } from '@/server/repositories/adminActivityLogRepository';

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const repo = new AdminActivityLogRepository();
    const logs = await repo.listForUser(userId, { page: 1, pageSize: 50 });
    return NextResponse.json({ logs });
  } catch (err) {
    console.error('[admin users activity] GET failed', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
