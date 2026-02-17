# Agent Architecture - Complete System Design

## Architecture Principles

1. **Main agents return markdown ONLY** — No exceptions
2. **Sub-agents convert formats** — markdown → SMS, markdown → JSON
3. **Tools provide context** — File reads, not JSON path navigation
4. **Examples guide generation** — Show, don't schema
5. **Simple validation** — Section presence, not deep structure

## Agent Taxonomy

### Primary Agents (Return Markdown)
- **Fitness Plan Agent** — Generate 12-week training plans
- **Microcycle Agent** — Generate weekly workout sets
- **Chat Agent** — Conversational training advice

### Format Conversion Sub-Agents (Markdown → Other)
- **Workout Message Agent** — Markdown → SMS
- **Weekly Overview Agent** — Markdown → SMS summary
- **Workout Structure Agent** — Markdown → JSON (for calendar UI)
- **Analytics Agent** — Markdown history → Charts/progress JSON
- **Weekly Breakdown Agent** — Week markdown → JSON (for UI)

### Support Agents
- **Exercise Resolution Agent** — Natural language → exercise DB lookup
- **Plan Adjustment Agent** — Modify existing plan markdown
- **Feedback Processor Agent** — Parse user feedback → dossier updates

---

## Primary Agents

### 1. Fitness Plan Agent

**Purpose:** Generate complete 12-week training plan from user dossier

**Trigger:** 
- New user onboarding (after signup data collection)
- User requests plan change
- Major goal/availability change

**Input:**
- User dossier markdown (via `read_user_dossier` tool)
- Example plan markdowns (via `read_example_plans` tool)

**Output:** Complete training plan markdown

**Structure:**
```markdown
# [Program Name]

**Program Owner:** [Source/methodology]
**User:** [User name]
**Duration:** 12 weeks (YYYY-MM-DD to YYYY-MM-DD)
**Goal:** [Primary training goal]

## Program Philosophy
[Why this approach, what principles guide it]

## Microcycle 1-4: [Phase Name] (Weeks 1-4)

### Weekly Pattern
#### Monday - [Workout Type]
**Focus:** [Primary emphasis]
**Volume:** [Set count range]

**Main Lifts:**
1. [Exercise]: [Sets] × [Reps] (RPE [X-Y])
...

**Accessories:**
4. [Exercise]: [Sets] × [Reps]
...

#### Wednesday - [Workout Type]
...

[Repeat for all training days]

### Progression
- **Week 1:** [Strategy]
- **Week 2:** [Strategy]
- **Week 3:** [Strategy]
- **Week 4:** [Deload/Strategy]

## Microcycle 5: [Phase Name] (Week 5)
...

[Continue through all 12 weeks]

## Modification History
- **[Date]:** [Initial creation or modification]
```

**System Prompt (Summary):**
```
You are a strength and conditioning coach creating a 12-week training plan.

Context provided:
- User dossier (goals, experience, equipment, schedule)
- 3-5 example plans (markdown format)

Your task:
1. Read the user's dossier to understand their goals, experience level, and constraints
2. Select an appropriate training methodology (e.g., upper/lower split, PPL, full body)
3. Generate a complete 12-week plan with 3 microcycle phases
4. Each microcycle should include weekly patterns with specific exercises
5. Include progression strategy (weight increases, deloads)

Output format: Follow the example plan structure exactly.
Ensure variety in exercise selection based on available equipment.
Include appropriate progression (e.g., +5 lbs/week, deload every 4-5 weeks).
```

**Tools:**
- `read_user_dossier(user_id)` → Returns user dossier markdown
- `read_example_plans(experience_level, goal_type)` → Returns 3-5 example plan markdowns
- `search_exercises(muscle_group, equipment)` → Returns exercise options from DB

**Validation:**
```typescript
function validatePlanMarkdown(markdown: string): ValidationResult {
  const errors: string[] = [];
  
  // Check required top-level sections
  if (!markdown.match(/^# .+/m)) errors.push('Missing plan title');
  if (!markdown.includes('## Program Philosophy')) errors.push('Missing philosophy section');
  
  // Check for at least 3 microcycle sections
  const microcycles = markdown.match(/## Microcycle \d+/g);
  if (!microcycles || microcycles.length < 3) {
    errors.push('Need at least 3 microcycle sections');
  }
  
  // Check each microcycle has weekly pattern
  if (!markdown.includes('### Weekly Pattern')) {
    errors.push('Missing weekly pattern in microcycles');
  }
  
  return { valid: errors.length === 0, errors };
}
```

