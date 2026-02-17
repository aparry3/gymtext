# Database Schema - Complete Design

## Design Philosophy

**Markdown is the source of truth. JSON is cached for performance.**

Every table that stores AI-generated content follows this pattern:
```sql
CREATE TABLE example (
  id UUID PRIMARY KEY,
  markdown TEXT NOT NULL,              -- Source of truth (editable, versionable)
  
  -- Cached structured views (generated JIT, nullable)
  structured_data JSONB,
  sms_text TEXT,
  summary_text TEXT,
  
  cache_version INT DEFAULT 1,          -- Invalidate cache when schema changes
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Principles:**
1. **Markdown is NOT NULL** — Always present, always canonical
2. **JSON is nullable** — Can be regenerated, may be missing (cache miss)
3. **Cache version tracks schema** — Bump to invalidate all cached JSON
4. **Indexes on JSON** — Fast queries when cache is warm

---

## Core Tables (AI Content)

### user_dossiers

**Purpose:** Unified user profile, equipment, schedule, and training history

```sql
CREATE TABLE user_dossiers (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Source of truth
  markdown TEXT NOT NULL,
  
  -- Cached structured views
  profile_json JSONB,                   -- { name, age, goals, experience, ... }
  equipment_tags TEXT[],                -- ['Barbell', 'Dumbbells', 'Squat Rack']
  training_days TEXT[],                 -- ['Monday', 'Wednesday', 'Friday']
  current_plan_id UUID,                 -- Foreign key to training_plans (nullable)
  
  -- Cache management
  cache_version INT NOT NULL DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dossiers_equipment ON user_dossiers USING GIN(equipment_tags);
CREATE INDEX idx_dossiers_training_days ON user_dossiers USING GIN(training_days);
CREATE INDEX idx_dossiers_profile ON user_dossiers USING GIN(profile_json);

-- Full-text search on markdown (for admin/debugging)
CREATE INDEX idx_dossiers_markdown_fts ON user_dossiers USING GIN(to_tsvector('english', markdown));

-- Trigger: Update updated_at on change
CREATE TRIGGER update_dossiers_updated_at
  BEFORE UPDATE ON user_dossiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Markdown Structure:**
```markdown
# Training Dossier - [User Name]

## Profile
- **Name:** ...
- **Age:** ...
- **Experience Level:** ...
- **Primary Goals:** ...

## Equipment Access
...

## Schedule & Availability
...

## Training History
### YYYY-MM-DD - [Event]
...

## Current Training Plan
**Program:** ...
**Phase:** ...
```

**Cache Fields:**
- `profile_json`: Extracted profile data (name, age, goals, experience)
- `equipment_tags`: Array of equipment names for fast filtering
- `training_days`: Array of training day names
- `current_plan_id`: Reference to active plan

---

### training_plans

**Purpose:** Complete 12-week training plan with microcycle sections

```sql
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Source of truth
  markdown TEXT NOT NULL,
  
  -- Cached structured views
  structured_plan JSONB,                -- { microcycles: [...], exercises: [...], ... }
  exercise_list TEXT[],                 -- All unique exercises in plan
  plan_type VARCHAR(50),                -- 'upper_lower', 'ppl', 'full_body', etc.
  
  -- Plan metadata
  start_date DATE NOT NULL,
  end_date DATE,                        -- Calculated: start_date + 12 weeks
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Cache management
  cache_version INT NOT NULL DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_plans_user ON training_plans(user_id, is_active);
CREATE INDEX idx_plans_active ON training_plans(is_active, start_date);
CREATE INDEX idx_plans_dates ON training_plans(start_date, end_date);
CREATE INDEX idx_plans_exercises ON training_plans USING GIN(exercise_list);
CREATE INDEX idx_plans_structured ON training_plans USING GIN(structured_plan);

-- Trigger: Update updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Calculate end_date
CREATE OR REPLACE FUNCTION calculate_plan_end_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date IS NULL AND NEW.start_date IS NOT NULL THEN
    NEW.end_date := NEW.start_date + INTERVAL '12 weeks';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_plan_end_date
  BEFORE INSERT OR UPDATE ON training_plans
  FOR EACH ROW
  EXECUTE FUNCTION calculate_plan_end_date();

-- Constraint: Only one active plan per user
CREATE UNIQUE INDEX idx_plans_one_active_per_user 
  ON training_plans(user_id) 
  WHERE is_active = true;
```

**Markdown Structure:**
```markdown
# [Program Name]

**Program Owner:** ...
**User:** ...
**Duration:** 12 weeks
**Goal:** ...

## Program Philosophy
...

## Microcycle 1-4: [Phase Name] (Weeks 1-4)

### Weekly Pattern
#### Monday - [Workout Type]
...

## Microcycle 5: [Phase Name] (Week 5)
...

[Continue through Week 12]

## Modification History
- **YYYY-MM-DD:** ...
```

**Cache Fields:**
- `structured_plan`: Full plan as nested JSON (for UI rendering)
- `exercise_list`: All unique exercises mentioned in plan
- `plan_type`: Classification (upper/lower, PPL, full body, etc.)

---

### workouts

**Purpose:** Individual daily workout instances

```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  training_plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL,
  
  -- Workout identity
  workout_date DATE NOT NULL,
  workout_type VARCHAR(100),            -- 'Upper Strength', 'Lower Hypertrophy', etc.
  
  -- Source of truth
  markdown TEXT NOT NULL,
  
  -- Cached structured views
  structured_workout JSONB,             -- { exercises: [...], warm_up: {...}, ... }
  sms_message TEXT,                     -- Cached SMS-formatted message
  
  -- Analytics cache (for fast queries)
  exercise_list TEXT[],                 -- ['Bench Press', 'Barbell Row', ...]
  total_volume_lbs INT,                 -- Sum of (sets × reps × weight)
  total_sets INT,
  estimated_duration_min INT,
  
  -- Completion tracking
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,                -- User feedback after workout
  
  -- Cache management
  cache_version INT NOT NULL DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);
CREATE INDEX idx_workouts_plan ON workouts(training_plan_id, workout_date);
CREATE INDEX idx_workouts_date ON workouts(workout_date);
CREATE INDEX idx_workouts_exercises ON workouts USING GIN(exercise_list);
CREATE INDEX idx_workouts_structured ON workouts USING GIN(structured_workout);
CREATE INDEX idx_workouts_completed ON workouts(user_id, completed_at) WHERE completed_at IS NOT NULL;

-- Full-text search on markdown (for user queries like "when did I do bench press?")
CREATE INDEX idx_workouts_markdown_fts ON workouts USING GIN(to_tsvector('english', markdown));

-- Trigger: Update updated_at
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Constraint: One workout per user per date
CREATE UNIQUE INDEX idx_workouts_user_date_unique 
  ON workouts(user_id, workout_date);
```

**Markdown Structure:**
```markdown
# Workout - [Day], [Date]
**Program:** ...
**Focus:** ...

## Warm-Up
...

## Main Workout
### 1. [Exercise]
**Target:** [Sets] × [Reps] @ [Intensity]
- **Set 1:** [Weight] × [Reps]
...

## Cool Down
...

## Notes
...
```

**Cache Fields:**
- `structured_workout`: Full workout as JSON (for calendar UI)
- `sms_message`: Pre-formatted SMS text (for fast morning delivery)
- `exercise_list`: Array of exercise names
- `total_volume_lbs`: Sum of (sets × reps × weight)
- `total_sets`: Count of all sets
- `estimated_duration_min`: Estimated workout duration

---

## Supporting Tables (AI Metadata)

### agent_invocations

**Purpose:** Log all agent calls for debugging and cost tracking

```sql
CREATE TABLE agent_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent identity
  agent_id VARCHAR(100) NOT NULL,       -- 'fitness_plan', 'microcycle', 'chat', etc.
  session_id UUID,                      -- Group related agent calls
  parent_invocation_id UUID REFERENCES agent_invocations(id),  -- Sub-agent calls
  
  -- User context
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  
  -- Input/output
  input_data JSONB,                     -- Tools called, context provided
  output_data JSONB,                    -- Result (markdown, JSON, etc.)
  output_format VARCHAR(20),            -- 'markdown', 'json', 'text'
  
  -- Performance metrics
  model VARCHAR(50),                    -- 'gpt-5.1', 'claude-sonnet-4-5', etc.
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  duration_ms INT,
  
  -- Status
  status VARCHAR(20) NOT NULL,          -- 'success', 'failure', 'validation_error'
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invocations_agent ON agent_invocations(agent_id, created_at DESC);
CREATE INDEX idx_invocations_user ON agent_invocations(user_id, created_at DESC);
CREATE INDEX idx_invocations_session ON agent_invocations(session_id);
CREATE INDEX idx_invocations_status ON agent_invocations(status, created_at DESC);

-- Index for cost analysis
CREATE INDEX idx_invocations_cost ON agent_invocations(created_at DESC) 
  WHERE status = 'success';
```

**Usage:**
- Debug agent failures
- Track token usage per user
- Calculate costs
- Performance monitoring

---

### workout_examples

**Purpose:** Template workouts for agent reference (example-driven prompting)

```sql
CREATE TABLE workout_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classification
  workout_type VARCHAR(100) NOT NULL,   -- 'upper_strength', 'lower_hypertrophy', etc.
  experience_level VARCHAR(20),         -- 'beginner', 'intermediate', 'advanced'
  equipment_required TEXT[],            -- ['Barbell', 'Dumbbells']
  
  -- Example markdown
  markdown TEXT NOT NULL,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INT NOT NULL DEFAULT 0,   -- Track how often used
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_examples_type ON workout_examples(workout_type, is_active);
CREATE INDEX idx_examples_level ON workout_examples(experience_level);
CREATE INDEX idx_examples_equipment ON workout_examples USING GIN(equipment_required);
```

**Seeding:**
- Pre-populate with 10-15 high-quality example workouts
- Cover all major types (upper/lower strength/hypertrophy, full body, etc.)
- Include variety (beginner → advanced)

---

### plan_examples

**Purpose:** Template training plans for agent reference

```sql
CREATE TABLE plan_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classification
  plan_type VARCHAR(100) NOT NULL,      -- 'upper_lower', 'ppl', 'full_body'
  experience_level VARCHAR(20),         -- 'beginner', 'intermediate', 'advanced'
  primary_goal VARCHAR(100),            -- 'strength', 'hypertrophy', 'weight_loss'
  duration_weeks INT NOT NULL DEFAULT 12,
  
  -- Example markdown
  markdown TEXT NOT NULL,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_plan_examples_type ON plan_examples(plan_type, is_active);
CREATE INDEX idx_plan_examples_level ON plan_examples(experience_level);
CREATE INDEX idx_plan_examples_goal ON plan_examples(primary_goal);
```

---

## Existing Tables (Unchanged)

These tables remain as-is (non-AI infrastructure):

### users
```sql
-- Existing table (unchanged)
-- Handles authentication, basic user info
```

### signupdata
```sql
-- Existing table (unchanged)
-- Stores initial onboarding questionnaire responses
```

### messages
```sql
-- Existing table (unchanged)
-- Chat message history
```

### message_queues
```sql
-- Existing table (unchanged)
-- SMS delivery queue
```

### subscriptions
```sql
-- Existing table (unchanged)
-- Stripe billing subscriptions
```

### exercises
```sql
-- Existing table (unchanged)
-- Exercise database with videos, instructions, muscle groups
```

---

## Migrations

### Migration 1: Create New Tables

```sql
-- Drop old tables (after cutover complete)
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS structured_plans CASCADE;
-- DROP TABLE IF EXISTS microcycles CASCADE;
-- ...

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user_dossiers
CREATE TABLE user_dossiers (...);  -- [full definition from above]

-- Create training_plans
CREATE TABLE training_plans (...);

-- Create workouts
CREATE TABLE workouts (...);

-- Create agent_invocations
CREATE TABLE agent_invocations (...);

-- Create workout_examples
CREATE TABLE workout_examples (...);

-- Create plan_examples
CREATE TABLE plan_examples (...);
```

### Migration 2: Seed Example Tables

```sql
-- Insert workout examples
INSERT INTO workout_examples (workout_type, experience_level, equipment_required, markdown)
VALUES
  ('upper_strength', 'beginner', ARRAY['Dumbbells', 'Bench'], '[example markdown]'),
  ('lower_strength', 'beginner', ARRAY['Dumbbells'], '[example markdown]'),
  ... (10-15 examples);

-- Insert plan examples
INSERT INTO plan_examples (plan_type, experience_level, primary_goal, markdown)
VALUES
  ('full_body', 'beginner', 'strength', '[example markdown]'),
  ('upper_lower', 'intermediate', 'hypertrophy', '[example markdown]'),
  ... (5-10 examples);
```

### Migration 3: Data Migration (Old → New)

**For Existing Users (Gradual):**

```sql
-- Convert old profiles → user_dossiers
INSERT INTO user_dossiers (user_id, markdown, cache_version)
SELECT 
  user_id,
  generate_dossier_markdown(user_id),  -- Custom function to convert JSON → markdown
  1
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM user_dossiers WHERE user_dossiers.user_id = profiles.user_id
);

-- Convert old plans → training_plans
INSERT INTO training_plans (id, user_id, markdown, start_date, is_active, cache_version)
SELECT
  id,
  user_id,
  generate_plan_markdown(id),          -- Custom function to convert JSON → markdown
  start_date,
  is_active,
  1
FROM structured_plans
WHERE NOT EXISTS (
  SELECT 1 FROM training_plans WHERE training_plans.id = structured_plans.id
);

-- Workouts: Generate from scratch for new system
-- (Don't migrate old workouts; generate fresh from plans)
```

**Helper Functions:**

```sql
CREATE OR REPLACE FUNCTION generate_dossier_markdown(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_profile JSONB;
  v_markdown TEXT;
BEGIN
  -- Fetch old profile JSON
  SELECT structured_profile INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;
  
  -- Convert JSON → markdown template
  v_markdown := format(
    E'# Training Dossier - %s\n\n' ||
    E'## Profile\n' ||
    E'- **Name:** %s\n' ||
    E'- **Age:** %s\n' ||
    E'- **Experience Level:** %s\n' ||
    E'- **Primary Goals:** %s\n\n' ||
    E'## Equipment Access\n%s\n\n' ||
    E'## Schedule & Availability\n%s\n\n' ||
    E'## Training History\n' ||
    E'### %s - Migrated from old system\n' ||
    E'Starting point captured.\n\n' ||
    E'## Current Training Plan\n' ||
    E'**Program:** Migrated plan\n',
    v_profile->>'name',
    v_profile->>'name',
    v_profile->>'age',
    v_profile->>'experience',
    v_profile->'goals'->>'primary',
    v_profile->'equipment'->>'summary',
    v_profile->'schedule'->>'summary',
    NOW()::DATE
  );
  
  RETURN v_markdown;
END;
$$ LANGUAGE plpgsql;

-- Similar function for plans...
```

---

## Cache Invalidation Strategy

### When to Regenerate Cache

**Scenario 1: Markdown Updated**
```sql
-- When user_dossiers.markdown changes, clear cache
UPDATE user_dossiers
SET 
  markdown = '[updated markdown]',
  profile_json = NULL,               -- Force regeneration
  equipment_tags = NULL,
  training_days = NULL
WHERE user_id = '[user_id]';
```

**Scenario 2: Schema Change (Bump Cache Version)**
```sql
-- When JSON schema changes, invalidate all caches
UPDATE user_dossiers
SET cache_version = 2;               -- All caches now stale

-- Application checks:
IF dossier.cache_version < CURRENT_CACHE_VERSION THEN
  regenerate_cache(dossier.markdown)
END IF
```

**Scenario 3: On-Demand Regeneration**
```typescript
async function getDossierProfile(userId: string) {
  const dossier = await db.query('SELECT markdown, profile_json, cache_version FROM user_dossiers WHERE user_id = $1', [userId]);
  
  // Cache hit
  if (dossier.profile_json && dossier.cache_version === CURRENT_CACHE_VERSION) {
    return dossier.profile_json;
  }
  
  // Cache miss: regenerate
  const profileJson = await extractProfileFromMarkdown(dossier.markdown);
  
  // Update cache
  await db.query(
    'UPDATE user_dossiers SET profile_json = $1, cache_version = $2 WHERE user_id = $3',
    [profileJson, CURRENT_CACHE_VERSION, userId]
  );
  
  return profileJson;
}
```

---

## Query Patterns

### Get User's Current Plan
```sql
SELECT markdown
FROM training_plans
WHERE user_id = $1 AND is_active = true
LIMIT 1;
```

### Get Recent Workouts (for context)
```sql
SELECT markdown
FROM workouts
WHERE user_id = $1
  AND workout_date >= CURRENT_DATE - INTERVAL '14 days'
ORDER BY workout_date DESC;
```

### Get Today's Workout
```sql
SELECT markdown, sms_message
FROM workouts
WHERE user_id = $1 AND workout_date = CURRENT_DATE
LIMIT 1;
```

### Analytics: Exercise Progress Over Time
```sql
SELECT 
  workout_date,
  structured_workout->'exercises' AS exercises,
  total_volume_lbs
FROM workouts
WHERE user_id = $1
  AND 'Bench Press' = ANY(exercise_list)
  AND workout_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY workout_date;
```

### Get Example Workouts (for Agent)
```sql
SELECT markdown
FROM workout_examples
WHERE workout_type = $1
  AND experience_level = $2
  AND is_active = true
ORDER BY usage_count DESC
LIMIT 5;

-- Increment usage counter
UPDATE workout_examples
SET usage_count = usage_count + 1
WHERE id = ANY($1::UUID[]);
```

---

## Database Maintenance

### Cleanup Old Workouts (Archive)
```sql
-- Archive workouts older than 1 year to separate table
INSERT INTO workouts_archive
SELECT * FROM workouts
WHERE workout_date < CURRENT_DATE - INTERVAL '1 year';

DELETE FROM workouts
WHERE workout_date < CURRENT_DATE - INTERVAL '1 year';
```

### Vacuum & Analyze
```sql
-- Regular maintenance (weekly)
VACUUM ANALYZE user_dossiers;
VACUUM ANALYZE training_plans;
VACUUM ANALYZE workouts;
```

---

## Next: Agent Registry

See `03-agent-registry.md` for simplified agent definitions and tool system.
