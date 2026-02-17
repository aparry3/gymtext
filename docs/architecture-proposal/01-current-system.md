# Current System Architecture Audit

## System Overview

GymText's current architecture follows a sophisticated agent-based pattern with database-driven configuration. The system is well-engineered but has grown complex through iterative development.

## Core Components

### 1. Agent Registry System ⭐ (Strength)

**Location:** `agent_definitions` table + `AgentRunner`

**What It Does:**
- Database-driven agent configuration (no code changes for new agents)
- Versioned, append-only agent definitions
- Declarative tool bindings, context types, sub-agents, hooks
- Runtime composition of agents from DB config

**Strengths:**
- ✅ Highly flexible
- ✅ No deployment needed for prompt/config changes
- ✅ Version history preserved
- ✅ Supports complex orchestration (sub-agents, hooks)

**Pain Points:**
- ⚠️ Complexity: lots of moving parts to understand
- ⚠️ Debugging: agent behavior determined by DB state, not code
- ⚠️ Testing: hard to unit test when everything is database-driven

### 2. Sub-Agent Pipeline ⭐ (Strength)

**How It Works:**
```typescript
{
  sub_agents: [
    {
      agent_id: 'workout:structured',
      input_mapping: { markdown: '$.result.markdown' },
      conditions: { when: { hasMarkdown: true } }
    }
  ]
}
```

**Strengths:**
- ✅ Declarative composition
- ✅ Clean separation of concerns
- ✅ Reusable transformation agents

**Pain Points:**
- ⚠️ JSONPath mapping can be cryptic
- ⚠️ Errors in mappings are runtime-only
- ⚠️ Hard to trace data flow through multiple sub-agents

### 3. Tool Registry ⭐ (Strength)

**Location:** `packages/shared/src/server/agents/tools/toolRegistry.ts`

**What It Does:**
- Centralized tool definitions
- Type-safe tool parameters
- Automatic LangChain tool wrapping

**Strengths:**
- ✅ DRY: tools defined once, used everywhere
- ✅ Type safety
- ✅ Easy to add new tools

**Pain Points:**
- ⚠️ Some tools are thin wrappers around services (could be simpler)

### 4. Context Resolution ⭐ (Strength)

**Location:** `packages/shared/src/server/agents/context/contextRegistry.ts`

**What It Does:**
- Declares what context types an agent needs (e.g., `USER_PROFILE`, `FITNESS_PLAN`)
- Automatically fetches and injects context into system prompt

**Strengths:**
- ✅ Declarative dependencies
- ✅ Prevents missing context bugs
- ✅ Consistent context formatting

**Pain Points:**
- ⚠️ Context can get verbose (15KB+ system prompts)
- ⚠️ Hard to know which context is actually used by the LLM

### 5. Structured Output Validation ⚠️ (Complexity Hotspot)

**Current Flow:**
```
Agent generates markdown
  → workout:structured sub-agent converts to JSON
    → workout:structured:validate sub-agent validates completeness
      → Retry if invalid
        → Eventually give up or succeed
```

**Pain Points:**
- ⚠️ Three agent calls for one workout (expensive)
- ⚠️ Validation schema is rigid; LLMs struggle with deeply nested structures
- ⚠️ Error messages don't always help the LLM fix the issue
- ⚠️ Retries burn tokens and add latency

**Example Validation Error:**
```
"Error: workout.exercises[2].sets[1].reps missing"
```
↳ LLM has to figure out which exercise, which set, why it's missing

### 6. Data Entities ⚠️ (Fragmentation)

**Current Separation:**
- `users` table
- `user_profiles` table (structured JSON)
- `fitness_plans` table (structured JSON + markdown description)
- `microcycles` table (structured JSON + markdown pattern)
- `workouts` table (structured JSON + markdown message)
- `messages` table (chat history)

**Pain Points:**
- ⚠️ Data scattered across multiple tables
- ⚠️ Joins needed to get full user context
- ⚠️ Markdown is treated as "output format" not canonical representation
- ⚠️ Duplication: structured JSON has same info as markdown, but in less readable form

**Example Query Complexity:**
To get everything needed for a workout:
```sql
SELECT 
  u.*, 
  up.profile_json,
  fp.plan_json,
  fp.description_markdown,
  mc.pattern_json,
  mc.description_markdown,
  -- ... more joins
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN fitness_plans fp ON u.active_plan_id = fp.id
LEFT JOIN microcycles mc ON mc.fitness_plan_id = fp.id
WHERE ...
```

## Architecture Strengths (Keep These!)

1. **Agent Registry Pattern** - Database-driven config is powerful and flexible
2. **Sub-Agent Composition** - Clean way to build complex flows from simple agents
3. **Tool Registry** - Centralized, reusable tools
4. **Context Resolution** - Declarative dependencies
5. **Hook System** - Side effects (SMS, logging) separated from core logic

## Architecture Pain Points (Simplify These)

1. **Structured JSON as Primary Format**
   - LLMs excel at markdown, struggle with deeply nested JSON
   - Validation is brittle
   - Hard for humans to read/debug

2. **Multiple Transformation Layers**
   - markdown → JSON → validate → re-generate → validate again
   - Each layer adds latency, cost, and failure modes

3. **Fragmented Data Model**
   - User context spread across many tables
   - Markdown treated as "output" not canonical source

4. **Heavy Validation Logic**
   - Complex JSON schemas
   - Multi-step validation agents
   - Retry loops that burn tokens

## Complexity Hotspots (Migration Targets)

### Hotspot 1: Workout Generation
**Current:** 5+ agent calls (generate, structure, validate, message, optional sub-agents)
**Target:** 2 agent calls (generate markdown, optional: extract JSON for UI)

### Hotspot 2: Profile Updates
**Current:** Extract structured JSON, validate, merge with existing JSON, save
**Target:** Append to markdown dossier section, save

### Hotspot 3: Fitness Plan Creation
**Current:** Generate plan JSON, generate microcycles JSON array, validate, structure
**Target:** Generate markdown training plan with microcycle sections

## Migration Opportunities

Based on this audit, these areas would benefit most from markdown-first simplification:

1. **User Profiles** → Unified markdown dossier
2. **Fitness Plans + Microcycles** → Markdown training plan with weekly patterns
3. **Workouts** → Keep markdown as canonical; generate JSON for calendar UI
4. **Validation** → Simple structure checks instead of deep schema validation

## What We've Learned

**The Good:**
- Agent registry architecture is solid
- Sub-agent pattern enables composition
- Tool/context registries prevent code duplication

**The Overcomplicated:**
- Too many layers between user input and output
- LLMs forced to work with JSON instead of their native markdown
- Validation is too rigid for the flexibility LLMs need

**The Insight:**
OpenClaw proves markdown-first works at scale. We can adopt the same philosophy while keeping our excellent agent orchestration layer.

## Next: OpenClaw Lessons

Read `02-openclaw-lessons.md` to see how a production markdown-first system works.
