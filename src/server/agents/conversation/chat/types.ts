import { z } from 'zod';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import type { AgentDeps } from '@/server/agents/base';
import type { PatchProfileCallback } from '@/server/agents/profile/chain';
import type { WorkoutModificationService } from './modifications/tools';
import type { MicrocycleModificationService } from './modifications/tools';

/**
 * Intent types that the triage agent can identify
 */
export const MessageIntentSchema = z.enum(['updates', 'questions', 'modifications']);
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
 * Input for chat agent
 */
export interface ChatInput {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
}

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
  patchProfile: PatchProfileCallback;
  workoutService: WorkoutModificationService;
  microcycleService: MicrocycleModificationService;
}