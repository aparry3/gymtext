# Microcycle Examples: Intermediate Hypertrophy (Weeks 1, 7, 13)

Detailed microcycle examples showing block periodization progression across the 16-week Intermediate Hypertrophy PPL plan.

## Purpose

These examples demonstrate:
- **Block periodization in action** — Accumulation (W1) → Deload (W7) → Intensification (W13)
- **Phase-specific programming** — Different volume/intensity strategies for each phase
- **PPL split structure** — 6-day training week with 2x frequency per muscle group
- **Advanced intensity techniques** — Rest-pause, drop sets, slow eccentrics (intensification phase)
- **Higher training frequency** compared to beginner examples (6 days vs 3 days)

## Week Selection Rationale

**Week 1 — Accumulation Phase Begins (Weeks 1-6)**
- Progression goal: "Build volume from 12-14 sets per muscle group"
- Volume: Baseline (compounds 3-4 sets, accessories 3 sets)
- Intensity: Moderate (RPE 7-8 compounds, RPE 8 accessories)
- Focus: Establish baseline, build work capacity
- Techniques: Standard sets, controlled tempo

**Week 7 — Deload Phase (Weeks 7-8)**
- Progression goal: "Reduce volume by 50%, dissipate accumulated fatigue"
- Volume: Cut in half (2 sets per exercise)
- Intensity: Moderate (70-80% of working weights, RPE 6-7)
- Focus: Active recovery, technique refinement
- Techniques: Standard sets, no advanced techniques

**Week 13 — Intensification Phase Peak (Weeks 9-14)**
- Progression goal: "Increase load/intensity, maintain volume 14-16 sets, RPE 8-9"
- Volume: Stabilized (compounds 4 sets, accessories 3 sets)
- Intensity: High (RPE 8-9 most sets)
- Focus: Push load increases, maximize hypertrophy stimulus
- Techniques: Rest-pause, drop sets, slow eccentrics (3-4sec)

## Progression Highlights

### Week 1 → Week 7 → Week 13 Changes

**Volume:**
- Week 1: Baseline (compounds 3-4 sets, accessories 3 sets)
- Week 7: Deload (-50%, down to 2 sets per exercise)
- Week 13: Stabilized (compounds 4 sets, accessories 3 sets, similar to Week 1 but after accumulation)

**Intensity:**
- Week 1: RPE 7-8 (compounds), RPE 8 (accessories)
- Week 7: RPE 6-7 (70-80% of working weights)
- Week 13: RPE 8-9 (most sets), pushing closer to failure

**Rest Periods:**
- Week 1: 2-3min (compounds), 60-90sec (accessories)
- Week 7: 2min (all exercises, no rush)
- Week 13: 2-3min (compounds), 90sec (accessories), 60sec (isolation)

**Techniques:**
- Week 1: Standard sets, controlled tempo
- Week 7: Standard sets, focus on quality
- Week 13: Rest-pause (1 compound/session), drop sets (isolation), slow eccentrics (3-4sec)

**Exercise Examples (Monday Push):**
- Week 1: Bench press 4x8 @ RPE 7-8
- Week 7: Bench press 2x8 @ 70-80% of Week 6 weight
- Week 13: Bench press 4x6-8 @ RPE 8-9, Set 4 rest-pause

**Tracking Emphasis:**
- Week 1: "Track all lifts—establish baseline"
- Week 7: "How did deload weights feel? Adjust for Week 8"
- Week 13: "Did you add weight since Week 12? Compare to Week 1 baseline"

### Phase-Specific Focus

**Accumulation (Week 1):**
- Establish baseline volume and weights
- Build work capacity
- Track everything for future progression
- Avoid chasing PRs

**Deload (Week 7):**
- Active recovery (not complete rest)
- Maintain exercise selection (pattern reinforcement)
- Dissipate accumulated fatigue from Weeks 1-6
- Prepare for intensification phase

**Intensification (Week 13):**
- Push load increases (add 5-10lbs when hitting top of range)
- Use advanced techniques (rest-pause, drop sets, slow eccentrics)
- Train closer to failure (RPE 8-9)
- Maintain volume (14-16 sets per muscle group)

## Schema Compliance

All examples follow the `MicrocycleGenerationOutput` schema:

```typescript
{
  overview: string;     // Weekly training focus (100-250 words)
  isDeload: boolean;    // false for W1 and W13, true for W7
  days: string[7];      // Exactly 7 day descriptions
}
```

### Overview Field

**Purpose:** Sets weekly context, phase objectives, intensity/volume guidance

**Week 1 example:**
> "Week 1 — Accumulation Phase Begins. This is your first week of the 16-week hypertrophy block. The goal is to establish baseline volume (12-14 sets per muscle group) and build work capacity. Intensity is moderate (RPE 7-8 on compounds, RPE 8 on accessories)..."

