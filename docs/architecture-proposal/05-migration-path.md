# Migration Path - Step-by-Step Transition Strategy

## Migration Principles

1. **Parallel Track:** Run both old and new systems simultaneously during transition
2. **No Downtime:** Users should never experience service interruption
3. **Gradual Rollout:** Start with new users, migrate existing users progressively
4. **Rollback Safety:** Keep old system functional for quick rollback if needed
5. **Test in Production:** Use feature flags to test with subset of users

## Phase 0: Preparation (Week 1)

### Goals
- Set up parallel infrastructure
- Create example markdown files
- Build extraction utilities

### Tasks

**1. Database Schema Updates**
```sql
-- Add markdown columns (nullable initially)
ALTER TABLE user_profiles 
  ADD COLUMN dossier_markdown TEXT,
  ADD COLUMN markdown_version INT DEFAULT 0;

ALTER TABLE fitness_plans
  ADD COLUMN plan_markdown TEXT,
  ADD COLUMN markdown_version INT DEFAULT 0;

ALTER TABLE workouts
  ADD COLUMN workout_markdown TEXT,
  ADD COLUMN markdown_version INT DEFAULT 0;

-- Add feature flag table
CREATE TABLE feature_flags (
  flag_name TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INT DEFAULT 0,
  user_allowlist UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO feature_flags (flag_name, enabled, rollout_percentage)
VALUES ('markdown_profiles', false, 0),
       ('markdown_plans', false, 0),
       ('markdown_workouts', false, 0);
```

**2. Create Example Repository**
```bash
mkdir -p docs/markdown-examples/{profiles,plans,workouts}
```

Populate with 10-15 examples per type (see examples/ folder).

**3. Build Utility Functions**
```typescript
// packages/shared/src/server/markdown/
export const markdownUtils = {
  // Convert old JSON → markdown (one-time migration)
  profileToMarkdown: (profile: UserProfile) => string,
  planToMarkdown: (plan: FitnessPlan) => string,
  workoutToMarkdown: (workout: Workout) => string,
  
  // Extract JSON from markdown (ongoing)
  extractProfile: (markdown: string) => ProfileJson,
  extractPlan: (markdown: string) => PlanJson,
  extractWorkout: (markdown: string) => WorkoutJson,
  
  // Validation
  validateProfileMarkdown: (markdown: string) => ValidationResult,
  validatePlanMarkdown: (markdown: string) => ValidationResult,
  validateWorkoutMarkdown: (markdown: string) => ValidationResult,
};
```

**4. Create Migration Scripts**
```typescript
// scripts/migrate-profiles-to-markdown.ts
async function migrateProfilesToMarkdown(batchSize = 100) {
  const profiles = await db.selectFrom('user_profiles')
    .where('dossier_markdown', 'is', null)
    .limit(batchSize)
    .execute();
  
  for (const profile of profiles) {
    const markdown = markdownUtils.profileToMarkdown(profile);
    
    await db.updateTable('user_profiles')
      .set({
        dossier_markdown: markdown,
        markdown_version: 1
      })
      .where('user_id', '=', profile.user_id)
      .execute();
  }
  
  console.log(`Migrated ${profiles.length} profiles`);
}
```

**Deliverables:**
- ✅ Database schema updated
- ✅ 30+ example markdown files created
- ✅ Utility functions written and tested
- ✅ Migration scripts ready (not yet run)

## Phase 1: User Profiles Migration (Weeks 2-3)

### Goals
- Migrate existing user profiles to markdown dossiers
- Test markdown profile updates with new users
- Validate extraction accuracy

### Tasks

**1. Migrate Existing Profiles**
```bash
# Run migration in batches
pnpm migrate:profiles --batch-size=100 --dry-run
pnpm migrate:profiles --batch-size=100  # Real run
```

**2. Update Agent Prompts**
```typescript
// Create new agent: profile:update:markdown
const profileUpdateMarkdownAgent = {
  agent_id: 'profile:update:markdown',
  system_prompt: `
You are a fitness profile assistant. You maintain user dossiers in markdown format.

When the user provides information, update the relevant section of their dossier. Always preserve existing information unless explicitly asked to change it.

Dossier structure:
# Training Dossier - [Name]

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
### YYYY-MM-DD - [Title]
...

## Current Training Plan
...

## Preferences & Notes
...

Read the current dossier, make updates, and return the complete updated markdown.
  `,
  model: 'gpt-5-nano',
  tool_ids: ['get_user_dossier'],
  schema_json: null,  // No schema, just markdown
};
```

