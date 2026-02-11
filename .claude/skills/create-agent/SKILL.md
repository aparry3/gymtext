---
name: create-agent
description: Create or update an AI agent definition in the database. Use when the user wants to add a new agent, modify an existing agent's prompts/config, or manage agent definitions. Triggers on mentions of creating agents, updating prompts, agent definitions, or agent configuration.
---

# Create / Update Agent Definition

Create or update agent definitions in the GymText database using the CLI script. Agent definitions are stored in the `agent_definitions` table with append-only versioning (every update creates a new version row).

## Setup

```bash
source .env.local
```

## Workflow

### 1. Gather Requirements

Before creating an agent, determine:

- **`agentId`** (required): Namespaced identifier like `domain:action` (e.g., `chat:generate`, `workout:structured`). Check existing conventions in `packages/shared/src/server/agents/constants.ts`.
- **`systemPrompt`** (required): The system prompt instructions for the agent.
- **`model`** (required): Model identifier. Options: `gpt-5.1`, `gpt-5-nano`, `gemini-2.5-flash`, `gemini-2.5-pro`.
- **`description`**: Human-readable description of what the agent does.
- **`userPromptTemplate`**: Template with `{{variable}}` placeholders for runtime substitution.
- **`userPrompt`**: Static user prompt (use `userPromptTemplate` instead if dynamic input is needed).
- **`temperature`**: Generation temperature (0-2). Default: 1.
- **`maxTokens`**: Max output tokens. Default varies by model.
- **`maxIterations`**: Max tool-use loop iterations. Default: 10.
- **`maxRetries`**: Max retry attempts on validation failure. Default: 3.
- **`toolIds`**: Array of tool names the agent can use. Available tools: `update_profile`, `make_modification`, `get_workout`.
- **`contextTypes`**: Array of context providers resolved at runtime. Available: `user`, `userProfile`, `fitnessPlan`, `dayOverview`, `currentWorkout`, `dateContext`, `trainingMeta`, `currentMicrocycle`, `experienceLevel`, `dayFormat`, `programVersion`, `availableExercises`.
- **`subAgents`**: Sub-agent configurations (batches, parallel/sequential execution).
- **`schemaJson`**: JSON Schema for structured output validation.
- **`validationRules`**: Declarative validation rules (`equals`, `truthy`, `nonEmpty`, `length`) with auto-retry.
- **`examples`**: Few-shot examples for the agent.

### 2. Review Existing Agents

List current agents to understand naming patterns and avoid conflicts:

```bash
source .env.local && pnpm agent:list
```

Get full details of a specific agent for reference:

```bash
source .env.local && pnpm agent:get <agent-id>
```

### 3. Create the Definition JSON

Write a JSON file with the agent definition. Use camelCase keys matching the database columns:

```json
{
  "systemPrompt": "You are a helpful assistant that...",
  "model": "gpt-5-nano",
  "description": "Brief description of this agent",
  "temperature": 1,
  "maxTokens": 4096,
  "userPromptTemplate": "Given the following context:\n{{context}}\n\nRespond to: {{input}}",
  "toolIds": ["update_profile"],
  "contextTypes": ["user", "userProfile"],
  "schemaJson": null,
  "subAgents": null,
  "validationRules": null
}
```

Only include fields you want to set. Fields not included will use database defaults for new agents, or preserve existing values for updates.

### 4. Upsert the Agent

From a JSON file:

```bash
source .env.local && pnpm agent:upsert <agent-id> /path/to/definition.json
```

Or inline for simple definitions:

```bash
source .env.local && pnpm agent:upsert <agent-id> --inline '{"systemPrompt": "...", "model": "gpt-5-nano"}'
```

This is an **upsert**: if the agent ID already exists, it appends a new version (preserving history). If it doesn't exist, it creates the first version.

### 5. Verify

Confirm the agent was created/updated:

```bash
source .env.local && pnpm agent:get <agent-id>
```

### 6. Register in Code (for new agents only)

If this is a **new** agent (not updating an existing one), you also need to:

1. **Add the agent ID constant** to `packages/shared/src/server/agents/constants.ts`:

```typescript
export const AGENTS = {
  // ... existing agents ...
  NEW_AGENT: 'domain:action',
} as const;
```

2. **Register any new tools** (if the agent uses tools not yet in the registry):
   - Add tool definition in `packages/shared/src/server/agents/tools/definitions/`
   - Register in `packages/shared/src/server/agents/tools/definitions/index.ts`

3. **Register any new context providers** (if the agent uses context types not yet registered):
   - Add provider in `packages/shared/src/server/agents/context/definitions/`
   - Register in `packages/shared/src/server/agents/context/definitions/index.ts`

4. **Invoke from a service** using `agentRunner.invoke()`:

```typescript
const result = await agentRunner.invoke('domain:action', {
  input: userMessage,
  params: { user, previousMessages },
});
```

## Important Notes

- Agent IDs follow the `domain:action` naming convention (e.g., `chat:generate`, `workout:structured`)
- Updates are **append-only**: every change creates a new version row, preserving full history
- The agent definition cache has a **5-minute TTL** - changes take effect within 5 minutes, or immediately if `invalidateCache()` is called
- Services must always use `agentRunner.invoke(agentId, params)` - never instantiate LLMs directly
- The `systemPrompt` and `model` are the only truly required fields for a minimal agent
- For structured output agents, provide `schemaJson` with a valid JSON Schema
- For tool-using agents, list tool names in `toolIds` that are registered in the Tool Registry
- Sub-agents are defined as JSON with batch configurations for sequential/parallel execution
