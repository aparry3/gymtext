# Data Flow - System Interactions

## Overview

This document illustrates how data flows through the markdown-first agent system in various scenarios:
1. New user onboarding
2. Weekly workout generation (recurring)
3. Daily workout delivery
4. User chat interaction
5. Plan modification
6. Analytics generation

**Key Principle:** Markdown flows through the system. JSON is generated at the edges (UI, analytics) as needed.

---

## Flow 1: New User Onboarding

**Trigger:** User completes signup questionnaire

### Steps

```
1. User submits signup form
   └─> Data stored in `signupdata` table
   
2. Cron/webhook detects new signup
   └─> Trigger: onboarding_pipeline(user_id)
   
3. Generate User Dossier
   ├─> Read signup data from `signupdata`
   ├─> Convert to dossier markdown template
   └─> INSERT INTO user_dossiers (user_id, markdown)
   
4. Invoke Fitness Plan Agent
   ├─> Tool: read_user_dossier(user_id)          [returns markdown]
   ├─> Tool: read_example_plans(level, goal)      [returns markdown examples]
   ├─> Agent generates 12-week plan markdown
   ├─> Validate: check required sections
   └─> INSERT INTO training_plans (user_id, markdown, start_date)
   
5. Invoke Microcycle Agent (generate week 1)
   ├─> Tool: read_user_dossier(user_id)          [returns markdown]
   ├─> Tool: read_training_plan(plan_id)         [returns markdown]
   ├─> Tool: read_example_workouts(type)         [returns markdown examples]
   ├─> Agent generates 7 workout markdowns
   ├─> Validate: check 7 workouts, required sections
   └─> INSERT INTO workouts (7 rows) [markdown]
   
6. Invoke Sub-Agent: Workout Message Agent (for each workout)
   ├─> Input: workout markdown
   ├─> Agent converts markdown → SMS text
   └─> UPDATE workouts SET sms_message = [text]
   
7. Send Welcome Message
   └─> SMS: "Welcome to GymText! Your plan is ready. First workout: Monday 7 AM 💪"
```

### Data Flow Diagram

```
signupdata
    ↓
user_dossiers.markdown  ──────────────┐
    ↓                                 ↓
Fitness Plan Agent                read_user_dossier (tool)
    ↓                                 ↓
training_plans.markdown  ─────────────┤
    ↓                                 ↓
Microcycle Agent  ←─── read_training_plan (tool)
    ↓
workouts.markdown (7 rows)
    ↓
Workout Message Agent (sub-agent)
    ↓
workouts.sms_message (cached)
    ↓
SMS Delivery
```

### Token Usage

| Step | Agent | Tokens |
|------|-------|--------|
| Fitness Plan | fitness_plan | ~6,000 |
| Microcycle (7 workouts) | microcycle | ~8,000 |
| SMS Conversion (7x) | workout_message | ~2,800 (400 each) |
| **Total** | | **~16,800** |

### Timing

- Fitness Plan: ~12 seconds
- Microcycle: ~15 seconds
- SMS Conversion: ~10 seconds (parallel)
- **Total:** ~37 seconds

---

## Flow 2: Weekly Workout Generation (Recurring)

**Trigger:** Sunday 8 PM cron job

### Steps

```
1. Cron queries active users
   └─> SELECT user_id FROM users WHERE is_active = true AND next_generation_date = CURRENT_DATE
   
2. For each user (batched, 10 at a time):
   
   3. Invoke Microcycle Agent
      ├─> Tool: read_user_dossier(user_id)          [markdown]
      ├─> Tool: read_training_plan(plan_id)         [markdown]
      ├─> Tool: read_recent_workouts(user_id, 14)   [markdown array]
      ├─> Tool: read_example_workouts(type)         [markdown examples]
      ├─> Agent analyzes progression:
      │   • Check last week's weights
      │   • Determine if user hit all reps/sets
      │   • Calculate new weights (+5-10 lbs if progressing)
      │   • Respect deload weeks (reduce volume 40%)
      ├─> Agent generates 7 workout markdowns (with specific weights)
      └─> INSERT INTO workouts (7 rows)
      
   4. Invoke Sub-Agent: Workout Message Agent (for each workout)
      ├─> Input: workout markdown
      ├─> Convert markdown → SMS
      └─> UPDATE workouts SET sms_message = [text]
      
   5. Invoke Sub-Agent: Workout Structure Agent (on-demand, async)
      ├─> Input: workout markdown
      ├─> Extract JSON structure
      └─> UPDATE workouts SET structured_workout = [json]
      
   6. Log invocation
      └─> INSERT INTO agent_invocations (agent_id, user_id, tokens, duration, status)
      
3. Send summary notification (optional)
   └─> SMS: "Your workouts for next week are ready! 💪"
```

