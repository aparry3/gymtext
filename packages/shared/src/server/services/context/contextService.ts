import type { UserWithProfile } from '@/server/models';
import type { FitnessPlanServiceInstance } from '@/server/services/domain/training/fitnessPlanService';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { FitnessProfileServiceInstance } from '@/server/services/domain/user/fitnessProfileService';
import type { EnrollmentServiceInstance } from '@/server/services/domain/program/enrollmentService';
import type { ExerciseRepository } from '@/server/repositories/exerciseRepository';
import { ContextType, type ContextExtras, type ResolvedContextData } from './types';
import { SnippetType } from './builders/experienceLevel';
import * as builders from './builders';
import { today } from '@/shared/utils/date';

/**
 * Dependencies for ContextService
 * Uses the new instance types from the factory pattern
 */
export interface ContextServiceDeps {
  fitnessPlanService: FitnessPlanServiceInstance;
  workoutInstanceService: WorkoutInstanceServiceInstance;
  microcycleService: MicrocycleServiceInstance;
  fitnessProfileService: FitnessProfileServiceInstance;
  enrollmentService: EnrollmentServiceInstance;
  exerciseRepo?: ExerciseRepository;
}

/**
 * ContextService - Builds context arrays for createAgent
 *
 * Orchestrates fetching context data from domain services and formats
 * it into strings for the agent's context array.
 *
 * @example
 * ```typescript
 * // Create via factory function with injected services
 * const contextService = createContextService({
 *   fitnessPlanService: services.fitnessPlan,
 *   workoutInstanceService: services.workoutInstance,
 *   microcycleService: services.microcycle,
 *   fitnessProfileService: services.fitnessProfile,
 * });
 *
 * const context = await contextService.getContext(
 *   user,
 *   [ContextType.USER_PROFILE, ContextType.DAY_OVERVIEW, ContextType.TRAINING_META],
 *   { dayOverview: input.dayOverview, isDeload: input.isDeload }
 * );
 * ```
 */
export class ContextService {
  private deps: ContextServiceDeps;

  constructor(deps: ContextServiceDeps) {
    this.deps = deps;
  }

