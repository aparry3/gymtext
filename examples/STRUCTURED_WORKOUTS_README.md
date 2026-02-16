# Structured Workout Examples

Curated collection of "perfect" structured workout examples that demonstrate the [WorkoutStructure schema](../packages/shared/src/shared/types/workout/workoutStructure.ts).

## Purpose

These examples serve as:
- **Reference material** — Show what high-quality structured output looks like
- **Training data** — Ground truth for `workout:structured` agent fine-tuning
- **Evaluation benchmarks** — Test cases for structured workout generation quality
- **UI testing** — Sample data for workout detail components
- **Schema validation** — Ensure all fields are used correctly

## File Structure

**`structured-workout-examples.json`** — Complete structured workouts in JSON format

Each example includes:
- **id**: Unique identifier (matches corresponding message example)
- **metadata**: Context (title, corresponding message example, key features)
- **structuredWorkout**: Full `WorkoutStructureLLM` schema object

## Coverage Matrix

### Workout Types
- ✅ **Strength** (upper, lower, full body)
- ✅ **Hypertrophy** (higher volume, muscle-building focus)
- ✅ **Supersets** (SS1, SS2 formatting with supersetId)
- ✅ **Circuits** (C1, C2 formatting with supersetId)
- ✅ **Hybrid** (strength + conditioning)
- ✅ **Bodyweight** (no equipment required)
- ✅ **HIIT** (high-intensity intervals)
- ✅ **Steady Cardio** (aerobic base building)
- ✅ **Sport-Specific** (running intervals)

### Experience Levels
- ✅ Beginner (simplified, fewer exercises, basic movements)
- ✅ Intermediate (standard programming, moderate complexity)
- ✅ Advanced (implied in strength/hypertrophy examples)

### Section Types
- ✅ Single section (Workout only)
- ✅ Multiple sections (Warm-Up, Workout, Conditioning, Cooldown, Core)
- ✅ Hybrid layouts (Strength + Conditioning sections)

## Schema Compliance

All examples use the **LLM-safe schema** (`WorkoutStructureLLMSchema`) which omits fields that should be set post-generation:
- ❌ `id` (per-exercise, generated programmatically)
- ❌ `exerciseId` (FK to canonical exercise, set by resolution service)
- ❌ `nameRaw` (original LLM output, set by resolution service)
- ❌ `resolution` (resolution metadata, set by resolution service)

### Required Fields (Always Present)

**Workout level:**
- ✅ `title` (concise, 2-4 words)
- ✅ `focus` (1-3 words describing primary emphasis)
- ✅ `description` (brief overview)
- ✅ `sections` (array of workout sections)
- ✅ `estimatedDurationMin` (realistic time estimate)
- ✅ `intensityLevel` (Low, Moderate, High, Severe)
- ✅ `tags` (comprehensive tagging for searchability)

**Section level:**
- ✅ `title` (e.g., "Workout", "Warm-Up", "Conditioning")
- ✅ `overview` (brief section goal)
- ✅ `exercises` (array of activities)

**Exercise level:**
- ✅ `name` (clear exercise name)
- ✅ `type` (Strength, Cardio, Plyometric, Mobility, etc.)
- ✅ `sets` / `reps` (for strength) OR `duration` / `distance` (for cardio)
- ✅ `rest` (time between sets)
- ✅ `intensity` (RPE/RIR/Zone/Pace/Other)
- ✅ `notes` (execution cues, brief)
- ✅ `supersetId` (empty string if not in superset/circuit)

### Optional Fields (Use When Appropriate)

- `quote` (inspirational quote, usually empty)
- `tempo` (e.g., "3-0-1" for controlled movements)
- `tags` (per-exercise tags, optional)

## Tag System

All workouts include comprehensive tags for searchability:

**Category tags:**
- strength, hypertrophy, power, cardio, hiit, conditioning, mobility, active_recovery, rest, sport, etc.

**Split tags:**
- push, pull, legs, upper, lower, full_body, core, arms, back, chest, shoulders

**Muscle tags:**
- quads, hamstrings, glutes, calves, chest, lats, traps, front_delts, biceps, triceps, abs, etc.

