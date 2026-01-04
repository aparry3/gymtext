/**
 * Shared utilities for agent orchestration services
 */
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
export function toToolResult(result, toolType = 'action') {
    if (!result.success) {
        return {
            toolType,
            response: `Operation failed: ${result.error || 'Unknown error'}`,
            messages: result.messages?.length ? result.messages : undefined,
        };
    }
    return {
        toolType,
        response: result.modifications
            ? `Operation completed: ${result.modifications}`
            : 'Operation completed successfully',
        messages: result.messages?.length ? result.messages : undefined,
    };
}