### Data Flow Diagram

```
Cron (Sunday 8 PM)
    ↓
Query: active users
    ↓
For each user:
    ├─> read_user_dossier ────────> user_dossiers.markdown
    ├─> read_training_plan ───────> training_plans.markdown
    ├─> read_recent_workouts ─────> workouts.markdown (last 14 days)
    └─> read_example_workouts ────> workout_examples.markdown
                ↓
         Microcycle Agent
                ↓
    workouts.markdown (7 new rows)
                ↓
       ┌────────┴────────┐
       ↓                 ↓
Workout Message Agent  Workout Structure Agent
       ↓                 ↓
workouts.sms_message  workouts.structured_workout
       ↓
  SMS Delivery (next morning)
```

### Performance (Per User)

- **Tokens:** ~10,000 (microcycle + SMS conversions)
- **Duration:** ~20 seconds
- **Cost:** ~$0.05 (at $5/M tokens)

### Batching Strategy

- Process 10 users concurrently
- 150 users = 15 batches × 20 seconds = ~5 minutes total
- Cron runs at 8 PM → all workouts ready by 8:05 PM

---

## Flow 3: Daily Workout Delivery

**Trigger:** User's preferred time (e.g., 6:00 AM)

### Steps

```
1. Cron queries users with delivery time = NOW
   └─> SELECT user_id, workout_id FROM workouts WHERE workout_date = CURRENT_DATE AND user_preferred_time = CURRENT_TIME
   
2. For each user:
   
   3. Fetch cached SMS message
      └─> SELECT sms_message FROM workouts WHERE id = [workout_id]
      
   4. If cache miss (sms_message IS NULL):
      ├─> Fetch workout markdown
      ├─> Invoke Workout Message Agent
      ├─> Generate SMS text
      └─> UPDATE workouts SET sms_message = [text]
      
   5. Send SMS
      ├─> INSERT INTO message_queues (user_id, message, scheduled_for)
      └─> SMS delivery service processes queue
      
   6. Log delivery
      └─> UPDATE workouts SET delivered_at = NOW()
```

### Data Flow Diagram

```
Cron (6:00 AM)
    ↓
Query: today's workouts for users with preferred_time = 6:00 AM
    ↓
workouts.sms_message (cached)
    ↓
[If cache hit] ────────> SMS Delivery
    ↓
[If cache miss]
    ↓
workouts.markdown
    ↓
Workout Message Agent
    ↓
workouts.sms_message (update cache)
    ↓
SMS Delivery
```

### Performance

- **Cache hit:** Instant (just fetch text from DB)
- **Cache miss:** ~2 seconds (generate SMS)
- **Typical:** 99% cache hit rate (generated Sunday night)

---

## Flow 4: User Chat Interaction

**Trigger:** User sends SMS message

### Example: "My shoulder hurts, can I skip overhead press today?"

```
1. User sends SMS
   └─> SMS webhook → INSERT INTO messages (user_id, text, direction='inbound')
   
2. Trigger Chat Agent
   ├─> Tool: read_user_dossier(user_id)          [markdown]
   ├─> Tool: read_todays_workout(user_id)        [markdown]
   ├─> Tool: read_recent_workouts(user_id, 7)    [markdown array]
   ├─> Context: conversation_history (last 10 messages)
   │
   ├─> Agent analyzes:
   │   • User reported shoulder pain
   │   • Today's workout includes overhead press (shoulder-intensive)
   │   • Need to modify workout
   │
   ├─> Agent decides to:
   │   1. Modify today's workout (replace overhead press → lateral raises)
   │   2. Log injury in dossier
   │   3. Respond with empathy and confirmation
   │
   ├─> Tool: update_todays_workout(user_id, modified_markdown)
   │   └─> UPDATE workouts SET markdown = [modified], sms_message = NULL, cache_version++
   │
   ├─> Tool: update_user_dossier(user_id, history_entry)
   │   └─> Append to ## Training History:
   │       "### 2026-02-16 - Shoulder Soreness
   │        - Reported pain after yesterday's workout
   │        - Modified today's overhead press → lateral raises"
   │
   └─> Agent responds:
       "I hear you on the shoulder! Let's swap overhead press for lighter lateral raises today. Rest up and we'll reassess tomorrow. 💪"
       
3. Regenerate SMS (optional, if user wants today's workout again)
   ├─> Invoke Workout Message Agent
   ├─> Input: modified workout markdown
   └─> UPDATE workouts SET sms_message = [new SMS]
   
4. Send response
   └─> INSERT INTO messages (user_id, text, direction='outbound')
   └─> SMS delivery
```

### Data Flow Diagram

