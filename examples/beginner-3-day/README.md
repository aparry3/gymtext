# Beginner 3-Day Training Plan Examples

**Purpose:** Comprehensive training examples demonstrating the complete GymText agent workflow from plan generation through workout delivery.

**Client Profile:** Sarah Chen — 28-year-old beginner, 6 months sedentary, goal to build strength foundation

---

## Overview

This example set demonstrates the TEXT → STRUCTURE pattern used throughout GymText, showing how unstructured agent-generated content gets converted into structured data that powers the backend system.

The examples follow a realistic 12-week beginner program with internally consistent progression, realistic weights, and high-quality coaching.

---

## File Structure

### 01 — Plan Generation (TEXT)
**File:** `01-plan-generate.txt`

The foundational program design document. Defines:
- 12-week program structure (3 phases × 4 weeks)
- Training philosophy and progression scheme
- Exercise selection and periodization
- Rep schemes, intensity targets (RPE), and deload weeks
- Expected outcomes and troubleshooting

**Purpose:** This is what a `plan:generate` agent call would produce—a comprehensive training plan in natural language.

---

### 02 — Microcycle Generation (TEXT)
**Files:** 
- `02-microcycle-generate-week-01.txt` (Phase 1: Movement Foundation)
- `02-microcycle-generate-week-05.txt` (Phase 2: Strength Development)
- `02-microcycle-generate-week-09.txt` (Phase 3: Consolidation & Testing)

Weekly training breakdowns showing:
- Session-by-session structure (Day 1, 2, 3)
- Warm-up, main work, accessory work, cooldown
- Weight selections, rep schemes, tempo prescriptions
- Coaching cues and progression notes

**Purpose:** This is what a `microcycle:generate` agent call would produce—detailed weekly programming that flows from the overall plan.

**Progression Demonstrated:**
- Week 1: 3×8, RPE 6-7, dumbbells only, learning movements
- Week 5: 4×6, RPE 7-8, barbell introduced (squat, bench, RDL)
- Week 9: 4×8, RPE 8-9, conventional deadlift and assisted pull-ups introduced

---

### 03 — Microcycle Structure (JSON)
**File:** `03-microcycle-structure.json`

Structured metadata for Weeks 1, 5, and 9:
- Week number, phase, focus, volume, intensity
- Schedule (day themes and estimated durations)
- Key exercises with prescriptions
- Progression notes and recovery guidance

**Purpose:** This is what a `microcycle:structure` agent call would produce—structured data for backend storage and retrieval.

**Schema Pattern:**
```json
{
  "weekNumber": 1,
  "phase": { "name": "Movement Foundation", "phaseWeek": 1, "totalWeeks": 4 },
  "focus": "Learn movement patterns, establish baseline",
  "volume": { "sessionsPerWeek": 3, "setsPerSession": 9, "totalSets": 27 },
  "intensity": { "rpeTarget": "6-7", "description": "Moderate, technique-focused" },
  "keyExercises": [ ... ],
  "progressionNotes": "...",
  "nextWeekAdjustments": "..."
}
```

---

### 04 — Workout Generation (TEXT)
**Files:**
- `04-workout-generate-week01-day1.txt` (Squat Emphasis)
- `04-workout-generate-week01-day2.txt` (Hinge Emphasis)
- `04-workout-generate-week01-day3.txt` (Lunge Emphasis)

Detailed individual workout text with:
- Session overview and priorities
- Full warm-up protocol
- Exercise-by-exercise instructions (setup, execution, coaching cues)
- Common mistakes and corrections
- Cooldown and recovery recommendations
- Post-session notes (what to expect, homework)

**Purpose:** This is what a `workout:generate` agent call would produce—coach-level detail for session execution.

**Example Detail Level:**
- Exercise setup and execution mechanics
- Tempo prescriptions (3-0-1, 2-1-2)
- Coaching cues ("Push hips BACK, not down")
- Film instructions (sets to record for review)
- Anticipated soreness and recovery guidance

---

### 05 — Workout Messages (SMS)
**Files:**
- `05-workout-message-week01-day1.txt`
- `05-workout-message-week01-day2.txt`
- `05-workout-message-week01-day3.txt`

