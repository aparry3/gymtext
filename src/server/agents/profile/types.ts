import type { FitnessProfile, User } from '../../models/user/schemas';
import type { UserWithProfile } from '../../models/userModel';

/**
 * Result type returned by any ProfileAgent
 */
export interface ProfileAgentResult {
  profile: FitnessProfile | null;
  user?: Partial<User>;
  wasUpdated: boolean;
  updateSummary?: {
    fieldsUpdated: string[];
    reason: string;
    confidence: number;
  };
}

/**
 * Configuration for ProfileAgents
 */
export interface ProfileAgentConfig {
  model?: 'gpt-5-nano' | 'gemini-2.5-flash';
  temperature?: number;
  verbose?: boolean;
}

/**
 * Prompt builder function type - takes user context and returns system prompt
 */
export type PromptBuilder = (user: UserWithProfile) => string;

/**
 * Sub-agent configuration
 */
export interface SubAgentConfig extends ProfileAgentConfig {
  promptBuilder: PromptBuilder;
  agentName: string;
  outputSchema: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- Zod schema type
}

/**
 * Simple result from sub-agents - just the extracted domain data + metadata
 */
export interface SubAgentResult {
  // The extracted data for this domain (goals, activities, etc.)
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  // Metadata about the extraction
  hasData: boolean;
  confidence: number;
  reason: string;
}