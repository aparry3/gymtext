import type { ToolRegistry } from '../toolRegistry';
import { updateProfileTool, modifyWorkoutTool, modifyWeekTool, modifyPlanTool, getWorkoutTool } from './chatTools';

/**
 * Register all tool definitions with the tool registry
 */
export function registerAllTools(registry: ToolRegistry): void {
  // Chat tools
  registry.register(updateProfileTool);
  registry.register(modifyWorkoutTool);
  registry.register(modifyWeekTool);
  registry.register(modifyPlanTool);
  registry.register(getWorkoutTool);
}
