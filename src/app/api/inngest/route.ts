/**
 * Inngest API Route
 *
 * This endpoint is auto-discovered by Inngest and serves as the gateway
 * for all serverless function execution.
 *
 * Inngest will:
 * - Register all functions defined here
 * - Send events to trigger function execution
 * - Handle retries and error tracking
 * - Provide observability dashboard
 *
 * Local Development:
 * 1. Run: npx inngest-cli@latest dev
 * 2. Visit: http://localhost:8288
 * 3. Functions are auto-detected and ready to test
 *
 * Production:
 * - Vercel auto-detects this route
 * - Set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY in env vars
 * - Functions are automatically registered
 */

import { serve } from 'inngest/next';
import { inngest } from '@/server/connections/inngest/client';
import { processMessageFunction } from '@/server/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processMessageFunction,
    // Add more functions here as needed:
    // processComplexMessageFunction,
    // processBatchMessagesFunction,
    // etc.
  ],
});
