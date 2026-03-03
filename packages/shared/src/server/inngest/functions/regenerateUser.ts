/**
 * Regenerate User Function (Inngest)
 *
 * Async function that regenerates a user's dossier (profile/plan/week).
 * Triggered by 'user/regeneration.requested' event from admin API.
 *
 * Uses a single step.run() because regenerateUser already handles
 * sequential execution and error isolation per step internally.
 */

import { inngest } from '@/server/connections/inngest/client';
import { createServicesFromDb } from '@/server/services';
import { postgresDb } from '@/server/connections/postgres/postgres';
import type { RegenerationStep } from '@/server/services/agents/regeneration';

// Create services container at module level (Inngest always uses production)
const services = createServicesFromDb(postgresDb);

export const regenerateUserFunction = inngest.createFunction(
  {
    id: 'regenerate-user',
    name: 'Regenerate User Dossier',
    retries: 1,
  },
  { event: 'user/regeneration.requested' },
  async ({ event, step }) => {
    const { userId, steps } = event.data as { userId: string; steps?: RegenerationStep[] };

    const result = await step.run('regenerate', () =>
      services.regeneration.regenerateUser(userId, steps)
    );

    console.log(`[Inngest] Regeneration complete for user ${userId}`);

    return { success: true, userId, result };
  }
);
