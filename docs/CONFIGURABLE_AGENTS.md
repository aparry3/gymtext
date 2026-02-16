# Configurable Agent Architecture

This document describes the fully declarative, database-driven agent architecture for GymText. Agents are configured entirely through the `agent_definitions` table — no code changes needed to add new agents, modify behavior, adjust prompts, swap models, or reconfigure sub-agent pipelines.

---

## Overview

Every agent in the system is invoked through a single entry point:

```typescript
const result = await agentRunner.invoke('chat:generate', {
  user,
  message,
  previousMessages,
  extras: { workoutDate, targetDay },
});
```

The AgentRunner handles everything:
1. Fetches the agent's DB configuration (model, prompts, schema, tools, sub-agents, hooks)
2. Resolves context (fitness plan, user profile, etc.) based on declared `context_types`
3. Resolves tools from the ToolRegistry based on declared `tool_ids`
4. Creates and invokes the agent
5. Runs sub-agents with declarative input mappings and conditions
6. Evaluates validation rules (with retry on failure)
7. Fires hooks (pre/post) for side effects like sending SMS

---

## Core Concepts

### Agent Definitions (Database)

Each agent is a row in `agent_definitions` with these columns:

| Column | Type | Description |
|--------|------|-------------|
| `version_id` | SERIAL PK | Auto-incrementing version (append-only) |
| `agent_id` | TEXT | Unique identifier, e.g. `chat:generate`, `workout:modify` |
| `system_prompt` | TEXT | The system prompt for the LLM |
| `user_prompt` | TEXT | Default user prompt (legacy, from prompts table) |
| `model` | TEXT | LLM model ID, e.g. `gpt-5.1`, `gpt-5-nano` |
| `max_tokens` | INTEGER | Max output tokens |
| `temperature` | NUMERIC | Temperature for generation |
| `max_iterations` | INTEGER | Max tool-use loop iterations |
| `max_retries` | INTEGER | Retries on validation failure |
| `tool_ids` | TEXT[] | Tool names from ToolRegistry, e.g. `{update_profile, get_workout}` |
| `context_types` | TEXT[] | Context types to resolve, e.g. `{USER_PROFILE, FITNESS_PLAN}` |
| `sub_agents` | JSONB | Sub-agent pipeline configuration (see below) |
| `hooks` | JSONB | Agent-level pre/post hooks |
| `tool_hooks` | JSONB | Per-tool hook overrides |
| `schema_json` | JSONB | JSON Schema for structured output |
| `validation_rules` | JSONB | Declarative validation rules |
| `user_prompt_template` | TEXT | Template with `{{variable}}` substitution |
| `is_active` | BOOLEAN | Whether this version is active |
| `created_at` | TIMESTAMPTZ | Version timestamp |

Versioning is append-only — updates insert new rows. The latest active version is used.

### AgentRunner

The unified invocation service. Replaces all individual agent service classes.

```typescript
interface AgentInvokeParams {
  user: UserWithProfile;
  message?: string;
  previousMessages?: Message[];
  extras?: Record<string, unknown>;  // e.g. { workoutDate, targetDay, absoluteWeek }
}

// Returns the composed output from the main agent + all sub-agents
const result = await agentRunner.invoke(agentId, params);
```

**Invocation flow:**
1. Fetch agent definition from DB (cached 5 min)
2. Resolve `context_types` → build system prompt context sections
3. Resolve `tool_ids` → get LangChain tools from ToolRegistry (with hook wrapping)
4. Resolve `schema_json` → configure structured output
5. Create agent via `createAgent(definition)`
6. Invoke agent with user message
7. Run `sub_agents` pipeline (recursive — sub-agents can have their own sub-agents, depth limit: 5)
8. Evaluate `validation_rules` on composed result; retry if failed
9. Fire post-hooks
10. Return composed result

---

## Declarative Systems

### 1. Input Mapping (Replaces Transform Functions)

Sub-agents receive their input via declarative mappings that extract data from the parent agent's result, the user, extras, or literal values.

