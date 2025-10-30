import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import type { WorkoutBlock } from '@/server/models/workout';
import type { MicrocyclePattern } from '@/server/models/microcycle';
import type { AgentDeps } from '@/server/agents/base';
import { z } from 'zod';

/**
 * Schema for reply agent structured output
 */
export const ReplyAgentResponseSchema = z.object({
  reply: z.string().describe('The reply message to send to the user'),
  needsFullPipeline: z.boolean().describe('Whether this message needs the full chat pipeline (profile extraction, triage, subagents)'),
  resendWorkout: z.boolean().describe('Whether to resend today\'s workout to the user via SMS'),
  reasoning: z.string().describe('Explanation of why this does or does not need the full pipeline')
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
  currentMicrocycle?: MicrocyclePattern;
  fitnessPlan?: {
    overview: string | null;
    planDescription: string | null;
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
