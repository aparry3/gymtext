# Plan:Structured Example: Intermediate Hypertrophy Focus

Structured (parsed) version of the Intermediate Hypertrophy PPL plan from `plan-examples.json`, demonstrating more complex periodization and higher training frequency than the beginner example.

## Purpose

This example demonstrates:
- **How `plan:structured` agent should parse intermediate-level plans**
- **More complex periodization** (block periodization vs linear progression)
- **Higher training frequency** (6 days/week vs 3 days/week)
- **Detailed progression strategy** with distinct phases
- **Auto-regulation** and scheduled deloads

## Comparison: Beginner vs Intermediate

### High-Level Differences

| Aspect | Beginner Plan | Intermediate Plan |
|--------|---------------|-------------------|
| **Name** | Beginner General Fitness Foundation | Intermediate Hypertrophy Focus |
| **Type** | Full Body Stabilization | Push/Pull/Legs |
| **Duration** | 12 weeks | 16 weeks |
| **Frequency** | 3 days/week | 6 days/week |
| **Split** | Full body (same patterns 3x/week) | PPL (each muscle group 2x/week) |
| **Periodization** | Linear progression | Block periodization (accumulation → intensification) |
| **Intensity** | RPE 5-6 → 6-7 (conservative) | RPE 7-8 → 8-9 (closer to failure) |
| **Volume** | 2-3 sets x 12-15 reps | 3-4 sets x 6-20 reps (varies by lift type) |
| **Progression** | Simple (add weight when hitting 3x15) | Complex (phase-specific rules, volume waves) |
| **Deloads** | Every 4th week or as needed | Scheduled (Weeks 7-8, 15-16) + auto-regulation |
| **Conditioning** | Optional Zone 2, minimal | Optional 2-3x/week, structured |

### Core Strategy Complexity

**Beginner:**
```
3-day full-body training using NASM Stabilization Endurance Phase 
principles. Focus on movement quality, skill acquisition, and building 
sustainable training habits. Low intensity (50-60% 1RM), high reps 
(12-15), controlled tempo (3-1-1). Prioritize form mastery over 
progressive overload in early weeks.
```

**Intermediate:**
```
6-day Push/Pull/Legs split with volume accumulation for hypertrophy. 
High frequency per muscle group (2x/week) while managing fatigue 
through movement-pattern specificity. Uses block periodization: 
accumulation phase (increase volume) followed by intensification 
phase (increase load). Compound lifts (3-4 sets of 6-10 reps RPE 7-8), 
accessories (3-4 sets of 10-15 reps RPE 8-9), isolation (2-3 sets of 
12-20 reps RPE 9).
```

**Key differences:**
- Beginner: Single training philosophy (NASM stabilization)
- Intermediate: Multiple training zones (compounds vs accessories vs isolation)
- Beginner: Simple intensity prescription (RPE 5-6)
- Intermediate: Varied intensity by lift type (RPE 7-8 compounds, RPE 8-9 accessories)
- Beginner: Focus on form mastery
- Intermediate: Focus on hypertrophy via progressive volume

### Progression Strategy Complexity

**Beginner (3 items):**
1. Weeks 1-4: Focus on form mastery
2. Weeks 5-8: Add 5-10lbs when hitting 3x15
3. Weeks 9-12: Continue load increases or add complexity

**Intermediate (5 items):**
1. Phase 1 (Weeks 1-6): Accumulation — increase volume from 12-14 to 18-20 sets
2. Phase 2 (Weeks 7-8): Deload — reduce volume by 50%
3. Phase 3 (Weeks 9-14): Intensification — increase load, maintain volume 14-16 sets
4. Phase 4 (Weeks 15-16): Final deload & assessment
5. Exercise variation: Rotate every 4-6 weeks

**Key differences:**
- Beginner: Simple linear progression (add weight when hitting rep target)
- Intermediate: Block periodization (distinct accumulation and intensification phases)
- Beginner: Single progression rule
- Intermediate: Phase-specific rules (volume increase vs load increase)
- Intermediate: Includes exercise rotation strategy (prevent accommodation)

### Schedule Template Complexity

**Beginner (3 training days):**
- Monday: Full Body — Lower emphasis
- Wednesday: Full Body — Upper emphasis
- Friday: Full Body — Balanced

**Intermediate (6 training days):**
- Monday: Push — Chest & Shoulders emphasis
- Tuesday: Pull — Back & Biceps
- Wednesday: Legs — Quad emphasis
- Thursday: Push — Triceps & Front Delts
- Friday: Pull — Rear Delts & Biceps
- Saturday: Legs — Hamstring & Glute emphasis

