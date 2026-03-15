/**
 * New Regeneration Service (V2)
 *
 * Handles full context regeneration for a user.
 * Used when admin wants to regenerate a user's profile/plan/schedule.
 */
import type { Runner } from '@agent-runner/core';
import { fitnessContextId } from '../helpers';

export interface RegenerationResult {
  success: boolean;
  error?: string;
}

export interface NewRegenerationServiceInstance {
  regenerateUser(userId: string): Promise<RegenerationResult>;
}

export interface NewRegenerationServiceDeps {
  runner: Runner;
}

export function createNewRegenerationService(deps: NewRegenerationServiceDeps): NewRegenerationServiceInstance {
  const { runner } = deps;

  return {
    async regenerateUser(userId: string): Promise<RegenerationResult> {
      const contextId = fitnessContextId(userId);

      try {
        console.log('[NewRegenerationService] Regenerating context for user:', userId);

        // Clear existing context and rebuild
        await runner.context.clear(contextId);

        // Regenerate from scratch using update-fitness
        await runner.invoke('update-fitness', 'Regenerate the complete fitness context for this user. Create a fresh training plan, weekly schedule, and review all profile data.', {
          contextIds: [contextId],
        });

        console.log('[NewRegenerationService] Regeneration complete for user:', userId);
        return { success: true };
      } catch (error) {
        console.error('[NewRegenerationService] Error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
