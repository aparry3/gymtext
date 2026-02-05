/**
 * Agent Registry System
 *
 * Three registries that separate concerns:
 *
 * 1. **ToolRegistry** - Named tool implementations (side effects)
 *    Tools are what the LLM can call. They have schemas, descriptions,
 *    priorities, and implementations. Registered once, resolved by name.
 *
 * 2. **AgentRegistry** - Declarative agent configurations
 *    Agent configs define what an agent does: model, tools (by name),
 *    sub-agents (by name), validators, callbacks. Pure data, no code.
 *
 * 3. **CallbackRegistry** - Deterministic post-agent side effects
 *    Callbacks always run after an agent (unlike tools which the LLM decides).
 *    Used for: sending messages, saving to DB, triggering workflows.
 *
 * ## Architecture
 *
 * ```
 * AgentConfig (declarative)
 *   ├── tools: ['update_profile', 'get_workout']  → ToolRegistry
 *   ├── subAgents: [{ agentName: 'workout:structured' }]  → AgentRegistry
 *   └── callbacks: [{ name: 'send_sms' }]  → CallbackRegistry
 *
 * createAgentFromRegistry('chat:generate', { toolContext })
 *   1. Looks up AgentConfig from AgentRegistry
 *   2. Resolves tools from ToolRegistry (binds runtime context)
 *   3. Creates agent via createAgent()
 *   4. Returns agent + callback configs
 *
 * executeAgentCallbacks(callbacks, result, context)
 *   1. Resolves callbacks from CallbackRegistry
 *   2. Executes deterministically based on timing (on_success/on_failure/always)
 * ```
 */

// ============================================
// Registries
// ============================================
export { toolRegistry } from './toolRegistry';
export type { ToolDefinition, ToolContext } from './toolRegistry';

export { agentRegistry } from './agentRegistry';
export type {
  AgentConfig as RegistryAgentConfig,
  SubAgentRef,
  SubAgentBatchRef,
  TransformFn,
  ConditionFn,
  ValidatorDefinition,
} from './agentRegistry';

export { callbackRegistry } from './callbackRegistry';
export type {
  CallbackDefinition,
  CallbackConfig,
  CallbackContext,
  CallbackTiming,
} from './callbackRegistry';

// ============================================
// Agent Factory (from registry)
// ============================================
export { createAgentFromRegistry, executeAgentCallbacks } from './createAgentFromRegistry';
export type { CreateFromRegistryOptions, RegistryAgent } from './createAgentFromRegistry';

// ============================================
// Registration (call once at startup)
// ============================================
export { initializeRegistries } from './registrations';
export type { ChatToolDeps, ChatToolContext } from './registrations';
