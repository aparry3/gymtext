# Agent System

GymText uses a **database-driven AI agent system** where agent definitions are stored in the database and resolved at runtime via code-side registries.

## Overview

The agent system consists of:

1. **AgentRunner** - Central entry point for all agent invocations
2. **Tool Registry** - Maps tool names to implementations
3. **Context Registry** - Maps context types to data providers
4. **Agent Definitions** - Stored in `agent_definitions` table

```
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│         (ChatService, WorkoutService, etc.)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AgentRunner                             │
│         agentRunner.invoke(agentId, params)                  │
└─────────────────────────────────────────────────────────────┘
          │               │                    │
          ▼               ▼                    ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────────┐
│ Context Registry│ │Tool Registry │ │Agent Definitions DB│
│ - user          │ │- update_     │ │- system_prompt     │
│ - userProfile   │ │  profile     │ │- user_prompt_tpl   │
│ - currentWorkout│ │- get_workout │ │- model config      │
└─────────────────┘ │- make_       │ │- tool_ids          │
                    │  modification│ │- context_types     │
                    └──────────────┘ └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   LangChain     │
                    │   (LLM calls)   │
                    └─────────────────┘
```

## AgentRunner

The `AgentRunner` is the single entry point for invoking agents:

```typescript
import { agentRunner } from '@gymtext/shared/server';

const result = await agentRunner.invoke('chat:generate', {
  input: 'What workout should I do today?',
  params: {
    user: userWithProfile,
    previousMessages: messages,
  },
});
```

### Invocation Flow

1. **Fetch definition** - Get agent config from `agent_definitions` table (cached 5min)
2. **Resolve context** - Get context data via Context Registry
3. **Resolve tools** - Get tool implementations via Tool Registry
4. **Build sub-agents** - Recursively build any sub-agents
5. **Create validation** - Build validation function from declarative rules
6. **Execute** - Run via LangChain (tool agent, structured output, or plain text)
7. **Execute sub-agents** - Run sub-agents in batches
8. **Log** - Write invocation to `agent_logs` table

## Agent Definitions

Agents are defined in the `agent_definitions` table with append-only versioning:

| Column | Type | Description |
|--------|------|-------------|
| `agent_id` | string | Unique identifier (e.g., `'chat:generate'`) |
| `system_prompt` | text | System prompt instructions |
| `user_prompt_template` | text | Template with `{{variable}}` substitution |
| `model` | string | Model identifier (e.g., `'gpt-4o'`, `'gpt-4o-mini'`) |
| `tool_ids` | jsonb | Array of tool names available to agent |
| `context_types` | jsonb | Array of context types to resolve |
| `sub_agents` | jsonb | Sub-agent configurations |
| `schema_json` | jsonb | JSON Schema for structured output |
| `validation_rules` | jsonb | Declarative validation rules |
| `temperature` | float | Model temperature (0-2) |
| `max_tokens` | int | Max tokens in response |
| `max_iterations` | int | Max tool call iterations |
| `max_retries` | int | Max validation retries |

### Agent ID Constants

Defined in `packages/shared/src/server/agents/constants.ts`:

```typescript
// Chat agents
export const AGENT_CHAT_GENERATE = 'chat:generate';

// Profile agents
export const AGENT_PROFILE_FITNESS = 'profile:fitness';
export const AGENT_PROFILE_USER = 'profile:user';

// Plan agents
export const AGENT_PLAN_GENERATE = 'plan:generate';

// Workout agents
export const AGENT_WORKOUT_GENERATE = 'workout:generate';

// Modification agents
export const AGENT_MODIFICATIONS_ROUTER = 'modifications:router';
```

## Key Agents

### chat:generate

Main conversational agent for SMS chat.

- **Tools**: `update_profile`, `get_workout`, `make_modification`
- **Context**: `user`, `userProfile`, `fitnessPlan`, `currentWorkout`, `dateContext`
- **Model**: Configurable (default: GPT-4o)

### profile:fitness

Extracts and updates fitness profile from conversation.

- **Tools**: `update_profile` (via service callback)
- **Sub-agents**: `profile:structured` for structured data extraction
- **Output**: Fitness profile updates

### plan:generate

Creates comprehensive fitness plans.

- **Sub-agents**: Generates mesocycle structure
- **Output**: Complete fitness plan with phases

### workout:generate

Generates daily workouts.

- **Sub-agents**: 
  - `workout:message` - Natural language description
  - `workout:structured` - Structured workout data

### modifications:router

Routes modification requests to appropriate handlers.

- **Sub-agents**: Various modification types (workout, week, plan)

## Related Documentation

- [Agent Runner](./agent-runner.md) - Detailed AgentRunner documentation
- [Tools](./tools.md) - Available agent tools
- [Context Providers](./context.md) - Context resolution
- [Agent Definitions](./definitions.md) - Agent definitions reference
