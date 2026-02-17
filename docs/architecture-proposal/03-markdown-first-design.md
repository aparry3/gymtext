# Markdown-First Architecture Design

## Design Philosophy

**Core Principle:** Markdown is the source of truth. Structured JSON is generated on-demand for UI/API needs.

**Key Goals:**
1. LLMs work in their native format (markdown)
2. Humans can read and debug everything
3. Version control shows meaningful diffs
4. Database stores markdown with optional generated JSON views
5. Validation is lightweight (section presence, not deep structure)

## Proposed Data Model

### User Dossier (Unified Markdown)

**Database Schema:**
```sql
CREATE TABLE user_dossiers (
  user_id UUID PRIMARY KEY,
  markdown TEXT NOT NULL,                    -- Canonical source of truth
  structured_profile JSONB,                  -- Generated from markdown (for queries)
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  version INT DEFAULT 1
);

CREATE INDEX idx_dossier_profile ON user_dossiers USING gin(structured_profile);
```

**Markdown Structure:**
```markdown
# Training Dossier - Alex Martinez

## Profile
- **Name:** Alex Martinez
- **Age:** 28
- **Experience Level:** Intermediate (2 years consistent training)
- **Primary Goals:** Build muscle, improve strength, lose 10 lbs body fat
- **Secondary Goals:** Run a 5K under 25 minutes
- **Timezone:** America/New_York
- **Preferred Message Time:** 6:00 AM

## Equipment Access
- **Home Gym:**
  - Barbell (Olympic, 45 lbs)
  - Dumbbells (5-50 lbs, pairs)
  - Squat rack with pull-up bar
  - Adjustable bench
  - Resistance bands (light, medium, heavy)
- **Gym Access:** LA Fitness (full equipment)
- **Preferred Location:** Home gym on weekdays, LA Fitness on weekends

## Schedule & Availability
- **Training Days:** Monday, Wednesday, Friday, Saturday
- **Typical Duration:** 45-60 minutes
- **Morning Preference:** 6:00-7:00 AM weekdays, 8:00-9:00 AM weekends
- **Cannot Train:** Sundays (family time)

## Training History
### 2025-12-01 - Initial Assessment
- Starting point: 180 lbs, ~18% body fat
- Squat: 135 lbs × 5
- Bench: 115 lbs × 5
- Deadlift: 185 lbs × 5

### 2026-01-15 - Progress Check
- Weight: 176 lbs
- Squat: 185 lbs × 5
- Bench: 145 lbs × 5
- Deadlift: 225 lbs × 5
- Note: Added cardio goal (5K race in March)

### 2026-02-16 - Knee Issue
- Reported knee discomfort during barbell squats
- Switched to goblet squats (more comfortable)
- Note: Monitor knee, consider goblet/front squats going forward

## Current Training Plan
**Program:** 4-Day Upper/Lower Split
**Phase:** Week 3 of 4 (Strength Focus)
**Start Date:** 2026-01-22

### Weekly Pattern
- **Monday:** Upper Body (Strength)
- **Wednesday:** Lower Body (Strength)
- **Friday:** Upper Body (Hypertrophy)
- **Saturday:** Lower Body (Hypertrophy) + Cardio

### Progression Strategy
- Add 5 lbs per week on main lifts
- Deload week 5 (reduce volume 40%)
- Re-assess maxes after deload

## Preferences & Notes
- **Likes:** Compound movements, variety in accessories
- **Dislikes:** Long cardio sessions (prefers HIIT)
- **Injuries:** Previous right shoulder strain (2024), fully healed
- **Modifications:** Goblet squats preferred over barbell squats (knee comfort)
- **Music:** Energetic playlists, no ballads
- **Communication Style:** Direct, concise, data-driven
```