```typescript
interface InputMapping {
  [key: string]: string | InputMapping;
}
```

**Reference syntax** — values prefixed with `$` are resolved at runtime:

| Reference | Resolves To |
|-----------|------------|
| `$result` | Entire parent agent result |
| `$result.overview` | `parentResult.overview` |
| `$result.days` | `parentResult.days` (arrays passed as-is) |
| `$user.name` | `user.name` from invoke params |
| `$user.profile` | `user.profile` |
| `$extras.absoluteWeek` | `extras.absoluteWeek` from invoke params |
| `$parentInput` | The input that was sent to the parent agent |
| `$now` | Current date formatted for AI |
| `"literal"` | Passed as-is (no `$` prefix) |

**Example — plan:generate → plan:message sub-agent:**
```json
{
  "inputMapping": {
    "userName": "$user.name",
    "userProfile": "$user.profile",
    "overview": "$result"
  }
}
```

This replaces the old `injectUserForMessage` transform function. The resolved mapping is either:
- Passed through a `user_prompt_template` (if the sub-agent has one) with `{{variable}}` substitution
- Or `JSON.stringify()`'d as the sub-agent's user message

### 2. User Prompt Templates

Templates stored in the `user_prompt_template` column use `{{variable}}` syntax. Variables are resolved from the sub-agent's inputMapping output.

**Example — plan:message agent:**
```
Generate a short, friendly onboarding SMS for the client below based on their new fitness plan.

<User>
Name: {{userName}}
</User>

<User Profile>
{{userProfile}}
</User Profile>

<Fitness Plan>
{{overview}}
</Fitness Plan>

Guidelines:
- Sound natural and personal, as if the coach is texting the client directly.
- Focus on what the plan does and how it's structured.
- Limit to 1 or 2 messages total (each under 160 characters).
- Output only the message text (no JSON wrapper).
```

### 3. Validation Rules (Replaces Validator Functions)

Declarative rules that check agent output. Used for both agent-level validation (with retry) and sub-agent conditions.

```typescript
interface ValidationRule {
  field: string;    // dot-path into result, e.g. "validation.isValid", "days"
  check: 'equals' | 'truthy' | 'nonEmpty' | 'allNonEmpty' | 'length';
  expected?: unknown;  // for 'equals' and 'length'
  error?: string;      // error message on failure
}
```

**Check types:**

| Check | Passes When |
|-------|------------|
| `equals` | `value === expected` |
| `truthy` | `!!value` |
| `nonEmpty` | Array: `length > 0`; Other: `!!value` |
| `allNonEmpty` | Array where every element is truthy |
| `length` | Array with `length === expected` |

**Example — workout:structured validation:**
```json
{
  "validationRules": [
    { "field": "validation.isValid", "check": "equals", "expected": true, "error": "Workout structure failed validation" }
  ]
}
```

When validation fails, the AgentRunner retries (up to `max_retries`) with error feedback in the message history.

### 4. Conditions (Replaces Condition Functions)

Sub-agents can declare conditions using the same rule format. The condition is evaluated against the parent agent's result. If any rule fails, the sub-agent is skipped.

**Example — profile:structured only runs if profile was updated:**
```json
{
  "condition": [{ "field": "wasUpdated", "check": "truthy" }]
}
```

### 5. JSON Schemas (Replaces Zod Schema References)

Structured output schemas stored as JSON Schema in the `schema_json` column. Both OpenAI and Gemini support JSON Schema natively via `withStructuredOutput()`.

```json
{
  "type": "object",
  "properties": {
    "updatedProfile": { "type": "string" },
    "wasUpdated": { "type": "boolean" },
    "updateSummary": { "type": "string" }
  },
  "required": ["updatedProfile", "wasUpdated"]
}
```

---

## Sub-Agent Pipelines

Sub-agents are configured via the `sub_agents` JSONB column. Each entry specifies:

```typescript
interface SubAgentConfig {
  batch: number;              // Sequential ordering (0, 1, 2...)
  key: string;                // Result property name on composed output
  agentId: string;            // agent_definitions.agent_id to invoke
  inputMapping?: InputMapping; // Maps parent output → sub-agent input
  condition?: ValidationRule[]; // Skip if condition fails
  postHook?: HookConfig;      // Hook to fire after completion
}
```

**Execution rules:**
- Sub-agents in the same batch run **in parallel**
- Batches run **sequentially** (batch 0 before batch 1)
- Sub-agents are resolved **recursively** — a sub-agent can have its own sub-agents
- No inputMapping → defaults to passing `$result` as the user message

**Example — microcycle:generate pipeline:**
```json
[
  {
    "batch": 0, "key": "message", "agentId": "microcycle:message",
    "inputMapping": {
      "overview": "$result.overview",
      "days": "$result.days",
      "isDeload": "$result.isDeload"
    }
  },
  {
    "batch": 0, "key": "structure", "agentId": "microcycle:structured",
    "inputMapping": {
      "overview": "$result.overview",
      "days": "$result.days",
      "absoluteWeek": "$extras.absoluteWeek",
      "isDeload": "$result.isDeload"
    }
  }
]
```

Both sub-agents run in parallel (batch 0). The microcycle:message agent receives the overview, days array, and isDeload flag as JSON. The microcycle:structured agent also receives the absoluteWeek from extras.

---

## Hook System

Hooks are atomic side-effect functions that fire at specific points in the agent/tool lifecycle.

### Hook Functions

```typescript
type HookFn = (user: UserWithProfile, value: unknown) => Promise<void>;
```

Hooks are registered in the HookRegistry by name. They receive the user and a value extracted via the configured source path.

### Hook Configuration

```typescript
interface HookConfig { hook: string; source?: string; }
type HookConfigOrString = HookConfig | string;
```

**Shorthand:** `"sendMessage"` → `{ hook: "sendMessage" }` with default source based on position.

**Full form:** `{ "hook": "sendMessage", "source": "args.message" }` — the source is a dot-path for extracting the value to pass to the hook.

### Hook Attachment Points

| Location | Config Column | Description |
|----------|--------------|-------------|
| Agent pre/post | `hooks` | Fires before/after the entire agent invocation |
| Tool pre/post | `tool_hooks` | Per-tool hooks on the parent agent |
| Sub-agent post | `sub_agents[].postHook` | Fires after a sub-agent completes |

**Example — chat:generate tool_hooks:**
```json
{
  "make_modification": {
    "preHook": { "hook": "sendMessage", "source": "args.message" }
  }
}
```

This sends the user's message as an immediate SMS before the modification tool executes (latency reduction — user gets an ack while the modification runs).

### Available Hooks

| Hook Name | Description | Expected Value |
|-----------|------------|----------------|
| `sendMessage` | Sends an immediate SMS to the user | String message text |

---

## Tool System

### Tool Registry

Tools are registered centrally and referenced by name in agent definitions.

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  schema: ZodSchema;          // Input schema for the LLM
  priority?: number;          // Execution order (lower = first)
  execute: (ctx: ToolExecutionContext, args: Record<string, unknown>) => Promise<ToolResult>;
}

