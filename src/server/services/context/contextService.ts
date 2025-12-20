import type { UserWithProfile } from '@/server/models';
import type { FitnessPlanService } from '@/server/services/training/fitnessPlanService';
import type { WorkoutInstanceService } from '@/server/services/training/workoutInstanceService';
import type { MicrocycleService } from '@/server/services/training/microcycleService';
import type { ProfileRepository } from '@/server/repositories/profileRepository';
import { ContextType, type ContextExtras, type ResolvedContextData } from './types';
import { SnippetType } from './builders/experienceLevel';
import * as builders from './builders';
import { now } from '@/shared/utils/date';

/**
 * Dependencies for ContextService
 */
export interface ContextServiceDeps {
  fitnessPlanService: FitnessPlanService;
  workoutInstanceService: WorkoutInstanceService;
  microcycleService: MicrocycleService;
  profileRepository: ProfileRepository;
}

/**
 * ContextService - Builds context arrays for createAgent
 *
 * Orchestrates fetching context data from domain services and formats
 * it into strings for the agent's context array.
 *
 * @example
 * ```typescript
 * const context = await contextService.getContext(
 *   user,
 *   [ContextType.USER_PROFILE, ContextType.DAY_OVERVIEW, ContextType.TRAINING_META],
 *   { dayOverview: input.dayOverview, isDeload: input.isDeload }
 * );
 *
 * const agent = createAgent({
 *   name: 'workout-generate',
 *   systemPrompt: SYSTEM_PROMPT,
 *   context,
 * }, config);
 * ```
 */
export class ContextService {
  private static instance: ContextService;
  private deps: ContextServiceDeps;

  private constructor(deps: ContextServiceDeps) {
    this.deps = deps;
  }

  /**
   * Initialize the singleton with dependencies
   * Must be called before getInstance()
   */
  public static initialize(deps: ContextServiceDeps): ContextService {
    if (!ContextService.instance) {
      ContextService.instance = new ContextService(deps);
    }
    return ContextService.instance;
  }

  /**
   * Get the singleton instance
   * Throws if not initialized
   */
  public static getInstance(): ContextService {
    if (!ContextService.instance) {
      throw new Error('ContextService not initialized. Call initialize() first.');
    }
    return ContextService.instance;
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

    // Fetch required data in parallel
    const targetDate = extras.date || now(user.timezone).startOf('day').toJSDate();
    const [fitnessPlan, workout, microcycle, structuredProfile] = await Promise.all([
      needsFitnessPlan ? this.deps.fitnessPlanService.getCurrentPlan(user.id) : null,
      needsWorkout ? this.deps.workoutInstanceService.getWorkoutByUserIdAndDate(user.id, targetDate) : null,
      needsMicrocycle ? this.deps.microcycleService.getMicrocycleByDate(user.id, targetDate) : null,
      needsExperienceLevel ? this.deps.profileRepository.getCurrentStructuredProfile(user.id) : null,
    ]);

    // Build resolved data object
    const data: ResolvedContextData = {
      userName: user.name,
      userGender: user.gender,
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
      experienceLevel: extras.experienceLevel ?? structuredProfile?.experienceLevel ?? null,
      snippetType: extras.snippetType,
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
        return builders.buildUserContext({ name: data.userName, gender: data.userGender });
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
          data.experienceLevel,
          data.snippetType || SnippetType.WORKOUT
        );
      default:
        return '';
    }
  }
}
