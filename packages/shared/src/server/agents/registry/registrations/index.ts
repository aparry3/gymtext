/**
 * Registry Initialization
 *
 * Registers all tools, agents, and callbacks in the global registries.
 * Call initializeRegistries() once at application startup.
 *
 * Registration is idempotent - calling multiple times is safe.
 *
 * As we migrate more agents to the registry pattern, add their
 * registration functions here.
 */
import { registerChatTools } from './chatTools';
import { registerChatAgent } from './chatAgent';
import { registerCallbacks } from './callbacks';

let _initialized = false;

/**
 * Initialize all registries with tool/agent/callback definitions.
 *
 * This is safe to call multiple times - registrations are idempotent.
 */
export function initializeRegistries(): void {
  if (_initialized) return;

  // Register tools
  registerChatTools();

  // Register agent configs
  registerChatAgent();

  // Register callbacks
  registerCallbacks();

  _initialized = true;
}

// Re-export individual registration functions for selective use
export { registerChatTools } from './chatTools';
export type { ChatToolDeps, ChatToolContext } from './chatTools';
export { registerChatAgent } from './chatAgent';
export { registerCallbacks } from './callbacks';
