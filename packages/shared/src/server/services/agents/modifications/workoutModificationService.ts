import { now, getDayOfWeek } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { DossierServiceInstance } from '../../domain/dossier/dossierService';

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

// =============================================================================
// Factory Pattern
// =============================================================================

export interface WorkoutModificationServiceInstance {
  modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult>;
  modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult>;
}

export interface WorkoutModificationServiceDeps {
  user: UserServiceInstance;
  dossier: DossierServiceInstance;
  training: TrainingServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
  messagingOrchestrator?: MessagingOrchestratorInstance;
}

export function createWorkoutModificationService(
  deps: WorkoutModificationServiceDeps
): WorkoutModificationServiceInstance {
  const {
    user: userService,
    dossier: dossierService,
    training: trainingService,
    agentRunner: simpleAgentRunner,
    messagingOrchestrator,
  } = deps;

  return {
    async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
      try {
        const { userId, workoutDate, changeRequest } = params;
        console.log('[MODIFY_WORKOUT] Starting workout modification', { userId, changeRequest });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const timezone = user.timezone || 'America/New_York';
        const today = now(timezone);
        const workoutDateTime = DateTime.fromJSDate(workoutDate, { zone: timezone });
        const isToday = workoutDateTime.hasSame(today, 'day');

        // Read week dossier
        const weekDossier = await dossierService.getWeekForDate(userId, workoutDate);
        if (!weekDossier?.content) {
          return { success: false, messages: [], error: 'No week plan found. Please create a plan first.' };
        }

        const targetDay = getDayOfWeek(workoutDate, timezone);

        // Build context
        const profileDossier = await dossierService.getProfile(userId);
        const context: string[] = [];
        if (profileDossier) {
          context.push(`<Profile>${profileDossier}</Profile>`);
        }
        context.push(`<Week>${weekDossier.content}</Week>`);

        // Call workout:modify agent to get modified week dossier
        const result = await simpleAgentRunner.invoke('workout:modify', {
          input: `For ${targetDay}: ${changeRequest}`,
          context,
          params: { user, date: workoutDate },
        });

        const modifiedWeekContent = result.response;

        // Write new week version via dossier service
        const plan = await dossierService.getPlan(userId);
        if (plan?.id) {
          await dossierService.createWeek(
            userId,
            plan.id,
            modifiedWeekContent,
            weekDossier.startDate
          );
        }

        // If today, regenerate immediately
        if (isToday) {
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, workoutDateTime);
          if (generatedWorkout?.message && messagingOrchestrator) {
            await messagingOrchestrator.queueMessage(user, { content: generatedWorkout.message }, 'daily');
          }
        }

        console.log('[MODIFY_WORKOUT] Workout modification complete');
        return {
          success: true,
          modifications: `Workout for ${targetDay} modified: ${changeRequest}`,
          messages: [],
        };
      } catch (error) {
        console.error('[MODIFY_WORKOUT] Error modifying workout:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },

    async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
      try {
        const { userId, changeRequest, weekStartDate } = params;
        console.log('[MODIFY_WEEK] Starting week modification', { userId, changeRequest, weekStartDate });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const timezone = user.timezone || 'America/New_York';
        const today = now(timezone);
        const referenceDate = weekStartDate ?? today.toJSDate();

        // Read week dossier
        const weekDossier = await dossierService.getWeekForDate(userId, referenceDate);
        if (!weekDossier?.content) {
          // Try to generate one first
          try {
            await trainingService.prepareMicrocycleForDate(userId, referenceDate, timezone);
          } catch {
            return { success: false, messages: [], error: 'No week plan found and could not generate one.' };
          }
        }

        const currentWeek = weekDossier ?? await dossierService.getWeekForDate(userId, referenceDate);
        if (!currentWeek?.content) {
          return { success: false, messages: [], error: 'Could not find or create week plan.' };
        }

        // Build context
        const profileDossier = await dossierService.getProfile(userId);
        const planDossier = await dossierService.getPlan(userId);
        const context: string[] = [];
        if (profileDossier) {
          context.push(`<Profile>${profileDossier}</Profile>`);
        }
        if (planDossier?.content) {
          context.push(`<Plan>${planDossier.content}</Plan>`);
        }
        context.push(`<Week>${currentWeek.content}</Week>`);

        // Call week:modify agent
        const result = await simpleAgentRunner.invoke('week:modify', {
          input: changeRequest,
          context,
          params: { user },
        });

        const modifiedWeekContent = result.response;

        // Write new week version
        if (planDossier?.id) {
          await dossierService.createWeek(
            userId,
            planDossier.id,
            modifiedWeekContent,
            currentWeek.startDate
          );
        }

        // If today is affected, regenerate immediately
        const isFutureWeek = !!weekStartDate;
        if (!isFutureWeek) {
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, today);
          if (generatedWorkout?.message && messagingOrchestrator) {
            await messagingOrchestrator.queueMessage(user, { content: generatedWorkout.message }, 'daily');
          }
        }

        console.log('[MODIFY_WEEK] Week modification complete');
        return {
          success: true,
          modifications: `Week schedule modified: ${changeRequest}`,
          messages: [],
        };
      } catch (error) {
        console.error('[MODIFY_WEEK] Error modifying week:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}
