import type { ModifyWorkoutOutput, WorkoutGenerateOutput } from '@/server/services/agents/types/workouts';
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
import { SnippetType } from '../../context/builders/experienceLevel';

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
  targetDay: string; // The day being modified (e.g., "Monday", "Tuesday")
  changeRequest: string; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 min"])
}

export interface ModifyWeekResult {
  success: boolean;
  workout?: WorkoutGenerateOutput;
  modifiedDays?: number;
  modifications?: string;
  messages: string[];
  error?: string;
}

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * WorkoutModificationServiceInstance interface
 */
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
  // Exercise resolution (optional — skipped if not provided)
  exerciseResolution?: ExerciseResolutionServiceInstance;
  exerciseUse?: ExerciseUseRepository;
}

/**
 * Create a WorkoutModificationService instance with injected dependencies
 */
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

  /**
   * Infer activity type from user's change request
   */
  const inferActivityTypeFromRequest = (request: string): 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | undefined => {
    const reqLower = request.toLowerCase();
    if (reqLower.includes('rest') || reqLower.includes('off day') || reqLower.includes('skip')) return 'REST';
    if (reqLower.includes('active recovery') || reqLower.includes('light') || reqLower.includes('easy')) return 'ACTIVE_RECOVERY';
    if (reqLower.includes('workout') || reqLower.includes('training') || reqLower.includes('lift') || reqLower.includes('run')) return 'TRAINING';
    return undefined;
  };

  /**
   * Infer day overview from user's change request
   */
  const inferDayOverviewFromRequest = (request: string, fallback: string): string => {
    const reqLower = request.toLowerCase();

    // Muscle group replacements
    if (reqLower.includes('leg')) return 'Legs (Quads, Hamstrings, Glutes)';
    if (reqLower.includes('chest')) return 'Chest & Triceps';
    if (reqLower.includes('back')) return 'Back & Biceps';
    if (reqLower.includes('shoulder')) return 'Shoulders & Arms';
    if (reqLower.includes('upper')) return 'Upper Body';
    if (reqLower.includes('lower')) return 'Lower Body';
    if (reqLower.includes('push')) return 'Push (Chest, Shoulders, Triceps)';
    if (reqLower.includes('pull')) return 'Pull (Back, Biceps)';

    // Activity type replacements
    if (reqLower.includes('run') || reqLower.includes('cardio')) return 'Cardio (Running, Intervals)';
    if (reqLower.includes('hiit') || reqLower.includes('metcon')) return 'HIIT / Conditioning';
    if (reqLower.includes('mobility') || reqLower.includes('stretch')) return 'Mobility & Flexibility';
    if (reqLower.includes('rest') || reqLower.includes('recovery')) return 'Rest or active recovery';

    return fallback;
  };

  /**
   * Generate a summary of the rest of the week after modification
   */
  const generateWeekSummary = (days: string[], modifiedDay: string, currentDay: string): string | undefined => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDayIndex = dayNames.indexOf(currentDay);
    const remainingDays = dayNames
      .slice(currentDayIndex + 1)
      .map((day, idx) => {
        const actualIdx = currentDayIndex + 1 + idx;
        const dayTheme = days[actualIdx] || 'Rest';
        return `${day}: ${dayTheme}`;
      })
      .filter(line => line.length > 0);

    if (remainingDays.length === 0) return undefined;

    return `I've also adjusted your week to keep things balanced. Here's the rest of your week:\n\n${remainingDays.join('\n')}`;
  };

  return {
    async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
      try {
        const { userId, workoutDate, changeRequest } = params;
        console.log('Modifying workout', params);

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const today = now(user.timezone);
        const workoutDateTime = DateTime.fromJSDate(workoutDate, { zone: user.timezone });
        const workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, workoutDateTime.toJSDate());
        if (!workout) return { success: false, messages: [], error: 'No workout found for that date' };

        const result = await agentRunner.invoke('workout:modify', {
          user,
          message: changeRequest,
          extras: { workout },
        });
        const modifiedWorkout: ModifyWorkoutOutput = {
          response: result.response as { overview: string; wasModified: boolean; modifications: string },
          message: normalizeWhitespace((result as Record<string, unknown>).message as string),
          structure: (result as Record<string, unknown>).structure as WorkoutStructure,
        };

        // Resolve exercise names to canonical IDs (prevents fake LLM-generated exerciseIds)
        if (modifiedWorkout.structure && exerciseResolution) {
          await resolveExercisesInStructure(
            modifiedWorkout.structure,
            exerciseResolution,
            exerciseUse,
            userId
          );
        }

        const updated = await workoutInstanceService.updateWorkout(workout.id, {
          description: modifiedWorkout.response.overview,
          structured: modifiedWorkout.structure,
          message: modifiedWorkout.message,
        });
        if (!updated) return { success: false, messages: [], error: 'Failed to update workout' };

        const messages: string[] = [];
        if (workoutDateTime.hasSame(today, 'day')) messages.push(modifiedWorkout.message);

        return { success: true, workout: modifiedWorkout, modifications: modifiedWorkout.response.modifications, messages };
      } catch (error) {
        console.error('Error modifying workout:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },

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

        const messages: string[] = [];
        const currentDayOfWeek = getDayOfWeek(today.toJSDate(), user.timezone);
        const isTargetDayToday = targetDay === currentDayOfWeek;

        // STEP 1: Generate new workout FIRST (prioritize immediate user feedback)
        console.log('[MODIFY_WEEK] Generating new workout for target day (PRIORITY)');
        const targetDayIndex = DAY_NAMES.indexOf(targetDay as typeof DAY_NAMES[number]);
        const targetDate = today.startOf('week').plus({ days: targetDayIndex });

        // Get preliminary day overview from current microcycle for workout generation
        const preliminaryDayOverview = microcycle.days[targetDayIndex] || 'Rest or active recovery';

        // Infer what the new activity type should be based on the change request
        const inferredActivityType = inferActivityTypeFromRequest(changeRequest);
        const activityType = inferredActivityType ||
          (microcycle.structured?.days?.[targetDayIndex]?.activityType as 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | undefined);

        let workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, targetDate.toJSDate());
        let workoutMessage: string | undefined;

        // Generate workout with inferred day overview based on change request
        const inferredDayOverview = inferDayOverviewFromRequest(changeRequest, preliminaryDayOverview);

        if (!workout) {
          console.log('[MODIFY_WEEK] No existing workout found, generating new one');
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, targetDate);
          if (generatedWorkout) {
            workout = generatedWorkout;
            workoutMessage = generatedWorkout.message ?? undefined;
          }
        } else {
          console.log('[MODIFY_WEEK] Regenerating existing workout with requested changes');
          const wkResult = await agentRunner.invoke('workout:generate', {
            user,
            extras: {
              dayOverview: inferredDayOverview,
              isDeload: microcycle.isDeload,
              activityType,
              snippetType: SnippetType.WORKOUT,
            },
          });
          const wkDescription = wkResult.response as string;
          const wkMessage = normalizeWhitespace((wkResult as Record<string, unknown>).message as string);
          const wkStructure = (wkResult as Record<string, unknown>).structure as WorkoutStructure | undefined;

          // Resolve exercise names to canonical IDs (prevents fake LLM-generated exerciseIds)
          if (wkStructure && exerciseResolution) {
            await resolveExercisesInStructure(
              wkStructure,
              exerciseResolution,
              exerciseUse,
              userId
            );
          }

          await workoutInstanceService.updateWorkout(workout.id, {
            goal: inferredDayOverview,
            description: wkDescription,
            structured: wkStructure ?? undefined,
            message: wkMessage,
            sessionType: getWorkoutTypeFromTheme(inferredDayOverview),
          });
          workoutMessage = wkMessage;
        }

        // Send workout message immediately if it's for today
        if (isTargetDayToday && workoutMessage) {
          messages.push(workoutMessage);
        }

        // STEP 2: Now modify the microcycle (this can take longer)
        console.log('[MODIFY_WEEK] Modifying microcycle for week-level changes', { microcycleId: microcycle.id, absoluteWeek: microcycle.absoluteWeek });
        const fullChangeRequest = `For ${targetDay}: ${changeRequest}`;
        const mcResult = await agentRunner.invoke('microcycle:modify', {
          user,
          message: fullChangeRequest,
          extras: { microcycle, absoluteWeek: microcycle.absoluteWeek },
        });
        const mcResponse = mcResult.response as { overview: string; days: string[]; isDeload: boolean; wasModified: boolean; modifications: string };
        const modifiedMicrocycle = {
          days: mcResponse.days,
          description: mcResponse.overview,
          isDeload: mcResponse.isDeload,
          message: normalizeWhitespace((mcResult as Record<string, unknown>).message as string),
          structure: (mcResult as Record<string, unknown>).structure as MicrocycleStructure | undefined,
          wasModified: mcResponse.wasModified,
          modifications: mcResponse.modifications,
        };

        const updatedMicrocycle = await microcycleService.updateMicrocycle(microcycle.id, {
          days: modifiedMicrocycle.days,
          description: modifiedMicrocycle.description,
          isDeload: modifiedMicrocycle.isDeload,
          structured: modifiedMicrocycle.structure,
        });
        if (!updatedMicrocycle) return { success: false, messages, error: 'Failed to update microcycle' };

        // STEP 3: Generate week summary message (only if it's for today)
        if (isTargetDayToday && modifiedMicrocycle.wasModified) {
          const weekSummary = generateWeekSummary(modifiedMicrocycle.days, targetDay, currentDayOfWeek);
          if (weekSummary) {
            messages.push(weekSummary);
          }
        }

        console.log('[MODIFY_WEEK] Week modification complete');
        return { success: true, modifiedDays: 1, modifications: modifiedMicrocycle.modifications, messages };
      } catch (error) {
        console.error('[MODIFY_WEEK] Error modifying week:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}

