/**
 * Shared types for agent orchestration services
 */
export type { ToolResult } from '@/server/agents';
/**
 * Base context interface for tools
 * All tool contexts should extend this
 */
export interface BaseToolContext {
    userId: string;
    message: string;
}
//# sourceMappingURL=shared.d.ts.map