interface ToolExecutionContext {
  user: UserWithProfile;
  message: string;
  previousMessages?: Message[];
  services: ServiceContainer;  // Full service access at invocation time
  extras?: Record<string, unknown>;
}
```

Tools are pure execution units — they don't know about hooks or messaging. The ToolRegistry wraps tools with hook execution when resolving them for an agent.

### Available Tools

| Tool Name | Priority | Description | Used By |
|-----------|----------|-------------|---------|
| `update_profile` | 1 | Updates user fitness profile | `chat:generate` |
| `get_workout` | 2 | Retrieves today's workout | `chat:generate` |
| `make_modification` | 3 | Routes modification requests | `chat:generate` |
| `modify_workout` | — | Modifies a specific workout | `modifications:router` |
| `modify_week` | — | Modifies the weekly schedule | `modifications:router` |
| `modify_plan` | — | Modifies the fitness plan | `modifications:router` |

---

## Agent Catalog

### Chat & Routing

| Agent ID | Model | Description | Tools | Sub-Agents |
|----------|-------|-------------|-------|------------|
| `chat:generate` | gpt-5.1 | Main conversational agent | update_profile, get_workout, make_modification | — |
| `modifications:router` | gpt-5-nano | Routes modification requests | modify_workout, modify_week, modify_plan | — |

### Profile

| Agent ID | Model | Description | Sub-Agents |
|----------|-------|-------------|------------|
| `profile:fitness` | gpt-5-nano | Updates fitness profile dossier | `profile:structured` (conditional on wasUpdated) |
| `profile:structured` | gpt-5-nano | Extracts structured profile data | — |
| `profile:user` | gpt-5-nano | Extracts timezone, send time, name | — |

### Workout

| Agent ID | Model | Description | Sub-Agents |
|----------|-------|-------------|------------|
| `workout:generate` | gpt-5.1 | Generates workout for a day | `workout:message` + `workout:structured` (parallel) |
| `workout:structured` | gpt-5-nano | Structures workout into JSON | `workout:structured:validate` |
| `workout:structured:validate` | gpt-5-nano | Validates workout completeness | — |
| `workout:message` | gpt-5-nano | Formats workout as SMS | — |
| `workout:modify` | gpt-5-mini | Modifies existing workouts | `workout:message` + `workout:structured` (parallel) |

### Microcycle

| Agent ID | Model | Description | Sub-Agents |
|----------|-------|-------------|------------|
| `microcycle:generate` | gpt-5.1 | Generates weekly training pattern | `microcycle:message` + `microcycle:structured` (parallel) |
| `microcycle:structured` | gpt-5-nano | Structures microcycle output | — |
| `microcycle:message` | gpt-5-nano | Formats microcycle as SMS | — |
| `microcycle:modify` | gpt-5-mini | Modifies existing microcycles | `microcycle:message` + `microcycle:structured` (parallel) |

### Fitness Plan

| Agent ID | Model | Description | Sub-Agents |
|----------|-------|-------------|------------|
| `plan:generate` | gpt-5.1 | Generates fitness plan | `plan:message` + `plan:structured` (parallel) |
| `plan:structured` | gpt-5-nano | Structures plan output | — |
| `plan:message` | gpt-5-nano | Generates plan summary SMS | — |
| `plan:modify` | gpt-5-mini | Modifies existing plans | `plan:structured` |

### Messaging & Other

| Agent ID | Model | Description |
|----------|-------|-------------|
| `messaging:plan-summary` | gpt-5-nano | Generates plan summary messages |
| `messaging:plan-ready` | gpt-5-nano | Generates plan ready notifications |
| `program:parse` | gpt-5.1 | Parses raw program text |
| `blog:metadata` | gpt-5-nano | Generates blog post metadata |

---

## Context Types

Agents declare which context they need via `context_types`. The ContextService resolves these in parallel before agent invocation.

| Context Type | Description | Data Source |
|-------------|-------------|-------------|
| `USER` | User record (name, timezone, preferences) | UserService |
| `USER_PROFILE` | Fitness profile dossier | FitnessProfileService |
| `FITNESS_PLAN` | Current fitness plan | FitnessPlanService |
| `CURRENT_WORKOUT` | Today's workout instance | WorkoutInstanceService |
| `CURRENT_MICROCYCLE` | Current week's microcycle | MicrocycleService |
| `DATE_CONTEXT` | Current date/time formatted for AI | Computed |
| `DAY_OVERVIEW` | Day description from microcycle | From extras |
| `TRAINING_META` | Training metadata (week number, phase) | From extras |
| `EXPERIENCE_LEVEL` | User's experience level snippet | From DB |
| `PROGRAM_VERSION` | Program description | ProgramService |
| `AVAILABLE_EXERCISES` | Exercise library for the workout | ExerciseService |
| `DAY_FORMAT` | Day formatting instructions | From activityType extra |

---

## Architecture Diagram

```
                    Service Layer
                         │
                    agentRunner.invoke(agentId, params)
                         │
                    ┌────┴────┐
                    │ AgentRunner │
                    └────┬────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    DB Definition   ContextService   ToolRegistry
    (agent config)  (resolve types)  (resolve tools)
          │              │              │
          └──────────────┼──────────────┘
                         │
                    ┌────┴────┐
                    │ createAgent │
                    └────┬────┘
                         │
                    Agent Invocation
                    (LLM call with tools/schema)
                         │
                    ┌────┴────┐
                    │ Sub-Agent │──── inputMapping resolution
                    │ Pipeline  │──── condition evaluation
                    └────┬────┘──── hook execution
                         │
                    Validation Rules
                    (retry if failed)
                         │
                    Composed Result
