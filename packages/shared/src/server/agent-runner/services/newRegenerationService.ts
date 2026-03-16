/**
 * New Regeneration Service (V2)
 *
 * Handles full context regeneration for a user.
 * Used when admin wants to regenerate a user's profile/plan/schedule.
 */
import type { Runner } from '@agent-runner/core';
import { fitnessContextId } from '../helpers';
import { agentLogger } from '../logger';

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

      const SVC = 'NewRegenerationService';
      try {
        agentLogger.info({ service: SVC, event: 'starting', userId });

        // Clear existing context and rebuild
        await runner.context.clear(contextId);
        agentLogger.info({ service: SVC, event: 'context_cleared', userId });

        // Regenerate from scratch using update-fitness
        const result = await runner.invoke('update-fitness', 'Regenerate the complete fitness context for this user. Create a fresh training plan, weekly schedule, and review all profile data.', {
          contextIds: [contextId],
        });
        agentLogger.invocation(SVC, userId, result, 'update-fitness');

        agentLogger.info({ service: SVC, event: 'complete', userId });
        return { success: true };
      } catch (error) {
        agentLogger.error({ service: SVC, event: 'error', userId, error: error instanceof Error ? error.message : String(error) });
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