**3. Feature Flag Rollout**
```sql
-- Enable for new users (created after migration)
UPDATE feature_flags 
SET enabled = true, 
    rollout_percentage = 5  -- Start with 5% of new users
WHERE flag_name = 'markdown_profiles';

-- After 1 week of testing, increase rollout
UPDATE feature_flags
SET rollout_percentage = 100
WHERE flag_name = 'markdown_profiles';
```

**4. Parallel Testing**
```typescript
async function updateUserProfile(userId: string, updates: ProfileUpdates) {
  const useMarkdown = await featureFlags.isEnabled('markdown_profiles', userId);
  
  if (useMarkdown) {
    // New path: update markdown
    const currentMarkdown = await getUserDossier(userId);
    const updatedMarkdown = await agents.invoke('profile:update:markdown', {
      currentMarkdown,
      updates
    });
    
    await db.updateTable('user_profiles')
      .set({
        dossier_markdown: updatedMarkdown,
        markdown_version: db.raw('markdown_version + 1'),
        // Also update JSON for backward compatibility
        profile_json: markdownUtils.extractProfile(updatedMarkdown)
      })
      .where('user_id', '=', userId)
      .execute();
  } else {
    // Old path: update JSON directly
    // ... existing code ...
  }
}
```

**5. Validation & Monitoring**
```typescript
// Add metrics tracking
metrics.track('profile_update_method', {
  method: useMarkdown ? 'markdown' : 'json',
  success: true/false,
  duration_ms: elapsed
});

// Validate markdown → JSON extraction accuracy
async function validateExtraction(userId: string) {
  const markdown = await getUserDossier(userId);
  const extractedJson = markdownUtils.extractProfile(markdown);
  const originalJson = await db.selectFrom('user_profiles')
    .select('profile_json')
    .where('user_id', '=', userId)
    .executeTakeFirst();
  
  const diff = deepDiff(extractedJson, originalJson.profile_json);
  if (diff.length > 0) {
    logger.warn('Extraction mismatch', { userId, diff });
  }
}
```

**Deliverables:**
- ✅ All existing profiles have markdown dossiers
- ✅ New users use markdown-first profile updates
- ✅ Extraction accuracy validated (>95% match)
- ✅ Metrics show markdown path is stable

## Phase 2: Training Plans Migration (Weeks 4-5)

### Goals
- Migrate fitness plans to markdown
- Test plan generation with markdown format
- Integrate microcycles into plan markdown (not separate table)

### Tasks

**1. Migrate Existing Plans**
```bash
pnpm migrate:plans --batch-size=50
```

**2. Update Plan Generation Agent**
```typescript
const planGenerateMarkdownAgent = {
  agent_id: 'plan:generate:markdown',
  system_prompt: `
You are a program designer creating comprehensive training plans.

Read the user's dossier and generate a complete markdown training plan with these sections:

# [Program Name]

**Program Owner:** ...
**User:** [Name]
**Duration:** ...
**Goal:** ...

## Program Philosophy
[1-2 paragraphs explaining the approach]

## Microcycle 1-X: [Phase Name] (Weeks Y-Z)

### Weekly Pattern
#### [Day] - [Focus]
**Focus:** ...
**Volume:** ...

**Main Lifts:**
1. [Exercise]: X sets × Y reps @ Z intensity

**Accessories:**
...

### Progression
...

Repeat this structure for all microcycles.

Refer to example plans for formatting and detail level.
  `,
  model: 'gpt-5.1',
  tool_ids: ['get_user_dossier', 'get_example_plans'],
};
```

**3. Deprecate Microcycles Table (Long-term)**
```sql
-- Mark microcycles table as deprecated (data preserved for rollback)
COMMENT ON TABLE microcycles IS 'DEPRECATED: Microcycles now embedded in fitness_plans.plan_markdown';

-- After 2 months of stable markdown plans, archive old table
CREATE TABLE microcycles_archived AS SELECT * FROM microcycles;
DROP TABLE microcycles;
```

**4. Update Plan Display**
```typescript
// UI: render plan from markdown
async function getPlanForDisplay(planId: string) {
  const plan = await db.selectFrom('fitness_plans')
    .select(['plan_markdown', 'structured_plan'])
    .where('id', '=', planId)
    .executeTakeFirst();
  
  if (!plan.structured_plan) {
    // Generate on-demand if not cached
    plan.structured_plan = await markdownUtils.extractPlan(plan.plan_markdown);
  }
  
  return plan;
}
```

**Deliverables:**
- ✅ All plans converted to markdown
- ✅ New plans generated as markdown
- ✅ Microcycles embedded (no separate table)
- ✅ UI renders markdown plans correctly

## Phase 3: Workouts Migration (Weeks 6-7)