```
User SMS (inbound)
    ↓
messages table
    ↓
Chat Agent
    ├─> read_user_dossier ────────> user_dossiers.markdown
    ├─> read_todays_workout ──────> workouts.markdown
    └─> read_recent_workouts ─────> workouts.markdown (history)
            ↓
    [Agent decides to modify]
            ↓
    ├─> update_todays_workout ───> workouts.markdown (UPDATE)
    └─> update_user_dossier ─────> user_dossiers.markdown (UPDATE, invalidate cache)
            ↓
    Response message
            ↓
    messages table (outbound)
            ↓
    SMS Delivery
```

### Cache Invalidation

- **Workout modified:** `workouts.sms_message = NULL` (regenerate if requested)
- **Dossier updated:** `user_dossiers.profile_json = NULL` (regenerate on next access)

---

## Flow 5: Plan Modification

**Trigger:** User requests plan change (e.g., "Add an extra upper day on Saturdays")

### Steps

```
1. User sends request via chat
   └─> "Can we add an extra upper body day on Saturdays?"
   
2. Invoke Chat Agent
   ├─> Tool: read_user_dossier(user_id)          [markdown]
   ├─> Tool: read_training_plan(plan_id)         [markdown]
   │
   ├─> Agent analyzes request:
   │   • User wants to add Saturday (currently rest day)
   │   • Request is feasible (user has time, equipment)
   │
   ├─> Agent invokes Plan Adjustment Agent (sub-agent)
   │   ├─> Input: current plan markdown + modification request
   │   ├─> Agent modifies plan:
   │   │   • Add "Saturday - Upper Hypertrophy" to weekly patterns
   │   │   • Update all microcycle sections
   │   │   • Add modification history entry
   │   └─> Output: updated plan markdown
   │
   ├─> Tool: update_training_plan(plan_id, modified_markdown)
   │   └─> UPDATE training_plans SET markdown = [modified], structured_plan = NULL
   │
   └─> Agent responds:
       "Great idea! I've added Saturday upper hypertrophy to your plan. Your next week's workouts will include the new Saturday session. 💪"
       
3. Regenerate upcoming workouts (if needed)
   ├─> Check: are there future workouts already generated?
   └─> If yes: DELETE future workouts, regenerate with new plan
       (Alternatively: keep this week, apply change starting next week)
```

### Data Flow Diagram

```
User Request (chat)
    ↓
Chat Agent
    ├─> read_training_plan ──────> training_plans.markdown
    └─> [decides modification needed]
            ↓
    Plan Adjustment Agent (sub-agent)
            ↓
    Modified plan markdown
            ↓
    update_training_plan ────> training_plans.markdown (UPDATE)
            ↓
    [Invalidate cache]
    training_plans.structured_plan = NULL
            ↓
    Response to user
```

---

## Flow 6: Analytics Generation (On-Demand)

**Trigger:** User requests progress report (e.g., "How's my bench press progress?")

### Steps

```
1. User requests progress via chat or web UI
   └─> "Show me my bench press progress over the last 3 months"
   
2. Invoke Analytics Agent
   ├─> Tool: read_workout_history(user_id, exercise='Bench Press', days=90)
   │   └─> SELECT markdown FROM workouts 
   │       WHERE user_id = $1 AND 'Bench Press' = ANY(exercise_list) AND workout_date >= NOW() - INTERVAL '90 days'
   │       ORDER BY workout_date
   │
   ├─> Agent parses markdown:
   │   • Extract bench press sets/reps/weights from each workout
   │   • Build time series: [ { date: '2026-01-15', max_weight: 185, volume: 3700 }, ... ]
   │   • Calculate PRs, trends, consistency
   │
   └─> Agent generates analytics JSON:
       {
         "exercise": "Bench Press",
         "history": [
           { "date": "2026-01-15", "max_weight": 185, "total_volume": 3700 },
           { "date": "2026-01-22", "max_weight": 195, "total_volume": 3900 },
           { "date": "2026-02-05", "max_weight": 205, "total_volume": 4100 }
         ],
         "pr": { "weight": 205, "date": "2026-02-05" },
         "avg_weekly_volume": 3900,
         "improvement_pct": 10.8
       }
       
3. Return JSON to UI or convert to text for SMS
   ├─> [Web UI] Render charts from JSON
   └─> [SMS] "Bench Press progress: 185 → 205 lbs (+10.8%) over 3 months! 💪 Keep it up!"
```

### Data Flow Diagram

```
User Request (web/chat)
    ↓
Analytics Agent
    ↓
read_workout_history ───> workouts.markdown (filtered by exercise)
    ↓
Parse markdown (extract sets/reps/weights)
    ↓
Generate analytics JSON
    ↓
┌────────┴────────┐
↓                 ↓
Web UI (charts)   SMS (text summary)
```

