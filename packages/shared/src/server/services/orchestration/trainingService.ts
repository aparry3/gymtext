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
import { getDayOfWeekName, now, parseDate, toISODate } from '@/shared/utils/date';
import { normalizeWhitespace, stripCodeFences } from '@/server/utils/formatters';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
// Domain services
import type { UserServiceInstance } from '../domain/user/userService';
import type { MarkdownServiceInstance } from '../domain/markdown/markdownService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { ShortLinkServiceInstance } from '../domain/links/shortLinkService';

// Agent services
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

// =============================================================================
// Types
// =============================================================================

export interface WorkoutData {
  id: string;
  message: string;
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
  prepareWorkoutForDate(user: UserWithProfile, targetDate: DateTime, options?: { weekContent?: string }): Promise<WorkoutData | null>;
  formatWeekMessage(user: UserWithProfile, weekContent: string): Promise<string>;
  regenerateWorkoutMessage(user: UserWithProfile, workout: WorkoutData): Promise<string>;
}

export interface TrainingServiceDeps {
  user: UserServiceInstance;
  markdown: MarkdownServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  shortLink: ShortLinkServiceInstance;
}

// =============================================================================
// Factory
// =============================================================================

export function createTrainingService(deps: TrainingServiceDeps): TrainingServiceInstance {
  const {
    user: userService,
    markdown: markdownService,
    agentRunner: simpleAgentRunner,
    workoutInstance: workoutInstanceService,
    shortLink: shortLinkService,
  } = deps;

  return {
    async createFitnessPlan(user: UserWithProfile, options?: { programId?: string; programVersionId?: string }): Promise<FitnessPlan> {
      console.log(`[TrainingService] Creating fitness plan for user ${user.id}`);

      // Fetch profile context
      const context = await markdownService.getContext(user.id, ['profile']);

      // Append program context if enrolling via a program
      if (options?.programVersionId) {
        const programContext = await markdownService.getProgramContext(options.programVersionId);
        if (programContext) context.push(programContext);
      }

      // Generate plan via AI agent
      const result = await simpleAgentRunner.invoke('plan:generate', {
        input: `${user.name || 'this user'}'s profile and goals.`,
        context,
        params: { user },
      });

      const planContent = result.response;
      console.log('[TrainingService] Generated plan:', planContent.substring(0, 200));

      // Extract structured plan details via AI agent (mirrors week:details pattern)
      const detailsResult = await simpleAgentRunner.invoke('plan:details', {
        input: planContent,
        context,
        params: { user },
      })
        .then((r) => JSON.parse(r.response) as Record<string, unknown>)
        .catch((error) => {
          console.error('[TrainingService] Failed to generate plan details:', error);
          return undefined;
        });

      // Save to database via dossier service
      const savedPlan = await markdownService.createPlan(user.id, planContent, now().toJSDate(), { details: detailsResult });
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

      // Fetch profile and plan context
      const context = await markdownService.getContext(userId, ['profile', 'plan']);

      // Generate week dossier via AI agent
      const weekStart = DateTime.fromJSDate(targetDate, { zone: timezone }).startOf('week');
      const result = await simpleAgentRunner.invoke('week:generate', {
        input: `Week starting ${weekStart.toISODate()}.`,
        context,
        params: { user },
      });

      const weekContent = result.response;

      // Run week:format and week:details in parallel (mirrors workout pattern)
      const weekContext = [...context, `## Week\n${weekContent}`];

      const [formatResult, detailsResult] = await Promise.all([
        simpleAgentRunner.invoke('week:format', {
          input: weekContent,
          context: weekContext,
          params: { user },
        }),
        simpleAgentRunner.invoke('week:details', {
          input: weekContent,
          context: weekContext,
          params: { user },
        })
          .then((r) => JSON.parse(r.response) as Record<string, unknown>)
          .catch((error) => {
            console.error(`[TrainingService] Failed to generate structured week:`, error);
            return undefined;
          }),
      ]);

      const weekMessage = formatResult.response;

      // Save to database via dossier service
      const microcycle = await markdownService.createWeek(
        userId,
        plan.id!,
        weekContent,
        weekStart.toJSDate(),
        { message: weekMessage, details: detailsResult }
      );

      console.log(
        `[TrainingService] Created week for user ${userId} starting ${weekStart.toISODate()}`
      );

      // Return backward-compatible format for old callers
      return { microcycle, progress: {}, wasCreated: true };
    },

    async prepareWorkoutForDate(
      user: UserWithProfile,
      targetDate: DateTime,
      options?: { weekContent?: string }
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

        const weekContent = options?.weekContent ?? microcycle.content;
        const context = await markdownService.getContext(user.id, ['week'], {
          weekContentOverride: weekContent ?? undefined,
        });
        console.log('[TrainingService] Week content:', weekContent);

        const dayName = getDayOfWeekName(todayDate, timezone);
        const dateStr = targetDate.toISODate()!;

        // Run format and details agents in parallel
        const agentInput = `${dayName} (${dateStr})`;
        const agentOpts = { context, params: { user, date: todayDate } };

        const [formatResult, detailsResult] = await Promise.all([
          simpleAgentRunner.invoke('workout:format', { input: agentInput, ...agentOpts }),
          simpleAgentRunner.invoke('workout:details', { input: agentInput, ...agentOpts })
            .then((r) => {
              return JSON.parse(r.response) as Record<string, unknown>;
            })
            .catch((error) => {
              console.error(`[TrainingService] Failed to generate structured workout:`, error);
              return undefined;
            }),
        ]);

        const rawMessage = stripCodeFences(normalizeWhitespace(formatResult.response));

        // Save workout instance first to get a real ID for the short link
        const workoutInstance = await workoutInstanceService.upsert({
          clientId: user.id,
          date: dateStr,
          message: rawMessage,
          details: detailsResult,
        });

        // Create short link using the actual workout instance ID
        let shortLinkSuffix = '';
        try {
          const shortLink = await shortLinkService.createWorkoutLink(user.id, workoutInstance.id);
          const fullUrl = shortLinkService.getFullUrl(shortLink.code);
          shortLinkSuffix = `\n\n(More details: ${fullUrl})`;
        } catch (error) {
          console.error(`[TrainingService] Failed to create short link:`, error);
        }

        // Compose final message: day name + content + short link
        const workoutMessage = `${dayName}\n\n${rawMessage}${shortLinkSuffix}`;

        // Update with final message including the short link
        if (shortLinkSuffix) {
          await workoutInstanceService.upsert({
            clientId: user.id,
            date: dateStr,
            message: workoutMessage,
          });
        }

        console.log(`[TrainingService] Generated workout for user ${user.id} on ${dateStr}`);

        return {
          id: workoutInstance.id,
          message: workoutMessage,
          date: todayDate,
        };
      } catch (error) {
        console.error(`[TrainingService] Error generating workout for user ${user.id}:`, error);
        throw error;
      }
    },

    async formatWeekMessage(user: UserWithProfile, weekContent: string): Promise<string> {
      const context = await markdownService.getContext(user.id, ['profile']);

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
      const timezone = user.timezone || 'America/New_York';
      const workoutDate = parseDate(workout.date)!;

      const context = await markdownService.getContext(user.id, ['week'], {
        date: workoutDate,
        timezone,
      });

      const dayName = getDayOfWeekName(workoutDate, timezone);
      const workoutISODate = toISODate(workoutDate, timezone);
      const result = await simpleAgentRunner.invoke('workout:format', {
        input: `${dayName} (${workoutISODate})`,
        context,
        params: { user, date: workoutDate },
      });

      const rawMessage = stripCodeFences(normalizeWhitespace(result.response));

      // Save workout instance first to get a real ID for the short link
      const workoutInstance = await workoutInstanceService.upsert({
        clientId: user.id,
        date: workoutISODate,
        message: rawMessage,
      });

      // Generate short link using the actual workout instance ID
      let shortLinkSuffix = '';
      try {
        const shortLink = await shortLinkService.createWorkoutLink(user.id, workoutInstance.id);
        const fullUrl = shortLinkService.getFullUrl(shortLink.code);
        shortLinkSuffix = `\n\n(More details: ${fullUrl})`;
      } catch (error) {
        console.error(`[TrainingService] Failed to create short link for regenerated workout:`, error);
      }

      const regeneratedMessage = `${dayName}\n\n${rawMessage}${shortLinkSuffix}`;

      // Update with final message including the short link
      if (shortLinkSuffix) {
        await workoutInstanceService.upsert({
          clientId: user.id,
          date: workoutISODate,
          message: regeneratedMessage,
        });
      }

      return regeneratedMessage;
    },
  };
}
