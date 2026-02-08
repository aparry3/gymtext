import type { UserWithProfile } from '@/server/models/user';

/**
 * Declarative input mapping stored in sub_agents JSONB
 *
 * Maps parent agent output to sub-agent input using $-prefixed references:
 *   "$result.overview"     -> parent agent result.overview
 *   "$result"              -> entire parent agent result
 *   "$user.name"           -> user.name from invoke params
 *   "$user.profile"        -> user.profile
 *   "$extras.absoluteWeek" -> extras.absoluteWeek from invoke params
 *   "$parentInput"         -> the input that was sent to the parent agent
 *   "$now"                 -> current date formatted for AI
 *   "literal string"       -> passed as-is (no $ prefix)
 */
export interface InputMapping {
  [outputKey: string]: string | InputMapping;
}

/**
 * Declarative validation rule
 *
 * Used for:
 * - Agent validation: After all sub-agents complete, check rules on the result
 * - Sub-agent conditions: Before running a sub-agent, check rules on parent result
 */
export interface ValidationRule {
  /** Dot-path into the result (e.g., "validation.isValid", "days") */
  field: string;
  /** Check type */
  check: 'equals' | 'truthy' | 'nonEmpty' | 'allNonEmpty' | 'length';
  /** For 'equals': value to match; for 'length': expected number */
  expected?: unknown;
  /** Error message when rule fails */
  error?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Context available for input mapping resolution
 */
export interface MappingContext {
  /** Parent agent output */
  result: unknown;
  /** User from invoke params */
  user: UserWithProfile;
  /** Extras from invoke params */
  extras: Record<string, unknown>;
  /** Input sent to parent agent */
  parentInput: string;
  /** Formatted current date */
  now: string;
}