**Generated Profile JSON (when needed):**
```typescript
{
  name: "Alex Martinez",
  age: 28,
  experience: "Intermediate",
  goals: {
    primary: ["Build muscle", "Improve strength", "Lose 10 lbs body fat"],
    secondary: ["Run a 5K under 25 minutes"]
  },
  equipment: {
    homeGym: ["Barbell", "Dumbbells (5-50 lbs)", "Squat rack", "Pull-up bar", "Bench", "Bands"],
    gymAccess: "LA Fitness"
  },
  schedule: {
    trainingDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    preferredTime: "6:00-7:00 AM",
    duration: "45-60 minutes"
  },
  currentPlan: {
    program: "4-Day Upper/Lower Split",
    phase: "Week 3 of 4 (Strength Focus)",
    startDate: "2026-01-22"
  }
}
```

**Key Design Decisions:**

1. **Unified Dossier:** Profile + equipment + schedule + history + current plan in one file
   - ✅ Complete context in one place
   - ✅ Chronological history (append-only)
   - ✅ Easy to see user evolution over time

2. **Markdown Canonical:** The markdown is the truth; JSON is a view
   - ✅ Updates go to markdown first
   - ✅ JSON regenerated when needed (with caching)

3. **Human-Readable Updates:** Append to history section with dates
   - ✅ Clear audit trail
   - ✅ LLM can see what changed and why

### Training Plans (Markdown with Microcycle Sections)

**Database Schema:**
```sql
CREATE TABLE training_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  markdown TEXT NOT NULL,                    -- Canonical source
  structured_plan JSONB,                     -- Generated (for queries)
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Markdown Structure:**
```markdown
# 12-Week Upper/Lower Strength Builder

**Program Owner:** Renaissance Periodization (Modified)
**User:** Alex Martinez
**Duration:** 12 weeks (2026-01-22 to 2026-04-14)
**Goal:** Increase strength on main lifts, build muscle

## Program Philosophy
Progressive overload through weekly load increases. Deload every 5th week. Focus on compound movements with strategic accessories.

## Microcycle 1-4: Strength Accumulation (Weeks 1-4)

### Weekly Pattern
#### Monday - Upper Strength
**Focus:** Heavy pressing, back strength
**Volume:** 16-20 sets

**Main Lifts:**
1. Barbell Bench Press: 4 sets × 4-6 reps (RPE 8-9)
2. Barbell Row: 4 sets × 6-8 reps (RPE 8)
3. Overhead Press: 3 sets × 6-8 reps (RPE 7-8)

**Accessories:**
4. Dumbbell Incline Press: 3 sets × 8-10 reps
5. Lat Pulldown: 3 sets × 10-12 reps
6. Face Pulls: 3 sets × 15-20 reps

#### Wednesday - Lower Strength
**Focus:** Squat/deadlift progression
**Volume:** 14-18 sets

**Main Lifts:**
1. Goblet Squat: 4 sets × 6-8 reps (RPE 8) *[Modified: was barbell squat]*
2. Romanian Deadlift: 4 sets × 6-8 reps (RPE 8)
3. Bulgarian Split Squat: 3 sets × 8-10 reps per leg

**Accessories:**
4. Leg Curl: 3 sets × 10-12 reps
5. Calf Raise: 4 sets × 12-15 reps

#### Friday - Upper Hypertrophy
**Focus:** Volume work, muscle building
**Volume:** 18-22 sets

**Main Lifts:**
1. Dumbbell Bench Press: 4 sets × 8-10 reps
2. Cable Row: 4 sets × 10-12 reps
3. Dumbbell Shoulder Press: 3 sets × 10-12 reps

**Accessories:**
4. Cable Flyes: 3 sets × 12-15 reps
5. Dumbbell Curls: 3 sets × 10-12 reps
6. Tricep Pushdown: 3 sets × 12-15 reps
7. Lateral Raises: 3 sets × 15-20 reps

#### Saturday - Lower Hypertrophy + Cardio
**Focus:** Leg volume, conditioning
**Volume:** 16-20 sets + 20 min cardio

