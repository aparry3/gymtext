/**
 * RegenerationService
 *
 * Agent service that re-runs the AI pipeline to convert existing
 * profile/plan/week data into the current dossier format.
 *
 * Unlike ProfileService or PlanModificationService, this service
 * skips side effects (Inngest events, parallel workout modifications)
 * that are unnecessary during bulk data migration.
 */
import { parseDossierResponse } from '@/server/agents/dossierParser';
import { formatForAI } from '@/shared/utils/date';
import type { MarkdownServiceInstance } from '../../domain/markdown/markdownService';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { TrainingServiceInstance } from '../../orchestration/trainingService';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

// =============================================================================
// Types
// =============================================================================

export interface RegenerationStepResult {
  regenerated: boolean;
  planId?: string;
  wasCreated?: boolean;
  error?: string;
}

export interface RegenerationResult {
  profile?: RegenerationStepResult;
  plan?: RegenerationStepResult;
  week?: RegenerationStepResult;
}

export type RegenerationStep = 'profile' | 'plan' | 'week';

export interface RegenerationServiceInstance {
  regenerateUser(userId: string, steps?: RegenerationStep[]): Promise<RegenerationResult>;
  regenerateAllUsers(): Promise<BulkRegenerationResult>;
}

export interface BulkRegenerationResult {
  total: number;
  success: number;
  skipped: number;
  failed: number;
  errors: { userId: string; error: string }[];
}

export interface RegenerationServiceDeps {
  user: UserServiceInstance;
  markdown: MarkdownServiceInstance;
  training: TrainingServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
}

// =============================================================================
// Factory
// =============================================================================

const ALL_STEPS: RegenerationStep[] = ['profile', 'plan', 'week'];

