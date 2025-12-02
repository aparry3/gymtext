import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import type { WorkoutInstance } from '@/server/models';
import { WorkoutModificationService } from './workoutModificationService';
import { PlanModificationService } from './planModificationService';
import { createModificationsAgent } from '@/server/agents/modifications';

/**
 * Parameters for making a modification via the modifications agent
 */
export interface MakeModificationParams {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
  currentWorkout?: WorkoutInstance;
  workoutDate: Date;
  targetDay: string;
}

/**
 * Result from the modification service
 */
export interface MakeModificationResult {
  success: boolean;
  messages: string[];
  error?: string;
}

/**
 * ModificationService
 *
 * Orchestration service that wraps the modifications agent.
 * Acts as the entry point for all user modification requests.
 *
 * Responsibilities:
 * - Create and invoke the modifications agent with proper dependencies
 * - Transform agent results into service results
 * - Handle errors gracefully
 *
 * The modifications agent internally chooses which specific modification
 * (workout, week, or plan) to perform based on the user's request.
 */
export class ModificationService {
  private static instance: ModificationService;

  private workoutModificationService: WorkoutModificationService;
  private planModificationService: PlanModificationService;

  private constructor() {
    this.workoutModificationService = WorkoutModificationService.getInstance();
    this.planModificationService = PlanModificationService.getInstance();
  }

  public static getInstance(): ModificationService {
    if (!ModificationService.instance) {
      ModificationService.instance = new ModificationService();
    }
    return ModificationService.instance;
  }

  /**
   * Process a modification request from the user
   *
   * Creates the modifications agent with service dependencies,
   * invokes it, and returns the result.
   *
   * @param params - The modification parameters including user context
   * @returns Result with success status and messages to send
   */
  public async makeModification(params: MakeModificationParams): Promise<MakeModificationResult> {
    const { user, message, previousMessages, currentWorkout, workoutDate, targetDay } = params;

    console.log('[MODIFICATION_SERVICE] Processing modification request:', {
      userId: user.id,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      targetDay,
      workoutDate: workoutDate.toISOString(),
    });

    try {
      // Create the modifications agent with service dependencies
      const agent = createModificationsAgent({
        modifyWorkout: this.workoutModificationService.modifyWorkout.bind(this.workoutModificationService),
        modifyWeek: this.workoutModificationService.modifyWeek.bind(this.workoutModificationService),
        modifyPlan: this.planModificationService.modifyPlan.bind(this.planModificationService),
      });

      // Invoke the agent
      const result = await agent.invoke({
        user,
        message,
        previousMessages,
        currentWorkout,
        workoutDate,
        targetDay,
      });

      console.log('[MODIFICATION_SERVICE] Agent returned:', {
        messageCount: result.messages.length,
      });

      return {
        success: true,
        messages: result.messages,
      };
    } catch (error) {
      console.error('[MODIFICATION_SERVICE] Error processing modification:', error);

      return {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Export singleton instance
export const modificationService = ModificationService.getInstance();