### Goals
- Migrate workout generation to markdown
- Simplify validation (remove multi-step JSON validation)
- Test SMS message generation from markdown

### Tasks

**1. Create Markdown Workout Generator**
```typescript
const workoutGenerateMarkdownAgent = {
  agent_id: 'workout:generate:markdown',
  system_prompt: `
Generate today's workout in markdown format.

Read:
- User dossier (goals, equipment, schedule, preferences)
- Training plan (current microcycle, weekly pattern)
- Recent workouts (for progression)

Output a detailed markdown workout following this structure:

# Workout - [Day], [Date]
**Program:** ...
**Focus:** ...

## Warm-Up
...

## Main Workout
### 1. [Exercise Name]
**Target:** X sets × Y reps @ Z intensity
- **Set 1:** ... lbs × ... reps
- **Set 2:** ... lbs × ... reps
...

## Cool Down
...

## Notes
...

Be specific with weights (use progression from previous workouts).
Refer to example workouts for proper formatting.
  `,
  model: 'gpt-5.1',
  tool_ids: ['get_user_dossier', 'get_training_plan', 'get_recent_workouts', 'get_example_workouts'],
  sub_agents: [
    {
      agent_id: 'workout:to_sms',
      input_mapping: { markdown: '$.result.markdown' }
    }
  ]
};
```

**2. Lightweight SMS Formatter**
```typescript
const workoutToSmsAgent = {
  agent_id: 'workout:to_sms',
  system_prompt: `
Convert this markdown workout into a concise SMS message (max 1600 characters).

Format:
🏋️ [Day] [Focus] - Week X, Day Y

WARM-UP (X min)
• [Concise list]

MAIN WORKOUT
1️⃣ [Exercise]: Sets×Reps @ Weight (rest time)
2️⃣ ...

COOL DOWN (X min)
[Brief description]

💪 [Motivational closer]

Keep it readable on mobile. Use emojis sparingly.
  `,
  model: 'gpt-5-nano',
};
```

**3. Remove Old Validation Agents**
```sql
-- Mark old agents as inactive
UPDATE agent_definitions
SET is_active = false
WHERE agent_id IN (
  'workout:structured',
  'workout:structured:validate'
);
```

**4. Simple Markdown Validation**
```typescript
function validateWorkoutMarkdown(markdown: string): ValidationResult {
  const errors: string[] = [];
  
  if (!markdown.includes('## Warm-Up')) errors.push('Missing warm-up section');
  if (!markdown.includes('## Main Workout')) errors.push('Missing main workout');
  if (!markdown.includes('## Cool Down')) errors.push('Missing cool down');
  
  const exerciseCount = (markdown.match(/^### \d+\./gm) || []).length;
  if (exerciseCount < 3) errors.push('Need at least 3 exercises in main workout');
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Deliverables:**
- ✅ Workouts generated as markdown
- ✅ SMS messages generated from markdown (not stored separately)
- ✅ Validation simplified (10x faster)
- ✅ Reduced token usage (no multi-step validation retries)

## Phase 4: Cleanup & Optimization (Week 8)

### Goals
- Remove deprecated code paths
- Optimize storage and queries
- Document the new architecture

### Tasks

**1. Remove Old Agent Definitions**
```sql
-- Archive deprecated agents
CREATE TABLE agent_definitions_archived AS 
  SELECT * FROM agent_definitions 
  WHERE agent_id LIKE '%:structured%' OR agent_id LIKE '%:validate%';

DELETE FROM agent_definitions
WHERE agent_id IN (
  'profile:structured',
  'plan:structured',
  'workout:structured',
  'workout:structured:validate'
);
```

**2. Add Database Indexes**
```sql
-- Full-text search on markdown
CREATE INDEX idx_user_dossier_markdown_fts 
  ON user_dossiers 
  USING gin(to_tsvector('english', dossier_markdown));

CREATE INDEX idx_plan_markdown_fts
  ON fitness_plans
  USING gin(to_tsvector('english', plan_markdown));

-- JSONB indexes for queries (when JSON is needed)
CREATE INDEX idx_user_profile_json ON user_dossiers USING gin(cached_profile_json);
```

**3. Optimize JSON Caching**
```typescript
// Regenerate cached JSON only when markdown changes
async function updateUserDossier(userId: string, markdown: string) {
  const cached = await markdownUtils.extractProfile(markdown);
  
  await db.updateTable('user_dossiers')
    .set({
      dossier_markdown: markdown,
      cached_profile_json: cached,
      markdown_version: db.raw('markdown_version + 1'),
      updated_at: new Date()
    })
    .where('user_id', '=', userId)
    .execute();
}
```

**4. Performance Comparison**
```typescript
// Before (JSON-first):
// - 5 agent calls per workout
// - ~3-5 seconds generation time
// - ~15K tokens used
// - 3 DB queries (profile, plan, microcycles)