**Week 7 example:**
> "Week 7 — Deload Phase. After 6 weeks of volume accumulation (you've increased from 12-14 sets to 18-20 sets per muscle group), your body needs active recovery. This week, volume drops by 50%..."

**Week 13 example:**
> "Week 13 — Intensification Phase Peak. You're in the final stretch of the intensification block (Weeks 9-14). Volume is stabilized at 14-16 sets per muscle group, but intensity is high (RPE 8-9 on most sets)..."

### Days Array

**Structure:** Exactly 7 strings (Day 1 through Day 7)

**PPL Split Structure (6 training days):**
- Day 1 (Monday): Push — Chest & Shoulders
- Day 2 (Tuesday): Pull — Back & Biceps
- Day 3 (Wednesday): Legs — Quad emphasis
- Day 4 (Thursday): Push — Triceps & Front Delts
- Day 5 (Friday): Pull — Rear Delts & Biceps
- Day 6 (Saturday): Legs — Hamstring & Glute emphasis
- Day 7 (Sunday): Rest (or optional Zone 2 cardio)

**Training day length:** 250-350 words (more detail than beginner due to higher exercise count)  
**Rest day length:** 80-120 words

## Comparison: Beginner vs Intermediate Microcycles

| Aspect | Beginner (Week 1) | Intermediate (Week 1) |
|--------|-------------------|----------------------|
| **Training days** | 3 (Mon, Wed, Fri) | 6 (Mon-Sat) |
| **Split** | Full body | Push/Pull/Legs |
| **Volume** | 2 sets x 12-15 reps | 3-4 sets x 6-15 reps (varies by lift type) |
| **Intensity** | RPE 5-6 | RPE 7-8 (compounds), RPE 8 (accessories) |
| **Exercises/day** | 3-5 | 6-8 |
| **Rest periods** | 60-90sec | 2-3min (compounds), 60-90sec (accessories) |
| **Periodization** | Linear | Block (accumulation → deload → intensification) |
| **Advanced techniques** | None | Rest-pause, drop sets, slow eccentrics (Week 13) |
| **Day descriptions** | 150-300 words | 250-350 words |

## Block Periodization Demonstration

### Accumulation Phase (Weeks 1-6)

**Week 1 characteristics:**
- Baseline volume: 12-14 sets per muscle group
- Moderate intensity: RPE 7-8
- Standard techniques: No rest-pause, drop sets, or slow eccentrics
- Focus: "Establish baseline, don't chase PRs"

**Expected progression:**
- Weeks 2-6: Add 1-2 sets every 2 weeks
- By Week 6: 18-20 sets per muscle group
- Goal: Build work capacity before intensification

### Deload Phase (Weeks 7-8)

**Week 7 characteristics:**
- Volume: Cut by 50% (2 sets per exercise)
- Intensity: 70-80% of working weights (RPE 6-7)
- No advanced techniques
- Shorter sessions: ~30-40min vs 60min

**Purpose:**
- Dissipate accumulated fatigue from accumulation phase
- Maintain movement patterns (exercise selection unchanged)
- Prepare body for intensification phase

**Not a complete rest:**
- Active recovery (still training 6 days)
- Maintains neural pathways
- Prevents deconditioning

### Intensification Phase (Weeks 9-14)

**Week 13 characteristics:**
- Volume: Stabilized at 14-16 sets (slightly reduced from Week 6 peak)
- Intensity: High (RPE 8-9 on most sets)
- Advanced techniques:
  - Rest-pause: 1 compound per session (e.g., bench press Set 4)
  - Drop sets: Isolation work final set (e.g., leg extension, cable curl)
  - Slow eccentrics: 3-4sec on accessories (e.g., incline DB press)

**Expected progression:**
- Add 5-10lbs to compounds when hitting top of rep range
- By Week 13: Significantly stronger than Week 1
- Goal: Maximize hypertrophy stimulus via intensity

## Usage

### For Agent Training
Use these as ground truth for `microcycle:generate` agent fine-tuning on intermediate plans. Shows:
- Block periodization implementation (not just linear progression)
- PPL split structure (6 days vs full body 3 days)
- Phase-specific programming (accumulation vs deload vs intensification)
- Advanced intensity techniques (rest-pause, drop sets)

### For Agent Evaluation
Compare agent output for intermediate plan against these examples. Check for:
1. ✅ PPL split structure (6 training days, correct muscle group pairings)
2. ✅ Block periodization phases (accumulation, deload, intensification characteristics)
3. ✅ Volume appropriate for phase (baseline → 50% cut → stabilized)
4. ✅ Intensity appropriate for phase (RPE 7-8 → 6-7 → 8-9)
5. ✅ Advanced techniques in intensification (rest-pause, drop sets, slow eccentrics)
6. ✅ Deload characteristics (50% volume reduction, 70-80% intensity, no advanced techniques)
7. ✅ Progression tracking emphasized (Week 1: establish baseline, Week 13: compare to baseline)

