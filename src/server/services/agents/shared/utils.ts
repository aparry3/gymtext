/**
 * Shared utilities for agent orchestration services
 */

import type { ToolResult } from './types';

/**
 * Result interface that domain services can return
 * This is the minimum shape required for toToolResult to work
 */
export interface DomainResult {
  success: boolean;
  messages?: string[];
  error?: string;
  modifications?: string;
}

/**
 * Transform a domain-specific result to a standard ToolResult
 *
 * This utility converts service results (like ModifyWorkoutResult, ModifyWeekResult, etc.)
 * into the standard ToolResult format that agents expect.
 *
 * @param result - Domain-specific result with success, messages, error, and modifications
 * @returns Standard ToolResult with response and optional messages
 */
export function toToolResult<T extends DomainResult>(result: T): ToolResult {
  if (!result.success) {
    return {
      response: `Operation failed: ${result.error || 'Unknown error'}`,
      messages: result.messages?.length ? result.messages : undefined,
    };
  }
  return {
    response: result.modifications
      ? `Operation completed: ${result.modifications}`
      : 'Operation completed successfully',
    messages: result.messages?.length ? result.messages : undefined,
  };
}
