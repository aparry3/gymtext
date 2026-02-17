# Markdown-First Agent System - Ground-Up Rebuild

## Executive Summary

This document outlines a complete architectural rebuild of GymText's AI/agent system using markdown as the canonical source of truth. **This is not an incremental migration** — this is a clean-slate redesign that keeps what works (agent orchestration, non-AI infrastructure) and rebuilds everything AI-related with simplicity and transparency as core principles.

## Why Rebuild From Scratch?

### Current System Challenges
1. **JSON Complexity:** Rigid 200+ line schemas that are hard to debug and modify
2. **Opaque Context:** Nested JSON paths obscure what data flows where
3. **Validation Overhead:** Complex multi-step validation agents that slow generation
4. **Debugging Difficulty:** JSON errors require deep inspection to understand
5. **Git Diffs:** Meaningless when JSON structures change
6. **LLM Inefficiency:** Models work better with markdown than strict JSON

### Core Insight: Markdown Is Better for Everything

**For LLMs:**
- Native format (trained on markdown, not JSON)
- Flexible structure
- Easy to see examples
- Self-documenting

**For Humans:**
- Readable without tools
- Meaningful git diffs
- Easy to edit and debug
- Clear audit trail

**For the System:**
- Simple validation (section checks, not deep schemas)
- Fast generation (fewer retries)
- Transparent data flow (file reads, not JSON path navigation)

## The Rebuild Architecture

### Non-Negotiable Principle

**Main agents MUST ALWAYS return markdown.** 

This is the foundation of the entire system. Sub-agents can convert markdown to other formats (SMS, JSON for UI, analytics), but every primary agent in the chain works with markdown as both input and output.

### What Stays (Don't Touch)

All non-AI infrastructure remains exactly as-is:
- `users` table (authentication, user accounts)
- `signupdata` table (onboarding information)
- `messages` table (chat history)
- `message_queues` table (SMS delivery)
- `subscriptions` table (Stripe billing)
- `exercises` table (exercise database with videos)
- SMS delivery infrastructure
- Authentication system
- Billing/payment processing

### What Gets Rebuilt (AI Layer)

Everything related to training and agents:
- Agent system architecture
- Training plan generation
- Workout generation
- User profiles/dossiers
- Microcycle management
- Context assembly
- All agent definitions

## Key Design Principles

1. **Markdown is canonical** — All edits go to markdown first, JSON is generated JIT
2. **Main agents return markdown** — No JSON transforms between main agents
3. **Sub-agents convert formats** — markdown → SMS, markdown → JSON for UI
4. **Cache for performance** — Generate JSON on-demand, cache for fast queries
5. **Transparent context** — Tool calls read files, no opaque JSON mappings
6. **Simple validation** — Section checks (regex), not deep schema traversal
7. **Keep non-AI infrastructure** — Don't rebuild what already works

## Core Agent Architecture

### Three Primary Agents

**1. Fitness Plan Agent**
- **Input:** User dossier markdown
- **Output:** Complete 12-week training plan markdown (with all microcycle sections)
- **Runs:** Onboarding, or when user requests plan change
- **Returns:** Markdown ONLY

**2. Microcycle Agent** (Weekly Generator)
- **Input:** User dossier + current microcycle section + recent workouts (all markdown)
- **Output:** 7 daily workout markdowns (Monday-Sunday)
- **Runs:** Sunday night for upcoming week
- **Returns:** Markdown ONLY