**Sub-Agents:**
- None (plan markdown is stored as-is, no immediate conversions needed)

**Caching:**
- Plan markdown stored in `training_plans.markdown`
- JSON structure generated on-demand for UI (via Plan Structure Agent)

---

### 2. Microcycle Agent (Weekly Generator)

**Purpose:** Generate 7 daily workouts for upcoming week

**Trigger:**
- Sunday night cron job (for upcoming week)
- User requests regeneration

**Input:**
- User dossier markdown
- Current training plan markdown
- Recent workout history (last 7-14 days markdown)
- Example workout markdowns

**Output:** Array of 7 workout markdowns (Mon-Sun)

**System Prompt (Summary):**
```
You are a personal trainer generating this week's workouts.

Context provided:
- User dossier (current state, preferences, modifications)
- Training plan (current microcycle section)
- Recent workout history (to track progression)
- Example workouts (format reference)

Your task for each training day:
1. Read the microcycle section to see the prescribed weekly pattern
2. Check recent workout history to determine appropriate weights
3. Generate a detailed daily workout markdown following the example format
4. Apply progressive overload (increase weight 5-10 lbs if user completed last week)
5. Respect any modifications in the dossier (e.g., "goblet squats instead of barbell squats")

Output format: 7 separate workout markdown files (one per day).
Include specific weights, sets, reps based on user's current progression.
Add warm-up and cool-down sections.
```

**Tools:**
- `read_user_dossier(user_id)`
- `read_training_plan(plan_id)`
- `read_recent_workouts(user_id, days=14)`
- `read_example_workouts(type)`
- `search_exercises(muscle_group, equipment)`

**Workflow:**
1. Invoke agent with context (all markdown)
2. Agent determines current week in plan (e.g., Week 3 of Microcycle 1-4)
3. Agent reads prescribed weekly pattern from plan markdown
4. Agent generates 7 workout markdowns with specific weights/reps
5. Agent returns array of workout markdowns

**Validation:**
```typescript
function validateWorkoutMarkdown(markdown: string): ValidationResult {
  const errors: string[] = [];
  
  if (!markdown.match(/^# Workout - /m)) errors.push('Missing workout title');
  if (!markdown.includes('## Warm-Up')) errors.push('Missing warm-up');
  if (!markdown.includes('## Main Workout')) errors.push('Missing main workout');
  if (!markdown.includes('## Cool Down')) errors.push('Missing cool down');
  
  // Check for at least 3 exercises
  const exercises = markdown.match(/^### \d+\. /gm);
  if (!exercises || exercises.length < 3) {
    errors.push('Need at least 3 main exercises');
  }
  
  return { valid: errors.length === 0, errors };
}
```

**Sub-Agents:**
- **Workout Message Agent** (converts each workout markdown → SMS)
- **Workout Structure Agent** (converts markdown → JSON for calendar UI)

**Caching:**
- Workout markdown stored in `workouts.markdown`
- SMS message generated once, cached in `workouts.sms_message`
- JSON structure generated once, cached in `workouts.structured_workout`

---

### 3. Chat Agent

**Purpose:** Conversational training advice and plan adjustments

**Trigger:**
- User sends message via SMS/web
- Continuous conversation context

**Input:**
- User message (text)
- Conversation history (recent messages)
- User dossier markdown
- Current training plan markdown
- Today's/recent workouts markdown

**Output:** Response message (markdown or plain text)

**System Prompt (Summary):**
```
You are the user's personal trainer in an ongoing conversation.

Context provided:
- User's dossier (goals, preferences, training history)
- Current training plan
- Recent workouts
- Conversation history

Respond to user questions and requests:
- Answer training questions
- Provide exercise substitutions
- Adjust workouts for today (e.g., "I'm tired, make it easier")
- Log feedback (e.g., "That bench press felt great!")
- Update preferences (e.g., "I got new dumbbells up to 75 lbs")

When modifying plans or dossiers:
- Use update_user_dossier or update_training_plan tools
- Be conversational and supportive
- Confirm changes with the user

Output format: Natural conversational text.
```

