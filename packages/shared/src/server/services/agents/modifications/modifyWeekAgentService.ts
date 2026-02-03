import {
  createWorkoutAgentService,
  createMicrocycleAgentService,
  type WorkoutAgentService,
  type MicrocycleAgentService,
} from '../training';
import type { ContextService } from '../../context/contextService';
import type { UserWithProfile } from '@/server/models/user';
import type { Microcycle, MicrocycleStructure } from '@/server/models/microcycle';
import type { WorkoutStructure } from '@/server/models/workout';
import type { ActivityType } from '@/shared/types/microcycle/schema';
import type { EventLogRepository } from '@/server/repositories/eventLogRepository';

/**
 * Output from modifyWeek operation
 */
export interface ModifyWeekOutput {
  /** Microcycle modification results */
  microcycle: {
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
    wasModified: boolean;
    modifications: string;
  };
  /** Workout generation results for the target day */
  workout: {
    response: string;
    message: string;
    structure: WorkoutStructure;
  };
}

/**
 * Options for modifyWeek operation
 */
export interface ModifyWeekOptions {
  /**
   * Callback fired when microcycle message is ready (fire-and-forget).
   * Use for progressive message delivery.
   */
  onMicrocycleMessage?: (message: string) => void | Promise<void>;
  /**
   * Callback fired when workout message is ready (fire-and-forget).
   * Use for progressive message delivery.
   */
  onWorkoutMessage?: (message: string) => void | Promise<void>;
}

/**
 * ModifyWeekAgentService - Orchestrates week modifications with progressive message delivery
 *
 * This service composes microcycle and workout agents to modify a user's week plan
 * while firing callbacks as soon as each message is ready, reducing perceived latency.
 *
 * Flow:
 * 1. Microcycle agent modifies the week pattern
 *    - message sub-agent fires onMicrocycleMessage callback immediately when ready
 *    - structure sub-agent runs in parallel
 * 2. Workout agent generates the workout for the target day
 *    - message sub-agent fires onWorkoutMessage callback immediately when ready
 *    - structure sub-agent runs in parallel
 *
 * @example
 * ```typescript
 * const service = createModifyWeekAgentService(contextService);
 * const result = await service.modifyWeek(user, microcycle, targetDayIndex, changeRequest, {
 *   onMicrocycleMessage: (msg) => sendToUser(msg),
 *   onWorkoutMessage: (msg) => sendToUser(msg),
 * });
 * ```
 */
export class ModifyWeekAgentService {
  private contextService: ContextService;
  private eventLogRepo?: EventLogRepository;
  private workoutAgent: WorkoutAgentService | null = null;
  private microcycleAgent: MicrocycleAgentService | null = null;

  constructor(contextService: ContextService, eventLogRepo?: EventLogRepository) {
    this.contextService = contextService;
    this.eventLogRepo = eventLogRepo;
  }

  private getWorkoutAgent(): WorkoutAgentService {
    if (!this.workoutAgent) {
      this.workoutAgent = createWorkoutAgentService(this.contextService, this.eventLogRepo);
    }
    return this.workoutAgent;
  }

  private getMicrocycleAgent(): MicrocycleAgentService {
    if (!this.microcycleAgent) {
      this.microcycleAgent = createMicrocycleAgentService(this.contextService);
    }
    return this.microcycleAgent;
  }

  /**
   * Modify a week's training pattern and generate the workout for a target day
   *
   * This method orchestrates the modification with progressive message delivery:
   * 1. Modifies the microcycle, calling onMicrocycleMessage when the message is ready
   * 2. Generates the workout for the target day, calling onWorkoutMessage when ready
   *
   * @param user - User with profile
   * @param currentMicrocycle - Current microcycle to modify
   * @param targetDayIndex - Index of the target day (0-6, Monday-Sunday)
   * @param changeRequest - User's modification request
   * @param options - Optional callbacks for progressive message delivery
   * @returns Combined modification results
   */
  async modifyWeek(
    user: UserWithProfile,
    currentMicrocycle: Microcycle,
    targetDayIndex: number,
    changeRequest: string,
    options?: ModifyWeekOptions
  ): Promise<ModifyWeekOutput> {
    const startTime = Date.now();
    console.log('[ModifyWeekAgentService] Starting week modification');

    // Step 1: Modify the microcycle
    // The microcycle agent internally uses sub-agents with our callback pattern
    const microcycleResult = await this.getMicrocycleAgent().modifyMicrocycle(
      user,
      currentMicrocycle,
      changeRequest
    );

    // Fire microcycle message callback (fire-and-forget)
    if (options?.onMicrocycleMessage && microcycleResult.message) {
      Promise.resolve(options.onMicrocycleMessage(microcycleResult.message)).catch((e) =>
        console.error('[ModifyWeekAgentService] onMicrocycleMessage callback failed:', e)
      );
    }

    console.log(`[ModifyWeekAgentService] Microcycle modified in ${Date.now() - startTime}ms`);

    // Step 2: Generate workout for the target day
    const workoutStartTime = Date.now();
    const dayOverview = microcycleResult.days[targetDayIndex] || 'Rest or active recovery';
    const activityType = microcycleResult.structure?.days?.[targetDayIndex]?.activityType as ActivityType | undefined;

    const workoutResult = await this.getWorkoutAgent().generateWorkout(
      user,
      dayOverview,
      microcycleResult.isDeload,
      activityType
    );

    // Fire workout message callback (fire-and-forget)
    if (options?.onWorkoutMessage && workoutResult.message) {
      Promise.resolve(options.onWorkoutMessage(workoutResult.message)).catch((e) =>
        console.error('[ModifyWeekAgentService] onWorkoutMessage callback failed:', e)
      );
    }

    console.log(`[ModifyWeekAgentService] Workout generated in ${Date.now() - workoutStartTime}ms`);
    console.log(`[ModifyWeekAgentService] Total modification time: ${Date.now() - startTime}ms`);

    return {
      microcycle: microcycleResult,
      workout: workoutResult,
    };
  }
}

/**
 * Factory function to create a ModifyWeekAgentService instance
 *
 * @param contextService - ContextService for building agent context
 * @param eventLogRepo - Optional EventLogRepository for logging
 * @returns A new ModifyWeekAgentService instance
 */
export function createModifyWeekAgentService(
  contextService: ContextService,
  eventLogRepo?: EventLogRepository
): ModifyWeekAgentService {
  return new ModifyWeekAgentService(contextService, eventLogRepo);
}

/**
 * Instance type for ModifyWeekAgentService
 */
export type ModifyWeekAgentServiceInstance = ModifyWeekAgentService;
