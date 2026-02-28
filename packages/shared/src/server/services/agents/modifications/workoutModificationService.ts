import { now, getDayOfWeek } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import { parseDossierResponse } from '@/server/agents/dossierParser';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { MarkdownServiceInstance } from '../../domain/markdown/markdownService';

import type { TrainingServiceInstance } from '../../orchestration/trainingService';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';
import type { MessagingOrchestratorInstance } from '../../orchestration/messagingOrchestrator';

export interface ModifyWorkoutParams {
  userId: string;
  workoutDate: Date;
  changeRequest: string;
}

export interface ModifyWorkoutResult {
  success: boolean;
  modifications?: string;
  messages: string[];
  error?: string;
}

export interface ModifyWeekParams {
  userId: string;
  changeRequest: string;
  weekStartDate?: Date;
}

export interface ModifyWeekResult {
  success: boolean;
  modifications?: string;
  messages: string[];
  error?: string;
}

// Unified modify params (internal)
interface ModifyParams {
  userId: string;
  changeRequest: string;
  scope: 'day' | 'week';
  targetDate?: Date;
  weekStartDate?: Date;
}

interface ModifyResult {
  success: boolean;
  modifications?: string;
  messages: string[];
  error?: string;
}

// =============================================================================
// Factory Pattern
// =============================================================================

export interface WorkoutModificationServiceInstance {
  modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult>;
  modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult>;
}

export interface WorkoutModificationServiceDeps {
  user: UserServiceInstance;
  markdown: MarkdownServiceInstance;
  training: TrainingServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
  messagingOrchestrator?: MessagingOrchestratorInstance;
}

export function createWorkoutModificationService(
  deps: WorkoutModificationServiceDeps
): WorkoutModificationServiceInstance {
  const {
    user: userService,
    markdown: markdownService,
    training: trainingService,
    agentRunner: simpleAgentRunner,
    messagingOrchestrator,
  } = deps;

  /**
   * Unified modification method — handles both day-scope and week-scope modifications.
   * Picks the right agent based on scope, parses the dossier response for changes metadata,
   * and conditionally saves + regenerates.
   */
  async function modify(params: ModifyParams): Promise<ModifyResult> {
    const { userId, changeRequest, scope, targetDate, weekStartDate } = params;
    const logPrefix = scope === 'day' ? '[MODIFY_WORKOUT]' : '[MODIFY_WEEK]';

    try {
      console.log(`${logPrefix} Starting ${scope} modification`, { userId, changeRequest });

      const user = await userService.getUser(userId);
      if (!user) return { success: false, messages: [], error: 'User not found' };

      const timezone = user.timezone || 'America/New_York';
      const today = now(timezone);
      const referenceDate = weekStartDate ?? targetDate ?? today.toJSDate();

      // Read week dossier
      let weekDossier = await markdownService.getWeekForDate(userId, referenceDate);
      if (!weekDossier?.content) {
        if (scope === 'week') {
          // Try to generate one first
          try {
            await trainingService.prepareMicrocycleForDate(userId, referenceDate, timezone);
            weekDossier = await markdownService.getWeekForDate(userId, referenceDate);
          } catch {
            // Fall through to error
          }
        }
        if (!weekDossier?.content) {
          return { success: false, messages: [], error: 'No week plan found. Please create a plan first.' };
        }
      }

      // Build context
      const profileDossier = await markdownService.getProfile(userId);
      const context: string[] = [];
      if (profileDossier) {
        context.push(`<Profile>${profileDossier}</Profile>`);
      }

      // Week-scope includes plan context for broader reasoning
      if (scope === 'week') {
        const planDossier = await markdownService.getPlan(userId);
        if (planDossier?.content) {
          context.push(`<Plan>${planDossier.content}</Plan>`);
        }
      }
      context.push(`<Week>${weekDossier.content}</Week>`);

      // Pick agent and format input based on scope
      const agentId = scope === 'day' ? 'workout:modify' : 'week:modify';
      const input = scope === 'day'
        ? `For ${getDayOfWeek(targetDate ?? today.toJSDate(), timezone)}: ${changeRequest}`
        : changeRequest;

      const result = await simpleAgentRunner.invoke(agentId, {
        input,
        context,
        params: { user },
      });

      // Parse dossier response with changes metadata
      const { changed, summary, dossierContent } = parseDossierResponse(result.response);

      // Save if changed
      if (changed && dossierContent) {
        const plan = await markdownService.getPlan(userId);
        if (plan?.id) {
          await markdownService.createWeek(
            userId,
            plan.id,
            dossierContent,
            weekDossier.startDate
          );
        }
      }

      // If current week and changed, regenerate today's workout
      const isCurrentWeek = !weekStartDate;
      if (changed && isCurrentWeek) {
        const isToday = scope === 'day'
          ? DateTime.fromJSDate(targetDate ?? today.toJSDate(), { zone: timezone }).hasSame(today, 'day')
          : true; // Week modifications always potentially affect today

        if (isToday) {
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, today);
          if (generatedWorkout?.message && messagingOrchestrator) {
            await messagingOrchestrator.queueMessage(user, { content: generatedWorkout.message }, 'daily');
          }
        }
      }

      console.log(`${logPrefix} Modification complete`, { changed, summary });
      return {
        success: true,
        modifications: changed ? summary : 'No changes needed.',
        messages: [],
      };
    } catch (error) {
      console.error(`${logPrefix} Error:`, error);
      return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  return {
    async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
      return modify({
        userId: params.userId,
        changeRequest: params.changeRequest,
        scope: 'day',
        targetDate: params.workoutDate,
      });
    },

    async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
      return modify({
        userId: params.userId,
        changeRequest: params.changeRequest,
        scope: 'week',
        weekStartDate: params.weekStartDate,
      });
    },
  };
}
