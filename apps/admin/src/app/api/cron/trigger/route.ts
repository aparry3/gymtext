import { NextResponse } from 'next/server';
import { getProductionSecrets } from '@/lib/secrets';
import { getProductionConfig } from '@/lib/config';

/**
 * Proxy endpoint to trigger the web app's daily message cron
 * This allows admins to manually trigger the cron job from the admin dashboard
 */
export async function POST() {
  try {
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

    const cronUrl = `${webAppUrl}/api/cron/daily-messages`;
    console.log('[ADMIN CRON] Triggering daily messages cron:', cronUrl);

    const response = await fetch(cronUrl, {
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

    console.log('[ADMIN CRON] Cron triggered successfully:', result);
    return NextResponse.json({
      success: true,
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
