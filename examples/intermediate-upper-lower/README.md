# Intermediate Upper/Lower Split Training Examples

## Purpose

This directory contains comprehensive training examples demonstrating the **GymText agent workflow** for intermediate-level programming. These examples show the complete TEXT → STRUCTURE pipeline: from initial plan generation through workout delivery, illustrating how unstructured agent output gets converted into structured data that drives the GymText backend.

**Key Learning Points:**
- Block periodization with distinct phases (accumulation → intensification → realization)
- Upper/lower split structure with 2x/week frequency per muscle group
- Exercise variation strategies (Upper 1/2, Lower 1/2 with different emphases)
- Progressive overload beyond linear progression (volume waves, intensity manipulation)
- SMS message formatting for intermediate-complexity workouts
- Structured JSON with RPE/RIR targets and tempo prescriptions

## Fictional Trainee Profile

**Marcus Johnson** — 32-year-old intermediate lifter
- **Training Experience:** 2 years consistent training (completed beginner program)
- **Current Strength Levels (Week 1):**
  - Squat: 225lbs × 8 reps @ RPE 7-8
  - Bench Press: 185lbs × 8 reps @ RPE 7-8
  - Deadlift: 265lbs × 6 reps @ RPE 8
  - Overhead Press: 115lbs × 8 reps @ RPE 7-8
- **Target PRs (Week 9):**
  - Squat: 305lbs × 5 reps
  - Bench Press: 245lbs × 5 reps
  - Deadlift: 355lbs × 5 reps
  - Overhead Press: 155lbs × 5 reps
- **Goal:** Break through intermediate plateau, continue strength and muscle development
- **Schedule:** 4 days per week (Mon/Tue/Thu/Fri)
- **Equipment:** Fully equipped commercial gym

## Program Structure

**Duration:** 16 weeks organized into 4 training blocks

**Training Split:** 4-day Upper/Lower
- **Monday:** Upper 1 (Horizontal emphasis — rows, bench variations)
- **Tuesday:** Lower 1 (Squat emphasis)
- **Thursday:** Upper 2 (Vertical emphasis — pull-ups, overhead pressing)
- **Friday:** Lower 2 (Hinge emphasis — deadlifts, RDLs)

**Periodization Model:** Block periodization
- **Block 1 (Weeks 1-4):** Accumulation — High volume (4×8-10), moderate intensity (RPE 7-8)
- **Block 2 (Weeks 5-8):** Intensification — Moderate volume (5×5), high intensity (RPE 8-9)
- **Block 3 (Weeks 9-12):** Realization — Lower volume (work to 5RM), peak intensity (RPE 9-10)
- **Block 4 (Weeks 13-16):** Overreach + Deload

**Why Upper/Lower for Intermediates:**
- **Higher frequency:** Each muscle group trained 2x/week drives better adaptations than once-weekly splits
- **Manageable volume:** Can accumulate higher weekly volumes than full-body while remaining recoverable
- **Exercise variety:** Upper 1/2 and Lower 1/2 use different exercises to prevent overuse and staleness
- **Flexible:** Easier to fit into work/life schedule than 5-6 day splits
- **Sustainable:** Better recovery than daily body-part splits, especially for natural lifters

## File Structure & Flow

This example set demonstrates the complete GymText agent pipeline:

### 1. Plan Generation (TEXT)
**File:** `01-plan-generate.txt`