**Pattern tags:**
- squat, hinge, press, row, pullup, lunge, carry, rotation, jump, sprint, gait, etc.

**Equipment tags:**
- barbell, dumbbell, kettlebell, cable, machine, bodyweight, no_equipment, etc.

**Tagging philosophy:** Over-tag. Include everything that applies. This improves searchability and filtering.

## Relationship to Message Examples

Each structured workout corresponds to a message example from `workout-message-examples.json`:

| Structured ID | Message ID | Description |
|---------------|------------|-------------|
| `training-upper-strength` | `training-upper-strength` | Heavy upper body compounds |
| `training-legs-hypertrophy` | `training-legs-hypertrophy` | High-volume leg day |
| `training-push-supersets` | `training-push-supersets` | Chest/shoulders with supersets |
| `training-circuit-beginner` | `training-circuit-beginner` | Full-body circuits |
| `training-lower-conditioning` | `training-lower-conditioning` | Strength + cardio hybrid |
| `training-bodyweight-travel` | `training-bodyweight-travel` | No equipment needed |
| `training-hiit-cardio` | `training-hiit-cardio` | Sprint intervals |
| `training-running-intervals` | `training-running-intervals` | Track session |
| `training-steady-cardio` | `training-steady-cardio` | Easy aerobic run |
| `training-pull-day` | `training-pull-day` | Back & biceps |

This 1:1 mapping shows how the same workout can be expressed in both formats:
- **Message format** — SMS-friendly, concise, scannable
- **Structured format** — Full detail, UI-renderable, searchable

## Usage

### For Agent Training
Use the `structuredWorkout` field as ground truth for fine-tuning the `workout:structured` agent.

### For Agent Evaluation
Compare agent output against these examples. Check for:
1. Schema compliance (all required fields present, correct types)
2. Logical section organization (warm-up → workout → cooldown)
3. Appropriate detail level (not too verbose, not too sparse)
4. Correct superset/circuit formatting (supersetId used properly)
5. Realistic time estimates (estimatedDurationMin)
6. Comprehensive tagging (all applicable tags included)

### For UI Development
Import these examples to test workout detail components:
- Workout cards
- Exercise lists
- Section headers
- Intensity indicators
- Tag displays

### For Schema Validation
Use Zod to validate examples against `WorkoutStructureLLMSchema`:

```typescript
import { WorkoutStructureLLMSchema } from '@/shared/types/workout/workoutStructure';

const result = WorkoutStructureLLMSchema.safeParse(structuredWorkout);
if (!result.success) {
  console.error('Validation errors:', result.error);
}
```

## Adding New Examples

When adding examples:
1. Ensure schema compliance (use LLM-safe schema)
2. Add comprehensive metadata
3. Match to a corresponding message example (if applicable)
4. Include realistic time estimates
5. Tag comprehensively (over-tag)
6. Test on actual UI components
7. Validate with Zod before committing

## Anti-Patterns to Avoid

❌ **Including `id` on exercises** — Let the system generate these  
❌ **Missing intensity guidance** — Always include RPE/RIR/Zone/Pace  
❌ **Empty sections** — Don't create sections with no exercises  
❌ **Inconsistent superset IDs** — SS1 exercises must all use "SS1"  
❌ **Unrealistic time estimates** — Test the workout to confirm duration  
❌ **Under-tagging** — Include all applicable tags, not just one or two  
❌ **Vague exercise names** — "Press" → "BB Bench Press"  
❌ **Missing notes** — Brief execution cues help users  

## Related Documentation

- [workoutStructure.ts](../packages/shared/src/shared/types/workout/workoutStructure.ts) — Schema definition
- [tags.ts](../packages/shared/src/shared/types/workout/tags.ts) — Tag enums
- [workout-message-examples.json](./workout-message-examples.json) — Corresponding SMS messages
- [WORKOUT_MESSAGES_README.md](./WORKOUT_MESSAGES_README.md) — Message format documentation

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 10 complete structured workouts  
**Schema:** `WorkoutStructureLLMSchema` (LLM-safe, omits post-processing fields)
