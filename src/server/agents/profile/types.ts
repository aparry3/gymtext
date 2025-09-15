import type { FitnessProfile, User } from '../models/user/schemas';
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
  model?: 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'gemini-2.5-flash';
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
}

/**
 * Sub-agent result - more focused than full ProfileAgentResult
 */
export interface SubAgentResult {
  updates: Partial<FitnessProfile> | Partial<User> | null;
  wasUpdated: boolean;
  updateSummary?: {
    fieldsUpdated: string[];
    reason: string;
    confidence: number;
  };
}