import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Message } from '@/server/models/conversation';
import type { DayOfWeek } from '@/shared/utils/date';
import type { MicrocycleGenerationOutput } from '@/server/services/agents/prompts/microcycles';
/**
 * MessagingAgentService - Handles all messaging-related AI operations
 *
 * Responsibilities:
 * - Welcome messages for new users
 * - Weekly check-in messages
 * - Plan summary messages
 * - Plan ready (combined plan + microcycle) messages
 * - Updated microcycle messages
 *
 * @example
 * ```typescript
 * const message = await messagingAgentService.generateWelcomeMessage(user);
 * ```
 */
export declare class MessagingAgentService {
    private static instance;
    private constructor();
    static getInstance(): MessagingAgentService;
    /**
     * Generate a welcome message for a new user
     * Uses a static template - no LLM needed
     */
    generateWelcomeMessage(user: UserWithProfile): Promise<string>;
    /**
     * Generate a weekly check-in message asking for feedback
     */
    generateWeeklyMessage(user: UserWithProfile, isDeload: boolean, absoluteWeek: number): Promise<string>;
    /**
     * Generate plan summary SMS messages (2-3 messages under 160 chars each)
     */
    generatePlanSummary(user: UserWithProfile, plan: FitnessPlan, previousMessages?: Message[]): Promise<string[]>;
    /**
     * Generate a "plan ready" message combining plan summary and week one breakdown
     */
    generatePlanMicrocycleCombinedMessage(fitnessPlan: string, weekOne: string, currentWeekday: DayOfWeek): Promise<string>;
    /**
     * Generate an "updated week" message when a microcycle is modified
     */
    generateUpdatedMicrocycleMessage(modifiedMicrocycle: MicrocycleGenerationOutput, modifications: string, currentWeekday: DayOfWeek): Promise<string>;
}
export declare const messagingAgentService: MessagingAgentService;
//# sourceMappingURL=messagingAgentService.d.ts.map