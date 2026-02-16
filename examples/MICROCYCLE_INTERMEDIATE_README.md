# Microcycle:Structured Examples — Intermediate Level (Weeks 1, 7, 13)

## Purpose
These examples demonstrate how the `microcycle:generate` agent should structure weekly training plans for **intermediate-level trainees** following the "Intermediate — Hypertrophy Focus" plan (16-week PPL split with block periodization).

## Week Selection Rationale
Week selection represents critical transition points in the intermediate program:

- **Week 1**: Accumulation phase launch — Establishes baseline volume (12-14 sets/muscle), introduces 6-day PPL split structure, moderate intensity (RPE 7-8)
- **Week 7**: First scheduled deload — 50% volume reduction, dissipates 6 weeks of accumulated fatigue, prepares for intensification phase
- **Week 13**: Peak intensification — High loads (RPE 8-9), advanced techniques (rest-pause, drop sets, slow eccentrics), maximum hypertrophy stimulus before final deload

## Plan Context
**Plan**: Intermediate — Hypertrophy Focus  
**Duration**: 16 weeks  
**Frequency**: 6 days/week (PPL × 2)  
**Split**: Push (chest/shoulders/triceps), Pull (back/biceps), Legs (quads/hamstrings/glutes)  
**Periodization**: Block periodization with distinct phases

### Phase Structure
1. **Weeks 1-6**: Accumulation (volume increases from 12-14 to 18-20 sets/muscle)
2. **Weeks 7-8**: Deload (50% volume reduction, moderate intensity)
3. **Weeks 9-14**: Intensification (high loads, advanced techniques, 14-16 sets/muscle)
4. **Weeks 15-16**: Final deload & assessment (60% volume reduction, testing, next block planning)

## Key Differences: Beginner vs. Intermediate

### Training Frequency
- **Beginner**: 3 days/week (full body)
- **Intermediate**: 6 days/week (PPL split, each muscle 2x/week)

### Periodization Complexity
- **Beginner**: Linear progression (add weight when hitting rep targets)
- **Intermediate**: Block periodization (distinct accumulation/intensification phases with different volume/intensity focuses)

### Volume Prescription
- **Beginner**: 2-3 sets per exercise (gradually building work capacity)
- **Intermediate**: 12-20 sets per muscle group/week (distributed across 2 sessions)

### Intensity Techniques
- **Beginner**: Straight sets with basic progression
- **Intermediate**: Advanced techniques (rest-pause, drop sets, slow eccentrics, auto-regulation)

### Exercise Selection
- **Beginner**: Fundamental patterns (squat, hinge, push, pull) with dumbbells → barbells
- **Intermediate**: More exercise variation per session, unilateral work, isolation movements, strategic rotation every 4-6 weeks

### Deload Strategy
- **Beginner**: One scheduled deload at Week 8 (after progressive overload phase)
- **Intermediate**: Two scheduled deloads (Weeks 7-8 after accumulation, Weeks 15-16 final deload), plus auto-regulation guidance for mid-block deloads if needed

## Schema Compliance

Each example follows the `MicrocycleGenerationOutput` schema:

```typescript
{
  planId: string;                    // Links to corresponding plan
  weekNumber: number;                // Week number within plan (1-16 for intermediate)
  metadata: {
    title: string;                   // Descriptive title with phase info
    phase: string;                   // Current training phase
    progressionFocus: string;        // What's being progressed this week
    isDeload: boolean;               // Deload week flag
  };
  microcycleOutput: {
    overview: string;                // 200-300 word week overview
    isDeload: boolean;               // Deload flag (duplicated for agent clarity)
    days: [string, string, ...];     // 7 daily descriptions (detailed for training days, concise for rest days)
  };
}
```

## Day-by-Day Structure

### Week 1 (Accumulation Launch)
- **Monday**: Push (Chest/Shoulders) — Compounds 4x8 RPE 7-8, accessories 3x10-15
- **Tuesday**: Pull (Back/Biceps) — Deadlift 4x6, vertical/horizontal pulling 14-16 sets
- **Wednesday**: Legs (Quad Emphasis) — Squat 4x8, leg press, Bulgarian split squats
- **Thursday**: Push (Triceps/Front Delts) — Incline press, flyes, close-grip bench
- **Friday**: Pull (Rear Delts/Biceps) — Pull-ups, rows, rear delt isolation
- **Saturday**: Legs (Hamstring/Glute) — RDLs, hip thrusts, leg curls
- **Sunday**: Rest (or optional light Zone 2 cardio)

### Week 7 (Deload)
- **All 6 training days**: Same exercises as Week 1, but 50% volume (half the sets), 70-80% loads, RPE 6-7
- **Focus**: Active recovery, technique refinement, dissipate fatigue
- **Sunday**: Full rest (no cardio this week — maximize recovery)

### Week 13 (Peak Intensification)
- **All 6 training days**: Same PPL structure, but RPE 8-9, advanced techniques deployed
  - **Rest-pause sets**: Hit target reps, rest 15-20sec, continue for 2-3 more reps
  - **Drop sets**: Hit failure, reduce weight 30%, immediately continue to failure
  - **Slow eccentrics**: 4-5sec negative on final sets (increases time under tension)
- **Sunday**: Full rest, 8-9 hours sleep minimum (recovery is critical at this intensity)

## Usage

### For Agent Training
Use these examples to teach the `microcycle:generate` agent:
1. **How to structure 6-day PPL splits** (vs. 3-day full body for beginners)
2. **How to write appropriate deload prescriptions** (active recovery with specific volume/intensity reductions)
3. **How to incorporate advanced techniques** (rest-pause, drop sets, eccentric emphasis) during intensification
4. **How to write detailed daily guidance** that balances prescription with education

### For Evaluation
Compare generated microcycles against these references for:
- **Volume accuracy**: 12-14 sets/muscle (Week 1), half that (Week 7), 14-16 sets (Week 13)
- **Intensity prescription**: RPE 7-8 (accumulation), RPE 6-7 (deload), RPE 8-9 (intensification)
- **Exercise selection**: Compound-first, accessories, isolation, appropriate for PPL split
- **Progressive detail**: Warm-up guidance, rest periods, set/rep/RPE specifics, technique cues
- **Deload implementation**: Active recovery (not "skip the gym"), lighter loads, same exercises
- **Advanced technique integration**: Appropriate placement (final sets), clear instructions, safety notes

### For Database Seeding
These examples can populate a `microcycle_examples` table with realistic intermediate-level training weeks that correspond to the "Intermediate — Hypertrophy Focus" plan.

## File Details
- **Location**: `examples/microcycle-intermediate-weeks-1-7-13.json`
- **Size**: ~24KB (3 complete microcycles with detailed daily guidance)
- **Format**: JSON array of `MicrocycleGenerationOutput` objects
- **Corresponding plan**: `plan-structured-intermediate-example.json`

## Related Files
- **Plan structure**: `examples/plan-structured-intermediate-example.json` (the full 16-week intermediate plan)
- **Plan structure guide**: `examples/PLAN_STRUCTURED_INTERMEDIATE_README.md` (comparison of beginner vs. intermediate complexity)
- **Beginner microcycle examples**: `examples/microcycle-beginner-weeks-1-5-9.json` (for comparison)
- **Beginner README**: `examples/MICROCYCLE_BEGINNER_README.md` (beginner progression pattern)

---

These examples demonstrate professional-grade intermediate programming: proper periodization, volume/intensity manipulation, strategic deloads, and advanced technique integration. Use them as the gold standard for intermediate `microcycle:generate` outputs.
