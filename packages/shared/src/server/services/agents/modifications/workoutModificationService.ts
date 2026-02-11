import type { ModifyWorkoutOutput } from '@/server/services/agents/types/workouts';
import type { WorkoutStructure } from '@/server/models/workout';
import type { MicrocycleStructure } from '@/server/models/microcycle';
import { now, getDayOfWeek, DAY_NAMES } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import { normalizeWhitespace } from '@/server/utils/formatters';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { MicrocycleServiceInstance } from '../../domain/training/microcycleService';
import type { WorkoutInstanceServiceInstance } from '../../domain/training/workoutInstanceService';
import type { FitnessPlanServiceInstance } from '../../domain/training/fitnessPlanService';
import { resolveExercisesInStructure, type TrainingServiceInstance } from '../../orchestration/trainingService';
import type { ExerciseResolutionServiceInstance } from '../../domain/exercise/exerciseResolutionService';
import type { ExerciseUseRepository } from '@/server/repositories/exerciseUseRepository';
import type { AgentRunnerInstance } from '@/server/agents/runner';
import type { MessagingOrchestratorInstance } from '../../orchestration/messagingOrchestrator';

export interface ModifyWorkoutParams {
  userId: string;
  workoutDate: Date;
  changeRequest: string;
}

export interface ModifyWorkoutResult {
  success: boolean;
  workout?: ModifyWorkoutOutput;
  modifications?: string;
  messages: string[];
  error?: string;
}

export interface ModifyWeekParams {
  userId: string;
  targetDay: string;
  changeRequest: string;
}

export interface ModifyWeekResult {
  success: boolean;
  modifiedDays?: number;
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
  microcycle: MicrocycleServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  training: TrainingServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  agentRunner: AgentRunnerInstance;
  exerciseResolution?: ExerciseResolutionServiceInstance;
  exerciseUse?: ExerciseUseRepository;
  messagingOrchestrator?: MessagingOrchestratorInstance;
}