// After (Markdown-first):
// - 2 agent calls per workout (generate + SMS)
// - ~1-2 seconds generation time
// - ~8K tokens used
// - 2 DB queries (dossier, plan)

// Improvement: 60% faster, 50% fewer tokens, simpler code
```

**Deliverables:**
- ✅ Old code paths removed
- ✅ Performance improved significantly
- ✅ Storage optimized
- ✅ Documentation updated

## Phase 5: Long-term Enhancements (Weeks 9-12)

### Advanced Features (Optional)

**1. Diff-Based Updates**
```typescript
// Show what changed in markdown
function getDossierDiff(userId: string) {
  const history = await db.selectFrom('user_dossiers_history')
    .select(['markdown', 'updated_at'])
    .where('user_id', '=', userId)
    .orderBy('updated_at', 'desc')
    .limit(2)
    .execute();
  
  const diff = generateMarkdownDiff(history[1].markdown, history[0].markdown);
  return diff;  // Human-readable diff
}
```

**2. Version Control Integration**
```typescript
// Optional: Git-based dossier storage for power users
async function commitDossierUpdate(userId: string, markdown: string, message: string) {
  const dossierPath = `dossiers/${userId}.md`;
  await fs.writeFile(dossierPath, markdown);
  await git.add(dossierPath);
  await git.commit(message);
  await git.push();
}
```

**3. LLM-Friendly Search**
```typescript
// Semantic search over dossiers
async function searchDossiers(query: string): Promise<string[]> {
  const embedding = await getEmbedding(query);
  
  const results = await db.selectFrom('user_dossiers')
    .select(['user_id', 'dossier_markdown'])
    .where(sql`dossier_embedding <-> ${embedding} < 0.5`)
    .orderBy(sql`dossier_embedding <-> ${embedding}`)
    .limit(10)
    .execute();
  
  return results.map(r => r.dossier_markdown);
}
```

## Rollback Plan

If critical issues arise during migration:

**1. Feature Flag Disable**
```sql
UPDATE feature_flags 
SET enabled = false 
WHERE flag_name = 'markdown_profiles';
```

**2. Restore Old Agents**
```sql
UPDATE agent_definitions
SET is_active = true
WHERE agent_id IN (
  'profile:structured',
  'workout:structured',
  'workout:structured:validate'
);
```

**3. Data Integrity Check**
```typescript
// Verify JSON data is still intact
async function verifyDataIntegrity() {
  const profiles = await db.selectFrom('user_profiles')
    .select(['user_id', 'profile_json'])
    .execute();
  
  for (const profile of profiles) {
    if (!profile.profile_json || Object.keys(profile.profile_json).length === 0) {
      logger.error('Data loss detected', { userId: profile.user_id });
    }
  }
}
```

**4. Communication**
- Notify users of rollback (if necessary)
- Explain temporary service degradation
- Provide timeline for resolution

## Success Metrics

### Performance
- ✅ Workout generation: <2 seconds (down from 3-5)
- ✅ Token usage: 50% reduction
- ✅ Database queries: 30% reduction

### Quality
- ✅ User satisfaction: maintained or improved
- ✅ Workout quality: maintained or improved (subjective feedback)
- ✅ Bug rate: no increase compared to JSON system

### Developer Experience
- ✅ Code complexity: reduced (fewer transformation layers)
- ✅ Debugging: easier (markdown is human-readable)
- ✅ Onboarding: faster (new devs understand markdown immediately)

## Timeline Summary

| Phase | Duration | Focus | Risk |
|-------|----------|-------|------|
| 0. Preparation | Week 1 | Setup, examples, utilities | Low |
| 1. Profiles | Weeks 2-3 | Migrate profiles, test extraction | Low-Medium |
| 2. Plans | Weeks 4-5 | Migrate plans, deprecate microcycles | Medium |
| 3. Workouts | Weeks 6-7 | Markdown workouts, simplify validation | Medium |
| 4. Cleanup | Week 8 | Remove old code, optimize | Low |
| 5. Enhancements | Weeks 9-12 | Optional advanced features | Low |

**Total: 8-12 weeks** (core migration in 8 weeks, enhancements optional)

## Conclusion

This migration path:
- ✅ Minimizes risk (parallel track, gradual rollout)
- ✅ Allows rollback at any phase
- ✅ Maintains service quality
- ✅ Improves performance and developer experience
- ✅ Keeps the excellent agent architecture we've built

The result: simpler, faster, more debuggable GymText powered by markdown-first architecture.
