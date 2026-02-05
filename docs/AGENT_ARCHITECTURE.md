# Agent Architecture

## Overview

GymText uses a layered agent system where AI/LLM interactions are handled by specialized agents, services handle business logic, and a **registry system** makes agent definitions config-driven rather than code-driven.

```
┌─────────────────────────────────────┐
│         API Routes Layer            │
│  (Next.js API routes in app/api)    │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│      Orchestration Services         │
│   (chatService, trainingService)    │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│        Agent Services               │
│  (chatAgentService, workoutAgent)   │
│  Uses createAgent() or registry     │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   Registry System                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ToolRegistry │  │ AgentRegistry│  │ CallbackRegistry │  │
│  │ (stochastic) │  │ (pure config)│  │ (deterministic)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────┐
│   createAgent() factory             │
│   (prompts, models, tool loop,      │
│    sub-agents, validation, retry)   │
└─────────────────────────────────────┘
```

## Core Concepts

### createAgent() — The Agent Factory

All agents are created via `createAgent()`, which takes a declarative `AgentDefinition`:

```typescript
const agent = await createAgent({
  name: 'chat:generate',        // Used for DB prompt lookup
  context: contextStrings,       // Pre-computed context (from ContextService)
  previousMessages: history,     // Conversation history
  tools: langchainTools,         // LangChain StructuredToolInterface[]
  schema: OutputSchema,          // Zod schema for structured output
  subAgents: [{ msg: msgAgent }], // Composed agents
  validate: (result) => ...,     // Output validation with retry
  maxRetries: 3,
}, { model: 'gpt-5-nano' });

const result = await agent.invoke('user message');
```

Key features:
- **DB-backed prompts**: If `systemPrompt` not provided, fetched from `prompts` table by agent name
- **Tool loop**: When tools are provided, enters an agentic loop until the LLM stops calling tools
- **Sub-agents**: Sequential batches with parallel execution within batches
- **Validation + retry**: Failed outputs are fed back as negative examples

### ContextService — Pre-computed Agent Context

Agents don't call services directly. Instead, `ContextService` pre-computes context strings:

```typescript
const context = await contextService.getContext(user, [
  ContextType.DATE_CONTEXT,
  ContextType.CURRENT_WORKOUT,
  ContextType.USER_PROFILE,
]);
// Returns: string[] injected as user messages between system prompt and conversation
```

---

## Registry System

The registry system separates **what exists** (definitions) from **how it's wired** (config) from **what runs** (runtime):

```
AgentConfig (pure data, no code)
  ├── tools: ['update_profile', 'get_workout']   → resolved from ToolRegistry
  ├── subAgents: [{ agentName: 'workout:structured' }]  → resolved from AgentRegistry
  └── callbacks: [{ name: 'send_sms' }]          → resolved from CallbackRegistry
```

### ToolRegistry — What the LLM can do

Tools are side-effect-producing functions that the LLM **decides** to call. Each tool has a name, description, schema, priority, and execute function.

```typescript
import { toolRegistry } from '@/server/agents';

toolRegistry.register({
  name: 'update_profile',
  description: 'Record permanent user preferences...',
  schema: z.object({}),
  priority: 1,            // Lower = runs first when multiple tools called
  toolType: 'action',
  immediateMessage: false, // If true, sends SMS ack before executing
  execute: async (_args, context) => {
    const deps = (context as ChatToolContext).deps;
    return deps.updateProfile(context.userId, context.message);
  },
});
```

At runtime, tools are resolved by name and bound to a `ToolContext`:

```typescript
const tools = toolRegistry.createTools(
  ['update_profile', 'get_workout', 'make_modification'],
  { userId, message, timezone, deps, onSendMessage }
);
```

The `toolExecutor` uses `toolRegistry.getPriority()` to sort tool calls deterministically.

**Registered chat tools:**

| Tool | Priority | Type | Immediate Message |
|------|----------|------|-------------------|
| `update_profile` | 1 | action | No |
| `get_workout` | 2 | query | No |
| `make_modification` | 3 | action | Yes |

### AgentRegistry — What agents exist

Agent configs are **pure data** — no functions, no imports. Everything referenced by name:

```typescript
import { agentRegistry } from '@/server/agents';

agentRegistry.register({
  name: 'chat:generate',
  tools: ['update_profile', 'get_workout', 'make_modification'],
  contextTypes: ['DATE_CONTEXT', 'CURRENT_WORKOUT'],
  callbacks: [{ name: 'enforce_sms_length', when: 'on_success' }],
});
```

The registry also stores named helper functions for sub-agent composition:

```typescript
// Transform: converts parent output → sub-agent input
agentRegistry.registerTransform('format_for_structured', (mainResult) => {
  return JSON.stringify({ workout: mainResult });
});

// Condition: determines if sub-agent should run
agentRegistry.registerCondition('was_updated', (result) => {
  return (result as { wasUpdated: boolean }).wasUpdated;
});

// Validator: checks agent output, provides retry feedback
agentRegistry.registerValidator({
  name: 'workout_completeness',
  validate: (result) => {
    const workout = result as WorkoutStructure;
    if (workout.blocks.length === 0) {
      return { isValid: false, errors: ['Workout has no blocks'] };
    }
    return { isValid: true };
  },
});
```

### CallbackRegistry — What happens after agents run

Callbacks are **deterministic** side effects. Unlike tools (which the LLM decides to call), callbacks **always** run when configured:

```typescript
import { callbackRegistry } from '@/server/agents';

callbackRegistry.register({
  name: 'enforce_sms_length',
  description: 'Truncate messages exceeding SMS character limit',
  execute: async (context) => {
    const result = context.agentResult as { response?: string; messages?: string[] };
    if (result?.response && result.response.length > 1600) {
      result.response = result.response.substring(0, 1597) + '...';
    }
  },
});
```