export function createWorkoutModificationService(
  deps: WorkoutModificationServiceDeps
): WorkoutModificationServiceInstance {
  const {
    user: userService,
    microcycle: microcycleService,
    workoutInstance: workoutInstanceService,
    training: trainingService,
    fitnessPlan: fitnessPlanService,
    agentRunner,
    exerciseResolution,
    exerciseUse,
    messagingOrchestrator,
  } = deps;

  const getWorkoutTypeFromTheme = (theme: string): string => {
    const themeLower = theme.toLowerCase();
    if (themeLower.includes('run') || themeLower.includes('cardio') || themeLower.includes('hiit') || themeLower.includes('metcon') || themeLower.includes('conditioning')) return 'cardio';
    if (themeLower.includes('lift') || themeLower.includes('strength') || themeLower.includes('upper') || themeLower.includes('lower') || themeLower.includes('push') || themeLower.includes('pull')) return 'strength';
    if (themeLower.includes('mobility') || themeLower.includes('flexibility') || themeLower.includes('stretch')) return 'mobility';
    if (themeLower.includes('rest') || themeLower.includes('recovery')) return 'recovery';
    if (themeLower.includes('assessment') || themeLower.includes('test')) return 'assessment';
    if (themeLower.includes('deload')) return 'deload';
    return 'strength';
  };

  return {
    /**
     * Modify today's workout (same muscle group, different constraints).
     *
     * Flow:
     * 1. workout:modify → get new description
     * 2. Promise.all([workout:message.then(queueMessage), workout:structured])
     * 3. Resolve exercises, save to DB
     * 4. Return empty messages (already queued via queueMessage)
     */
    async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
      try {
        const { userId, workoutDate, changeRequest } = params;
        console.log('[MODIFY_WORKOUT] Starting workout modification', { userId, changeRequest });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const today = now(user.timezone);
        const workoutDateTime = DateTime.fromJSDate(workoutDate, { zone: user.timezone });
        const workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, workoutDateTime.toJSDate());
        if (!workout) return { success: false, messages: [], error: 'No workout found for that date' };

        // Step 1: workout:modify (no sub-agents after migration)
        const modifyResult = await agentRunner.invoke('workout:modify', {
          input: changeRequest,
          params: { user, date: workoutDateTime.toJSDate() },
        });
        const modifyResponse = modifyResult.response as { overview: string; wasModified: boolean; modifications: string };
        const workoutDescription = modifyResponse.overview;

        // Step 2: Parallel - message (with immediate send) + structured
        const isToday = workoutDateTime.hasSame(today, 'day');

        const messagePromise = agentRunner.invoke('workout:message', {
          input: workoutDescription,
          params: { user },
        }).then(async (msgResult) => {
          const msg = normalizeWhitespace(msgResult.response as string);
          if (isToday && messagingOrchestrator) {
            await messagingOrchestrator.queueMessage(user, { content: msg }, 'daily');
          }
          return msg;
        });

        const structuredPromise = agentRunner.invoke('workout:structured', {
          input: workoutDescription,
          params: { user },
        }).then((res) => res.response as WorkoutStructure);

        const [workoutMessage, structure] = await Promise.all([messagePromise, structuredPromise]);

        // Step 3: Resolve exercises
        if (structure && exerciseResolution) {
          await resolveExercisesInStructure(structure, exerciseResolution, exerciseUse, userId);
        }

        // Step 4: Save to DB
        const updated = await workoutInstanceService.updateWorkout(workout.id, {
          description: workoutDescription,
          structured: structure,
          message: workoutMessage,
        });
        if (!updated) return { success: false, messages: [], error: 'Failed to update workout' };

        console.log('[MODIFY_WORKOUT] Workout modification complete');
        return {
          success: true,
          workout: { response: modifyResponse, message: workoutMessage, structure },
          modifications: modifyResponse.modifications,
          messages: [], // Already queued via queueMessage
        };
      } catch (error) {
        console.error('[MODIFY_WORKOUT] Error modifying workout:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },

    /**
     * Modify the weekly schedule (different muscle group, rearranging schedule).
     *
     * Flow (existing workout on target day):
     * 1. workout:modify → get new description
     * 2. Promise.all([workout:message.then(queueMessage), workout:structured, microcycle:modify])
     * 3. Resolve exercises, save workout + microcycle to DB
     * 4. Return empty messages (already queued via queueMessage)
     *
     * Flow (no existing workout - rest day → workout day):
     * 1. microcycle:modify → update schedule
     * 2. trainingService.prepareWorkoutForDate() → generate new workout
     * 3. Save microcycle to DB
     */
    async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
      try {
        const { userId, targetDay, changeRequest } = params;
        console.log('[MODIFY_WEEK] Starting week modification', { userId, targetDay, changeRequest });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const today = now(user.timezone);
        const plan = await fitnessPlanService.getCurrentPlan(userId);
        if (!plan) return { success: false, messages: [], error: 'No fitness plan found. Please create a plan first.' };

        const { microcycle } = await trainingService.prepareMicrocycleForDate(userId, plan, today.toJSDate(), user.timezone);
        if (!microcycle) return { success: false, messages: [], error: 'Could not find or create microcycle for current week' };

        const targetDayIndex = DAY_NAMES.indexOf(targetDay as typeof DAY_NAMES[number]);
        const targetDate = today.startOf('week').plus({ days: targetDayIndex });
        const existingWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, targetDate.toJSDate());
        const isToday = targetDay === getDayOfWeek(today.toJSDate(), user.timezone);
        const fullChangeRequest = `For ${targetDay}: ${changeRequest}`;

        if (existingWorkout) {
          // Path A: Existing workout - parallel agents
          console.log('[MODIFY_WEEK] Existing workout found, running parallel modification');

          // Step 1: workout:modify
          const modifyResult = await agentRunner.invoke('workout:modify', {
            input: changeRequest,
            params: { user, date: targetDate.toJSDate() },
          });
          const modifyResponse = modifyResult.response as { overview: string; wasModified: boolean; modifications: string };
          const workoutDescription = modifyResponse.overview;

          // Step 2: Parallel - message + structured + microcycle:modify
          const messagePromise = agentRunner.invoke('workout:message', {
            input: workoutDescription,
            params: { user },
          }).then(async (msgResult) => {
            const msg = normalizeWhitespace(msgResult.response as string);
            if (isToday && messagingOrchestrator) {
              await messagingOrchestrator.queueMessage(user, { content: msg }, 'daily');
            }
            return msg;
          });

          const structuredPromise = agentRunner.invoke('workout:structured', {
            input: workoutDescription,
            params: { user },
          }).then((res) => res.response as WorkoutStructure);

          const microcyclePromise = agentRunner.invoke('microcycle:modify', {
            input: fullChangeRequest,
            params: { user },
          });

          const [workoutMessage, structure, mcResult] = await Promise.all([
            messagePromise,
            structuredPromise,
            microcyclePromise,
          ]);

          // Step 3: Resolve exercises
          if (structure && exerciseResolution) {
            await resolveExercisesInStructure(structure, exerciseResolution, exerciseUse, userId);
          }

          // Step 4: Save workout + microcycle to DB
          const mcResponse = mcResult.response as { overview: string; days: string[]; isDeload: boolean; wasModified: boolean; modifications: string };
          const mcStructure = (mcResult as Record<string, unknown>).structure as MicrocycleStructure | undefined;

          await workoutInstanceService.updateWorkout(existingWorkout.id, {
            goal: mcResponse.days[targetDayIndex] || workoutDescription,
            description: workoutDescription,
            structured: structure ?? undefined,
            message: workoutMessage,
            sessionType: getWorkoutTypeFromTheme(workoutDescription),
          });

          await microcycleService.updateMicrocycle(microcycle.id, {
            days: mcResponse.days,
            description: mcResponse.overview,
            isDeload: mcResponse.isDeload,
            structured: mcStructure,
          });

          console.log('[MODIFY_WEEK] Week modification complete (parallel path)');
          return {
            success: true,
            modifiedDays: 1,
            modifications: modifyResponse.modifications,
            messages: [], // Already queued via queueMessage
          };
        } else {
          // Path B: No existing workout (rest day → workout day) - sequential fallback
          console.log('[MODIFY_WEEK] No existing workout, sequential fallback');

          // Step 1: microcycle:modify
          const mcResult = await agentRunner.invoke('microcycle:modify', {
            input: fullChangeRequest,
            params: { user },
          });
          const mcResponse = mcResult.response as { overview: string; days: string[]; isDeload: boolean; wasModified: boolean; modifications: string };
          const mcStructure = (mcResult as Record<string, unknown>).structure as MicrocycleStructure | undefined;

          await microcycleService.updateMicrocycle(microcycle.id, {
            days: mcResponse.days,
            description: mcResponse.overview,
            isDeload: mcResponse.isDeload,
            structured: mcStructure,
          });

          // Step 2: Generate new workout via training service
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, targetDate);
          if (generatedWorkout && isToday && generatedWorkout.message && messagingOrchestrator) {
            await messagingOrchestrator.queueMessage(user, { content: generatedWorkout.message }, 'daily');
          }

          console.log('[MODIFY_WEEK] Week modification complete (sequential fallback)');
          return {
            success: true,
            modifiedDays: 1,
            modifications: mcResponse.modifications,
            messages: [], // Already queued via queueMessage
          };
        }
      } catch (error) {
        console.error('[MODIFY_WEEK] Error modifying week:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}