**Key differences:**
- Beginner: Same movement patterns 3x/week (full body)
- Intermediate: Each muscle group trained 2x/week via split
- Beginner: Simple rationale (start week with lower, etc.)
- Intermediate: Detailed rationale (antagonist pairing, recovery distribution)
- Intermediate: Differentiation within split (Push A vs Push B focuses)

### Adjustment Strategy Complexity

**Beginner:**
```
Deload every 4th week OR if experiencing unusual fatigue/soreness. 
Reduce volume by 40-50% (drop to 2 sets per exercise), keep intensity 
moderate (stick with current weights, don't push for PRs), focus on 
movement quality and active recovery.
```

**Intermediate:**
```
Scheduled deloads at Weeks 7-8 and 15-16. Cut volume by 50-60%, 
maintain exercise selection, keep intensity moderate (70-80% of 
working weights). Focus on technique refinement and recovery. 
Auto-regulation deload if needed mid-block: If 3+ consecutive 
sessions feeling flat, sleep disruption, or joint pain occurs, take 
1 unscheduled deload week then resume.
```

**Key differences:**
- Beginner: Generic timing (every 4th week)
- Intermediate: Specific timing aligned with periodization (Weeks 7-8, 15-16)
- Beginner: Simple volume reduction (40-50%)
- Intermediate: Larger volume reduction (50-60%) but intensity more structured (70-80%)
- Intermediate: Auto-regulation built in with specific triggers

## Field-by-Field Analysis

### `name`
- **Beginner:** "Beginner General Fitness Foundation"
- **Intermediate:** "Intermediate Hypertrophy Focus"
- **Difference:** Intermediate name includes specific training goal (hypertrophy)

### `type`
- **Beginner:** "Full Body Stabilization"
- **Intermediate:** "Push/Pull/Legs"
- **Difference:** Beginner describes training phase (NASM stabilization), Intermediate describes split structure

### `coreStrategy`
- **Beginner:** 3 sentences, emphasizes movement quality and form mastery
- **Intermediate:** 4 sentences, includes block periodization methodology and multiple intensity zones
- **Difference:** Intermediate is more technical, assumes reader understands RPE, periodization concepts

### `progressionStrategy`
- **Beginner:** 4 items (3 phases + skill milestones)
- **Intermediate:** 5 items (4 periodization phases + exercise variation)
- **Difference:** Intermediate includes volume accumulation/intensification concepts, explicit exercise rotation

### `adjustmentStrategy`
- **Beginner:** Single deload protocol
- **Intermediate:** Scheduled deloads + auto-regulation with specific triggers
- **Difference:** Intermediate more proactive (scheduled) and reactive (auto-regulation)

### `conditioning`
- **Beginner:** 2 items, minimal structure (optional post-workout, weekend active recovery)
- **Intermediate:** 3 items, more structured (specific frequency, timing, purpose)
- **Difference:** Intermediate prescribes frequency (2-3x/week), explicit timing options

### `scheduleTemplate`
- **Beginner:** 3 training days + 4 rest/recovery days
- **Intermediate:** 6 training days + 1 rest day
- **Difference:** Intermediate has more detailed rationale (antagonist pairing, recovery distribution)

### `durationWeeks`
- **Beginner:** 12 weeks
- **Intermediate:** 16 weeks
- **Difference:** Intermediate longer to accommodate accumulation/intensification/deload cycle

### `frequencyPerWeek`
- **Beginner:** 3 days
- **Intermediate:** 6 days
- **Difference:** Intermediate double the frequency

## Schema Compliance

Both examples follow the `PlanStructure` schema correctly:

### ✅ Required Fields Present
- `name`: ✅ Both have clear, descriptive names
- `type`: ✅ Both specify plan type
- `coreStrategy`: ✅ Both have multi-sentence philosophy
- `progressionStrategy`: ✅ Both have array of progression rules
- `adjustmentStrategy`: ✅ Both have deload/adjustment guidance
- `conditioning`: ✅ Both have conditioning guidelines (array)
- `scheduleTemplate`: ✅ Both have 7-day schedules
- `durationWeeks`: ✅ Both specify duration (12 vs 16)
- `frequencyPerWeek`: ✅ Both specify frequency (3 vs 6)

### ✅ Array Structures
- `progressionStrategy`: Array of strings (3-5 items)
- `conditioning`: Array of strings (2-3 items)
- `scheduleTemplate`: Array of 7 objects (one per day)