### Caching Strategy

- **No permanent cache** (generate on-demand)
- **Session cache:** Store analytics JSON for 15 minutes (avoid re-parsing)
- **Why not cache permanently?** Data changes frequently (new workouts added daily)

---

## System-Wide Data Flow Summary

### Markdown-First Principle in Action

```
User Input (signup, chat, feedback)
    ↓
[Create/Update Markdown]
    ├─> user_dossiers.markdown
    ├─> training_plans.markdown
    └─> workouts.markdown
    ↓
[Agents Work With Markdown]
    ├─> Read markdown (tools)
    ├─> Generate markdown (output)
    └─> Update markdown (tools)
    ↓
[Convert at Edges (as needed)]
    ├─> markdown → SMS (Workout Message Agent)
    ├─> markdown → JSON (Workout Structure Agent)
    └─> markdown → Analytics JSON (Analytics Agent)
    ↓
[Cache Conversions]
    ├─> workouts.sms_message (cached SMS)
    ├─> workouts.structured_workout (cached JSON)
    └─> user_dossiers.profile_json (cached profile)
    ↓
[Deliver to User]
    ├─> SMS (text)
    ├─> Web UI (JSON)
    └─> Chat (text)
```

### Cache Invalidation Rules

| Event | Invalidate |
|-------|------------|
| Dossier markdown updated | `profile_json = NULL`, `equipment_tags = NULL`, `training_days = NULL` |
| Plan markdown updated | `structured_plan = NULL`, regenerate future workouts (optional) |
| Workout markdown updated | `sms_message = NULL`, `structured_workout = NULL` |
| Schema version bump | `cache_version++` → invalidate all caches of that type |

---

## Performance Optimization Strategies

### 1. Batch Agent Invocations

**Problem:** Generating 150 users' workouts sequentially = 150 × 20s = 50 minutes

**Solution:** Batch into groups of 10, run concurrently
```
Batch 1 (users 1-10)  → 20 seconds
Batch 2 (users 11-20) → 20 seconds
...
Batch 15 (users 141-150) → 20 seconds

Total: 15 × 20 seconds = 5 minutes
```

### 2. Preemptive Caching

**Problem:** User requests today's workout at 6 AM, but SMS not cached = 2 second delay

**Solution:** Generate and cache SMS on Sunday night (when workouts are created)
```
Sunday 8 PM:
├─> Generate 7 workouts (markdown)
└─> Immediately invoke Workout Message Agent for all 7
    └─> Cache all SMS messages

Monday 6 AM:
└─> Instant delivery (cache hit)
```

### 3. Lazy JSON Generation

**Problem:** Not all workouts need JSON (only when user views calendar UI)

**Solution:** Don't generate JSON until requested
```
Sunday 8 PM:
├─> Generate workouts.markdown
└─> Generate workouts.sms_message (always needed)
    └─> Skip workouts.structured_workout (lazy)

User opens calendar (Tuesday):
├─> Check: structured_workout IS NULL?
├─> Yes → Invoke Workout Structure Agent
└─> Cache JSON for future requests
```

### 4. Markdown Parsing Optimization

**Problem:** Parsing markdown for analytics = slow regex operations

**Solution:** Pre-cache exercise lists and volumes
```
When workout is created:
├─> Generate markdown
└─> Extract metadata (async):
    ├─> exercise_list (TEXT[])
    ├─> total_volume_lbs (INT)
    └─> total_sets (INT)

When analytics requested:
└─> Query: SELECT workout_date, total_volume_lbs FROM workouts WHERE 'Bench Press' = ANY(exercise_list)
    (Fast indexed query, no markdown parsing needed)
```

---

## Error Handling & Retry Flows

### Scenario: Microcycle Agent Validation Failure

```
1. Invoke Microcycle Agent
   ├─> Agent generates 7 workouts
   └─> Validation fails: "Workout 3 missing ## Cool Down section"
   
2. Retry with feedback
   ├─> System prompt appended with:
   │   "Your previous attempt was missing the ## Cool Down section in workout 3.
   │    Please regenerate all 7 workouts, ensuring each has:
   │    - ## Warm-Up
   │    - ## Main Workout
   │    - ## Cool Down"
   ├─> Agent regenerates
   └─> Validation passes
   
3. If retry fails (max 2 retries):
   ├─> Log error: INSERT INTO agent_invocations (..., status='validation_error')
   ├─> Fallback: Use last week's workouts (with note: "Using previous week's plan")
   └─> Alert admin: "Microcycle generation failed for user [user_id]"
```

---

## Next: Markdown Formats

See `05-markdown-formats.md` for canonical markdown structures and templates.