  /**
   * Build context array for createAgent
   *
   * Determines which services need to be called based on requested context types,
   * fetches data in parallel, and builds formatted context strings.
   *
   * @param user - User with profile
   * @param types - Array of context types to include
   * @param extras - Optional caller-provided data (supplements/overrides auto-fetched data)
   * @returns Array of formatted context strings ready for createAgent
   */
  async getContext(
    user: UserWithProfile,
    types: ContextType[],
    extras: ContextExtras = {}
  ): Promise<string[]> {
    // Determine which services need to be called
    const needsFitnessPlan = types.includes(ContextType.FITNESS_PLAN) && !extras.planText;
    const needsWorkout = types.includes(ContextType.CURRENT_WORKOUT) && extras.workout === undefined;
    const needsMicrocycle = types.includes(ContextType.CURRENT_MICROCYCLE) && extras.microcycle === undefined;
    const needsExperienceLevel = types.includes(ContextType.EXPERIENCE_LEVEL) && extras.experienceLevel === undefined;
    const needsDayFormat = types.includes(ContextType.DAY_FORMAT) && extras.activityType !== undefined;
    const needsExperienceSnippet = types.includes(ContextType.EXPERIENCE_LEVEL);
    const needsProgramVersion = types.includes(ContextType.PROGRAM_VERSION);
    const needsExercises = types.includes(ContextType.AVAILABLE_EXERCISES) && !!this.deps.exerciseRepo;

    // Fetch required data in parallel (phase 1: data that doesn't depend on other fetches)
    const targetDate = extras.date || today(user.timezone);
    const [fitnessPlan, workout, microcycle, structuredProfile, dayFormatTemplate, enrollmentWithVersion, exercises] = await Promise.all([
      needsFitnessPlan ? this.deps.fitnessPlanService.getCurrentPlan(user.id) : null,
      needsWorkout ? this.deps.workoutInstanceService.getWorkoutByUserIdAndDate(user.id, targetDate) : null,
      needsMicrocycle ? this.deps.microcycleService.getMicrocycleByDate(user.id, targetDate) : null,
      needsExperienceLevel ? this.deps.fitnessProfileService.getCurrentStructuredProfile(user.id) : null,
      needsDayFormat ? builders.fetchDayFormat(extras.activityType) : null,
      needsProgramVersion ? this.deps.enrollmentService.getEnrollmentWithProgramVersion(user.id) : null,
      needsExercises ? this.deps.exerciseRepo!.listActiveNames() : null,
    ]);

    // Resolve experience level (needed for experience snippet fetch)
    const resolvedExperienceLevel = extras.experienceLevel ?? structuredProfile?.experienceLevel ?? null;
    const resolvedSnippetType = extras.snippetType || SnippetType.WORKOUT;

    // Phase 2: fetch experience snippet (depends on resolved experience level)
    const experienceSnippet = needsExperienceSnippet && resolvedExperienceLevel
      ? await builders.fetchExperienceLevelSnippet(resolvedExperienceLevel, resolvedSnippetType)
      : null;

    // Build resolved data object
    const data: ResolvedContextData = {
      userName: user.name,
      userGender: user.gender,
      userAge: user.age,
      profile: user.profile,
      planText: extras.planText ?? fitnessPlan?.description,
      dayOverview: extras.dayOverview,
      workout: extras.workout ?? workout,
      microcycle: extras.microcycle ?? microcycle,
      timezone: user.timezone || 'America/New_York',
      date: targetDate,
      isDeload: extras.isDeload,
      absoluteWeek: extras.absoluteWeek,
      currentWeek: extras.currentWeek,
      experienceLevel: resolvedExperienceLevel,
      snippetType: resolvedSnippetType,
      activityType: extras.activityType,
      dayFormatTemplate: dayFormatTemplate,
      experienceSnippet: experienceSnippet,
      programVersion: enrollmentWithVersion?.programVersion ?? null,
      exercises: exercises ?? undefined,
    };

    // Build context strings for each requested type
    return types
      .map(type => this.buildContextForType(type, data))
      .filter(ctx => ctx && ctx.trim().length > 0);
  }

  /**
   * Build a single context string by type
   */
  private buildContextForType(type: ContextType, data: ResolvedContextData): string {
    switch (type) {
      case ContextType.USER:
        return builders.buildUserContext({ name: data.userName, gender: data.userGender, age: data.userAge });
      case ContextType.USER_PROFILE:
        return builders.buildUserProfileContext(data.profile);
      case ContextType.FITNESS_PLAN:
        return builders.buildFitnessPlanContext(data.planText);
      case ContextType.DAY_OVERVIEW:
        return builders.buildDayOverviewContext(data.dayOverview);
      case ContextType.CURRENT_WORKOUT:
        return builders.buildWorkoutContext(data.workout);
      case ContextType.DATE_CONTEXT:
        return builders.buildDateContext(data.timezone, data.date);
      case ContextType.TRAINING_META:
        return builders.buildTrainingMetaContext({
          isDeload: data.isDeload,
          absoluteWeek: data.absoluteWeek,
          currentWeek: data.currentWeek,
        });
      case ContextType.CURRENT_MICROCYCLE:
        return builders.buildMicrocycleContext(data.microcycle);
      case ContextType.EXPERIENCE_LEVEL:
        return builders.buildExperienceLevelContext(
          data.experienceSnippet,
          data.experienceLevel,
          data.snippetType || SnippetType.WORKOUT
        );
      case ContextType.DAY_FORMAT:
        return builders.buildDayFormatContext(data.dayFormatTemplate, data.activityType);
      case ContextType.PROGRAM_VERSION:
        return builders.buildProgramVersionContext(data.programVersion);
      case ContextType.AVAILABLE_EXERCISES:
        return builders.buildExercisesContext(data.exercises);
      default:
        return '';
    }
  }
}

/**
 * Factory function to create a ContextService instance
 *
 * @param deps - Service dependencies for context building
 * @returns A new ContextService instance
 */
export function createContextService(deps: ContextServiceDeps): ContextService {
  return new ContextService(deps);
}