| Timing | When it runs |
|--------|-------------|
| `on_success` | Only when agent succeeds (default) |
| `on_failure` | Only when agent throws |
| `always` | Regardless of outcome |

---

## Deterministic vs Stochastic

This is the key architectural distinction:

| Component | Deterministic? | Who decides? |
|-----------|---------------|-------------|
| **Tool selection** | No | LLM decides which tools to call |
| **Tool execution order** | Yes | Priority from ToolRegistry |
| **Tool implementation** | Yes | Same inputs = same side effects |
| **Callback execution** | Yes | Always runs per timing config |
| **Callback order** | Yes | Array order in agent config |

Tools give the LLM agency over *what* to do. Callbacks give you control over what *always* happens:

- LLM decides whether to call `make_modification` (stochastic)
- `enforce_sms_length` always runs on the final output (deterministic)
- Tool priority ensures `update_profile` runs before `make_modification` (deterministic ordering of stochastic selections)

---

## Using the Registry

### Creating Agents

```typescript
import { createAgentFromRegistry, executeAgentCallbacks } from '@/server/agents';

// 1. Create agent — tools resolved by name, config looked up
const { agent, callbacks } = await createAgentFromRegistry('chat:generate', {
  context: agentContext,        // from ContextService
  previousMessages: history,    // conversation history
  toolContext: {                // runtime context for tools
    userId: user.id,
    message: userMessage,
    timezone: user.timezone,
    deps: { updateProfile, getWorkout, makeModification },
  },
});

// 2. Invoke
const result = await agent.invoke(userMessage);

// 3. Run deterministic callbacks
await executeAgentCallbacks(callbacks, result, { userId: user.id }, true);
```

### Initialization

Call once at application startup:

```typescript
import { initializeRegistries } from '@/server/agents';
initializeRegistries();  // idempotent — safe to call multiple times
```

### Backward Compatibility

The registry is additive. All existing `createAgent()` calls and service code work unchanged. Services adopt the registry pattern incrementally:

- `generateResponse(user, msg, history, tools)` — legacy (tools passed in)
- `generateResponseFromRegistry(user, msg, history, toolContext)` — registry (tools resolved by name)

---

## Adding a New Agent

### 1. Register tools (if needed)

```typescript
// registry/registrations/myTools.ts
export function registerMyTools(): void {
  toolRegistry.register({
    name: 'my_tool',
    description: '...',
    schema: z.object({ ... }),
    priority: 1,
    toolType: 'action',
    execute: async (args, context) => { ... },
  });
}
```

### 2. Register agent config

```typescript
// registry/registrations/myAgent.ts
export function registerMyAgent(): void {
  agentRegistry.register({
    name: 'my:agent',
    model: 'gpt-5-nano',
    tools: ['my_tool'],
    contextTypes: ['USER_PROFILE'],
    callbacks: [{ name: 'log_result', when: 'always' }],
  });
}
```

### 3. Register callbacks (if needed)

```typescript
callbackRegistry.register({
  name: 'log_result',
  execute: async (context) => {
    console.log('Agent result:', context.agentResult);
  },
});
```

### 4. Wire up initialization

Add to `registrations/index.ts`:

```typescript
import { registerMyTools } from './myTools';
import { registerMyAgent } from './myAgent';

export function initializeRegistries(): void {
  registerChatTools();
  registerMyTools();      // ← add
  registerChatAgent();
  registerMyAgent();      // ← add
  registerCallbacks();
}
```

### 5. Use in service code

```typescript
const { agent, callbacks } = await createAgentFromRegistry('my:agent', {
  context: await contextService.getContext(user, ['USER_PROFILE']),
  toolContext: { userId, message, timezone, deps: { ... } },
});
const result = await agent.invoke(input);
await executeAgentCallbacks(callbacks, result, {}, true);
```

---

## File Structure

```
packages/shared/src/server/agents/
├── registry/
│   ├── index.ts                          # Re-exports everything
│   ├── toolRegistry.ts                   # Tool definitions + resolution
│   ├── agentRegistry.ts                  # Agent configs + transforms/conditions/validators
│   ├── callbackRegistry.ts              # Deterministic post-agent callbacks
│   ├── createAgentFromRegistry.ts       # Bridge: registry config → createAgent()
│   └── registrations/
│       ├── index.ts                      # initializeRegistries()
│       ├── chatTools.ts                  # Chat tool registrations
│       ├── chatAgent.ts                  # Chat agent config registration
│       └── callbacks.ts                  # Shared callback registrations
├── createAgent.ts                        # Core agent factory (unchanged)
├── toolExecutor.ts                       # Tool loop (uses ToolRegistry for priority)
├── subAgentExecutor.ts                   # Sub-agent batch execution (unchanged)
├── types.ts                              # Shared types (unchanged)
├── promptIds.ts                          # Agent name constants
└── index.ts                              # All exports
```

---

## Dependency Graph

Inspect agent relationships programmatically:

```typescript
const graph = agentRegistry.getDependencyGraph();
// {
//   'chat:generate': {
//     tools: ['update_profile', 'get_workout', 'make_modification'],
//     subAgents: [],
//     callbacks: ['enforce_sms_length'],
//   },
// }
```

---

## Testing

All registries have `clear()` for test isolation and `replace()` for mocking:

```typescript
beforeEach(() => {
  toolRegistry.clear();
  agentRegistry.clear();
  callbackRegistry.clear();
});

// Swap a tool implementation for testing
toolRegistry.replace({
  name: 'update_profile',
  description: 'Mock',
  schema: z.object({}),
  priority: 1,
  toolType: 'action',
  execute: async () => ({ response: 'mocked' }),
});
```

Test files: `tests/unit/agents/registry/`
