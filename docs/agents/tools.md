# Tool Registry

## Overview

The Tool Registry (`packages/shared/src/server/agents/tools/toolRegistry.ts`) maps tool name strings from DB `tool_ids` to LangChain `StructuredToolInterface` instances at runtime.

Key methods:
- `register(def: ToolDefinition)` — Register a tool at startup
- `get(name: string)` — Retrieve tool by name
- `list()` — Return metadata of all tools
- `resolve(toolIds: string[], ctx: ToolExecutionContext)` — Resolve tools with context injection, sorted by priority

Tools are registered once at startup in `agents/tools/definitions/index.ts`:

```typescript
export function registerAllTools(registry: ToolRegistry): void {
  registry.register(updateProfileTool);
  registry.register(modifyWorkoutTool);
  registry.register(modifyWeekTool);
  registry.register(modifyPlanTool);
  registry.register(getWorkoutTool);
}
```

## Tool Definitions

All 5 tools are defined in `agents/tools/definitions/chatTools.ts` and used exclusively by `chat:generate`.

### `update_profile` (Priority 1)

- **Purpose**: Record permanent user preferences (training days, goals, equipment, etc.)
- **Schema**: `{}` (empty — no arguments)
- **Returns**: Profile update confirmation
- **Delegates to**: `ProfileService.updateProfile()`
- **Tool type**: `action`

### `get_workout` (Priority 2)

- **Purpose**: Fetch or generate today's workout for the user
- **Schema**: `{}` (empty — no arguments)
- **Returns**: Formatted workout text
- **Delegates to**: `TrainingService.getOrGenerateWorkout()`
- **Tool type**: `query`

### `modify_workout` (Priority 3)

- **Purpose**: Modify a single day's workout based on user request
- **Schema**: `{ message: string }` — the modification request
- **Returns**: Modification confirmation with details
- **Delegates to**: `WorkoutModificationService.modifyWorkout()`
- **Tool type**: `action`
- **Side effect**: Sends immediate acknowledgment SMS via `queueMessage()`

### `modify_week` (Priority 3)

- **Purpose**: Restructure weekly training schedule
- **Schema**: `{ message: string, targetDay: string, targetWeek?: string }` — request + targeting
- **Returns**: Week modification confirmation
- **Delegates to**: `WorkoutModificationService.modifyWeek()`
- **Tool type**: `action`
- **Side effect**: Sends immediate acknowledgment SMS via `queueMessage()`

### `modify_plan` (Priority 3)

- **Purpose**: Program-level changes (mesocycle adjustments, phase changes)
- **Schema**: `{ message: string }` — the modification request
- **Returns**: Plan modification confirmation
- **Delegates to**: `PlanModificationService.modifyPlan()`
- **Tool type**: `action`
- **Side effect**: Sends immediate acknowledgment SMS via `queueMessage()`

## Priority System

Tools are sorted by priority (lower number = higher priority) before being passed to the LLM. This influences the order tools appear in the tool list, which can affect LLM tool selection behavior:

- **Priority 1**: Profile updates (most common, lightweight)
- **Priority 2**: Queries (fetch data)
- **Priority 3**: Modifications (heavier operations)

## ToolExecutionContext

Every tool receives a context object when invoked:

```typescript
interface ToolExecutionContext {
  user: UserWithProfile;           // Current user with profile
  message: string;                 // User's original message
  previousMessages?: AgentMessage[];  // Conversation history
  services: ToolServiceContainer;  // Service access (lazy injection)
  extras?: Record<string, unknown>;  // Extra data (workoutDate, etc.)
}
```

## ToolServiceContainer

Tools access services through a constrained interface (not the full ServiceContainer):

```typescript
interface ToolServiceContainer {
  profile: { updateProfile(userId, message, previousMessages?) };
  workoutModification: { modifyWorkout(params), modifyWeek(params) };
  planModification: { modifyPlan(params) };
  training: { getOrGenerateWorkout(userId, timezone) };
  queueMessage(user, content, queueName);
}
```

This is built via `buildToolServices()` lambda in the service factory (Phase 3), which captures mutable variables assigned in Phase 5 — resolving the circular dependency between tools and services.

## ToolResult

All tools return a standardized result:

```typescript
interface ToolResult {
  toolType: 'query' | 'action';  // Determines continuation prompt
  response: string;               // Summary for agent to reference
  messages?: string[];            // SMS messages to send to user
}
```

The `toolType` drives the AgentRunner's continuation logic:

- `query` → Agent introduces the fetched data naturally
- `action` → Agent confirms what was changed

## Adding New Tools

1. Create definition in `agents/tools/definitions/` (follow chatTools.ts pattern)
2. Export the tool definition with: name, description, schema (Zod), priority, execute function
3. Register in `registerAllTools()` in `agents/tools/definitions/index.ts`
4. Add tool name to the agent's `tool_ids` array in the seed script
5. If the tool needs new services, extend `ToolServiceContainer` and update `buildToolServices()`
6. Run `pnpm seed --agents` to update DB

## Key Files

| File | Purpose |
|------|---------|
| `agents/tools/toolRegistry.ts` | Registry: register, resolve, list tools |
| `agents/tools/definitions/chatTools.ts` | All 5 tool definitions |
| `agents/tools/definitions/index.ts` | `registerAllTools()` function |
| `agents/tools/types.ts` | ToolExecutionContext, ToolResult, ToolServiceContainer |