The `plan:generate` agent creates the overall program philosophy, structure, and periodization model. This establishes:
- 16-week block periodization framework
- Upper/lower split rationale and structure
- Exercise selection philosophy (variation strategies)
- Progression model (volume → intensity waves)
- Client context (Marcus Johnson's profile and goals)

**Output:** Unstructured TEXT that an LLM generated based on client intake

---

### 2. Microcycle Generation (TEXT)
**Files:** 
- `02-microcycle-generate-week-01.txt` (Accumulation phase)
- `02-microcycle-generate-week-05.txt` (Intensification phase)
- `02-microcycle-generate-week-09.txt` (Realization phase)

The `microcycle:generate` agent creates weekly training plans showing:
- **Week 1:** High-volume accumulation block (4×8 @ RPE 7-8)
- **Week 5:** Intensification block with increased load (5×5 @ RPE 8-9)
- **Week 9:** Realization/testing block (work to 5RM @ RPE 9-10)

These examples demonstrate **block periodization progression** — how volume and intensity wave across training blocks to drive continued adaptation.

**Output:** Unstructured TEXT for each week's training plan

---

### 3. Microcycle Structure (JSON)
**File:** `03-microcycle-structure.json`

Converts Week 1 microcycle text into structured JSON following GymText schema. Shows:
- Week-level metadata (block, phase, focus)
- 4-day session structure (Upper 1, Lower 1, Upper 2, Lower 2)
- Session-level volume/intensity targets
- Structural relationships between sessions

**Output:** Structured JSON that the GymText backend can consume

**Schema Pattern:**
```json
{
  "weekNumber": 1,
  "blockName": "Accumulation",
  "focus": "Volume accumulation with moderate intensity",
  "sessions": [
    {
      "dayOfWeek": "Monday",
      "sessionType": "Upper 1",
      "primaryFocus": "Horizontal Push/Pull",
      "volumeTarget": "Moderate-High",
      "intensityTarget": "RPE 7-8"
    }
    // ... more sessions
  ]
}
```

---

### 4. Workout Generation (TEXT)
**Files:**
- `04-workout-generate-week01-upper1.txt`
- `04-workout-generate-week01-lower1.txt`
- `04-workout-generate-week01-upper2.txt`
- `04-workout-generate-week01-lower2.txt`

The `workout:generate` agent creates detailed individual workout plans for each session. These show:
- Exercise selection with rationale
- Set/rep schemes
- Intensity prescriptions (RPE/RIR)
- Coaching cues and technique notes
- Exercise ordering and progression logic

**Example (Upper 1):**
- Bench Press 4×8 @ RPE 7-8 (main horizontal push)
- Barbell Row 4×8 @ RPE 7-8 (main horizontal pull)
- Incline DB Press 3×10 @ RPE 7 (accessory push variation)
- Face Pulls, Lateral Raises (shoulder health and hypertrophy)

**Output:** Unstructured TEXT ready for SMS delivery or JSON structuring

---

### 5. Workout Messages (SMS Format)
**Files:**
- `05-workout-message-week01-upper1.txt`
- `05-workout-message-week01-lower1.txt`
- `05-workout-message-week01-upper2.txt`
- `05-workout-message-week01-lower2.txt`

Converts detailed workout text into **SMS-ready format** following `workout-messages.md` style:
- Concise, scannable format
- Clear warm-up → main work → cooldown structure
- Emoji-based section markers
- Mobile-friendly line breaks and spacing
- Removes verbose coaching (keeps essential cues only)

**What Users Actually Receive:** These messages are what Marcus would get via SMS on workout day.

**Output:** SMS-formatted TEXT ready to send via Twilio

---

### 6. Workout Structure (JSON)
**Files:**
- `06-workout-structure-week01-upper1.json`
- `06-workout-structure-week01-lower1.json`
- `06-workout-structure-week01-upper2.json`
- `06-workout-structure-week01-lower2.json`

Converts workout text into **structured JSON** following `structured-workouts.json` schema. Shows:
- Exercise library IDs (standardized naming)
- Set/rep/intensity prescriptions
- Tempo notation (eccentric-pause-concentric-pause)
- Rest periods
- RPE/RIR targets
- Exercise categories (main lift, accessory, conditioning)

**What the Backend Uses:** These JSON structures drive workout tracking, progression logic, and analytics.

**Output:** Structured JSON for database storage and application logic

**Schema Pattern:**
```json
{
  "workoutId": "week01-upper1",
  "sessionType": "Upper 1",
  "exercises": [
    {
      "exerciseId": "bench-press-barbell",
      "exerciseName": "Barbell Bench Press",
      "sets": 4,
      "reps": 8,
      "tempo": "3010",
      "restSeconds": 180,
      "intensityMetric": "RPE",
      "intensityTarget": 7.5,
      "category": "main-lift"
    }
    // ... more exercises
  ]
}
```

---

### 7. README Documentation
**File:** `README.md` (this file)

Documents the entire example set, explaining:
- Purpose and learning objectives
- Trainee profile and progression targets
- Program structure and periodization rationale
- File flow and schema patterns
- When/why to use upper/lower splits for intermediates

---

## Progressive Overload Strategy

**How Marcus Progresses Across Blocks:**

### Accumulation Phase (Weeks 1-4)
- **Volume emphasis:** 4×8-10 reps
- **Intensity:** RPE 7-8 (moderate)
- **Goal:** Build work capacity, accumulate training volume
- **Example:** Squat 4×8 @ 225lbs (RPE 7-8)

### Intensification Phase (Weeks 5-8)
- **Intensity emphasis:** 5×5 reps
- **Intensity:** RPE 8-9 (high)
- **Goal:** Increase load on the bar, maintain volume through more sets
- **Example:** Squat 5×5 @ 255lbs (RPE 8-9)

### Realization Phase (Weeks 9-12)
- **Peak intensity:** Work to 5RM
- **Intensity:** RPE 9-10 (maximal)
- **Goal:** Test strength gains, realize adaptations from previous blocks
- **Example:** Squat work to 305×5 (RPE 9-10, new 5RM PR)

### Overreach + Deload (Weeks 13-16)
- **Weeks 13-15:** Functional overreach (push volume/intensity beyond sustainable)
- **Week 16:** Deload (50% volume, maintain intensity)
- **Goal:** Supercompensation and recovery before next training cycle

**Key Insight:** Progression happens through **block-to-block manipulation** of volume and intensity variables, not just adding weight each week (which stops working for intermediates).

---

## Exercise Variation Strategy

**Upper 1 vs Upper 2:**
- **Upper 1 (Horizontal emphasis):**
  - Bench Press (horizontal push)
  - Barbell Row (horizontal pull)
  - Incline DB Press (upper chest)
  - Face Pulls (rear delts)
  
- **Upper 2 (Vertical emphasis):**
  - Overhead Press (vertical push)
  - Pull-Ups (vertical pull)
  - Close-Grip Bench (tricep emphasis)
  - Lateral Raises (side delts)

**Why This Works:**
- Hits muscles from different angles (horizontal vs vertical)
- Prevents overuse injuries (varying movement patterns)
- Provides novel stimuli each session (better adaptations)
- Manages fatigue (one session emphasizes pushing, next emphasizes pulling)

**Lower 1 vs Lower 2:**
- **Lower 1 (Squat emphasis):**
  - Back Squat (quad/glute dominant)
  - Romanian Deadlift (hamstring accessory)
  - Leg Press (quad volume)
  - Leg Curls (hamstring isolation)
  
- **Lower 2 (Hinge emphasis):**
  - Conventional Deadlift (posterior chain dominant)
  - Front Squat (quad accessory, less spinal load)
  - Hip Thrusts (glute isolation)
  - Nordic Curls (hamstring eccentric)

**Why This Works:**
- Balances quad and posterior chain development
- Varies spinal loading patterns (back squat heavy Mon, deadlift heavy Fri)
- Provides recovery between similar movement patterns
- Allows high frequency without excessive fatigue

---

## When to Use This Programming Style

**Appropriate For:**
- ✅ Intermediate lifters (1-3 years consistent training)
- ✅ Trainees who have exhausted linear progression
- ✅ Athletes who can train 4 days per week consistently
- ✅ Lifters who respond well to higher frequency (2x/week per muscle)
- ✅ Those seeking balanced strength and hypertrophy development
- ✅ Natural lifters who need sustainable training volume

**Not Appropriate For:**
- ❌ True beginners (use full-body 3x/week instead)
- ❌ Advanced lifters close to genetic potential (may need specialized programs)
- ❌ Athletes in-season with high sport demands (insufficient recovery)
- ❌ Trainees who can only train 2-3 days per week (use full-body)
- ❌ Powerlifters peaking for competition (use sport-specific peaking program)

---

## Technical Notes

### RPE/RIR Targets
- **RPE 7:** Could do 3 more reps (RIR 3)
- **RPE 8:** Could do 2 more reps (RIR 2)
- **RPE 9:** Could do 1 more rep (RIR 1)
- **RPE 10:** Max effort, no more reps possible (RIR 0)

### Tempo Notation
Format: `[eccentric]-[bottom pause]-[concentric]-[top pause]`
- **3010:** 3-second lower, no pause, explosive up, no pause
- **2010:** 2-second lower, no pause, explosive up, no pause
- **3110:** 3-second lower, 1-second pause, explosive up, no pause

### Exercise Categories
- **main-lift:** Primary strength exercises (squat, bench, deadlift, overhead press)
- **accessory:** Secondary compound movements (rows, pull-ups, RDLs)
- **isolation:** Single-joint movements (curls, extensions, raises)
- **conditioning:** Energy system work (bike, sled, carries)

---

## Integration with GymText System

These examples demonstrate how GymText agents work together:

1. **plan:generate** → Creates overall program philosophy (TEXT)
2. **microcycle:generate** → Creates weekly training plans (TEXT)
3. **structure:microcycle** → Converts microcycle to JSON (STRUCTURE)
4. **workout:generate** → Creates individual workout details (TEXT)
5. **message:workout** → Formats for SMS delivery (TEXT)
6. **structure:workout** → Converts workout to JSON (STRUCTURE)

**The Pattern:** TEXT → STRUCTURE

Agents generate natural language training plans (which LLMs excel at), then specialized structuring agents convert that text into JSON that drives the application backend (database storage, progression logic, analytics, user tracking).

---

## Example Usage

**For Training Other Agents:**
- Show this directory as a reference for intermediate-level programming
- Point to specific files to demonstrate plan → microcycle → workout → message flow
- Use JSON structures as examples of proper schema adherence

**For Testing the System:**
- Load these workouts into a test database
- Verify that SMS formatting matches workout-messages.md style
- Confirm JSON structures validate against GymText schema

**For Product Development:**
- Use as reference when building workout generation features
- Validate that agent output matches these quality standards
- Test progression logic using Marcus's baseline → target strength progression

---

## Related Examples

- **Beginner 3-Day Plan Examples** (`examples/beginner-3-day/`) — Shows linear progression and full-body training
- **Powerlifting Peaking Examples** (coming soon) — Demonstrates meet preparation and percentage-based loading
- **Bodybuilding Hypertrophy Examples** (coming soon) — Shows body-part splits and hypertrophy techniques
- **Athletic Performance Examples** (coming soon) — Demonstrates power development and sport-specific training

---

## Questions or Feedback

This is a living example set. If you find issues, inconsistencies, or opportunities for improvement, document them and iterate.

**Created:** February 16, 2026  
**Author:** Shackleton (Product Researcher)  
**Trainee Profile:** Marcus Johnson (fictional)  
**Program Duration:** 16 weeks  
**Training Split:** 4-day Upper/Lower
