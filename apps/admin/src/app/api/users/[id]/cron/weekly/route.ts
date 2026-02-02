import { NextResponse } from 'next/server';
import { getProductionSecrets } from '@/lib/secrets';
import { getProductionConfig } from '@/lib/config';

interface TriggerRequest {
  forceImmediate?: boolean;
}

/**
 * Proxy endpoint to trigger weekly message for a specific user
 * Forwards the request to the web app which has Inngest configured
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, reason: 'User ID is required' },
        { status: 400 }
      );
    }

    let body: TriggerRequest = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine, use defaults
    }

    const forceImmediate = body.forceImmediate ?? true;

    const secrets = getProductionSecrets();
    const config = getProductionConfig();

    const webAppUrl = config.urls.webApiUrl;
    const cronSecret = secrets.cron.cronSecret;

    if (!webAppUrl) {
      console.error('[ADMIN CRON] Web API URL is not configured');
      return NextResponse.json(
        { success: false, reason: 'Web API URL is not configured' },
        { status: 500 }
      );
    }

    if (!cronSecret) {
      console.error('[ADMIN CRON] CRON_SECRET is not configured');
      return NextResponse.json(
        { success: false, reason: 'CRON_SECRET is not configured' },
        { status: 500 }
      );
    }

    const cronUrl = `${webAppUrl}/api/cron/weekly-messages/${userId}`;

    console.log(`[ADMIN CRON] Triggering weekly message for user ${userId}:`, cronUrl);

    const response = await fetch(cronUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ forceImmediate }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[ADMIN CRON] Weekly message request failed:', result);
      return NextResponse.json(
        { success: false, reason: result.error || result.reason || 'Request failed', status: response.status },
        { status: response.status }
      );
    }

    console.log(`[ADMIN CRON] Weekly message triggered successfully for user ${userId}:`, result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('[ADMIN CRON] Error triggering weekly cron for user:', error);

    return NextResponse.json(
      {
        success: false,
        scheduled: false,
        reason: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
