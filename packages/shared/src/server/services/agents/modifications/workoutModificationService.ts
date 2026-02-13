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
import { flattenWorkoutTags } from '@/shared/types/workout/tags';

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
  changeRequest: string;
  weekStartDate?: Date;
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
     * Modify today's workout (any change — different exercises, muscle group, equipment, constraints).
     * Also syncs the microcycle to keep the weekly overview consistent.
     *
     * Flow (existing workout):
     * 1. workout:modify → get new description
     * 2. Promise.all([workout:message.then(queueMessage), workout:structured, microcycle:modify])
     * 3. Resolve exercises, save workout + microcycle to DB
     *
     * Flow (no existing workout — rest day → workout day):
     * 1. microcycle:modify → update the day in the schedule
     * 2. Save microcycle, then trainingService.prepareWorkoutForDate() → generate workout
     * 3. Queue message if today
     */
    async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
      try {
        const { userId, workoutDate, changeRequest } = params;
        console.log('[MODIFY_WORKOUT] Starting workout modification', { userId, changeRequest });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const today = now(user.timezone);
        const workoutDateTime = DateTime.fromJSDate(workoutDate, { zone: user.timezone });
        const isToday = workoutDateTime.hasSame(today, 'day');
        const targetDay = getDayOfWeek(workoutDate, user.timezone);
        const targetDayIndex = DAY_NAMES.indexOf(targetDay);

        const plan = await fitnessPlanService.getCurrentPlan(userId);
        if (!plan) return { success: false, messages: [], error: 'No fitness plan found. Please create a plan first.' };

        const { microcycle } = await trainingService.prepareMicrocycleForDate(userId, plan, today.toJSDate(), user.timezone);
        if (!microcycle) return { success: false, messages: [], error: 'Could not find or create microcycle for current week' };

        const existingWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, workoutDateTime.toJSDate());
        const fullChangeRequest = `For ${targetDay}: ${changeRequest}`;

        if (existingWorkout) {
          // Path A: Existing workout — modify workout + sync microcycle in parallel
          console.log('[MODIFY_WORKOUT] Existing workout found, running parallel modification');

          // Step 1: workout:modify
          const modifyResult = await agentRunner.invoke('workout:modify', {
            input: changeRequest,
            params: { user, date: workoutDateTime.toJSDate() },
          });
          const modifyResponse = modifyResult.response as { overview: string; wasModified: boolean; modifications: string };
          const workoutDescription = modifyResponse.overview;

          // Step 2: Parallel — message + structured + microcycle:modify
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
          const mcResponse = mcResult.response as { overview: string; days: string[]; wasModified: boolean; modifications: string };
          const mcStructure = (mcResult as Record<string, unknown>).structure as MicrocycleStructure | undefined;

          const tags = structure?.tags ? flattenWorkoutTags(structure.tags) : undefined;
          await workoutInstanceService.updateWorkout(existingWorkout.id, {
            goal: mcResponse.days[targetDayIndex] || workoutDescription,
            description: workoutDescription,
            structured: structure ?? undefined,
            message: workoutMessage,
            sessionType: getWorkoutTypeFromTheme(workoutDescription),
            ...(tags ? { tags } : {}),
          });

          await microcycleService.updateMicrocycle(microcycle.id, {
            days: mcResponse.days,
            description: mcResponse.overview,
            structured: mcStructure,
          });

          console.log('[MODIFY_WORKOUT] Workout modification complete (parallel path)');
          return {
            success: true,
            workout: { response: modifyResponse, message: workoutMessage, structure },
            modifications: modifyResponse.modifications,
            messages: [], // Already queued via queueMessage
          };
        } else {
          // Path B: No existing workout (rest day → workout day) — sequential fallback
          console.log('[MODIFY_WORKOUT] No existing workout, sequential fallback (rest day → workout day)');

          // Step 1: microcycle:modify
          const mcResult = await agentRunner.invoke('microcycle:modify', {
            input: fullChangeRequest,
            params: { user },
          });
          const mcResponse = mcResult.response as { overview: string; days: string[]; wasModified: boolean; modifications: string };
          const mcStructure = (mcResult as Record<string, unknown>).structure as MicrocycleStructure | undefined;

          await microcycleService.updateMicrocycle(microcycle.id, {
            days: mcResponse.days,
            description: mcResponse.overview,
            structured: mcStructure,
          });

          // Step 2: Generate new workout via training service
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, workoutDateTime);
          if (generatedWorkout && isToday && generatedWorkout.message && messagingOrchestrator) {
            await messagingOrchestrator.queueMessage(user, { content: generatedWorkout.message }, 'daily');
          }

          console.log('[MODIFY_WORKOUT] Workout modification complete (sequential fallback)');
          return {
            success: true,
            modifications: mcResponse.modifications,
            messages: [], // Already queued via queueMessage
          };
        }
      } catch (error) {
        console.error('[MODIFY_WORKOUT] Error modifying workout:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },

    /**
     * Restructure the weekly schedule (move sessions, swap days, multi-day changes).
     * Invalidates affected workouts so they regenerate on-demand.
     *
     * Flow:
     * 1. microcycle:modify → updated 7-day schedule
     * 2. Save microcycle to DB
     * 3. Compare old vs new days → find affected day indices
     * 4. For each affected day (today or future, skip completed):
     *    - If changed meaningfully: delete existing workout (will regenerate on-demand)
     * 5. If today is affected: regenerate immediately via prepareWorkoutForDate()
     */
    async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
      try {
        const { userId, changeRequest, weekStartDate } = params;
        console.log('[MODIFY_WEEK] Starting week modification', { userId, changeRequest, weekStartDate });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const today = now(user.timezone);
        const referenceDate = weekStartDate ?? today.toJSDate();
        const plan = await fitnessPlanService.getCurrentPlan(userId);
        if (!plan) return { success: false, messages: [], error: 'No fitness plan found. Please create a plan first.' };

        const { microcycle } = await trainingService.prepareMicrocycleForDate(userId, plan, referenceDate, user.timezone);
        if (!microcycle) return { success: false, messages: [], error: 'Could not find or create microcycle for target week' };

        const oldDays = [...microcycle.days];

        // Step 1: microcycle:modify — agent determines which days are affected
        const mcResult = await agentRunner.invoke('microcycle:modify', {
          input: changeRequest,
          params: { user },
        });
        const mcResponse = mcResult.response as { overview: string; days: string[]; wasModified: boolean; modifications: string };
        const mcStructure = (mcResult as Record<string, unknown>).structure as MicrocycleStructure | undefined;

        // Step 2: Save microcycle to DB
        await microcycleService.updateMicrocycle(microcycle.id, {
          days: mcResponse.days,
          description: mcResponse.overview,
          structured: mcStructure,
        });

        // Step 3: Compare old vs new days to find affected indices
        const isFutureWeek = !!weekStartDate;
        const weekStart = weekStartDate
          ? DateTime.fromJSDate(weekStartDate, { zone: user.timezone }).startOf('week')
          : today.startOf('week');
        const todayIndex = isFutureWeek ? -1 : Math.floor(today.diff(weekStart, 'days').days);
        let modifiedDays = 0;
        let todayAffected = false;

        for (let i = 0; i < 7; i++) {
          const oldDay = (oldDays[i] || '').toLowerCase().trim();
          const newDay = (mcResponse.days[i] || '').toLowerCase().trim();

          // Skip if day didn't change
          if (oldDay === newDay) continue;

          // Skip past days (before today) — for future weeks, no days are in the past
          if (!isFutureWeek && i < todayIndex) continue;

          const dayDate = weekStart.plus({ days: i });
          const existingWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, dayDate.toJSDate());

          if (existingWorkout) {
            // Skip completed workouts
            if (existingWorkout.completedAt) continue;

            // Delete the stale workout — it will regenerate on-demand
            await workoutInstanceService.deleteWorkout(existingWorkout.id, userId);
            modifiedDays++;
          } else {
            // New day or rest→workout — count as modified (will generate on-demand)
            modifiedDays++;
          }

          if (!isFutureWeek && i === todayIndex) {
            todayAffected = true;
          }
        }

        // Step 4: If today is affected, regenerate immediately (never for future weeks)
        if (todayAffected) {
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, today);
          if (generatedWorkout?.message && messagingOrchestrator) {
            await messagingOrchestrator.queueMessage(user, { content: generatedWorkout.message }, 'daily');
          }
        }

        console.log('[MODIFY_WEEK] Week modification complete', { modifiedDays, todayAffected, isFutureWeek });
        return {
          success: true,
          modifiedDays,
          modifications: mcResponse.modifications,
          messages: [], // Already queued via queueMessage if today was affected
        };
      } catch (error) {
        console.error('[MODIFY_WEEK] Error modifying week:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}