```

---

## File Structure

```
packages/shared/src/server/agents/
├── hooks/
│   ├── types.ts              — HookFn, HookConfig, HookConfigOrString, HookableConfig
│   ├── hookRegistry.ts       — HookRegistry class
│   ├── resolver.ts           — normalizeHookConfig(), resolveDotPath()
│   ├── definitions/
│   │   ├── sendMessage.ts    — createSendMessageHook()
│   │   └── index.ts          — registerAllHooks()
│   └── index.ts
├── tools/
│   ├── types.ts              — ToolDefinition, ToolExecutionContext
│   ├── toolRegistry.ts       — ToolRegistry class
│   ├── definitions/
│   │   ├── chatTools.ts      — update_profile, get_workout, make_modification
│   │   ├── modificationTools.ts — modify_workout, modify_week, modify_plan
│   │   └── index.ts          — registerAllTools()
│   └── index.ts
├── declarative/
│   ├── types.ts              — InputMapping, ValidationRule, MappingContext
│   ├── inputMapping.ts       — resolveInputMapping()
│   ├── validation.ts         — evaluateRules()
│   ├── templateEngine.ts     — resolveTemplate()
│   ├── schemaResolver.ts     — JSON Schema → structured output
│   └── index.ts
├── runner/
│   ├── types.ts              — AgentInvokeParams, SubAgentDbConfig, ExtendedAgentConfig
│   ├── agentRunner.ts        — AgentRunner class
│   └── index.ts
├── createAgent.ts            — Agent factory (existing, modified)
├── toolExecutor.ts           — Tool loop executor (existing, modified)
├── subAgentExecutor.ts       — Sub-agent batch executor (existing, modified)
├── constants.ts              — Agent ID constants
├── types.ts                  — Core agent types
└── index.ts                  — Barrel exports
```

---

## Adding a New Agent

To add a new agent, insert a row into `agent_definitions`:

```sql
INSERT INTO agent_definitions (
  agent_id, system_prompt, model, max_tokens, temperature,
  context_types, schema_json, sub_agents, user_prompt_template
) VALUES (
  'my:new:agent',
  'You are a helpful assistant that...',
  'gpt-5-nano',
  4000,
  0.7,
  '{USER_PROFILE, FITNESS_PLAN}',
  '{"type": "object", "properties": {"summary": {"type": "string"}}, "required": ["summary"]}',
  '[{"batch": 0, "key": "formatted", "agentId": "my:formatter", "inputMapping": {"text": "$result.summary"}}]',
  NULL
);
```

Then invoke it:
```typescript
const result = await agentRunner.invoke('my:new:agent', { user, message });
```

No code changes required.

---

## Modifying an Agent

To change an agent's behavior, insert a new version:

```sql
INSERT INTO agent_definitions (agent_id, system_prompt, model, temperature, ...)
SELECT agent_id, 'Updated system prompt...', 'gpt-5.1', 0.5, ...
FROM agent_definitions
WHERE agent_id = 'workout:generate' AND is_active = true
ORDER BY created_at DESC LIMIT 1;
```

The latest active version is automatically used (after cache TTL expires, ~5 min).

To rollback, deactivate the new version:
```sql
UPDATE agent_definitions SET is_active = false WHERE version_id = <new_version>;
```