**Main Lifts:**
1. Leg Press: 4 sets × 10-12 reps
2. Romanian Deadlift: 3 sets × 10-12 reps (lighter than Wednesday)
3. Walking Lunges: 3 sets × 12 steps per leg

**Accessories:**
4. Leg Extension: 3 sets × 12-15 reps
5. Leg Curl: 3 sets × 12-15 reps
6. Calf Raise: 4 sets × 15-20 reps

**Cardio:**
HIIT on bike: 20 minutes (30 sec sprint, 90 sec recovery)

### Progression
- **Week 1:** Start with conservative weights (RPE 7-8)
- **Week 2:** Increase weight 5-10 lbs on main lifts
- **Week 3:** Increase weight 5-10 lbs on main lifts
- **Week 4:** Increase weight 5 lbs on main lifts, approaching peak

## Microcycle 5: Deload (Week 5)

### Weekly Pattern
Same structure as weeks 1-4, but:
- **Volume:** Reduce sets by 40% (e.g., 4 sets → 2 sets)
- **Intensity:** Reduce weight by 20%, keep RPE 6-7
- **Recovery Focus:** Add mobility work, extra sleep

## Microcycle 6-9: Strength Peak (Weeks 6-9)
*[Pattern similar to Microcycle 1-4, with adjusted intensity]*

## Microcycle 10: Deload (Week 10)
*[Same as Microcycle 5]*

## Microcycle 11-12: Final Push (Weeks 11-12)
*[Peak intensity, testing maxes in week 12]*

## Modification History
- **2026-02-16:** Changed barbell squat → goblet squat (knee comfort)
```

**Key Design Decisions:**

1. **Microcycles as Sections:** Each 4-week block is a markdown section
   - ✅ Easy to navigate and read
   - ✅ Clear progression visible
   - ✅ Modification history at bottom

2. **Weekly Pattern Details:** Full workout structure in markdown
   - ✅ Complete context for generating daily workouts
   - ✅ LLM can see the full program, not just today
   - ✅ Easy to modify (just edit the section)

3. **Modification History:** Track changes at bottom
   - ✅ Audit trail
   - ✅ Context for why things changed

### Daily Workouts (Markdown Instances)

**Database Schema:**
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  training_plan_id UUID REFERENCES training_plans(id),
  workout_date DATE NOT NULL,
  markdown TEXT NOT NULL,                     -- Canonical workout
  structured_workout JSONB,                   -- Generated for calendar UI
  sms_message TEXT,                           -- Generated message text
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date);
```

