import { now, getDayOfWeek } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import { parseDossierResponse, mergeDossierWithOriginal } from '@/server/agents/dossierParser';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { MarkdownServiceInstance } from '../../domain/markdown/markdownService';

import type { TrainingServiceInstance } from '../../orchestration/trainingService';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';
import type { MessagingOrchestratorInstance } from '../../orchestration/messagingOrchestrator';

export interface ModifyWorkoutParams {
  userId: string;
  workoutDate: Date;
  changeRequest: string;
  targetDay?: string;
  weekStartDate?: Date;
}

export interface ModifyWorkoutResult {
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

  return {
    async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
      const { userId, changeRequest, workoutDate, targetDay, weekStartDate } = params;

      try {
        console.log('[MODIFY_WORKOUT] Starting modification', { userId, changeRequest, targetDay });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const timezone = user.timezone || 'America/New_York';
        const today = now(timezone);
        const referenceDate = weekStartDate ?? workoutDate ?? today.toJSDate();

        // Read week dossier
        let weekDossier = await markdownService.getWeekForDate(userId, referenceDate);
        if (!weekDossier?.content) {
          // Try to generate one first
          try {
            await trainingService.prepareMicrocycleForDate(userId, referenceDate, timezone);
            weekDossier = await markdownService.getWeekForDate(userId, referenceDate);
          } catch {
            // Fall through to error
          }
          if (!weekDossier?.content) {
            return { success: false, messages: [], error: 'No week plan found. Please create a plan first.' };
          }
        }

        // Build context — always include plan for broader reasoning
        const profileDossier = await markdownService.getProfile(userId);
        const context: string[] = [];
        if (profileDossier) {
          context.push(`<Profile>${profileDossier}</Profile>`);
        }
        const planDossier = await markdownService.getPlan(userId);
        if (planDossier?.content) {
          context.push(`<Plan>${planDossier.content}</Plan>`);
        }
        context.push(`<Week>${weekDossier.content}</Week>`);

        // Format input: prepend day info if targeting a specific day
        let input: string;
        if (targetDay) {
          input = `For ${targetDay}: ${changeRequest}`;
        } else if (workoutDate) {
          input = `For ${getDayOfWeek(workoutDate, timezone)}: ${changeRequest}`;
        } else {
          input = changeRequest;
        }

        const result = await simpleAgentRunner.invoke('workout:modify', {
          input,
          context,
          params: { user },
        });

        // Parse dossier response with changes metadata
        const { changed, summary, dossierContent } = parseDossierResponse(result.response);

        // Merge unchanged days back from original
        const mergedContent = changed && dossierContent
          ? mergeDossierWithOriginal(dossierContent, weekDossier.content)
          : dossierContent;

        // Save if changed
        if (changed && mergedContent) {
          const plan = await markdownService.getPlan(userId);
          if (plan?.id) {
            await markdownService.createWeek(
              userId,
              plan.id,
              mergedContent,
              weekDossier.startDate
            );
          }
        }

        // If current week and changed, regenerate today's workout
        const messages: string[] = [];
        const isCurrentWeek = !weekStartDate;
        if (changed && isCurrentWeek) {
          const targetDate = workoutDate ?? today.toJSDate();
          const isToday = targetDay
            ? true // Week-scope modifications always potentially affect today
            : DateTime.fromJSDate(targetDate, { zone: timezone }).hasSame(today, 'day');

          if (isToday) {
            const generatedWorkout = await trainingService.prepareWorkoutForDate(user, today);
            if (generatedWorkout?.message) {
              if (messagingOrchestrator) {
                await messagingOrchestrator.queueMessage(user, { content: generatedWorkout.message }, 'daily');
              }
              messages.push(generatedWorkout.message);
            }
          }
        }

        console.log('[MODIFY_WORKOUT] Modification complete', { changed, summary });
        return {
          success: true,
          modifications: changed ? summary : 'No changes needed.',
          messages,
        };
      } catch (error) {
        console.error('[MODIFY_WORKOUT] Error:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}
