# Plan Structured Example

Example of a parsed/structured fitness plan that demonstrates the `PlanStructure` schema.

## Purpose

This example shows:
- **How `plan:structured` agent should parse `plan:generate` output**
- **The relationship between text-based plans and structured data**
- **How to populate the `PlanStructure` schema correctly**
- **What UI-renderable plan data looks like**

## File Structure

**`plan-structured-beginner-example.json`** — Single structured plan example

Structure:
```json
{
  "id": "beginner-general-fitness-structured",
  "metadata": {
    "title": "plan:structured Example — Beginner General Fitness Foundation",
    "correspondingPlanExample": "beginner-general-fitness",
    "description": "..."
  },
  "planStructured": {
    "name": "...",
    "type": "...",
    "coreStrategy": "...",
    "progressionStrategy": [...],
    "adjustmentStrategy": "...",
    "conditioning": [...],
    "scheduleTemplate": [...],
    "durationWeeks": 12,
    "frequencyPerWeek": 3
  },
  "qualityNotes": "..."
}
```

## Schema Reference

### PlanStructure Schema

**Source:** `packages/shared/src/shared/types/plan/schema.ts`

```typescript
{
  name: string;                      // e.g., "Beginner General Fitness Foundation"
  type: string;                      // e.g., "Full Body Stabilization"
  coreStrategy: string;              // Overarching programming philosophy (paragraph)
  progressionStrategy: string[];     // How to advance (array of progression rules)
  adjustmentStrategy: string;        // When/how to modify (deload rules, etc.)
  conditioning: string[];            // Cardio/conditioning guidelines (array)
  scheduleTemplate: Array<{          // Weekly rhythm (7 days)
    day: string;                     // "Monday", "Tuesday", etc.
    focus: string;                   // "Full Body — Lower emphasis"
    rationale: string;               // Why this day is positioned here
  }>;
  durationWeeks: number;             // Total duration (-1 if ongoing)
  frequencyPerWeek: number;          // Training days per week (e.g., 3, 4, 5)
}
```

## Field-by-Field Guide

### `name` (Required)
- **Purpose:** Short, memorable plan name
- **Format:** 2-6 words describing the plan
- **Example:** `"Beginner General Fitness Foundation"`
- **Bad:** `"Plan"`, `"Workout Program"` (too generic)
- **Good:** `"Powerlifting Competition Peak"`, `"Hypertrophy Volume Block"`

### `type` (Optional)
- **Purpose:** Plan category/classification
- **Format:** 1-3 words describing the plan type
- **Example:** `"Full Body Stabilization"`, `"Push/Pull/Legs Hypertrophy"`, `"Upper/Lower Strength"`
- **Note:** Can be empty string if not clearly categorized

