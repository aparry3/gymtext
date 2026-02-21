import { NextResponse } from 'next/server';
import { getSecrets } from '@/lib/secrets';
import { Pool } from 'pg';

/**
 * GET /api/health
 *
 * Health check endpoint for agents to verify system health before making changes.
 * Returns system status, database connection status, and external service status.
 */
export async function GET() {
  let secrets;
  try {
    secrets = getSecrets();
  } catch {
    // If secrets can't be loaded, return error
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to load secrets - check environment configuration',
        database: {
          status: 'error',
          error: 'Secrets not available',
        },
        redis: {
          status: 'unavailable',
          note: 'Redis is not currently used in this application',
        },
        services: {
          twilio: {
            status: 'error',
            error: 'Secrets not available',
          },
          stripe: {
            status: 'unconfigured',
            error: 'Secrets not available',
          },
        },
      },
      { status: 503 }
    );
  }

  const health: {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    database: {
      status: 'ok' | 'error';
      latencyMs?: number;
      error?: string;
    };
    redis: {
      status: 'ok' | 'unavailable';
      note?: string;
    };
    services: {
      twilio: {
        status: 'ok' | 'error';
        error?: string;
      };
      stripe: {
        status: 'ok' | 'unconfigured';
        error?: string;
      };
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: 'ok',
    },
    redis: {
      status: 'unavailable',
      note: 'Redis is not currently used in this application',
    },
    services: {
      twilio: {
        status: 'ok',
      },
      stripe: {
        status: 'unconfigured',
      },
    },
  };

  // Check database connection
  let pool: Pool | null = null;
  try {
    pool = new Pool({ connectionString: secrets.database.url });
    const start = Date.now();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    health.database.latencyMs = Date.now() - start;
  } catch (error) {
    health.database.status = 'error';
    health.database.error = error instanceof Error ? error.message : 'Unknown error';
    health.status = 'error';
  } finally {
    if (pool) {
      await pool.end();
    }
  }

  // Check Twilio (verify credentials are present)
  const twilio = secrets.twilio;
  if (!twilio.accountSid || !twilio.authToken || !twilio.phoneNumber) {
    health.services.twilio.status = 'error';
    health.services.twilio.error = 'Twilio credentials not configured';
    health.status = 'degraded';
  }

  // Check Stripe (verify credentials are present)
  const stripe = secrets.stripe;
  if (!stripe.secretKey) {
    health.services.stripe.status = 'unconfigured';
    health.status = 'degraded';
  } else {
    health.services.stripe.status = 'ok';
  }

  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