**Markdown Structure:**
```markdown
# Workout - Monday, February 16, 2026
**Program:** 12-Week Upper/Lower Strength Builder (Week 3, Day 1)
**Focus:** Upper Strength

## Warm-Up (8 minutes)
1. Dynamic Stretching: 3 minutes
   - Arm circles, leg swings, torso twists
2. Light Cardio: 3 minutes
   - Jumping jacks or bike
3. Movement Prep: 2 minutes
   - Push-up to downward dog × 5
   - Scapular wall slides × 10

## Main Workout

### 1. Barbell Bench Press
**Target:** 4 sets × 4-6 reps @ RPE 8-9
- **Set 1:** 135 lbs × 6 reps (warm-up)
- **Set 2:** 185 lbs × 5 reps
- **Set 3:** 205 lbs × 4 reps (RPE 9)
- **Set 4:** 205 lbs × 4 reps (RPE 9)
**Rest:** 3-4 minutes between sets

### 2. Barbell Row
**Target:** 4 sets × 6-8 reps @ RPE 8
- **Set 1:** 135 lbs × 8 reps
- **Set 2:** 155 lbs × 7 reps
- **Set 3:** 165 lbs × 6 reps (RPE 8)
- **Set 4:** 165 lbs × 6 reps (RPE 8)
**Rest:** 2-3 minutes between sets

### 3. Overhead Press
**Target:** 3 sets × 6-8 reps @ RPE 7-8
- **Set 1:** 95 lbs × 8 reps
- **Set 2:** 105 lbs × 7 reps (RPE 8)
- **Set 3:** 105 lbs × 6 reps (RPE 8)
**Rest:** 2-3 minutes between sets

### 4. Dumbbell Incline Press
**Target:** 3 sets × 8-10 reps
- **Set 1:** 50 lbs (each) × 10 reps
- **Set 2:** 50 lbs × 9 reps
- **Set 3:** 50 lbs × 8 reps
**Rest:** 90 seconds between sets

### 5. Lat Pulldown
**Target:** 3 sets × 10-12 reps
- **Set 1:** 120 lbs × 12 reps
- **Set 2:** 130 lbs × 11 reps
- **Set 3:** 130 lbs × 10 reps
**Rest:** 90 seconds between sets

### 6. Face Pulls
**Target:** 3 sets × 15-20 reps
- **Set 1:** 30 lbs × 20 reps
- **Set 2:** 30 lbs × 18 reps
- **Set 3:** 30 lbs × 17 reps
**Rest:** 60 seconds between sets

## Cool Down (5 minutes)
1. Chest Stretch: hold 30 seconds per side
2. Lat Stretch: hold 30 seconds per side
3. Shoulder Circles: 10 forward, 10 backward
4. Deep Breathing: 2 minutes

## Notes
- Great session! Bench press felt strong.
- Added 10 lbs to bench from last week.
- Consider increasing row weight next Monday.
- Total time: 52 minutes
```

**SMS Message (Generated):**
```
🏋️ Monday Upper Strength - Week 3, Day 1

WARM-UP (8 min)
• Dynamic stretch 3 min
• Light cardio 3 min  
• Movement prep 2 min

MAIN WORKOUT
1️⃣ Bench Press: 4×4-6 @ 185-205 lbs (RPE 8-9, rest 3-4 min)
2️⃣ Barbell Row: 4×6-8 @ 155-165 lbs (rest 2-3 min)
3️⃣ Overhead Press: 3×6-8 @ 95-105 lbs (rest 2-3 min)
4️⃣ DB Incline Press: 3×8-10 @ 50 lbs (rest 90 sec)
5️⃣ Lat Pulldown: 3×10-12 @ 120-130 lbs (rest 90 sec)
6️⃣ Face Pulls: 3×15-20 @ 30 lbs (rest 60 sec)

COOL DOWN (5 min)
Chest/lat/shoulder stretches + breathing

💪 Let's crush it! Reply with questions or when done.
```

**Key Design Decisions:**

1. **Detailed Markdown:** Full workout structure with sets, reps, weights
   - ✅ Complete record for progress tracking
   - ✅ Easy to see what was prescribed vs. completed
   - ✅ Notes section for feedback

2. **Generated SMS:** Extract and format for mobile-friendly message
   - ✅ Lightweight agent reads markdown, generates SMS format
   - ✅ SMS is a view, not stored (or cached)

3. **Progressive Detail:** Can add completed sets/reps after the fact
   - ✅ User reports "Bench: 205×5, 205×4" → agent updates the markdown
   - ✅ Markdown becomes historical record

## Agent Architecture (Unchanged!)

**Good News:** The agent registry system stays exactly the same. Only the data format changes.

### Example Agent Definition

**Before (JSON-focused):**
```typescript
{
  agent_id: 'workout:generate',
  system_prompt: '...',
  model: 'gpt-5.1',
  tool_ids: ['get_training_plan', 'get_user_profile'],
  schema_json: { /* complex workout JSON schema */ },
  sub_agents: [
    {
      agent_id: 'workout:structured',
      input_mapping: { markdown: '$.result.markdown' }
    },
    {
      agent_id: 'workout:structured:validate',
      input_mapping: { workout_json: '$.structured_workout' }
    }
  ]
}
```

