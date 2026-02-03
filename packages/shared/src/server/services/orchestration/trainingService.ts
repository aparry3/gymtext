/**
 * TrainingService
 *
 * Orchestrates training-related workflows including workout generation,
 * microcycle creation, and coordination between domain services and AI agents.
 *
 * This service follows the orchestration pattern - it coordinates between
 * domain services (CRUD) and agent services (AI) without doing either directly.
 */
import { DateTime } from 'luxon';
import { getWeekday, getDayOfWeekName } from '@/shared/utils/date';
import { normalizeWhitespace } from '@/server/utils/formatters';
import { isMessageTooLong, getSmsMaxLength } from '@/server/utils/smsValidation';
import type { UserWithProfile } from '@/server/models/user';
import { FitnessPlanModel, type FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle, ActivityType } from '@/server/models/microcycle';
import type { WorkoutInstance, NewWorkoutInstance } from '@/server/models/workout';
import type { ProgressInfo } from '../domain/training/progressService';

// Domain services
import type { UserServiceInstance } from '../domain/user/userService';
import type { FitnessPlanServiceInstance } from '../domain/training/fitnessPlanService';
import type { ProgressServiceInstance } from '../domain/training/progressService';
import type { MicrocycleServiceInstance } from '../domain/training/microcycleService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { ShortLinkServiceInstance } from '../domain/links/shortLinkService';

// Program domain services
import type { EnrollmentServiceInstance } from '../domain/program/enrollmentService';
import type { ProgramServiceInstance } from '../domain/program/programService';
import type { ProgramOwnerServiceInstance } from '../domain/program/programOwnerService';

// Agent services
import type { WorkoutAgentService } from '../agents/training/workoutAgentService';
import type { MicrocycleAgentService } from '../agents/training/microcycleAgentService';
import type { FitnessPlanAgentService } from '../agents/training/fitnessPlanAgentService';

// Exercise resolution
import type { ExerciseResolutionServiceInstance } from '../domain/exercise/exerciseResolutionService';
import type { ExerciseUseRepository } from '@/server/repositories/exerciseUseRepository';

// Workout structure types
import type { WorkoutStructure } from '@/server/models/workout';

// =============================================================================
// Exported Helpers
// =============================================================================

/**
 * Resolve exercise names in a workout structure to canonical IDs
 * Extracted as a reusable function for use by trainingService and workoutModificationService
 *
 * @param structure - The workout structure containing exercises to resolve
 * @param exerciseResolution - The exercise resolution service instance
 * @param exerciseUse - Optional exercise use repository for tracking usage
 * @param userId - Optional user ID for tracking exercise usage
 */
export async function resolveExercisesInStructure(
  structure: WorkoutStructure,
  exerciseResolution: ExerciseResolutionServiceInstance,
  exerciseUse?: ExerciseUseRepository,
  userId?: string
): Promise<void> {
  if (!structure?.sections) return;

  for (const section of structure.sections) {
    for (const activity of section.exercises) {
      try {
        const result = await exerciseResolution.resolve(activity.name, {
          learnAlias: true,
          aliasSource: 'ai',
        });
        if (result) {
          activity.nameRaw = activity.name;
          activity.name = result.exercise.name;
          activity.exerciseId = result.exercise.id;
          activity.resolution = {
            method: result.method === 'exact' || result.method === 'exact_lex' ? 'exact' : 'fuzzy',
            confidence: result.confidence,
            version: 1,
          };
          // Track exercise usage for popularity scoring
          if (exerciseUse && userId) {
            exerciseUse.trackUse(result.exercise.id, userId, 'workout').catch(() => {});
          }
        } else {
          // Clear any LLM-generated fake IDs and mark as unresolved
          activity.nameRaw = activity.name;
          activity.exerciseId = null;
          activity.resolution = {
            method: 'unresolved',
            confidence: 0,
            version: 1,
          };
        }
      } catch (err) {
        console.warn(`[TrainingService] Exercise resolution failed for "${activity.name}":`, err);
        // Clear any LLM-generated fake IDs on error
        activity.nameRaw = activity.name;
        activity.exerciseId = null;
        activity.resolution = {
          method: 'unresolved',
          confidence: 0,
          version: 1,
        };
      }
    }
  }
}

