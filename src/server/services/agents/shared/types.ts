/**
 * Shared types for agent orchestration services
 */

// Re-export ToolResult from agents/base for service layer convenience
export type { ToolResult } from '@/server/agents/base';

/**
 * Base context interface for tools
 * All tool contexts should extend this
 */
export interface BaseToolContext {
  userId: string;
  message: string;
}