SMS-ready workout format:
- Warm-up: brief list
- Workout: exercises with sets×reps @ weight
- Cooldown: brief list
- Notes: key cues and reminders

**Purpose:** This is what a `workout:message` agent call would produce—concise, SMS-friendly format that users actually receive.

**Format Example:**
```
Week 1, Day 1 — Squat Emphasis

Warm-Up:
- Treadmill walk: 5min easy
- Cat-cow: 10 reps
- Glute bridge: 2x12

Workout:
- Goblet squat: 3x8 @ 15lbs
- DB bench press: 3x8 @ 15lbs each
- DB single-arm row: 3x8 each @ 20lbs

Notes: First session! Focus on learning movement patterns.
```

**Follows:** `workout-messages.md` style guide

---

### 06 — Workout Structure (JSON)
**Files:**
- `06-workout-structure-week01-day1.json`
- `06-workout-structure-week01-day2.json`
- `06-workout-structure-week01-day3.json`

Fully structured workout data:
- Title, focus, description, quote
- Sections (warm-up, main work, accessory, cooldown)
- Exercises with all fields:
  - `name`, `type`, `sets`, `reps`, `rest`
  - `intensity` (type, value, description)
  - `tempo`, `notes`, `tags`, `supersetId`
  - `duration`, `distance` (for cardio)
- Estimated duration, intensity level, workout tags

**Purpose:** This is what a `workout:structure` agent call would produce—structured JSON for backend storage, retrieval, and UI rendering.

**Schema Pattern:**
```json
{
  "title": "Beginner Full Body — Day 1",
  "focus": "Squat & Horizontal Push/Pull",
  "sections": [
    {
      "title": "Main Work",
      "exercises": [
        {
          "name": "Goblet Squat",
          "type": "Strength",
          "sets": "3",
          "reps": "8",
          "rest": "90s",
          "intensity": { "type": "RPE", "value": "6", "description": "Moderate effort" },
          "tempo": "3-0-1",
          "notes": "15lbs dumbbell. Sit back into hips, chest up.",
          "tags": ["squat", "legs", "quads"]
        }
      ]
    }
  ]
}
```

**Follows:** `structured-workouts.json` schema patterns

---

## The GymText Workflow

This example set demonstrates the complete agent workflow:

### 1. **Plan Generation** (Strategic)
Agent generates a 12-week training plan based on user goals, experience level, and constraints.

**Input:** User profile, goals, schedule, equipment  
**Output:** `01-plan-generate.txt` (comprehensive program design)

### 2. **Microcycle Generation** (Tactical)
Agent generates weekly programming that implements the plan's philosophy and progression scheme.

**Input:** Plan document, current week number, phase  
**Output:** `02-microcycle-generate-week-XX.txt` (detailed weekly breakdown)

### 3. **Microcycle Structure** (Data)
Agent converts microcycle text into structured metadata for backend storage.

**Input:** Microcycle text  
**Output:** `03-microcycle-structure.json` (JSON metadata)

### 4. **Workout Generation** (Execution)
Agent generates individual workout text with full coaching detail.

**Input:** Microcycle text, specific day  
**Output:** `04-workout-generate-week01-dayX.txt` (session instructions)

### 5. **Workout Message** (Delivery)
Agent converts workout text into SMS-friendly format for user delivery.

**Input:** Workout generation text  
**Output:** `05-workout-message-week01-dayX.txt` (SMS format)

### 6. **Workout Structure** (Data)
Agent converts workout text into structured JSON for backend storage and UI rendering.

**Input:** Workout generation text  
**Output:** `06-workout-structure-week01-dayX.json` (structured data)

---

## Key Design Patterns

### TEXT → STRUCTURE
All examples follow the pattern:
1. Generate natural language output (what coaches write)
2. Convert to structured data (what systems need)

This allows agents to "think" in natural language while producing machine-readable output.

### Progressive Detail
Examples move from strategic (plan) → tactical (microcycle) → operational (workout):
- **Plan:** 12 weeks, philosophy, periodization
- **Microcycle:** 1 week, 3 sessions, progression
- **Workout:** 1 session, exercise-by-exercise, coaching cues

