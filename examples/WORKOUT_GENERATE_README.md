# Workout:Generate Examples: Beginner Week 1 (Monday, Wednesday, Friday)

Structured workout data for the three training days in Beginner Week 1, corresponding to the microcycle examples in `microcycle-beginner-weeks-1-5-9.json`.

## Purpose

These examples demonstrate:
- **How workout:generate should structure daily workouts** (sections, exercises, metadata)
- **Appropriate detail level** (sets, reps, intensity, tempo, notes)
- **Progression across the week** (Monday → Wednesday → Friday)
- **Beginner-friendly programming** (low volume, light intensity, pattern focus)

## Relationship to Other Examples

### Microcycle:Generate Examples
**File:** `microcycle-beginner-weeks-1-5-9.json`

The microcycle provides **weekly context** (overview + 7 day descriptions).  
The workout:generate examples provide **daily execution** (structured exercises with sets/reps/intensity).

**Mapping:**
- Monday workout ← Day 1 description from Week 1 microcycle
- Wednesday workout ← Day 3 description from Week 1 microcycle
- Friday workout ← Day 5 description from Week 1 microcycle

### Workout:Message Examples
**File:** `workout-message-examples.json` (PR #145)

The workout:message examples show **SMS-formatted daily messages**.  
The workout:generate examples show **structured data** (JSON schema).

**Same workout, different formats:**
- Workout:generate = Structured data (for UI rendering, database storage)
- Workout:message = SMS text (for daily delivery to users)

## Schema

All examples follow the `WorkoutStructureLLMSchema`:

```typescript
{
  title: string;              // Concise workout name (2-4 words)
  focus: string;              // Brief focus area (1-3 words)
  description: string;        // Overview for the user
  quote: { text, author };    // Optional motivational quote
  sections: [                 // Array of workout sections
    {
      title: string;          // e.g., "Warm-Up", "Workout", "Core", "Cooldown"
      overview: string;       // Brief goal of this section
      exercises: [            // Array of exercises
        {
          name: string;       // Exercise name
          type: "Strength" | "Cardio" | "Mobility" | ...;
          sets: string;       // e.g., "2", "2-3"
          reps: string;       // e.g., "12-15"
          duration: string;   // e.g., "5 min" (for timed exercises)
          distance: string;   // e.g., "5km" (for cardio)
          rest: string;       // e.g., "60-90s"
          intensity: {
            type: "RPE" | "RIR" | "Zone" | ...;
            value: string;    // e.g., "5-6"
            description: string;
          };
          tempo: string;      // e.g., "3-1-1"
          notes: string;      // Execution cues
          tags: string[];
          supersetId: string; // e.g., "SS1" for supersets
        }
      ]
    }
  ];
  estimatedDurationMin: number;
  intensityLevel: "Low" | "Moderate" | "High" | "Severe";
  tags: {                     // Workout-level tags
    category: string[];       // e.g., ["strength", "beginner"]
    split: string[];          // e.g., ["full_body"]
    muscles: string[];        // e.g., ["quads", "chest"]
    patterns: string[];       // e.g., ["squat", "press"]
    equipment: string[];      // e.g., ["dumbbell", "bench"]
  };
}
```

## Workout Breakdown

### Monday: Full Body — Lower Emphasis

**Focus:** Squat and hinge pattern education

**Structure:**
- **Warm-Up:** Light cardio (5min) + dynamic stretches (leg swings, arm circles)
- **Workout:** 3 exercises (goblet squat, DB RDL, DB bench press) — 2 sets x 12-15 reps each
- **Core:** Plank 3x20-30sec
- **Cooldown:** Static stretching (5min)

**Key features:**
- First training day — welcoming tone in description
- RPE 5-6 (very conservative)
- Alternatives provided (push-ups if no bench)
- Emphasis on form over weight
- Estimated duration: 45min

**Progression notes:**
- This is baseline — establishing movement patterns
- Same exercises will appear Wednesday/Friday (consistency for learning)
- Volume: 2 sets (low to minimize soreness)

---

### Wednesday: Full Body — Upper Emphasis

**Focus:** Horizontal and vertical push/pull patterns

**Structure:**
- **Warm-Up:** Light cardio (5min) + band pull-aparts, scapular shrugs
- **Workout:** 3 exercises (DB bench press, seated cable row, lat pulldown) — 2 sets x 12-15 reps each
- **Core:** Dead bug 3x10/side
- **Cooldown:** Upper body stretching (5min)

**Key features:**
- Tempo focus: 3-1-1 (3sec descent, 1sec pause, 1sec lift)
- RPE 5-6 (consistent with Monday)
- Alternatives provided (chest-supported row, assisted pull-up)
- Upper back activation in warm-up (band pull-aparts, scapular shrugs)
- Estimated duration: 45min

**Progression notes:**
- Second training day — reinforces Monday's DB bench press
- Introduces rowing and pulldown patterns
- Tempo cues build control and body awareness
- Same 2-set volume as Monday

---

### Friday: Full Body — Balanced

**Focus:** Reinforcing all patterns learned this week

**Structure:**
- **Warm-Up:** Light cardio (5min)
- **Workout:** 5 exercises (goblet squat, DB RDL, DB bench press, seated cable row, DB shoulder press) — 2-3 sets
- **Core:** Bird dog 3x8/side
- **Conditioning (Optional):** Zone 2 cardio (10min)
- **Cooldown:** Full body stretching (5min)

**Key features:**
- Combines Monday's lower emphasis + Wednesday's upper emphasis
- Volume flexibility: 2-3 sets (add third set if exercises felt easy earlier)
- Introduces new movement: DB shoulder press (vertical press pattern)
- Optional conditioning finisher (Zone 2 cardio)
- Celebratory tone in description ("You've built the foundation!")
- Estimated duration: 55min (including optional conditioning)

**Progression notes:**
- Final training day of Week 1 — ties everything together
- Slightly higher volume (2-3 sets vs strict 2 sets)
- Introduces shoulder press (new pattern)
- Shoulder press has lower reps (10-12) since it's a new movement
- Optional cardio tests readiness for hybrid training

---

## Week 1 Progression

**Volume progression:**
- Monday: 2 sets (baseline)
- Wednesday: 2 sets (consistent)
- Friday: 2-3 sets (optional increase)

**Pattern introduction:**
- Monday: Squat, hinge, horizontal push
- Wednesday: Horizontal push, horizontal pull, vertical pull
- Friday: All of the above + vertical push (shoulder press)

**Confidence building:**
- Monday: "Your first training day — movement quality is the only priority"
- Wednesday: "Second training day — tempo builds control"
- Friday: "You should feel more confident with the movements now"

**Intensity:**
- All three days: RPE 5-6 (very conservative)
- Week 1 is about learning, not lifting heavy

## Quality Standards

All examples meet these criteria:

### ✅ Schema Compliance
- Uses `WorkoutStructureLLMSchema` (no `id`, `exerciseId`, `nameRaw`, `resolution` fields)
- All required fields present
- Proper section structure (Warm-Up, Workout, Core, Cooldown)
- Complete exercise objects (sets, reps, intensity, notes)

### ✅ Beginner-Appropriate
- Low volume (2-3 sets)
- Light intensity (RPE 5-6)
- Clear execution notes for each exercise
- Alternatives provided (push-ups, assisted pull-up)
- Encouraging descriptions

### ✅ Detail Level
- Specific sets/reps (not vague "a few sets")
- Intensity guidance (RPE values + descriptions)
- Rest periods specified
- Tempo cues where relevant (Wednesday: 3-1-1)
- Execution notes for every exercise

### ✅ Progression Logic
- Friday builds on Monday + Wednesday
- Friday introduces new movement (shoulder press)
- Optional volume increase on Friday (2-3 sets)
- Consistent exercises across the week (pattern reinforcement)

### ✅ Tags Accuracy
- Category: ["strength", "beginner"]
- Split: ["full_body"]
- Muscles: Accurate for exercises included
- Patterns: Matches movement patterns used
- Equipment: Matches what's required

## Design Decisions

**Why sections instead of flat exercise list?** — Organizes workout flow (warm-up → work → cooldown). Helps users know where they are in the session.

**Why include alternatives (push-ups, assisted pull-up)?** — Beginners may not have access to all equipment. Alternatives maintain the movement pattern.

**Why tempo cues on Wednesday?** — Builds control and body awareness. 3-1-1 tempo is educational for beginners.

**Why "2-3 sets" on Friday instead of strict "3 sets"?** — Allows user to self-regulate based on how Monday/Wednesday felt. Teaches autoregulation early.

**Why optional conditioning on Friday?** — Tests readiness for hybrid training. Not mandatory — respects beginner fatigue levels.

**Why celebratory tone on Friday description?** — Completing Week 1 is a milestone. Positive reinforcement builds adherence.

**Why same exercises Monday/Wednesday/Friday?** — Pattern reinforcement. Beginners need consistency to learn movements.

**Why introduce shoulder press on Friday?** — Adds variety while maintaining focus on fundamentals. Vertical press is foundational but lower priority than squat/hinge/horizontal push-pull.

## Anti-Patterns Avoided

❌ **Too many exercises** — 8+ exercises overwhelms beginners  
✅ **3-5 main exercises** — Manageable session length, focused learning

❌ **No warm-up/cooldown** — Increases injury risk  
✅ **Structured warm-up/cooldown** — Primes body, aids recovery

❌ **Vague intensity** — "Lift heavy"  
✅ **Specific intensity** — RPE 5-6 with descriptions

❌ **No rest periods** — Beginners don't know how long to rest  
✅ **Specified rest** — 60-90s for main work, 30s for core

❌ **Missing execution notes** — "Do goblet squats"  
✅ **Detailed notes** — "Use lightest dumbbell, focus on depth and upright torso"

❌ **No alternatives** — Assumes full gym access  
✅ **Alternatives provided** — Push-ups, assisted pull-up, chest-supported row

❌ **Starting too heavy** — RPE 8-9 on Week 1  
✅ **Conservative start** — RPE 5-6, focus on learning

❌ **All exercises new** — No pattern reinforcement  
✅ **Repeated exercises** — Goblet squat, DB RDL, DB bench press all appear 2-3x this week

## Usage

### For Agent Training
Use these as ground truth for `workout:generate` agent fine-tuning. The agent should:
1. Read the day description from the microcycle
2. Extract exercises, sets, reps, intensity
3. Structure into sections (warm-up, workout, core, cooldown)
4. Add execution notes and alternatives
5. Tag appropriately

### For Agent Evaluation
Compare agent output for Beginner Week 1 workouts against these examples. Check for:
1. ✅ Schema compliance (all required fields present)
2. ✅ Appropriate volume/intensity for beginner Week 1 (2 sets, RPE 5-6)
3. ✅ Logical section structure (warm-up → workout → core → cooldown)
4. ✅ Specific execution notes (not just exercise names)
5. ✅ Alternatives provided for common equipment gaps
6. ✅ Progression across the week (Friday builds on Monday + Wednesday)
7. ✅ Tags accuracy (muscles, patterns, equipment match exercises)

### For UI Development
Test workout detail sheets with these examples:
- Section expansion/collapse
- Exercise display (sets, reps, intensity, notes)
- Alternative exercise swapping
- Rest timer integration
- Tag filtering

## Extending These Examples

To complete Beginner Week 1, add:
- **Tuesday:** Rest day (no structured workout, but could include recovery guidance)
- **Thursday:** Rest day
- **Saturday:** Active recovery (optional light movement)
- **Sunday:** Rest day

To extend across phases:
- **Week 5 examples** (Progressive Overload Phase) — 3 sets, RPE 6-7, tracking introduced
- **Week 9 examples** (Barbell Introduction Phase) — Barbell squat/bench/deadlift, RPE 6-7, 10-12 reps

For other plans (intermediate, advanced):
- Higher volume (4-5 sets)
- Higher intensity (RPE 7-9)
- More complex periodization
- Advanced techniques (drop sets, clusters, etc.)

## Related Documentation

- [microcycle-beginner-weeks-1-5-9.json](./microcycle-beginner-weeks-1-5-9.json) — Source weekly programming
- [MICROCYCLE_BEGINNER_README.md](./MICROCYCLE_BEGINNER_README.md) — Microcycle documentation
- [workout-message-examples.json](./workout-message-examples.json) — SMS-formatted workouts (different format)
- [WORKOUT_MESSAGES_README.md](./WORKOUT_MESSAGES_README.md) — Workout message format standard
- [WorkoutStructureLLMSchema](../packages/shared/src/shared/types/workout/workoutStructure.ts) — Schema definition

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 3 (Monday, Wednesday, Friday of Beginner Week 1)  
**Schema:** `WorkoutStructureLLMSchema` (LLM-safe, omits post-processing fields)  
**Phase:** Form Mastery (Weeks 1-4)  
**Volume:** 2-3 sets x 12-15 reps  
**Intensity:** RPE 5-6 (~50-60% 1RM)