export function createRegenerationService(deps: RegenerationServiceDeps): RegenerationServiceInstance {
  const { user: userService, markdown: markdownService, training: trainingService, agentRunner } = deps;

  async function regenerateProfile(userId: string, timezone: string): Promise<RegenerationStepResult> {
    const user = await userService.getUser(userId);
    if (!user) return { regenerated: false, error: 'User not found' };

    const existingProfile = await markdownService.getProfile(userId) ?? '';
    const currentDate = formatForAI(new Date(), timezone);

    const profileResult = await agentRunner.invoke('profile:update', {
      input: existingProfile || 'Regenerate profile from existing data.',
      context: existingProfile ? [`<Profile>${existingProfile}</Profile>`] : [],
      params: { user, currentDate },
    });

    const { dossierContent: updatedProfile } = parseDossierResponse(profileResult.response);

    if (!updatedProfile) {
      return { regenerated: false, error: 'No content returned from agent' };
    }

    // Extract details in parallel with save
    const detailsPromise = agentRunner.invoke('profile:details', {
      input: updatedProfile,
      params: { user },
    })
      .then((r) => JSON.parse(r.response) as Record<string, unknown>)
      .catch((error) => {
        console.error('[REGENERATION] Failed to generate profile details:', error);
        return undefined;
      });

    const [, profileDetails] = await Promise.all([
      markdownService.updateProfile(userId, updatedProfile),
      detailsPromise,
    ]);

    if (profileDetails) {
      await markdownService.updateProfileDetails(userId, profileDetails);
    }

    return { regenerated: true };
  }

  async function regeneratePlan(userId: string): Promise<RegenerationStepResult> {
    const user = await userService.getUser(userId);
    if (!user) return { regenerated: false, error: 'User not found' };

    const existingPlan = await markdownService.getPlan(userId);
    if (!existingPlan) {
      return { regenerated: false, error: 'No existing plan found' };
    }

    const profileDossier = await markdownService.getProfile(userId);
    const context: string[] = [];
    if (profileDossier) context.push(`<Profile>${profileDossier}</Profile>`);
    const planContent = existingPlan.content || existingPlan.description || '';
    if (planContent) context.push(`<Plan>${planContent}</Plan>`);

    const planResult = await agentRunner.invoke('plan:modify', {
      input: 'Reformat this plan to match the current dossier structure. Preserve all training decisions, modifications, and periodization.',
      context,
      params: { user },
    });

    const { dossierContent: updatedPlan } = parseDossierResponse(planResult.response);

    if (!updatedPlan) {
      return { regenerated: false, error: 'No content returned from agent' };
    }

    const detailsResult = await agentRunner.invoke('plan:details', {
      input: updatedPlan,
      context,
      params: { user },
    })
      .then((r) => JSON.parse(r.response) as Record<string, unknown>)
      .catch((error) => {
        console.error('[REGENERATION] Failed to generate plan details:', error);
        return undefined;
      });

    const savedPlan = await markdownService.createPlan(
      userId,
      updatedPlan,
      existingPlan.startDate || new Date(),
      { details: detailsResult }
    );

    return { regenerated: true, planId: savedPlan.id };
  }

  async function regenerateWeek(userId: string, timezone: string): Promise<RegenerationStepResult> {
    const weekResult = await trainingService.prepareMicrocycleForDate(userId, new Date(), timezone);
    return { regenerated: true, wasCreated: weekResult.wasCreated };
  }

  return {
    async regenerateUser(userId: string, steps: RegenerationStep[] = ALL_STEPS): Promise<RegenerationResult> {
      const user = await userService.getUser(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const timezone = user.timezone || 'America/New_York';
      const results: RegenerationResult = {};

      if (steps.includes('profile')) {
        try {
          console.log(`[REGENERATION] Starting profile for user ${userId}`);
          results.profile = await regenerateProfile(userId, timezone);
          console.log(`[REGENERATION] Profile done for user ${userId}:`, results.profile.regenerated);
        } catch (error) {
          console.error(`[REGENERATION] Profile error for user ${userId}:`, error);
          results.profile = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }

      if (steps.includes('plan')) {
        try {
          console.log(`[REGENERATION] Starting plan for user ${userId}`);
          results.plan = await regeneratePlan(userId);
          console.log(`[REGENERATION] Plan done for user ${userId}:`, results.plan.regenerated);
        } catch (error) {
          console.error(`[REGENERATION] Plan error for user ${userId}:`, error);
          results.plan = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }

      if (steps.includes('week')) {
        try {
          console.log(`[REGENERATION] Starting week for user ${userId}`);
          results.week = await regenerateWeek(userId, timezone);
          console.log(`[REGENERATION] Week done for user ${userId}:`, results.week.regenerated);
        } catch (error) {
          console.error(`[REGENERATION] Week error for user ${userId}:`, error);
          results.week = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }

      return results;
    },

    async regenerateAllUsers(): Promise<BulkRegenerationResult> {
      const userIds = await userService.getUserIdsWithProfiles();
      const total = userIds.length;
      const successIds: string[] = [];
      const skippedIds: string[] = [];
      const errors: { userId: string; error: string }[] = [];

      console.log(`[REGENERATION] Starting bulk regeneration for ${total} users`);

      // Process sequentially to avoid overloading LLM APIs
      for (const userId of userIds) {
        try {
          const user = await userService.getUser(userId);
          if (!user) {
            skippedIds.push(userId);
            continue;
          }

          console.log(`[REGENERATION] Processing user ${userId} (${user.name || user.phoneNumber})`);
          await this.regenerateUser(userId);
          successIds.push(userId);
          console.log(`[REGENERATION] Completed user ${userId}`);
        } catch (error) {
          console.error(`[REGENERATION] Failed for user ${userId}:`, error);
          errors.push({ userId, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      console.log(`[REGENERATION] Bulk complete: ${successIds.length}/${total} succeeded, ${errors.length} failed, ${skippedIds.length} skipped`);

      return {
        total,
        success: successIds.length,
        skipped: skippedIds.length,
        failed: errors.length,
        errors,
      };
    },
  };
}