### Internal Consistency
All examples use the same fictional trainee (Sarah Chen) with:
- Consistent weight progressions (15lbs → 20lbs → 25lbs)
- Logical exercise selection (goblet squat → barbell back squat)
- Realistic strength gains (Week 1: 15lbs goblet squat → Week 9: 155lbs barbell squat)

### Coaching Voice
Text examples include:
- Coaching cues ("Push hips BACK, not down")
- Common mistakes and corrections
- Recovery guidance and expectations
- Motivational elements (celebrating Week 1 completion)

---

## Usage

### For Training GymText Agents
Use these examples to:
- Train plan generation agents (learn program design patterns)
- Train microcycle agents (learn weekly programming structure)
- Train workout agents (learn session detail and coaching cues)
- Train structure agents (learn TEXT → JSON conversion)

### For Testing the System
Use these examples to:
- Validate agent output quality (compare to gold standard)
- Test TEXT → STRUCTURE conversion pipelines
- Verify SMS message formatting
- Test UI rendering with structured workout data

### For Documentation
Use these examples to:
- Show stakeholders what GymText produces
- Document the agent workflow
- Explain the TEXT → STRUCTURE pattern
- Demonstrate realistic training progression

---

## Quality Standards

These examples demonstrate:
- ✅ **Realistic progression:** Week 1 (learning) → Week 5 (barbell intro) → Week 9 (heavy loads)
- ✅ **Internal consistency:** Same trainee, logical weight increases, realistic strength gains
- ✅ **High coaching quality:** Detailed cues, common mistakes, recovery guidance
- ✅ **Production-ready formatting:** SMS messages, structured JSON, coach-level text
- ✅ **Schema compliance:** All JSON follows established patterns in `structured-workouts.json`

---

## Next Steps

### Expansion Opportunities
- Add Week 2-4 examples (Phase 1 completion)
- Add Week 6-8 examples (Phase 2 progression)
- Add Week 10-12 examples (testing and assessment)
- Create examples for intermediate/advanced programs
- Add variation examples (upper/lower split, push/pull/legs)

### Integration
- Use examples to train/fine-tune GymText agents
- Build test suite around these examples
- Create UI components that render structured workout JSON
- Implement SMS delivery pipeline with message format

---

## File Inventory

| File | Type | Purpose | Size |
|------|------|---------|------|
| `01-plan-generate.txt` | TEXT | 12-week program design | 10KB |
| `02-microcycle-generate-week-01.txt` | TEXT | Week 1 programming | 8KB |
| `02-microcycle-generate-week-05.txt` | TEXT | Week 5 programming | 10KB |
| `02-microcycle-generate-week-09.txt` | TEXT | Week 9 programming | 12KB |
| `03-microcycle-structure.json` | JSON | Structured microcycle data | 11KB |
| `04-workout-generate-week01-day1.txt` | TEXT | Day 1 detailed workout | 11KB |
| `04-workout-generate-week01-day2.txt` | TEXT | Day 2 detailed workout | 11KB |
| `04-workout-generate-week01-day3.txt` | TEXT | Day 3 detailed workout | 13KB |
| `05-workout-message-week01-day1.txt` | SMS | Day 1 SMS format | 0.6KB |
| `05-workout-message-week01-day2.txt` | SMS | Day 2 SMS format | 0.6KB |
| `05-workout-message-week01-day3.txt` | SMS | Day 3 SMS format | 0.7KB |
| `06-workout-structure-week01-day1.json` | JSON | Day 1 structured data | 8KB |
| `06-workout-structure-week01-day2.json` | JSON | Day 2 structured data | 8KB |
| `06-workout-structure-week01-day3.json` | JSON | Day 3 structured data | 8KB |
| `README.md` | DOC | This file | 10KB |

**Total:** 15 files, ~120KB

---

## Contributors

**Created:** February 16, 2026  
**Agent:** Shackleton (Product Researcher)  
**Team:** GymText Engineering  
**Epic:** Beginner 3-Day Plan Examples  

---

## License

Internal training examples for GymText system development.
