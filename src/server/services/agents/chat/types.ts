import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import type { WorkoutInstance } from '@/server/models';

/**
 * Input for chat agent
 */
export interface ChatInput {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
  currentWorkout?: WorkoutInstance;
}

/**
 * Output from chat agent
 *
 * Messages are ordered: [agent's final response, ...accumulated tool messages]
 * The agent's conversational response is sent first, followed by any tool-generated messages.
 */
export interface ChatOutput {
  /** All messages to send to user, in order */
  messages: string[];
  /** Whether profile was updated during the conversation */
  profileUpdated: boolean;
}
