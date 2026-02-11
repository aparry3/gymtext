import type { ToolRegistry } from '../toolRegistry';
import { updateProfileTool, makeModificationTool, getWorkoutTool } from './chatTools';

/**
 * Register all tool definitions with the tool registry
 */
export function registerAllTools(registry: ToolRegistry): void {
  // Chat tools
  registry.register(updateProfileTool);
  registry.register(makeModificationTool);
  registry.register(getWorkoutTool);
}