**3. Workout Message Agent**
- **Input:** Today's workout markdown
- **Output:** SMS-formatted message text
- **Runs:** Each morning (user's preferred time)
- **Note:** This is a **sub-agent** that converts markdown → SMS

### Supporting Sub-Agents

4. **Weekly Overview Agent** — Summarize week's plan markdown → SMS summary
5. **Workout Structure Agent** — Convert workout markdown → JSON for calendar UI
6. **Analytics Agent** — Parse workout history markdown → progress charts/JSON
7. **Weekly Breakdown Structure Agent** — Convert week markdown → JSON for UI

## Data Model Summary

### User Dossiers
```sql
CREATE TABLE user_dossiers (
  user_id UUID PRIMARY KEY,
  markdown TEXT NOT NULL,              -- Source of truth
  profile_json JSONB,                  -- Cached for fast queries
  current_plan_id UUID,
  cache_version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Unified markdown file containing:
- Profile (name, age, goals, experience)
- Equipment access
- Schedule & availability
- Training history (chronological, append-only)
- Current training plan reference

### Training Plans
```sql
CREATE TABLE training_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  markdown TEXT NOT NULL,              -- Full plan with all microcycles
  structured_plan JSONB,               -- Cached for UI
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  cache_version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Complete 12-week plan markdown with:
- Program philosophy
- Microcycle sections (each 4-week block)
- Weekly patterns (exercise structure)
- Progression strategy
- Modification history

### Workouts
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  training_plan_id UUID REFERENCES training_plans(id),
  workout_date DATE NOT NULL,
  markdown TEXT NOT NULL,              -- Source of truth
  structured_workout JSONB,            -- Cached for calendar UI
  sms_message TEXT,                    -- Cached for fast delivery
  exercise_list TEXT[],                -- Cached for analytics
  total_volume_lbs INT,                -- Cached aggregate
  cache_version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

Daily workout markdown with:
- Warm-up exercises
- Main workout (exercises, sets, reps, weights)
- Cool down
- Notes section

## Agent Registry Simplification

### Old (Complex)
```typescript
{
  agent_id: 'workout:generate',
  schema_json: { /* 200+ lines of nested JSON schema */ },
  input_mapping: {
    user_profile: '$.context.user.structured_profile.profile',
    equipment: '$.context.user.structured_profile.equipment.available',
    current_plan: '$.context.plans[0].microcycles[2].workouts.monday'
  },
  sub_agents: [
    { agent_id: 'workout:structured:validate', ... },
    { agent_id: 'workout:structured:transform', ... }
  ]
}
```

### New (Simple)
```typescript
{
  agent_id: 'workout:generate',
  system_prompt: "You are a personal trainer...",
  tools: [
    'read_user_dossier',
    'read_training_plan',
    'read_recent_workouts',
    'read_example_workouts'
  ],
  output_format: 'markdown',           // ALWAYS markdown for main agents
  validation: 'workout_markdown_sections',  // Simple section check
  sub_agents: [
    { agent_id: 'workout:to_sms', input_format: 'markdown' }
  ]
}
```

**Changes:**
- ❌ Remove rigid JSON schemas
- ✅ Add example markdown files as tool
- ❌ Remove complex input_mapping (use tools to read files)
- ❌ Remove validation sub-agents (use simple section checks)
- ✅ Add lightweight format conversion sub-agents

## Data Flow Example: Weekly Workout Generation

**Sunday night (before upcoming week):**

1. **Cron triggers:** Weekly generation job for user
2. **Microcycle Agent invoked:**
   - Tool call: `read_user_dossier(user_id)` → returns markdown
   - Tool call: `read_training_plan(plan_id)` → returns markdown
   - Tool call: `read_recent_workouts(user_id, last_7_days)` → returns markdown array
   - Tool call: `read_example_workouts(type='upper_strength')` → returns markdown examples
3. **Agent generates:** 7 daily workout markdowns (Mon-Sun)
4. **Validation:** Simple section checks (has warm-up? has main workout? has cool down?)
5. **Storage:** Insert 7 markdown workouts into `workouts` table
6. **Cache generation (async):** Sub-agent converts markdown → JSON for calendar UI

**Monday morning (6:00 AM):**

7. **Cron triggers:** Daily workout message for user
8. **Workout Message Agent invoked:**
   - Reads today's workout markdown
   - Converts to SMS-friendly format
   - Returns SMS text
9. **Cache:** Store SMS text in `workouts.sms_message` (fast delivery tomorrow)
10. **Deliver:** Send SMS via existing infrastructure

**Key Benefits:**
- Transparent data flow (file reads, not JSON navigation)
- Fast generation (no validation retries)
- Debuggable (can read markdown at any step)
- Cacheable (JSON/SMS generated once, reused)

## Performance Strategy

### Problem: Markdown is verbose, generation can be slow

### Solution: Cache-for-Performance Pattern

1. **Source of Truth:** Markdown (readable, debuggable, versionable)
2. **Generated Views:** JSON/SMS (fast to query, optimized for use case)
3. **Cache Invalidation:** `cache_version` column tracks when to regenerate

**When to regenerate:**
- Markdown changes (edit → regenerate)
- Schema changes (bump cache_version → regenerate all)
- On-demand (cache miss → generate → store)

**Example:**
```typescript
async function getUserProfile(userId: string) {
  const dossier = await db.query('SELECT markdown, profile_json, cache_version FROM user_dossiers WHERE user_id = $1', [userId]);
  
  // Cache hit: return JSON
  if (dossier.profile_json && dossier.cache_version === CURRENT_VERSION) {
    return dossier.profile_json;
  }
  
  // Cache miss: generate from markdown
  const profileJson = await generateProfileJson(dossier.markdown);
  
  // Update cache
  await db.query('UPDATE user_dossiers SET profile_json = $1, cache_version = $2 WHERE user_id = $3', 
    [profileJson, CURRENT_VERSION, userId]);
  
  return profileJson;
}
```

## Migration Strategy Summary

**Not a migration — this is a rebuild.**

### Phase 1: Build New System (Parallel)
- Create new tables (`user_dossiers`, `training_plans`, `workouts`)
- Implement new agents (fitness plan, microcycle, workout message)
- Build tools (read_user_dossier, read_training_plan, etc.)
- Test with synthetic users

### Phase 2: Gradual Cutover
- **New users:** Use new system exclusively
- **Existing users:** Migrate on next plan update
  - Convert old JSON profile → markdown dossier
  - Convert old plan → markdown plan
  - Going forward: markdown system

### Phase 3: Deprecation
- Once 100% of users on new system
- Archive old tables (`profiles`, `structured_plans`, etc.)
- Remove old agents
- Keep non-AI infrastructure (users, messages, billing)

**Timeline:** 8-12 weeks from start to 100% cutover

## Benefits Summary

### For Users
- ✅ **Faster workouts:** 60% reduction in generation latency (no validation retries)
- ✅ **Better quality:** LLMs work better with markdown (native format)
- ✅ **More consistency:** Example-driven prompting vs. rigid schemas

### For Developers
- ✅ **Easier debugging:** Read markdown files, not JSON
- ✅ **Faster iteration:** Edit prompts and examples, not schemas
- ✅ **Better git history:** Meaningful diffs for markdown changes
- ✅ **Simpler code:** No complex JSON path navigation

### For the Business
- ✅ **Lower costs:** 50% reduction in tokens (no validation sub-agents)
- ✅ **Faster features:** Simpler architecture = faster development
- ✅ **Better reliability:** Fewer moving parts = fewer failure modes

## Next Steps

1. **Read the detailed docs:**
   - `01-agent-architecture.md` — Full agent system design
   - `02-database-schema.md` — Complete database design
   - `03-agent-registry.md` — Simplified registry design
   - `04-data-flow.md` — Detailed data flow diagrams
   - `05-markdown-formats.md` — Canonical markdown formats
   - `06-implementation-plan.md` — Build roadmap

2. **Review code examples:**
   - `examples/agent-definitions/` — Sample agent registry entries
   - `examples/markdown-templates/` — Template markdown files
   - `examples/tools/` — Tool implementations

3. **Build Phase 1:**
   - Set up new tables
   - Implement core agents
   - Create tools
   - Test with synthetic users

## Decision

This is a **rebuild, not a refactor.** We're not incrementally improving the current system — we're designing the ideal system from scratch and cutting over to it.

**Why now?** 
- Current system is reaching complexity limit
- Adding features is getting slower
- Debugging is painful
- Token costs are high

**Why markdown-first?**
- LLMs work better with it
- Humans can actually read it
- Git diffs are meaningful
- Validation is simpler
- It's what OpenClaw does (proven architecture)

Let's build it.