// =============================================================================
// Types
// =============================================================================

export interface TrainingServiceInstance {
  /**
   * Generate a fitness plan for a user
   * Orchestrates: AI generation, database storage
   */
  createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan>;

  /**
   * Generate a workout for a specific date
   * Orchestrates: fitness plan lookup, progress calculation, microcycle creation, workout generation
   */
  prepareWorkoutForDate(
    user: UserWithProfile,
    targetDate: DateTime,
    providedMicrocycle?: Microcycle
  ): Promise<WorkoutInstance | null>;

  /**
   * Generate a microcycle for a specific date/week
   * Orchestrates: user lookup, progress calculation, AI generation, database storage
   */
  prepareMicrocycleForDate(
    userId: string,
    plan: FitnessPlan,
    targetDate: Date,
    timezone?: string
  ): Promise<{ microcycle: Microcycle; progress: ProgressInfo; wasCreated: boolean }>;

  /**
   * Regenerate a workout message with proper day format context
   * Used when a workout exists but needs a new/shorter message
   *
   * @param user - User with profile
   * @param workout - Existing workout instance
   * @returns The regenerated message (already saved to database)
   */
  regenerateWorkoutMessage(
    user: UserWithProfile,
    workout: WorkoutInstance
  ): Promise<string>;
}

export interface TrainingServiceDeps {
  // Domain services
  user: UserServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  progress: ProgressServiceInstance;
  microcycle: MicrocycleServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  shortLink: ShortLinkServiceInstance;

  // Program domain services
  enrollment: EnrollmentServiceInstance;
  program: ProgramServiceInstance;
  programOwner: ProgramOwnerServiceInstance;

  // Agent services
  workoutAgent: WorkoutAgentService;
  microcycleAgent: MicrocycleAgentService;
  fitnessPlanAgent: FitnessPlanAgentService;

  // Exercise resolution (optional — skipped if not provided)
  exerciseResolution?: ExerciseResolutionServiceInstance;
  exerciseUse?: ExerciseUseRepository;
}

// =============================================================================
// Factory
// =============================================================================

/**
 * Create a TrainingService instance with injected dependencies
 */
