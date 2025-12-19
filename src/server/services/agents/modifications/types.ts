import { z } from 'zod';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import { WorkoutInstance } from '@/server/models';
import type { AgentConfig } from '@/server/agents/base';
import type { StructuredToolInterface } from '@langchain/core/tools';

/**
 * Input for the Modifications Agent
 * Contains all context needed to process modification requests
 */
export interface ModificationsAgentInput {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
  currentWorkout?: WorkoutInstance;
  workoutDate: Date;
  targetDay: string;
}

/**
 * Configuration for modifications agent factory
 * Tools are passed at agent creation time, not invoke time.
 */
export interface ModificationsAgentConfig extends AgentConfig {
  /** Tools provided by the calling service */
  tools: StructuredToolInterface[];
}

/**
 * Schema for modifications agent output
 * Conforms to AgentToolResult pattern for use in agentic loop
 */
export const ModificationsResponseSchema = z.object({
  messages: z.array(z.string()).optional().describe('Optional array of messages to send (e.g., week update message, workout message)'),
  response: z.string().describe('Required context for agent continuation'),
});

export type ModificationsResponse = z.infer<typeof ModificationsResponseSchema>;