### `coreStrategy` (Required)
- **Purpose:** High-level programming philosophy (the "why")
- **Format:** 2-4 sentences capturing the training approach
- **Example:** "3-day full-body training using NASM Stabilization Endurance Phase principles. Focus on movement quality, skill acquisition, and building sustainable training habits. Low intensity (50-60% 1RM), high reps (12-15), controlled tempo (3-1-1). Prioritize form mastery over progressive overload in early weeks."
- **What to include:** Training frequency, intensity philosophy, primary focus, key principles
- **What to avoid:** Listing specific exercises or sets/reps (that's in microcycles)

### `progressionStrategy` (Required)
- **Purpose:** Explicit rules for how to advance
- **Format:** Array of strings, each describing a progression rule or phase
- **Example:**
  ```json
  [
    "Weeks 1-4: Focus on form mastery. Add weight only when form is clean for all reps.",
    "Weeks 5-8: Increase load by 5-10lbs when you hit 3 sets of 15 reps with perfect form.",
    "Weeks 9-12: Continue load increases or add complexity (e.g., single-leg variations)."
  ]
  ```
- **Key principle:** Be specific. "Progressive overload" is too vague. "Add 5lbs when you hit top of rep range" is actionable.

### `adjustmentStrategy` (Required)
- **Purpose:** When and how to modify the plan (deloads, auto-regulation)
- **Format:** 1-3 sentences describing adjustment triggers and implementation
- **Example:** "Deload every 4th week OR if experiencing unusual fatigue/soreness. Reduce volume by 40-50% (drop to 2 sets per exercise), keep intensity moderate (stick with current weights, don't push for PRs), focus on movement quality and active recovery."
- **What to include:** Deload frequency, deload implementation (volume/intensity adjustments), auto-regulation rules

### `conditioning` (Optional)
- **Purpose:** Cardio/conditioning guidelines
- **Format:** Array of strings describing cardio recommendations
- **Example:**
  ```json
  [
    "Optional Zone 2 cardio post-workout: 10-15min easy effort",
    "Weekend active recovery: low-intensity movement for enjoyment (walking, swimming, yoga)"
  ]
  ```
- **When to use:** If the plan includes cardio or conditioning work
- **When to omit:** Pure strength plans with no cardio component (empty array `[]`)

### `scheduleTemplate` (Required)
- **Purpose:** Defines the weekly rhythm (which days train, which days rest)
- **Format:** Array of exactly 7 objects (Monday through Sunday)
- **Structure:**
  ```json
  {
    "day": "Monday",
    "focus": "Full Body — Lower emphasis",
    "rationale": "Start the week with foundational lower body patterns..."
  }
  ```
- **Rules:**
  - Must include all 7 days
  - `day` must be day name (Monday, Tuesday, etc.)
  - `focus` describes what happens that day (training session type OR "Rest")
  - `rationale` explains why this day is positioned here
- **Example (Training day):**
  ```json
  {
    "day": "Monday",
    "focus": "Full Body — Lower emphasis",
    "rationale": "Start the week with foundational lower body patterns (squat, hinge). Resistance training with emphasis on squat, hinge, and push patterns."
  }
  ```
- **Example (Rest day):**
  ```json
  {
    "day": "Tuesday",
    "focus": "Rest",
    "rationale": "Rest or optional light walk (10-20min). Recovery day between sessions."
  }
  ```

### `durationWeeks` (Required)
- **Purpose:** How long the plan runs
- **Format:** Positive integer OR `-1` for ongoing plans
- **Example:** `12` (12-week plan), `8` (8-week camp), `-1` (ongoing/no fixed duration)
- **Beginner plans:** Often 8-12 weeks (long enough to see progress, short enough to stay motivated)
- **Advanced plans:** May be longer (12-16 weeks with periodization blocks)
- **Ongoing plans:** `-1` (e.g., long-term strength maintenance)

### `frequencyPerWeek` (Required)
- **Purpose:** How many training days per week
- **Format:** Positive integer (typically 2-6)
- **Example:** `3` (3 days/week), `4`, `5`, `6`
- **Must match scheduleTemplate:** Count training days in scheduleTemplate and ensure this number matches

## Relationship to plan:generate

This structured example corresponds to the **text-based plan** in `plan-examples.json`:

| Text Plan ID | Structured Example | Relationship |
|--------------|-------------------|--------------|
| `beginner-general-fitness` | `beginner-general-fitness-structured` | 1:1 parsing |

**Workflow:**
1. `plan:generate` agent creates text-based plan (description field)
2. `plan:structured` agent parses that text into `PlanStructure` schema
3. UI renders structured data for easy navigation/filtering

**Why both formats?**
- **Text format:** Human-readable, comprehensive, coach-to-client voice
- **Structured format:** UI-renderable, searchable, programmatically accessible

## Usage

### For Agent Training
Use `planStructured` field as ground truth for fine-tuning the `plan:structured` agent.

### For Agent Evaluation
Compare agent output against this example. Check for:
1. All required fields populated (name, coreStrategy, progressionStrategy, etc.)
2. 7-day scheduleTemplate (Monday-Sunday)
3. Specific progression rules (not vague platitudes)
4. Realistic durationWeeks and frequencyPerWeek
5. Consistency (frequencyPerWeek matches training days in scheduleTemplate)

### For UI Development
Import this example to test plan detail components:
- Plan cards
- Schedule visualization
- Progression timeline
- Filter/search by frequencyPerWeek, durationWeeks, type

### For Schema Validation
```typescript
import { PlanStructureSchema } from '@/shared/types/plan/schema';

const result = PlanStructureSchema.safeParse(planStructured);
if (!result.success) {
  console.error('Validation errors:', result.error);
}
```

## Anti-Patterns to Avoid

❌ **Generic coreStrategy** — "Progressive overload is key" (everyone knows this, not useful)  
✅ **Specific coreStrategy** — "3-day full-body using NASM Stabilization Phase: 12-15 reps, 3-1-1 tempo, 50-60% 1RM"

❌ **Vague progressionStrategy** — "Add weight when it feels right"  
✅ **Specific progressionStrategy** — "Add 5-10lbs when you hit 3 sets of 15 reps with perfect form"

❌ **Missing scheduleTemplate days** — Only 5 days listed  
✅ **Complete scheduleTemplate** — All 7 days (Monday-Sunday) included

❌ **Inconsistent frequencyPerWeek** — Says 3 days/week but scheduleTemplate shows 4 training days  
✅ **Consistent frequencyPerWeek** — frequencyPerWeek=3 matches 3 training days in scheduleTemplate

❌ **No adjustment strategy** — Doesn't mention deloads or auto-regulation  
✅ **Clear adjustment strategy** — "Deload every 4th week: reduce volume by 50%, maintain exercise selection"

❌ **Exercise-level details in coreStrategy** — "Bench press 3x8, squats 4x6"  
✅ **Philosophy in coreStrategy** — "Compound-dominant full-body with moderate intensity"

## Extending This Example

To add more structured plan examples:
1. Select a plan from `plan-examples.json`
2. Parse it into `PlanStructure` format
3. Ensure all 7 days in scheduleTemplate
4. Add metadata linking back to original plan
5. Include qualityNotes explaining key features
6. Validate with Zod before committing

**Future examples to add:**
- Intermediate Hypertrophy (6-day PPL)
- Advanced Powerlifting (4-day U/L)
- Time-Constrained (3-day full body)
- Sport-Specific MMA (3-day concurrent)

## Related Documentation

- [schema.ts](../packages/shared/src/shared/types/plan/schema.ts) — Schema definition
- [plan-examples.json](./plan-microcycle-examples/plan-examples.json) — Text-based plan examples
- [SCHEMA.md](./plan-microcycle-examples/SCHEMA.md) — Plan/microcycle schema documentation

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 1 (Beginner General Fitness Foundation)  
**Schema:** `PlanStructureSchema`