### ✅ Schedule Template Objects
Each day has:
- `day`: String (Monday, Tuesday, etc.)
- `focus`: String (activity focus)
- `rationale`: String (why this day is positioned here)

## Use Cases

### 1. Agent Training
- **Beginner example:** Teach agent to parse simple linear progression plans
- **Intermediate example:** Teach agent to parse complex block periodization plans
- **Together:** Show agent how complexity scales with experience level

### 2. Agent Evaluation
Compare agent output for intermediate plan against this benchmark. Check for:
- ✅ Block periodization captured (accumulation → intensification phases)
- ✅ Phase-specific progression rules (volume increase vs load increase)
- ✅ Higher frequency reflected (6 days vs 3 days)
- ✅ PPL split structure captured in schedule
- ✅ Auto-regulation included in adjustment strategy
- ✅ More detailed conditioning prescription

### 3. UI Development
Test plan detail views with intermediate-level complexity:
- Multi-phase progression visualization (Weeks 1-6 vs 9-14)
- 6-day schedule display
- Volume tracking across accumulation phase
- Deload scheduling (Weeks 7-8, 15-16)
- Exercise rotation reminders (every 4-6 weeks)

### 4. Schema Validation
- Validate that `PlanStructure` schema accommodates both simple (beginner) and complex (intermediate) plans
- Test schema flexibility (e.g., progressionStrategy can be 3-5 items)

## Quality Standards

This intermediate example meets all standards:

### ✅ Schema Compliance
- All required fields present
- Proper array structures
- 7-day schedule template

### ✅ Intermediate-Appropriate Complexity
- Block periodization (accumulation → intensification)
- Higher training frequency (6 days/week)
- Multiple intensity zones (RPE 7-8-9)
- Volume tracking (12-20 sets per muscle group)
- Exercise rotation strategy

### ✅ Specificity
- Not vague ("progressive overload")
- Actionable ("add 5-10lbs when hitting top of rep range in Weeks 9-14")
- Concrete triggers ("if 3+ consecutive sessions feeling flat")

### ✅ Consistency
- Schedule frequency (6) matches training days (Mon-Sat)
- Duration (16 weeks) matches phase breakdown (6 + 2 + 6 + 2 = 16)
- Progression strategy phases align with deload schedule

## Design Decisions

**Why 16 weeks instead of 12?** — Block periodization requires sufficient time for accumulation (6 weeks) and intensification (6 weeks) phases plus deloads (2 + 2 weeks).

**Why 6 days/week instead of 4-5?** — PPL split with 2x frequency requires 6 days (Push/Pull/Legs repeated twice).

**Why block periodization instead of linear?** — Intermediate trainees benefit from periodization waves (volume accumulation followed by intensification) rather than continuous linear progression.

**Why multiple progressionStrategy items?** — Each phase (accumulation, deload, intensification) has different progression rules. Single rule wouldn't capture this.

**Why auto-regulation in adjustmentStrategy?** — Intermediate trainees can self-assess fatigue better than beginners. Auto-regulation respects individual recovery needs.

**Why exercise rotation mentioned?** — Intermediate trainees adapt to exercises faster than beginners. Rotation prevents accommodation.

## Extending This Pattern

For **Advanced-level plans**, expect:
- Even more complex periodization (DUP, conjugate, block with multiple intensification phases)
- Specific percentage prescriptions (not just RPE)
- Competition prep timelines (peak week protocols)
- More auto-regulation (RTS/RPE-based adjustments)
- Advanced techniques (cluster sets, rest-pause, wave loading)

For **Sport-Specific plans**, expect:
- Concurrent training (strength + power + conditioning)
- Interference management (how strength work fits with sport training)
- Competition taper protocols
- Sport-specific conditioning (fight rounds, sprint intervals)
- Injury prevention specific to sport demands

## Related Documentation

- [plan-structured-beginner-example.json](./plan-structured-beginner-example.json) — Beginner comparison
- [PLAN_STRUCTURED_README.md](./PLAN_STRUCTURED_README.md) — Beginner documentation (field-by-field guide)
- [plan-examples.json](./plan-microcycle-examples/plan-examples.json) — Source plan content
- [PlanStructureSchema](../packages/shared/src/shared/types/plan/schema.ts) — Schema definition

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Example:** 1 complete intermediate-level structured plan  
**Schema:** `PlanStructure` (from packages/shared/src/shared/types/plan/schema.ts)  
**Complexity Level:** Intermediate (block periodization, 6 days/week, higher volume)  
**Duration:** 16 weeks  
**Frequency:** 6 days/week (Push/Pull/Legs split)
