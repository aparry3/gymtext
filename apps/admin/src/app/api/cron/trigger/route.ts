import { NextResponse } from 'next/server';
import { getProductionSecrets } from '@/lib/secrets';
import { getProductionConfig } from '@/lib/config';

interface TriggerRequest {
  type?: 'daily' | 'weekly';
  forceImmediate?: boolean;
}

/**
 * Proxy endpoint to trigger the web app's daily or weekly message cron
 * This allows admins to manually trigger the cron job from the admin dashboard
 *
 * @param type - 'daily' or 'weekly' (defaults to 'daily')
 * @param forceImmediate - If true, triggers for ALL users regardless of time settings
 */
export async function POST(request: Request) {
  try {
    let body: TriggerRequest = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine, use defaults
    }

    const type = body.type ?? 'daily';
    const forceImmediate = body.forceImmediate ?? false;

    const secrets = getProductionSecrets();
    const config = getProductionConfig();

    const webAppUrl = config.urls.webApiUrl;
    const cronSecret = secrets.cron.cronSecret;

    if (!webAppUrl) {
      console.error('[ADMIN CRON] Web API Url is not configured');
      return NextResponse.json(
        { success: false, error: 'Web API URL is not configured' },
        { status: 500 }
      );
    }

    if (!cronSecret) {
      console.error('[ADMIN CRON] CRON_SECRET is not configured');
      return NextResponse.json(
        { success: false, error: 'CRON_SECRET is not configured' },
        { status: 500 }
      );
    }

    // Debug: log obfuscated secret
    const obfuscated = cronSecret.length > 10
      ? `${cronSecret.slice(0, 5)}${'*'.repeat(cronSecret.length - 10)}${cronSecret.slice(-5)}`
      : '***too-short***';
    console.log('[ADMIN CRON] Using CRON_SECRET:', obfuscated, 'length:', cronSecret.length);

    // Determine the endpoint based on type
    const endpoint = type === 'weekly' ? 'weekly-messages' : 'daily-messages';
    const cronUrl = `${webAppUrl}/api/cron/${endpoint}`;

    // Add forceImmediate as query param if true
    const urlWithParams = forceImmediate
      ? `${cronUrl}?forceImmediate=true`
      : cronUrl;

    console.log(`[ADMIN CRON] Triggering ${type} messages cron:`, urlWithParams);

    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[ADMIN CRON] Cron request failed:', result);
      return NextResponse.json(
        { success: false, error: result.error || 'Cron request failed', status: response.status },
        { status: response.status }
      );
    }

    console.log(`[ADMIN CRON] ${type} cron triggered successfully:`, result);
    return NextResponse.json({
      success: true,
      type,
      forceImmediate,
      ...result,
    });

  } catch (error) {
    console.error('[ADMIN CRON] Error triggering cron:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger cron' },
      { status: 500 }
    );
  }
}