export function createTrainingService(deps: TrainingServiceDeps): TrainingServiceInstance {
  const {
    user: userService,
    fitnessPlan: fitnessPlanService,
    progress: progressService,
    microcycle: microcycleService,
    workoutInstance: workoutInstanceService,
    shortLink: shortLinkService,
    enrollment: enrollmentService,
    program: programService,
    programOwner: programOwnerService,
    workoutAgent,
    microcycleAgent,
    fitnessPlanAgent,
    exerciseResolution,
    exerciseUse,
  } = deps;

  return {
    async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
      console.log(`[TrainingService] Creating fitness plan for user ${user.id}`);

      // 1. Generate plan via AI agent
      const agentResponse = await fitnessPlanAgent.generateFitnessPlan(user);

      // 2. Create plan model from agent response
      const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse);
      console.log('[TrainingService] Generated plan:', fitnessPlan.description?.substring(0, 200));

      // 3. Save to database
      const savedPlan = await fitnessPlanService.insertPlan(fitnessPlan);
      console.log(`[TrainingService] Saved fitness plan ${savedPlan.id} for user ${user.id}`);

      return savedPlan;
    },

    async prepareWorkoutForDate(
      user: UserWithProfile,
      targetDate: DateTime,
      providedMicrocycle?: Microcycle
    ): Promise<WorkoutInstance | null> {
      try {
        // 1. Get enrollment and current fitness plan instance
        const enrollmentResult = await enrollmentService.getEnrollmentWithProgramVersion(user.id);
        if (!enrollmentResult) {
          console.log(`[TrainingService] No active enrollment for user ${user.id}`);
          return null;
        }

        let { enrollment, currentPlanInstance: plan } = enrollmentResult;

        // For AI programs without a version, generate one
        if (!plan) {
          const prog = await programService.getById(enrollment.programId);
          if (!prog) {
            console.log(`[TrainingService] Program not found: ${enrollment.programId}`);
            return null;
          }

          const owner = await programOwnerService.getById(prog.ownerId);
          if (!owner) {
            console.log(`[TrainingService] Program owner not found: ${prog.ownerId}`);
            return null;
          }

          if (owner.ownerType === 'ai') {
            console.log(`[TrainingService] AI program has no version, generating one for user ${user.id}`);
            plan = await this.createFitnessPlan(user);
          } else {
            console.log(`[TrainingService] Non-AI program has no version for user ${user.id}`);
            return null;
          }
        }

        // 2. Get progress for the target date
        const progress = await progressService.getProgressForDate(plan, targetDate.toJSDate(), user.timezone);
        if (!progress) {
          console.log(`[TrainingService] No progress found for user ${user.id} on ${targetDate.toISODate()}`);
          return null;
        }

        // 3. Get or create microcycle for the week
        let microcycle: Microcycle | null = providedMicrocycle ?? null;
        if (!microcycle) {
          const result = await this.prepareMicrocycleForDate(user.id, plan, targetDate.toJSDate(), user.timezone);
          microcycle = result.microcycle;
        }
        if (!microcycle) {
          console.log(`[TrainingService] Could not get/create microcycle for user ${user.id}`);
          return null;
        }

        // 4. Extract day overview from microcycle
        const dayIndex = getWeekday(targetDate.toJSDate(), user.timezone) - 1;
        const dayOverview = microcycle.days?.[dayIndex];

        if (!dayOverview || typeof dayOverview !== 'string') {
          console.log(`[TrainingService] No overview found for day index ${dayIndex} in microcycle ${microcycle.id}`);
          return null;
        }

        const structuredDay = microcycle.structured?.days?.[dayIndex];
        const activityType = structuredDay?.activityType as ActivityType | undefined;

        // 5. Generate workout via AI agent
        const { response: description, message, structure } = await workoutAgent.generateWorkout(
          user,
          dayOverview,
          microcycle.isDeload ?? false,
          activityType
        );

        const theme = structure?.title || 'Workout';
        const details = { theme };

        // 6. Create workout record (must happen before short link creation)
        const workoutData: NewWorkoutInstance = {
          clientId: user.id,
          microcycleId: microcycle.id,
          date: targetDate.toJSDate(),
          sessionType: 'workout',
          goal: dayOverview.substring(0, 100),
          details: JSON.parse(JSON.stringify(details)),
          description,
          message,
          structured: structure,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const savedWorkout = await workoutInstanceService.createWorkout(workoutData);
        console.log(`[TrainingService] Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);

        // 7. Parallelize: exercise resolution and short link creation
        // These are independent operations that can run concurrently
        const [, shortLinkResult] = await Promise.all([
          // 7a. Resolve exercise names to canonical IDs (fire-and-forget pattern for non-critical operation)
          structure && exerciseResolution
            ? resolveExercisesInStructure(structure, exerciseResolution, exerciseUse, user.id)
                .then(() => {
                  // Update workout with resolved exercises
                  return workoutInstanceService.updateWorkout(savedWorkout.id, {
                    structured: structure,
                  });
                })
                .catch(err => {
                  console.warn(`[TrainingService] Exercise resolution failed, continuing:`, err);
                })
            : Promise.resolve(),

          // 7b. Create short link
          shortLinkService.createWorkoutLink(user.id, savedWorkout.id)
            .then(shortLink => {
              const fullUrl = shortLinkService.getFullUrl(shortLink.code);
              console.log(`[TrainingService] Created short link for workout ${savedWorkout.id}: ${fullUrl}`);
              return { shortLink, fullUrl };
            })
            .catch(err => {
              console.error(`[TrainingService] Failed to create short link for workout ${savedWorkout.id}:`, err);
              return null;
            }),
        ]);

        // 8. Update message with short link if available
        if (shortLinkResult && savedWorkout.message) {
          const dayOfWeekTitle = getDayOfWeekName(targetDate.toJSDate(), user.timezone);
          savedWorkout.message = normalizeWhitespace(
            `${dayOfWeekTitle}\n\n${savedWorkout.message}\n\n(More details: ${shortLinkResult.fullUrl})`
          );
          await workoutInstanceService.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
        }

        return savedWorkout;
      } catch (error) {
        console.error(`[TrainingService] Error generating workout for user ${user.id}:`, error);
        throw error;
      }
    },

    async prepareMicrocycleForDate(
      userId: string,
      plan: FitnessPlan,
      targetDate: Date,
      timezone: string = 'America/New_York'
    ): Promise<{ microcycle: Microcycle; progress: ProgressInfo; wasCreated: boolean }> {
      // 1. Calculate progress for the date
      const progress = await progressService.getProgressForDate(plan, targetDate, timezone);
      if (!progress) {
        throw new Error(`[TrainingService] Could not calculate progress for date ${targetDate}`);
      }

      // 2. Check if microcycle already exists
      if (progress.microcycle) {
        return { microcycle: progress.microcycle, progress, wasCreated: false };
      }

      // 3. Get user for AI context
      const user = await userService.getUser(userId);
      if (!user) {
        throw new Error(`[TrainingService] User not found: ${userId}`);
      }

      // 4. Generate microcycle via AI agent
      const { days, description, isDeload, message, structure } = await microcycleAgent.generateMicrocycle(
        user,
        progress.absoluteWeek
      );

      // 5. Create microcycle record
      const microcycle = await microcycleService.createMicrocycle({
        clientId: userId,
        absoluteWeek: progress.absoluteWeek,
        days,
        description,
        isDeload,
        message,
        structured: structure,
        startDate: progress.weekStartDate,
        endDate: progress.weekEndDate,
        isActive: false,
      });

      console.log(
        `[TrainingService] Created microcycle for user ${userId}, week ${progress.absoluteWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`
      );

      return { microcycle, progress: { ...progress, microcycle }, wasCreated: true };
    },

    async regenerateWorkoutMessage(
      user: UserWithProfile,
      workout: WorkoutInstance
    ): Promise<string> {
      const MAX_REGENERATION_ATTEMPTS = 3;
      const maxLength = getSmsMaxLength();

      // 1. Get activityType from microcycle (same pattern as prepareWorkoutForDate)
      let activityType: ActivityType | undefined;

      if (workout.microcycleId) {
        const microcycle = await microcycleService.getMicrocycleById(workout.microcycleId);
        if (microcycle?.structured?.days) {
          const dayIndex = getWeekday(new Date(workout.date), user.timezone) - 1;
          activityType = microcycle.structured.days[dayIndex]?.activityType as ActivityType;
        }
      }

      // 2. Generate message, regenerating if too long
      let message: string = '';
      let attempt = 0;

      while (attempt < MAX_REGENERATION_ATTEMPTS) {
        attempt++;

        // Get message agent with proper context (will use default TRAINING if no activityType)
        const messageAgent = await workoutAgent.getMessageAgent(user, activityType);

        // Add length constraint on retry attempts
        const input = attempt === 1
          ? workout.description || ''
          : `${workout.description}\n\nIMPORTANT: Keep the message under ${maxLength} characters. Be more concise.`;

        const result = await messageAgent.invoke(input);
        message = result.response;

        if (!isMessageTooLong(message)) {
          console.log(`[TrainingService] Message generated successfully on attempt ${attempt} (${message.length} chars)`);
          break;
        }

        console.warn(`[TrainingService] Message too long on attempt ${attempt} (${message.length} chars), regenerating...`);
      }

      // 3. Final check - if still too long after max attempts, throw error
      if (isMessageTooLong(message)) {
        throw new Error(`Failed to generate message under ${maxLength} chars after ${MAX_REGENERATION_ATTEMPTS} attempts`);
      }

      // 4. Save the regenerated message
      await workoutInstanceService.updateWorkoutMessage(workout.id, message);

      return message;
    },
  };
}
