# Workout:Generate Examples: Advanced Week 10 (Mon, Tue, Thu)

Structured workout examples for Advanced Powerlifting Peaking plan, Week 10 (Peaking phase).

## Note on Day Selection

The task requested "Mon, Tue, Fri" but **Friday is a rest day** in Week 10 of the Advanced plan. These examples cover:
- **Monday:** Squat emphasis (92.5% 3×2)
- **Tuesday:** Bench emphasis (92.5% 3×2)
- **Thursday:** Deadlift emphasis (92.5% 3×1-2)

These three days showcase all three competition lifts during the peaking phase peak (Week 2 of 90%→92.5%→95% singles progression).

## Purpose

These examples demonstrate:
- **How `workout:generate` should structure peaking workouts**
- **Near-maximal intensity programming** (92.5% 1RM for doubles/singles)
- **Minimal volume strategy** (6 total reps per lift to manage fatigue)
- **Safety protocols for maximal loads** (spotter requirements, fail-safe rep rules)
- **CNS recovery focus** (accessories eliminated or reduced to maintenance only)

## Workout Overview

| Day | Focus | Main Lift | Secondary | Accessories | Duration |
|-----|-------|-----------|-----------|-------------|----------|
| Mon | Squat | 3×2 @ 92.5% RPE 9.5 | Light Squat 2×5 | Light RDL 2×8-10 | 75 min |
| Tue | Bench | 3×2 @ 92.5% RPE 9.5 | Light CG Bench 2×5 | Face pulls 2×15-20 | 70 min |
| Thu | Deadlift | 3×1-2 @ 92.5% RPE 9.5 | Light Squat 2×5 | ELIMINATED | 80 min |

## Key Features

### Peaking Block Progression

**Context:** Weeks 9-11 handle loads very close to 1RM to prepare the CNS and build confidence.
- **Week 9:** 90% 1RM, 3×3 @ RPE 9 (9 total reps)
- **Week 10:** 92.5% 1RM, 3×2 @ RPE 9.5 (6 total reps) ← **these examples**
- **Week 11:** 95-97.5% 1RM, work up to heavy single
- **Week 12:** Taper + Competition

**Philosophy:** Intensity is maximal (RPE 9.5), volume is minimal (3 sets), and rest is long (4-5+ min).

### Safety Protocols (Near-Maximal Loads)

**The "Fail-Safe" Rep Rule:**
- **Squat/Bench:** "If first rep is slow and second rep grinds excessively (>6sec), stop set and reduce weight 10lbs next set."
- **Deadlift:** "If first rep is RPE 9.5 or slow (>4sec), do NOT attempt second rep. Quality > Quantity."
- **Why:** Avoids grinding reps that create excessive fatigue or risk injury before competition.

**Spotter Requirements:**
- **Bench:** "Spotter MUST be present—communicate liftoff cues clearly. Spotter assists liftoff to save energy."
- **Squat:** Recommended spotters/racks to parallel.

### Minimalist Accessory Strategy

**Comparison to Week 6 (Wave Loading):**

| Component | Week 6 (Wave Loading) | Week 10 (Peaking) |
|-----------|----------------------|-------------------|
| Main Lift Sets | 4 sets | 3 sets |
| Secondary Variation | 3 sets (Variation) | 2 sets (Maintenance only) |
| Accessories | 2-3 exercises | 1-2 (Maintenance only) |
| Accessory Reps | 6-12 | 5-10 (Very light) |

**Why eliminate accessories?**
- CNS is at maximal demand from 92.5% compounds.
- Hypertrophy is not the goal; maintenance and recovery are.
- Every ounce of energy must go toward the competition lifts.

### Detailed Execution Cues (Peaking Specific)

**Squat Execution:**
- "Don't cut depth to save energy—you'll red-light in competition."
- "Pause 0.5sec at bottom (maintain tension, don't relax)."

**Bench Execution:**
- "Unrack with spotter assist to save every ounce of energy."
- "Perfect setup is everything—drive through floor during press."

**Deadlift Execution:**
- "Pull slack out of bar—bar should click against plates before you pull."
- "If first rep is a grind, STOP. Do not risk second rep."

## Section Structure

Each workout follows this peaking structure:

### 1. Warm-Up (15-20 min)
- Light cardio (5 min) purely for temperature.
- Dynamic mobility focused on fluid joints.
- **The Peaking Ladder:** 6-8 warm-up sets with precise jumps (e.g., 315 → 345 → 370).
- **Purpose:** CNS priming, building confidence, and grooving identical competition form.

### 2. Main Lift (30-40 min)
- Competition squat/bench/deadlift at 92.5% 1RM.
- 3 working sets with 4-5 min rest (Full recovery is critical).
- Focus on "identical" form—treating 135lbs like 400lbs.

### 3. Maintenance (10-15 min)
- Very light secondary work (2 sets @ RPE 6-7).
- Purely for blood flow and pattern maintenance.
- NOT training; no fatigue should be generated here.

### 4. Cooldown (5-10 min)
- Gentle stretching (no aggressive stretching when neurally fatigued).
- **Mental Recovery:** Visualization of successful competition lifts.

## Schema Compliance

All three workouts follow `WorkoutStructureLLMSchema`:

### ✅ Required Fields
- `title`: ✅ Peaking phase specific.
- `focus`: ✅ "Competition [Lift] at 92.5% (Heavy Doubles)".
- `description`: ✅ Explains CNS preparation and minimal volume rationale.
- `estimatedDurationMin`: ✅ 70-80 min (despite low reps, long rests add time).
- `intensityLevel`: ✅ "Maximum".
- `tags`: ✅ "peaking", "heavy doubles", "powerlifting".

## Use Cases

### 1. Agent Training
- Teach `workout:generate` to handle near-maximal loads correctly.
- Show appropriate set/rep/rest trade-offs for peaking (3×2 @ 5min rest).
- Demonstrate "fail-safe" safety logic integration.

### 2. Agent Evaluation
Check for:
- ✅ Correct volume (minimal 3 sets).
- ✅ Appropriate intensity (92.5% / RPE 9.5).
- ✅ Safety protocols (spotter requirements, rep cut-off rules).
- ✅ Accessory reduction (maintenance only).
- ✅ Long rest periods (4-5+ min).

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 3 complete advanced-level peaking workouts  
**Schema:** `WorkoutStructureLLMSchema`  
**Complexity Level:** Maximum (sport-specific powerlifting peaking phase)  
**Week:** 10 (Peaking phase, Weeks 9-11)  
**Days:** Monday (Squat), Tuesday (Bench), Thursday (Deadlift)  
