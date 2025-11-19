import { z } from 'zod';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import type { AgentDeps } from '@/server/agents/base';
import type { ModifyWeekParams, ModifyWorkoutParams } from './modifications/tools';
import { WorkoutInstance } from '@/server/models';
import type { ModifyWeekResult, ModifyWorkoutResult } from '@/server/services';
import type { ProfileUpdateOutput } from '@/server/agents/profileUpdate';

/**
 * Intent types that the triage agent can identify
 */
export const MessageIntentSchema = z.enum(['updates', 'modifications']);
export type MessageIntent = z.infer<typeof MessageIntentSchema>;

/**
 * Individual intent analysis with confidence score
 */
export const IntentAnalysisSchema = z.object({
  intent: MessageIntentSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string()
});
export type IntentAnalysis = z.infer<typeof IntentAnalysisSchema>;

/**
 * Structured output for the chat triage agent
 */
export const TriageResultSchema = z.object({
  intents: z.array(IntentAnalysisSchema).length(4), // Must analyze all 4 intents
  summary: z.string()
});
export type TriageResult = z.infer<typeof TriageResultSchema>;

/**
 * Input for chat agent (initial input to the chain)
 */
export interface ChatInput {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
  currentWorkout?: WorkoutInstance;
}

/**
 * Input after parallel phase (profile + triage completed)
 * This type represents the complete context available to subagents.
 * All fields from ChatInput flow through, plus profile and triage results.
 */
export interface ChatAfterParallelInput extends ChatInput {
  profile: ProfileUpdateOutput;
  triage: TriageResult;
}

/**
 * Input for chat subagent runnables
 * Alias for ChatAfterParallelInput for clarity in subagent code
 */
export type ChatSubagentInput = ChatAfterParallelInput;

/**
 * Output from chat agent
 */
export interface ChatOutput {
  response: string;
  profileUpdated: boolean;
}

/**
 * Dependencies for chat agent (includes DI for profile and modification services)
 */
export interface ChatAgentDeps extends AgentDeps {
  getCurrentProfile: (userId: string) => Promise<string | null>;
  saveProfile: (userId: string, markdownProfile: string) => Promise<void>;
  modifyWorkout: (params: ModifyWorkoutParams) => Promise<ModifyWorkoutResult>;
  modifyWeek: (params: ModifyWeekParams) => Promise<ModifyWeekResult>;
}