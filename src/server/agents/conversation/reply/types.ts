import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import type { WorkoutBlock } from '@/server/models/workout';
import type { Microcycle } from '@/server/models/microcycle';
import type { AgentDeps } from '@/server/agents/base';
import { z } from 'zod';

/**
 * Action types for reply agent
 */
export const ReplyAgentActionSchema = z.enum(['resendWorkout', 'fullChatAgent']).nullable().describe(
  'The action to take: resendWorkout (resend today\'s workout), fullChatAgent (pass to full conversation agent), or null (full answer provided, no action needed)'
);

export type ReplyAgentAction = z.infer<typeof ReplyAgentActionSchema>;

/**
 * Schema for reply agent structured output
 */
export const ReplyAgentResponseSchema = z.object({
  action: ReplyAgentActionSchema,
  reply: z.string().describe('The reply message to send to the user'),
  reasoning: z.string().describe('Explanation of the decision and action taken')
});

export type ReplyAgentResponse = z.infer<typeof ReplyAgentResponseSchema>;

/**
 * Input for reply agent
 */
export interface ReplyInput {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
  currentWorkout?: {
    description: string | null;
    reasoning: string | null;
    blocks: WorkoutBlock[];
  };
  currentMicrocycle?: Microcycle;
  fitnessPlan?: {
    description: string | null;
    reasoning: string | null;
  };
}

/**
 * Output from reply agent
 */
export type ReplyOutput = ReplyAgentResponse;

/**
 * Dependencies for reply agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
export interface ReplyAgentDeps extends AgentDeps {
  /**
   * Optional service method to send workout message to user
   * Used by the resend_workout tool to send current workout via SMS
   */
  sendWorkoutMessage?: () => Promise<Message>;
}