**After (Markdown-focused):**
```typescript
{
  agent_id: 'workout:generate',
  system_prompt: `
You are a personal trainer generating today's workout.

Read the user's dossier and training plan sections. Generate a detailed markdown workout following this structure:

# Workout - [Day], [Date]
**Program:** [Program Name] (Week X, Day Y)
**Focus:** [Primary focus]

## Warm-Up
[Exercises with durations]

## Main Workout
### 1. [Exercise Name]
**Target:** [Sets] × [Reps] @ [Intensity]
- **Set 1:** [Weight] × [Reps]
...

## Cool Down
[Stretches and recovery]

Refer to example workouts for format. Be specific with weights, sets, reps, rest times.
  `,
  model: 'gpt-5.1',
  tool_ids: ['get_training_plan', 'get_user_dossier', 'get_example_workouts'],
  schema_json: null,  // No schema needed!
  sub_agents: [
    {
      agent_id: 'workout:to_sms',
      input_mapping: { markdown: '$.result.markdown' },
      // Lightweight agent: read markdown, output SMS-friendly text
    }
  ]
}
```

**Changes:**
- ❌ Remove rigid JSON schema
- ✅ Add example workout files as tool
- ❌ Remove validation sub-agent
- ✅ Add lightweight SMS formatter (optional)

### New Tools

```typescript
// Tool: get_example_workouts
{
  name: 'get_example_workouts',
  description: 'Retrieve 3-5 example workout markdown files for reference',
  schema: {
    type: 'object',
    properties: {
      workout_type: { type: 'string', enum: ['upper_strength', 'lower_strength', 'upper_hypertrophy', 'lower_hypertrophy'] }
    }
  },
  execute: async ({ workout_type }) => {
    const examples = await db.query(`
      SELECT markdown 
      FROM workout_examples 
      WHERE type = $1 
      LIMIT 5
    `, [workout_type]);
    
    return examples.rows.map(r => r.markdown).join('\n\n---\n\n');
  }
}
```

## Validation Strategy

**Old Way:** Deep JSON schema validation, multi-step retries

**New Way:** Simple structure checks

```typescript
function validateWorkoutMarkdown(markdown: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required sections
  if (!markdown.includes('## Warm-Up')) {
    errors.push('Missing ## Warm-Up section');
  }
  if (!markdown.includes('## Main Workout')) {
    errors.push('Missing ## Main Workout section');
  }
  if (!markdown.includes('## Cool Down')) {
    errors.push('Missing ## Cool Down section');
  }
  
  // Check at least 3 exercises
  const exerciseMatches = markdown.match(/^### \d+\./gm);
  if (!exerciseMatches || exerciseMatches.length < 3) {
    errors.push('Need at least 3 main exercises');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**If validation fails:**
```typescript
if (!result.valid) {
  // Simple retry prompt
  const feedback = `Your workout is missing:\n${result.errors.join('\n')}\n\nPlease regenerate with all required sections.`;
  
  // LLM sees the markdown it generated + the errors + can fix
}
```

**Benefits:**
- ✅ Fast (regex checks, not JSON parsing)
- ✅ Clear error messages
- ✅ LLM can see the markdown and fix it
- ✅ No deep schema traversal

## Migration Path Summary

1. **Add markdown columns** to existing tables (parallel track)
2. **Create example markdown files** (10-15 per entity type)
3. **Update agent prompts** to generate markdown instead of JSON
4. **Add markdown → JSON generators** (lightweight sub-agents for UI)
5. **Test in parallel** (both old and new pipelines)
6. **Gradual cutover** (new users → markdown, old users migrate on next plan update)
7. **Deprecate JSON-first agents** after 100% cutover

**Risk:** Low. We're not changing the agent orchestration, just the data format.

## Next: Data Structures

Read `04-data-structures.md` for detailed example markdown files and generation patterns.
