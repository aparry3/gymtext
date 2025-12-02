import { z } from 'zod';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import { WorkoutInstance } from '@/server/models';
import type { ProfileUpdateOutput } from '@/server/agents/profile';

/**
 * Input for the Modifications Agent
 * Contains all context needed to process modification requests
 */
export interface ModificationsAgentInput {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
  currentWorkout?: WorkoutInstance;
  profile?: ProfileUpdateOutput;
  workoutDate: Date;
  targetDay: string;
}

/**
 * Schema for modifications agent output
 */
export const ModificationsResponseSchema = z.object({
  messages: z.array(z.string()).describe('array of messages to send (e.g., week update message, workout message)'),
});

export type ModificationsResponse = z.infer<typeof ModificationsResponseSchema>;
