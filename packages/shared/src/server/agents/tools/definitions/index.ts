import type { ToolRegistry } from '../toolRegistry';
import { updateProfileTool, makeModificationTool, getWorkoutTool } from './chatTools';
import { modifyWorkoutTool, modifyWeekTool, modifyPlanTool } from './modificationTools';

/**
 * Register all tool definitions with the tool registry
 */
export function registerAllTools(registry: ToolRegistry): void {
  // Chat tools
  registry.register(updateProfileTool);
  registry.register(makeModificationTool);
  registry.register(getWorkoutTool);

  // Modification tools
  registry.register(modifyWorkoutTool);
  registry.register(modifyWeekTool);
  registry.register(modifyPlanTool);
}
