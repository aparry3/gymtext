/**
 * TrainingService
 *
 * Orchestrates training-related workflows including plan generation,
 * week (microcycle) generation, and workout formatting.
 *
 * Uses dossier-based markdown content stored via DossierService.
 * All AI generation goes through SimpleAgentRunner.
 */
import { DateTime } from 'luxon';
import { getDayOfWeekName } from '@/shared/utils/date';
import { normalizeWhitespace } from '@/server/utils/formatters';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
// Domain services
import type { UserServiceInstance } from '../domain/user/userService';
import type { MarkdownServiceInstance } from '../domain/markdown/markdownService';


// Agent services
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

// =============================================================================
// Types
// =============================================================================

export interface WorkoutData {
  id: string;
  message: string;
  description?: string;
  date: Date;
}

export interface TrainingServiceInstance {
  createFitnessPlan(user: UserWithProfile, options?: { programId?: string; programVersionId?: string }): Promise<FitnessPlan>;
  /**
   * Generate a microcycle for a specific date.
   * Supports both new signature (userId, date, timezone) and old signature (userId, plan, date, timezone).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareMicrocycleForDate(userId: string, planOrDate: any, dateOrTimezone?: any, timezone?: string): Promise<any>;
  prepareWorkoutForDate(user: UserWithProfile, targetDate: DateTime): Promise<WorkoutData | null>;
  formatWeekMessage(user: UserWithProfile, weekContent: string): Promise<string>;
  regenerateWorkoutMessage(user: UserWithProfile, workout: WorkoutData): Promise<string>;
}

export interface TrainingServiceDeps {
  user: UserServiceInstance;
  markdown: MarkdownServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
}

// =============================================================================
// Factory
// =============================================================================

export function createTrainingService(deps: TrainingServiceDeps): TrainingServiceInstance {
  const {
    user: userService,
    markdown: markdownService,
    agentRunner: simpleAgentRunner,
  } = deps;

  return {
    async createFitnessPlan(user: UserWithProfile, _options?: { programId?: string; programVersionId?: string }): Promise<FitnessPlan> {
      console.log(`[TrainingService] Creating fitness plan for user ${user.id}`);

      // Fetch profile dossier for context
      const profileDossier = await markdownService.getProfile(user.id);

      const context: string[] = [];
      if (profileDossier) {
        context.push(`<Profile>${profileDossier}</Profile>`);
      }

      // Generate plan via AI agent
      const result = await simpleAgentRunner.invoke('plan:generate', {
        input: 'Generate a fitness plan for this user.',
        context,
        params: { user },
      });

      const planContent = result.response;
      console.log('[TrainingService] Generated plan:', planContent.substring(0, 200));

      // Save to database via dossier service
      const savedPlan = await markdownService.createPlan(user.id, planContent, new Date());
      console.log(`[TrainingService] Saved fitness plan ${savedPlan.id} for user ${user.id}`);

      return savedPlan;
    },

    async prepareMicrocycleForDate(
      userId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      planOrDate: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dateOrTimezone?: any,
      timezoneArg?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
      // Support both old signature (userId, plan, date, timezone) and new (userId, date, timezone)
      let targetDate: Date;
      let timezone: string;
      if (planOrDate instanceof Date) {
        // New signature: (userId, date, timezone?)
        targetDate = planOrDate;
        timezone = (typeof dateOrTimezone === 'string' ? dateOrTimezone : undefined) ?? 'America/New_York';
      } else {
        // Old signature: (userId, plan, date, timezone?)
        targetDate = dateOrTimezone as Date;
        timezone = timezoneArg ?? 'America/New_York';
      }
      // Check if week dossier already exists for this date
      const existingWeek = await markdownService.getWeekForDate(userId, targetDate);
      if (existingWeek) {
        // Return backward-compatible format for old callers
        return { microcycle: existingWeek, progress: {}, wasCreated: false };
      }

      // Get user for AI context
      const user = await userService.getUser(userId);
      if (!user) {
        throw new Error(`[TrainingService] User not found: ${userId}`);
      }

      // Get plan for context
      const plan = await markdownService.getPlan(userId);
      if (!plan) {
        throw new Error(`[TrainingService] No fitness plan found for user: ${userId}`);
      }

      // Fetch profile dossier for context
      const profileDossier = await markdownService.getProfile(userId);

      const context: string[] = [];
      if (profileDossier) {
        context.push(`<Profile>${profileDossier}</Profile>`);
      }
      if (plan.content) {
        context.push(`<Plan>${plan.content}</Plan>`);
      } else if (plan.description) {
        context.push(`<Plan>${plan.description}</Plan>`);
      }

      // Generate week dossier via AI agent
      const weekStart = DateTime.fromJSDate(targetDate, { zone: timezone }).startOf('week');
      const result = await simpleAgentRunner.invoke('week:generate', {
        input: `Generate the training week starting ${weekStart.toISODate()}.`,
        context,
        params: { user },
      });

      const weekContent = result.response;

      // Save to database via dossier service
      const microcycle = await markdownService.createWeek(
        userId,
        plan.id!,
        weekContent,
        weekStart.toJSDate()
      );

      console.log(
        `[TrainingService] Created week for user ${userId} starting ${weekStart.toISODate()}`
      );

      // Return backward-compatible format for old callers
      return { microcycle, progress: {}, wasCreated: true };
    },

    async prepareWorkoutForDate(
      user: UserWithProfile,
      targetDate: DateTime
    ): Promise<WorkoutData | null> {
      try {
        const timezone = user.timezone || 'America/New_York';
        const todayDate = targetDate.toJSDate();

        // Ensure week dossier exists
        const { microcycle } = await this.prepareMicrocycleForDate(user.id, todayDate, timezone);
        if (!microcycle) {
          console.log(`[TrainingService] Could not get/create week for user ${user.id}`);
          return null;
        }

        // Fetch profile for context
        const profileDossier = await markdownService.getProfile(user.id);

        const context: string[] = [];
        if (profileDossier) {
          context.push(`<Profile>${profileDossier}</Profile>`);
        }
        if (microcycle.content) {
          context.push(`<Week>${microcycle.content}</Week>`);
        }

        const dayName = getDayOfWeekName(todayDate, timezone);

        // Format workout via AI agent
        const result = await simpleAgentRunner.invoke('workout:format', {
          input: `Format the workout for ${dayName} (${targetDate.toISODate()}).`,
          context,
          params: { user, date: todayDate },
        });

        const workoutMessage = normalizeWhitespace(result.response);
        const workoutId = `workout-${user.id}-${targetDate.toISODate()}`;

        console.log(`[TrainingService] Generated workout for user ${user.id} on ${targetDate.toISODate()}`);

        return {
          id: workoutId,
          message: workoutMessage,
          description: workoutMessage,
          date: todayDate,
        };
      } catch (error) {
        console.error(`[TrainingService] Error generating workout for user ${user.id}:`, error);
        throw error;
      }
    },

    async formatWeekMessage(user: UserWithProfile, weekContent: string): Promise<string> {
      const profileDossier = await markdownService.getProfile(user.id);

      const context: string[] = [];
      if (profileDossier) {
        context.push(`<Profile>${profileDossier}</Profile>`);
      }

      const result = await simpleAgentRunner.invoke('week:format', {
        input: weekContent,
        context,
        params: { user },
      });

      return result.response;
    },

    async regenerateWorkoutMessage(
      user: UserWithProfile,
      workout: WorkoutData
    ): Promise<string> {
      // Fetch context
      const profileDossier = await markdownService.getProfile(user.id);
      const weekDossier = await markdownService.getWeekForDate(user.id, new Date(workout.date));

      const context: string[] = [];
      if (profileDossier) {
        context.push(`<Profile>${profileDossier}</Profile>`);
      }
      if (weekDossier?.content) {
        context.push(`<Week>${weekDossier.content}</Week>`);
      }

      const result = await simpleAgentRunner.invoke('workout:format', {
        input: workout.description || '',
        context,
        params: { user, date: new Date(workout.date) },
      });

      return result.response;
    },
  };
}
