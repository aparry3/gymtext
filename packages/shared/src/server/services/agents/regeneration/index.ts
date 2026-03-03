/**
 * RegenerationService
 *
 * Agent service that re-runs the AI pipeline to convert existing
 * profile/plan/week data into the current dossier format.
 *
 * Uses the same agents as the normal pipeline (profile:update, plan:generate,
 * week:generate) but overrides the user prompt template to say "convert this
 * existing content" instead of "create new content." This keeps regeneration
 * always in sync with the parent agent's format instructions.
 */
import { AGENTS } from '@/server/agents/constants';
import { parseDossierResponse } from '@/server/agents/dossierParser';
import { formatForAI, now as nowFn } from '@/shared/utils/date';
import type { MarkdownServiceInstance } from '../../domain/markdown/markdownService';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { WorkoutInstanceServiceInstance } from '../../domain/training/workoutInstanceService';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

// =============================================================================
// Regeneration Prompt Overrides
// =============================================================================

const REGEN_PROFILE_PROMPT =
  'Convert this existing fitness profile into the updated format described in your instructions. ' +
  'Preserve all data exactly — only restructure and reformat.\n\n{{input}}';

const REGEN_PLAN_PROMPT =
  'Convert this existing training plan into the updated format described in your instructions. ' +
  'Preserve all data exactly — only restructure and reformat.\n\n{{input}}';

const REGEN_WEEK_PROMPT =
  'Convert this existing weekly microcycle into the updated format described in your instructions. ' +
  'Preserve all data exactly — only restructure and reformat.\n\n{{input}}';

const REGEN_WORKOUT_DETAILS_PROMPT =
  'Extract structured workout details from this workout message. ' +
  'The message was sent to a user via SMS and contains the full workout. ' +
  'Convert it into the blocks + items JSON format described in your instructions.\n\n{{input}}';

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
  workouts?: RegenerationStepResult;
}

export type RegenerationStep = 'profile' | 'plan' | 'week' | 'workouts';

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
  agentRunner: SimpleAgentRunnerInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
}

// =============================================================================
// Factory
// =============================================================================

const ALL_STEPS: RegenerationStep[] = ['profile', 'plan', 'week', 'workouts'];

export function createRegenerationService(deps: RegenerationServiceDeps): RegenerationServiceInstance {
  const { user: userService, markdown: markdownService, agentRunner, workoutInstance: workoutInstanceService } = deps;

  async function regenerateProfile(userId: string, timezone: string): Promise<RegenerationStepResult> {
    const user = await userService.getUser(userId);
    if (!user) return { regenerated: false, error: 'User not found' };

    const existingProfile = await markdownService.getProfile(userId) ?? '';
    const currentDate = formatForAI(new Date(), timezone);

    const profileResult = await agentRunner.invoke(AGENTS.PROFILE_UPDATE, {
      input: existingProfile || 'Regenerate profile from existing data.',
      userPromptTemplate: REGEN_PROFILE_PROMPT,
      params: { user, currentDate },
    });

    const { dossierContent: updatedProfile } = parseDossierResponse(profileResult.response);

    if (!updatedProfile) {
      return { regenerated: false, error: 'No content returned from agent' };
    }

    // Extract details in parallel with save
    const detailsPromise = agentRunner.invoke(AGENTS.PROFILE_DETAILS, {
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

    const planResult = await agentRunner.invoke(AGENTS.PLAN_GENERATE, {
      input: planContent,
      userPromptTemplate: REGEN_PLAN_PROMPT,
      context,
      params: { user },
    });

    const { dossierContent: updatedPlan } = parseDossierResponse(planResult.response);

    if (!updatedPlan) {
      return { regenerated: false, error: 'No content returned from agent' };
    }

    const detailsResult = await agentRunner.invoke(AGENTS.PLAN_DETAILS, {
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

  async function regenerateWeek(userId: string): Promise<RegenerationStepResult> {
    const user = await userService.getUser(userId);
    if (!user) return { regenerated: false, error: 'User not found' };

    const existingWeek = await markdownService.getWeek(userId);
    if (!existingWeek) {
      return { regenerated: false, error: 'No existing week found' };
    }

    const profileDossier = await markdownService.getProfile(userId);
    const planDossier = await markdownService.getPlan(userId);
    const context: string[] = [];
    if (profileDossier) context.push(`<Profile>${profileDossier}</Profile>`);
    if (planDossier?.content) context.push(`<Plan>${planDossier.content}</Plan>`);

    const weekContent = existingWeek.content || '';

    const weekResult = await agentRunner.invoke(AGENTS.WEEK_GENERATE, {
      input: weekContent,
      userPromptTemplate: REGEN_WEEK_PROMPT,
      context,
      params: { user },
    });

    const { dossierContent: updatedWeek } = parseDossierResponse(weekResult.response);

    if (!updatedWeek) {
      return { regenerated: false, error: 'No content returned from agent' };
    }

    // Run week:format and week:details in parallel (mirrors trainingService pattern)
    const weekContext = [...context, `<Week>${updatedWeek}</Week>`];

    const [formatResult, detailsResult] = await Promise.all([
      agentRunner.invoke(AGENTS.WEEK_FORMAT, {
        input: updatedWeek,
        context: weekContext,
        params: { user },
      }),
      agentRunner.invoke(AGENTS.WEEK_DETAILS, {
        input: updatedWeek,
        context: weekContext,
        params: { user },
      })
        .then((r) => JSON.parse(r.response) as Record<string, unknown>)
        .catch((error) => {
          console.error('[REGENERATION] Failed to generate week details:', error);
          return undefined;
        }),
    ]);

    const weekMessage = formatResult.response;

    const planId = planDossier?.id;
    if (!planId) {
      return { regenerated: false, error: 'No plan found for week creation' };
    }

    await markdownService.createWeek(
      userId,
      planId,
      updatedWeek,
      existingWeek.startDate || new Date(),
      { message: weekMessage, details: detailsResult }
    );

    return { regenerated: true, wasCreated: true };
  }

  async function regenerateWorkout(userId: string, timezone: string): Promise<RegenerationStepResult> {
    const todayDt = nowFn(timezone);
    const todayStr = todayDt.toFormat('yyyy-MM-dd');

    const workout = await workoutInstanceService.getByUserAndDate(userId, todayStr);
    if (!workout || !workout.message) {
      return { regenerated: false, error: 'No workout or message for today' };
    }

    const user = await userService.getUser(userId);
    if (!user) return { regenerated: false, error: 'User not found' };

    const detailsResult = await agentRunner.invoke(AGENTS.WORKOUT_DETAILS, {
      input: workout.message,
      userPromptTemplate: REGEN_WORKOUT_DETAILS_PROMPT,
      params: { user },
    });

    const details = JSON.parse(detailsResult.response) as Record<string, unknown>;

    await workoutInstanceService.upsert({
      clientId: userId,
      date: todayStr,
      details,
    });

    return { regenerated: true };
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
          results.week = await regenerateWeek(userId);
          console.log(`[REGENERATION] Week done for user ${userId}:`, results.week.regenerated);
        } catch (error) {
          console.error(`[REGENERATION] Week error for user ${userId}:`, error);
          results.week = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }

      if (steps.includes('workouts')) {
        try {
          console.log(`[REGENERATION] Starting workouts for user ${userId}`);
          results.workouts = await regenerateWorkout(userId, timezone);
          console.log(`[REGENERATION] Workouts done for user ${userId}:`, results.workouts.regenerated);
        } catch (error) {
          console.error(`[REGENERATION] Workouts error for user ${userId}:`, error);
          results.workouts = { regenerated: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
