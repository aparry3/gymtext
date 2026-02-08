import { NextResponse } from 'next/server';
import { getRepositories } from '@/lib/context';
import { getCronSecrets } from '@/server/config';

/**
 * Vercel Cron endpoint for cleaning up old agent logs
 * Runs daily at 3 AM to delete logs older than 3 days
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const { cronSecret } = getCronSecrets();

    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    console.log('[CRON] Cleanup agent logs cron triggered');

    const repos = getRepositories();
    const cutoffDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const deletedCount = await repos.agentLog.deleteOlderThan(cutoffDate);
    const duration = Date.now() - startTime;

    console.log('[CRON] Agent logs cleanup completed:', {
      deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      duration: `${duration}ms`,
    });

    return NextResponse.json({
      success: true,
      deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      duration,
    });
  } catch (error) {
    console.error('[CRON] Fatal error in agent logs cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