### For UI Development
Test intermediate-level features with these examples:
- Multi-phase progression visualization (Weeks 1-6 vs 7-8 vs 9-14)
- Deload scheduling (Weeks 7-8, 15-16)
- Advanced technique indicators (rest-pause icon, drop set notation)
- Volume tracking across accumulation phase
- 6-day calendar view (PPL split display)

## Anti-Patterns Avoided

❌ **Same volume all 16 weeks** — No periodization, leads to stagnation  
✅ **Block periodization** — Volume waves (accumulate → deload → intensify)

❌ **Week 7 = complete rest** — Deconditioning, neural pathways lose sharpness  
✅ **Week 7 = active deload** — 50% volume, maintain patterns

❌ **Advanced techniques Week 1** — Unnecessary fatigue when building baseline  
✅ **Advanced techniques Week 13** — Used strategically in intensification

❌ **Linear progression forever** — Intermediate trainees adapt faster  
✅ **Phase-specific progression** — Accumulation (add sets), Intensification (add load)

❌ **No deload between phases** — Accumulated fatigue impairs intensification  
✅ **Strategic deload (Weeks 7-8)** — Dissipate fatigue before intensification

## Quality Standards

All 3 examples meet these criteria:

### ✅ Schema Compliance
- Overview (100-250 words)
- isDeload flag (false, true, false)
- 7-day array with detailed descriptions

### ✅ Phase-Appropriate Programming
- Week 1: Baseline volume, moderate intensity, standard techniques
- Week 7: 50% volume cut, 70-80% intensity, no advanced techniques
- Week 13: High intensity (RPE 8-9), advanced techniques, stabilized volume

### ✅ PPL Split Structure
- 6 training days (Mon-Sat)
- Correct muscle group pairings (Push/Pull/Legs)
- 2x frequency per muscle group

### ✅ Realistic Progression
- Week 1: "Establish baseline, don't chase PRs"
- Week 7: "Cut sets in half, focus on technique"
- Week 13: "Add 5-10lbs when hitting top of range, compare to Week 1"

### ✅ Detail Level
- Specific sets/reps (4x8, 3x10-12)
- RPE values with phase context
- Rest periods specified
- Technique notes (rest-pause execution, drop set protocol)
- Tracking prompts ("Track: Bench __lbs")

## Extending These Examples

To complete the Intermediate plan microcycles, add:

**Accumulation Phase (Weeks 1-6):**
- Week 1: ✅ Complete
- Week 3: Add (volume increase: 14-16 sets per muscle group)
- Week 5: Add (volume increase: 16-18 sets per muscle group)
- Week 6: Add (volume peak: 18-20 sets per muscle group)

**Deload Phase (Weeks 7-8):**
- Week 7: ✅ Complete
- Week 8: Add (same structure as Week 7, final deload before intensification)

**Intensification Phase (Weeks 9-14):**
- Week 9: Add (first week of intensification, RPE 8-9 introduced)
- Week 11: Add (mid-intensification, continue load progression)
- Week 13: ✅ Complete
- Week 14: Add (final intensification week before final deload)

**Final Deload & Assessment (Weeks 15-16):**
- Week 15: Add (60% volume cut, progress photos, measurements)
- Week 16: Add (assessment week, strength tests, plan next block)

## Related Documentation

- [plan-structured-intermediate-example.json](./plan-structured-intermediate-example.json) — Parent plan
- [PLAN_STRUCTURED_INTERMEDIATE_README.md](./PLAN_STRUCTURED_INTERMEDIATE_README.md) — Plan documentation
- [microcycle-beginner-weeks-1-5-9.json](./microcycle-beginner-weeks-1-5-9.json) — Beginner comparison
- [MICROCYCLE_BEGINNER_README.md](./MICROCYCLE_BEGINNER_README.md) — Beginner microcycle documentation
- [MicrocycleGenerationOutput schema](../packages/shared/src/shared/types/microcycle) — Schema definition

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 3 (Weeks 1, 7, 13 of Intermediate Hypertrophy plan)  
**Schema:** `MicrocycleGenerationOutput` (overview + isDeload + 7 days)  
**Phase:** Accumulation (W1) → Deload (W7) → Intensification (W13)  
**Training Frequency:** 6 days/week (Push/Pull/Legs split)  
**Volume Range:** 12-20 sets per muscle group (varies by phase)  
**Intensity Range:** RPE 6-9 (varies by phase)