**Tools:**
- `read_user_dossier(user_id)`
- `read_training_plan(plan_id)`
- `read_todays_workout(user_id)`
- `read_recent_workouts(user_id, days=7)`
- `update_user_dossier(user_id, update_markdown)` — Append to history or modify sections
- `update_training_plan(plan_id, modification_markdown)` — Add to modification history
- `search_exercises(query)`
- `send_message(user_id, message)` — Deliver response

**Sub-Agents:**
- **Feedback Processor Agent** (parse user feedback → structured dossier update)
- **Plan Adjustment Agent** (modify plan markdown based on chat request)

---

## Format Conversion Sub-Agents

### 4. Workout Message Agent

**Purpose:** Convert workout markdown → SMS-friendly text

**Input:** Workout markdown

**Output:** SMS message text (plain text, formatted for mobile)

**System Prompt (Summary):**
```
Convert this workout markdown into an SMS-friendly message.

Input: Full workout markdown (warm-up, main workout, cool down)
Output: Concise SMS text (max 1600 characters)

Format:
- Use emojis for visual separation (🏋️, 💪)
- Abbreviate where appropriate (DB = Dumbbell, BB = Barbell)
- Group warm-up into summary line
- List exercises with sets×reps @ weight
- Include rest times
- End with motivational note

Example output:
🏋️ Monday Upper Strength - Week 3

WARM-UP (8 min)
• Dynamic stretch + light cardio

MAIN WORKOUT
1️⃣ Bench Press: 4×4-6 @ 185-205 lbs (rest 3-4 min)
2️⃣ BB Row: 4×6-8 @ 155-165 lbs (rest 2-3 min)
...

💪 Let's go! Reply when done.
```

**Tools:** None (pure transformation)

**Validation:** Check SMS length (< 1600 chars for single message)

**Caching:** Result stored in `workouts.sms_message`

---

### 5. Workout Structure Agent

**Purpose:** Convert workout markdown → JSON for calendar UI

**Input:** Workout markdown

**Output:** Structured JSON

**System Prompt (Summary):**
```
Extract structured data from workout markdown for UI display.

Input: Workout markdown
Output: JSON object

Schema:
{
  "title": "Monday Upper Strength",
  "date": "2026-02-16",
  "program": "12-Week Upper/Lower",
  "week": 3,
  "day": 1,
  "focus": "Upper Strength",
  "exercises": [
    {
      "order": 1,
      "name": "Barbell Bench Press",
      "sets": [
        { "weight": 185, "reps": 5, "rpe": null },
        { "weight": 205, "reps": 4, "rpe": 9 }
      ],
      "rest_seconds": 240,
      "notes": "Heavy sets"
    },
    ...
  ],
  "warm_up_duration_min": 8,
  "cool_down_duration_min": 5,
  "total_volume_lbs": 12500
}
```

**Tools:** None (pure extraction)

**Validation:** JSON schema check

**Caching:** Result stored in `workouts.structured_workout`

---

### 6. Weekly Overview Agent

**Purpose:** Generate weekly summary SMS

**Input:** Array of 7 workout markdowns for the week

**Output:** Weekly overview SMS message

**System Prompt (Summary):**
```
Create a motivating weekly overview SMS from 7 daily workouts.

Input: Array of workout markdowns (Mon-Sun)
Output: SMS summary (max 800 chars)

Include:
- Week number and phase
- Training days summary
- Key focus areas
- Motivational message

Example:
🗓️ Week 3 - Strength Accumulation

YOUR WEEK:
• Mon: Upper Strength (Bench, Rows, OHP)
• Wed: Lower Strength (Goblet Squat, RDL)
• Fri: Upper Hypertrophy (Volume day)
• Sat: Lower Hypertrophy + Cardio

FOCUS: Progressive overload on main lifts 💪

This is your biggest week yet - let's hit those numbers! 🔥
```

**Tools:** None

**Validation:** SMS length check

---

### 7. Analytics Agent

**Purpose:** Parse workout history → progress data (JSON)

**Input:** Array of workout markdowns (last 4-12 weeks)

**Output:** Analytics JSON

