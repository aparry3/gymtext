import { z } from 'zod';

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