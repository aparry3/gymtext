/**
 * Shared utilities for agent orchestration services
 */
import type { ToolResult } from '../types/shared';
import type { ToolType } from '@/server/agents';
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
 * @param toolType - Type of tool ('query' or 'action'), defaults to 'action'
 * @returns Standard ToolResult with response and optional messages
 */
export declare function toToolResult<T extends DomainResult>(result: T, toolType?: ToolType): ToolResult;
//# sourceMappingURL=utils.d.ts.map