**System Prompt (Summary):**
```
Analyze workout history and generate progress analytics.

Input: Array of workout markdowns (historical)
Output: JSON with progress data

Extract:
- Weight progression per exercise (time series)
- Volume trends (sets × reps × weight over time)
- Consistency metrics (workouts completed vs. scheduled)
- PRs achieved
- Notable improvements

Output JSON schema:
{
  "exercises": {
    "Bench Press": {
      "history": [
        { "date": "2026-01-15", "max_weight": 185, "total_volume": 3700 },
        { "date": "2026-01-22", "max_weight": 195, "total_volume": 3900 }
      ],
      "pr": { "weight": 205, "date": "2026-02-16" }
    },
    ...
  },
  "weekly_volume": [...],
  "consistency": { "completed": 45, "scheduled": 48, "rate": 0.9375 }
}
```

**Tools:** 
- `parse_exercise_sets(markdown)` — Helper to extract sets/reps/weight

**Caching:** Generated on-demand when user requests progress view

---

## Support Agents

### 8. Exercise Resolution Agent

**Purpose:** Convert natural language → exercise DB lookup

**Input:** Natural language exercise name or description

**Output:** Exercise record from database (JSON)

**System Prompt (Summary):**
```
Match user's exercise description to exercise database.

Input: User's description (e.g., "bench press", "chest press with dumbbells", "DB bench")
Output: Exercise record from database

Use semantic matching to find the best match.
Consider common abbreviations (DB = dumbbell, BB = barbell).
Prefer exact matches, but use fuzzy matching if needed.

Return JSON:
{
  "exercise_id": "uuid",
  "name": "Dumbbell Bench Press",
  "muscle_group": "Chest",
  "equipment": ["Dumbbells", "Bench"],
  "video_url": "https://...",
  "instructions": "..."
}
```

**Tools:**
- `search_exercises_db(query)` — Full-text search on exercises table

**Validation:** Return `null` if no good match found (let main agent handle)

---

### 9. Plan Adjustment Agent

**Purpose:** Modify existing plan markdown based on user request

**Input:**
- Current plan markdown
- User request (e.g., "Add an extra upper day on Saturdays")

**Output:** Updated plan markdown with modification logged

**System Prompt (Summary):**
```
Modify the user's training plan based on their request.

Input:
- Current training plan markdown
- User's modification request

Your task:
1. Understand the modification request
2. Update the relevant microcycle sections
3. Ensure consistency across weeks
4. Add entry to Modification History section

Output: Complete updated plan markdown (with modification logged)
```

**Tools:** None (pure text transformation)

**Validation:** Same as Fitness Plan Agent validation

---

### 10. Feedback Processor Agent

**Purpose:** Parse user feedback → dossier update markdown

**Input:**
- User feedback message (e.g., "My knee hurts during squats")
- Current user dossier markdown

**Output:** Dossier update (append to history section)

**System Prompt (Summary):**
```
Process user feedback and update their dossier.

Input:
- User's feedback message
- Current dossier markdown

Your task:
1. Extract key information (injury, preference change, equipment update, etc.)
2. Generate markdown entry for dossier history section
3. Suggest any plan modifications if needed

Output:
{
  "dossier_update": "### 2026-02-16 - Knee Discomfort\n- Reported knee pain during squats\n- Recommend: Switch to goblet squats or leg press",
  "plan_modification_needed": true,
  "suggestion": "Replace barbell squats with goblet squats in all workouts"
}
```

**Tools:** None

**Validation:** Check that dossier update is valid markdown

---

## Agent Orchestration Examples

### Example 1: New User Onboarding

**Flow:**
1. User completes signup form → data stored in `signupdata` table
2. Cron job triggers: "New user onboarding for user_id"
3. **Create Dossier:**
   - Read signup data
   - Generate initial dossier markdown (profile + equipment + schedule)
   - Insert into `user_dossiers` table
4. **Generate Plan:**
   - Invoke **Fitness Plan Agent**
     - Tool: `read_user_dossier(user_id)`
     - Tool: `read_example_plans(experience='beginner', goal='strength')`
     - Output: Training plan markdown
   - Insert into `training_plans` table
