import {
  createWorkoutAgentService,
  createMicrocycleAgentService,
  type WorkoutAgentService,
  type MicrocycleAgentService,
} from '../training';
import type { ModifyWorkoutOutput, WorkoutGenerateOutput } from '@/server/services/agents/types/workouts';
import { now, getDayOfWeek, DAY_NAMES } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { MicrocycleServiceInstance } from '../../domain/training/microcycleService';
import type { WorkoutInstanceServiceInstance } from '../../domain/training/workoutInstanceService';
import type { FitnessPlanServiceInstance } from '../../domain/training/fitnessPlanService';
import { resolveExercisesInStructure, type TrainingServiceInstance } from '../../orchestration/trainingService';
import type { ContextService } from '../../context/contextService';
import type { ExerciseResolutionServiceInstance } from '../../domain/exercise/exerciseResolutionService';
import type { ExerciseUseRepository } from '@/server/repositories/exerciseUseRepository';
import type { AgentDefinitionServiceInstance } from '../../domain/agents/agentDefinitionService';

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
  contextService: ContextService;
  agentDefinition: AgentDefinitionServiceInstance;
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
    contextService,
    agentDefinition: agentDefinitionService,
    exerciseResolution,
    exerciseUse,
  } = deps;

  let workoutAgent: WorkoutAgentService | null = null;
  let microcycleAgent: MicrocycleAgentService | null = null;

  const getWorkoutAgent = (): WorkoutAgentService => {
    if (!workoutAgent) workoutAgent = createWorkoutAgentService(contextService, undefined, agentDefinitionService);
    return workoutAgent;
  };

  const getMicrocycleAgent = (): MicrocycleAgentService => {
    if (!microcycleAgent) microcycleAgent = createMicrocycleAgentService(contextService, agentDefinitionService);
    return microcycleAgent;
  };

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

        const modifiedWorkout = await getWorkoutAgent().modifyWorkout(user, workout, changeRequest);

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

        console.log('[MODIFY_WEEK] Modifying microcycle', { microcycleId: microcycle.id, absoluteWeek: microcycle.absoluteWeek });
        // Combine targetDay into the change request for the agent
        const fullChangeRequest = `For ${targetDay}: ${changeRequest}`;
        const modifiedMicrocycle = await getMicrocycleAgent().modifyMicrocycle(user, microcycle, fullChangeRequest);

        const updatedMicrocycle = await microcycleService.updateMicrocycle(microcycle.id, {
          days: modifiedMicrocycle.days,
          description: modifiedMicrocycle.description,
          isDeload: modifiedMicrocycle.isDeload,
          structured: modifiedMicrocycle.structure,
        });
        if (!updatedMicrocycle) return { success: false, messages: [], error: 'Failed to update microcycle' };

        console.log('[MODIFY_WEEK] Generating new workout for target day');
        const targetDayIndex = DAY_NAMES.indexOf(targetDay as typeof DAY_NAMES[number]);
        const dayOverview = modifiedMicrocycle.days[targetDayIndex] || 'Rest or active recovery';

        const targetDate = today.startOf('week').plus({ days: targetDayIndex });
        let workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, targetDate.toJSDate());

        const activityType = modifiedMicrocycle.structure?.days?.[targetDayIndex]?.activityType as 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | undefined;

        let workoutMessage: string | undefined;

        if (!workout) {
          console.log('[MODIFY_WEEK] No existing workout found, generating new one');
          const generatedWorkout = await trainingService.prepareWorkoutForDate(user, targetDate);
          if (generatedWorkout) {
            workout = generatedWorkout;
            workoutMessage = generatedWorkout.message ?? undefined;
          }
        } else {
          console.log('[MODIFY_WEEK] Regenerating existing workout');
          const workoutResult = await getWorkoutAgent().generateWorkout(user, dayOverview, modifiedMicrocycle.isDeload, activityType);

          // Resolve exercise names to canonical IDs (prevents fake LLM-generated exerciseIds)
          if (workoutResult.structure && exerciseResolution) {
            await resolveExercisesInStructure(
              workoutResult.structure,
              exerciseResolution,
              exerciseUse,
              userId
            );
          }

          await workoutInstanceService.updateWorkout(workout.id, {
            goal: dayOverview,
            description: workoutResult.response,
            structured: workoutResult.structure ?? undefined,
            message: workoutResult.message,
            sessionType: getWorkoutTypeFromTheme(dayOverview),
          });
          workoutMessage = workoutResult.message;
        }

        const messages: string[] = [];
        const currentDayOfWeek = getDayOfWeek(today.toJSDate(), user.timezone);
        if (targetDay === currentDayOfWeek && workoutMessage) messages.push(workoutMessage);

        console.log('[MODIFY_WEEK] Week modification complete');
        return { success: true, modifiedDays: 1, modifications: modifiedMicrocycle.modifications, messages };
      } catch (error) {
        console.error('[MODIFY_WEEK] Error modifying week:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}

