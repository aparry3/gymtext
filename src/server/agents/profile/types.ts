import type { FitnessProfile, User } from '../../models/user/schemas';
import type { UserWithProfile } from '../../models/userModel';
import { AgentConfig } from '../base';
import { ActivitiesExtractionResult } from './activities/schema';
import { ConstraintsExtractionResult } from './constraints/schema';
import { EnvironmentExtractionResult } from './environment/schema';
import { GoalsExtractionResult } from './goals/schema';
import { UserExtractionResult } from './user/schema';


export type ProfileExtractionResults = {
  goals: GoalsExtractionResult,
  activities: ActivitiesExtractionResult,
  constraints: ConstraintsExtractionResult,
  environment: EnvironmentExtractionResult,
  user: UserExtractionResult,
};
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
 * User message builder function type - takes user context and message, returns dynamic user message
 */
export type UserMessageBuilder = (user: UserWithProfile, message: string) => string;

/**
 * Sub-agent configuration
 */
export interface SubAgentConfig extends AgentConfig {
  systemPrompt: string;  // Static system prompt
  userMessageBuilder: UserMessageBuilder;  // Dynamic user message builder
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