5. **Generate First Week:**
   - Invoke **Microcycle Agent**
     - Tool: `read_user_dossier(user_id)`
     - Tool: `read_training_plan(plan_id)`
     - Tool: `read_example_workouts(type='full_body')`
     - Output: 7 workout markdowns
   - Insert into `workouts` table
6. **Generate SMS Messages:**
   - For each workout, invoke **Workout Message Agent**
     - Input: Workout markdown
     - Output: SMS text
   - Cache in `workouts.sms_message`
7. **Send Welcome Message:**
   - SMS: "Welcome to GymText! Your plan is ready. First workout: Monday 7 AM. Let's go! 💪"

**Total Agents Invoked:** 3 (Fitness Plan Agent, Microcycle Agent, Workout Message Agent × 7)

---

### Example 2: Weekly Workout Generation (Recurring)

**Trigger:** Sunday 8 PM cron job

**Flow:**
1. Cron queries: "All active users with upcoming week needing workouts"
2. For each user:
   - Invoke **Microcycle Agent**
     - Tool: `read_user_dossier(user_id)`
     - Tool: `read_training_plan(plan_id)`
     - Tool: `read_recent_workouts(user_id, days=14)`
     - Tool: `read_example_workouts(type='upper_strength')`
     - Output: 7 workout markdowns (with progressive weights)
   - Insert 7 workouts into `workouts` table
   - For each workout:
     - Invoke **Workout Message Agent** (sub-agent)
       - Input: Workout markdown
       - Output: SMS text
     - Cache SMS in `workouts.sms_message`
3. Log: "Generated workouts for 150 users"

**Total Agents Per User:** 2 (Microcycle Agent + Workout Message Agent × 7 sub-calls)

---

### Example 3: User Chat Interaction

**User:** "My shoulder hurts from yesterday's workout. Can I do something different today?"

**Flow:**
1. User message received via SMS
2. Invoke **Chat Agent**
   - Tool: `read_user_dossier(user_id)`
   - Tool: `read_todays_workout(user_id)`
   - Tool: `read_recent_workouts(user_id, days=7)`
   - Context: Conversation history
3. Chat Agent analyzes:
   - Today's workout has overhead press (shoulder-intensive)
   - User reported shoulder pain
   - Needs modification
4. Chat Agent invokes **Plan Adjustment Agent** (optional, or inline):
   - Modify today's workout markdown
   - Replace overhead press with lateral raises (lighter, safer)
   - Update `workouts.markdown` for today
5. Chat Agent uses `update_user_dossier`:
   - Append: "### 2026-02-16 - Shoulder Soreness\n- Reported shoulder pain after workout\n- Modified today's overhead press → lateral raises"
6. Chat Agent responds:
   - "I hear you on the shoulder! Let's swap overhead press for lighter lateral raises today. Rest up and we'll reassess tomorrow. 💪"
7. Invoke **Workout Message Agent** (regenerate SMS for modified workout):
   - Input: Updated workout markdown
   - Output: Updated SMS
   - Send to user

**Total Agents:** 2-3 (Chat Agent + Plan Adjustment Agent + Workout Message Agent)

---

## Performance Characteristics

### Token Usage Comparison

**Old System (JSON-first):**
- Generate workout JSON: ~3,000 tokens
- Validate JSON (retry 1-2 times): +2,000 tokens
- Transform JSON → SMS: +500 tokens
- **Total:** ~5,500 tokens per workout

**New System (Markdown-first):**
- Generate workout markdown: ~2,500 tokens (examples more efficient than schemas)
- Simple validation (no retries): +0 tokens (regex check)
- Convert markdown → SMS: +400 tokens
- **Total:** ~2,900 tokens per workout

**Savings:** ~47% reduction in tokens

### Latency Comparison

**Old System:**
- Generate JSON: 8 seconds
- Validate (with 1 retry): +6 seconds
- Transform → SMS: 2 seconds
- **Total:** ~16 seconds per workout

**New System:**
- Generate markdown: 6 seconds (simpler, fewer tokens)
- Simple validation: <0.1 seconds
- Convert → SMS: 1.5 seconds
- **Total:** ~7.6 seconds per workout

**Improvement:** ~52% faster

---

## Next: Database Schema

See `02-database-schema.md` for complete table definitions, indexes, and migrations.
