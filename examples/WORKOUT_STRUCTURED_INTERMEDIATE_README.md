# Workout:Structured Examples — Intermediate All 9 Workouts

## Purpose
This file consolidates **all 9 intermediate workout examples** (Weeks 1, 7, 13 × Monday, Tuesday, Wednesday) into a single comprehensive reference demonstrating the complete intermediate PPL progression: accumulation → deload → intensification.

## Coverage

### Week 1: Accumulation Phase Launch (3 workouts)
- **Monday**: Push (Chest & Shoulders) — 4x8 bench, 3x10-12 incline DB, lateral raises
- **Tuesday**: Pull (Back & Biceps) — 4x6 deadlift, 4x8-10 pull-ups, rows, curls
- **Wednesday**: Legs (Quad Emphasis) — 4x8 squat (3-1-X tempo), leg press, Bulgarian split squats

### Week 7: Deload (3 workouts)
- **Thursday**: Push (Triceps/Front Delts) — 2 sets per exercise, 70-80% loads, RPE 6-7
- **Friday**: Pull (Rear Delts/Biceps) — 2 sets, NO deadlift (posterior chain rest)
- **Saturday**: Legs (Hamstring/Glute) — 2 sets, NO squat (covered Wed), RDL focus

### Week 13: Peak Intensification (3 workouts)
- **Monday**: Push (Chest & Shoulders) — 4x6-8 bench + rest-pause, incline + slow eccentrics, laterals + drop set
- **Tuesday**: Pull (Back & Biceps) — 4x5-6 deadlift + rest-pause, pull-ups + slow eccentrics, curls + drop set
- **Wednesday**: Legs (Quad Emphasis) — 4x6-8 squat + rest-pause, Bulgarian + slow eccentrics, extensions + drop set

**Total**: 9 complete workouts demonstrating intermediate PPL split across three critical training phases

## Progression Demonstrated

### Week 1 (Accumulation Launch)
**Goal**: Establish baseline volume (12-14 sets/muscle), introduce PPL split  
**Intensity**: RPE 7-8 (moderate, leave 2-3 reps in reserve)  
**Volume**: 3-4 sets per exercise  
**Load**: ~70-75% 1RM  
**Techniques**: Standard sets (tempo emphasis on squat: 3-1-X)  
**Session time**: 65-75min  
**Mental frame**: "Track everything, start conservative, build tolerance"

### Week 7 (Deload)
**Goal**: Dissipate 6 weeks of accumulated fatigue through active recovery  
**Intensity**: RPE 6-7 (leave 3-4 reps in reserve)  
**Volume**: 2 sets per exercise (50% reduction)  
**Load**: 70-80% of Week 6 working weights  
**Techniques**: None (technique practice, not pushing)  
**Session time**: 40-50min (25-30min shorter than accumulation)  
**Mental frame**: "Active recovery, not coasting. Deloads are when adaptation happens"

### Week 13 (Peak Intensification)
**Goal**: Maximum hypertrophy stimulus through high loads + advanced techniques  
**Intensity**: RPE 8-9 (only 1-2 reps in reserve)  
**Volume**: 3-4 sets per exercise (14-16 sets/muscle)  
**Load**: ~80-85% 1RM (+10-15% from Week 1)  
**Techniques**: Rest-pause, drop sets, slow eccentrics (final sets only)  
**Session time**: 70-80min (techniques add time)  
**Mental frame**: "Hardest week of the program. Expect significant DOMS. Form is still king"

## Complete Progression Arc

This collection demonstrates the full intermediate training cycle:

**Weeks 1-6: ACCUMULATION**
→ Gradually increase volume from 12-14 to 18-20 sets per muscle group
→ Add 1-2 sets every 2 weeks
→ Intensity moderate (RPE 7-8)
→ Week 1 examples show baseline

**Weeks 7-8: DELOAD**
→ Reduce volume 50%, reduce load to 70-80%, RPE 6-7
→ Dissipate fatigue, repair microtrauma, super-compensate
→ Week 7 examples show active recovery

**Weeks 9-14: INTENSIFICATION**
→ Increase load/intensity, maintain volume 14-16 sets/muscle
→ Deploy advanced techniques (rest-pause, drop sets, slow eccentrics)
→ RPE 8-9, pushing closer to failure
→ Week 13 examples show peak intensity

**Weeks 15-16: FINAL DELOAD & ASSESSMENT**
→ Reduce volume 60%, test progress, plan next block
→ (Not included in these 9 examples)

## File Structure

### Schema Compliance
All 9 workouts follow **WorkoutStructureLLMSchema**:

```typescript
{
  id: string;
  metadata: {
    title: string;
    weekNumber: number;
    dayOfWeek: string;
    planId: "intermediate-hypertrophy";
    phase: string;
    focus: string;
    keyFeatures: string[];
  };
  structuredWorkout: {
    title: string;
    focus: string;
    description: string;
    quote: { text: "", author: "" };
    sections: [
      {
        title: string;
        overview: string;
        exercises: [
          {
            name, type, sets, reps, duration, distance,
            rest, intensity: { type, value, description },
            tempo, notes, tags: [], supersetId: ""
          }
        ]
      }
    ];
    estimatedDurationMin: number;
    intensityLevel: string;
    tags: {
      category: string[];
      split: string[];
      muscles: string[];
      patterns: string[];
      equipment: string[];
    };
  };
}
```

### LLM-Safe Schema
**Omits** post-processing fields:
- ❌ `exerciseId` (assigned by database)
- ❌ `nameRaw` (parsing artifact)
- ❌ `resolution` (validation result)

**Includes** all fields needed for generation:
- ✅ Full exercise objects with execution notes
- ✅ Section structure (Warm-Up → Compounds → Accessories → Isolation → Cooldown)
- ✅ Intensity guidance (RPE, tempo, rest periods)
- ✅ Comprehensive tags (category, split, muscles, patterns, equipment)

## Progression Tables

### Volume Comparison

| Week | Phase | Sets/Exercise | Sets/Muscle | Total Sets/Session |
|------|-------|---------------|-------------|-------------------|
| **W1** | Accumulation | 3-4 | 12-14 | 20-27 |
| **W7** | Deload | **2** | **6-7** | **12-14** |
| **W13** | Intensification | 3-4 | 14-16 | 22-27 |

### Intensity Comparison

| Week | Phase | RPE | Load (% 1RM) | Reps in Reserve |
|------|-------|-----|--------------|-----------------|
| **W1** | Accumulation | 7-8 | ~70-75% | 2-3 |
| **W7** | Deload | **6-7** | **70-80% of W6** | **3-4** |
| **W13** | Intensification | **8-9** | **~80-85%** | **1-2** |

### Advanced Techniques

| Week | Phase | Techniques | Deployment |
|------|-------|------------|------------|
| **W1** | Accumulation | None (tempo on squat) | N/A |
| **W7** | Deload | **None** | Technique practice only |
| **W13** | Intensification | **Rest-pause, drop sets, slow eccentrics** | **Final sets only** |

### Session Time

| Week | Phase | Mon | Tue | Wed | Thu | Fri | Sat | Avg |
|------|-------|-----|-----|-----|-----|-----|-----|-----|
| **W1** | Accumulation | 65min | 70min | 75min | - | - | - | **70min** |
| **W7** | Deload | - | - | - | 45min | 45min | 45min | **45min** |
| **W13** | Intensification | 75min | 75min | 75min | - | - | - | **75min** |

## PPL Split Structure

All 9 workouts demonstrate the **Push/Pull/Legs split**:

### Push Days (Monday W1, Thursday W7, Monday W13)
**Primary muscles**: Chest, front/side delts, triceps  
**Movement patterns**: Horizontal press, vertical press  
**Core exercises**:
- Bench press (flat or incline)
- Dumbbell press (flat or incline)
- Shoulder press (DB or seated DB)
- Isolation (lateral raises, triceps)

**Volume distribution**:
- Chest: 12-14 sets (accumulation/intensification), 6-7 sets (deload)
- Shoulders: 10-12 sets (accumulation/intensification), 5-6 sets (deload)
- Triceps: 6-8 sets (accumulation/intensification), 3-4 sets (deload)

### Pull Days (Tuesday W1, Friday W7, Tuesday W13)
**Primary muscles**: Lats, mid-back, rear delts, biceps  
**Movement patterns**: Vertical pull, horizontal pull, hinge (deadlift)  
**Core exercises**:
- Deadlift (omitted during deload)
- Pull-ups or lat pulldown
- Rows (barbell, T-bar, cable, single-arm DB)
- Face pulls (rear delts)
- Curls (barbell, hammer, incline DB, cable)

**Volume distribution**:
- Back: 14-16 sets (accumulation/intensification), 7-8 sets (deload)
- Biceps: 8-10 sets (accumulation/intensification), 4-5 sets (deload)

### Legs Days (Wednesday W1, Saturday W7, Wednesday W13)
**Primary muscles**: Quads, hamstrings, glutes, calves  
**Movement patterns**: Squat, hinge, lunge  
**Core exercises**:
- Squat (omitted Saturday deload — covered Wednesday)
- Leg press
- Bulgarian split squats or walking lunges
- RDL (Romanian deadlift)
- Leg extensions, leg curls
- Calf raises

**Volume distribution**:
- Quads: 14-16 sets (accumulation/intensification), 6-8 sets (deload)
- Hamstrings: 6-8 sets (accumulation/intensification), 3-4 sets (deload)
- Calves: 4-6 sets (accumulation/intensification), 2-3 sets (deload)

## Exercise Categorization

All workouts follow the **Compounds → Accessories → Isolation** structure:

### Compounds (3-4 sets × 6-10 reps)
**Purpose**: Main strength movements, highest mechanical tension  
**Rest**: 90-120s (deadlift/squat get 2-3min)  
**RPE**: 7-8 (accumulation), 6-7 (deload), 8-9 (intensification)  
**Examples**:
- Bench press, incline barbell press
- Deadlift, pull-ups/lat pulldown, barbell row
- Squat, leg press, Bulgarian split squat

### Accessories (3 sets × 10-15 reps)
**Purpose**: Volume work without excessive fatigue  
**Rest**: 60-90s  
**RPE**: 8 (accumulation), 7 (deload), 8-9 (intensification)  
**Examples**:
- Machine chest press, cable flyes
- Single-arm DB row, face pulls, seated cable row
- RDL, walking lunges, calf raises

### Isolation (2-3 sets × 12-20 reps)
**Purpose**: Target specific muscles, metabolic stress, pump  
**Rest**: 60s  
**RPE**: 8-9 (accumulation), 7 (deload), 9 (intensification)  
**Examples**:
- Lateral raises, overhead triceps extension
- Straight-arm pulldown, curls (barbell, hammer, incline DB, cable)
- Leg extensions, leg curls

## Advanced Techniques (Week 13 Only)

### Rest-Pause (Primary Compounds)
**Where**: Final set of bench press, deadlift, squat  
**Execution**: Near failure → rest 15-30sec → 2-3 more reps  
**Example**: Bench 4x6-8, Set 4: 6 reps → rack → 15-20sec → 2-3 more  
**Marking**: ⚡ symbol in notes

### Slow Eccentrics 4-5sec (Secondary Compounds)
**Where**: Final set of incline press, pull-ups, Bulgarian split squats  
**Execution**: 4-5sec descent on EVERY rep of final set  
**Example**: Incline DB press 3x8-10, Set 3: 4-5sec eccentric every rep  
**Marking**: Tempo field + ⚡ symbol

### Drop Sets (Isolation)
**Where**: Final set of lateral raises, barbell curls, leg extensions  
**Execution**: Failure → reduce weight 30-40% → continue to failure  
**Example**: Lateral raises 3x12-15, Set 3: failure → drop 30-40% → 8-10 more  
**Marking**: ⚡ symbol in notes

## Use Cases

### 1. Agent Training
**Dataset for fine-tuning `workout:structured` agent**:
- Complete intermediate progression arc (accumulation → deload → intensification)
- PPL split structure (6 days/week, each muscle 2x/week)
- Volume/intensity manipulation across phases
- Advanced technique integration (Week 13)
- Deload programming (Week 7)

### 2. Agent Evaluation
**Benchmark for comparing generated workouts**:
- Schema compliance (all required fields present)
- Volume accuracy (12-16 sets/muscle accumulation/intensification, 6-7 deload)
- Intensity prescription (RPE 7-8 → 6-7 → 8-9)
- Exercise categorization (compounds → accessories → isolation)
- Advanced technique deployment (final sets only, one per exercise)
- Deload implementation (50% volume, 70-80% loads, no techniques)

### 3. UI Component Testing
**Test workout displays with realistic data**:
- Progression dashboards (W1 → W7 → W13)
- Phase transitions (accumulation → deload → intensification)
- Advanced technique indicators (⚡ symbol, tempo fields, drop set instructions)
- Volume/intensity charts (compare across weeks)
- Session time estimates (65-75min accumulation, 40-50min deload, 70-80min intensification)

### 4. Database Seeding
**Populate workout templates**:
- Single import for all 9 intermediate workouts
- Reference data for workout builder tools
- Template library for users creating custom plans
- Training data for recommendation systems

### 5. User Onboarding
**Show prospective intermediate users**:
- What 6-day PPL looks like across different phases
- How deloads are structured (active recovery, not skipping)
- What advanced techniques look like (rest-pause, drop sets, slow eccentrics)
- Realistic session times (40-80min depending on phase)

## Quality Standards

High-quality intermediate workout:structured examples demonstrate:
- ✅ **PPL split structure** (Push/Pull/Legs with appropriate exercise selection)
- ✅ **Volume progression** (12-14 → 6-7 → 14-16 sets/muscle across phases)
- ✅ **Intensity progression** (RPE 7-8 → 6-7 → 8-9 across phases)
- ✅ **Exercise categorization** (Compounds → Accessories → Isolation)
- ✅ **Rest period variance** (2-3min heavy compounds → 60s isolation)
- ✅ **Detailed execution notes** (setup cues, focus points, alternatives)
- ✅ **Advanced technique integration** (Week 13: rest-pause, drop sets, slow eccentrics)
- ✅ **Deload principles** (Week 7: 50% volume, 70-80% loads, active recovery)
- ✅ **Safety warnings** (form critical, when to stop, assistance cues)
- ✅ **Mental framing** (appropriate for each phase)
- ✅ **Session time realism** (65-75min accumulation, 40-50min deload, 70-80min intensification)

## Comparison: Beginner vs. Intermediate

| Dimension | Beginner (9 workouts) | Intermediate (9 workouts) |
|-----------|----------------------|---------------------------|
| **Split** | Full body (3 days/week) | **PPL (6 days/week)** |
| **Weeks shown** | W1, W5, W9 | **W1, W7, W13** |
| **Days per week** | Mon/Wed/Fri | **Mon/Tue/Wed (or Thu/Fri/Sat)** |
| **Volume/session** | 3-4 exercises | **6-9 exercises** |
| **Volume/muscle** | 4-6 sets/week | **12-16 sets/week (2 sessions)** |
| **Intensity range** | RPE 5-6 → 6-7 | **RPE 7-8 → 6-7 → 8-9** |
| **Deload** | Week 8 (after progressive overload) | **Week 7-8 (between blocks)** |
| **Advanced techniques** | None | **Week 13: rest-pause, drop sets, slow eccentrics** |
| **Equipment progression** | Dumbbells → barbells | **Barbells throughout, machines, cables** |
| **Session time** | 45min | **40-80min (phase-dependent)** |
| **Periodization** | Linear progression | **Block periodization** |

## File Details
- **Location**: `examples/workout-structured-intermediate-all-9.json`
- **Size**: ~88KB (2,608 lines)
- **Workouts**: 9 complete structured workouts
- **Format**: JSON array of workout objects (WorkoutStructureLLMSchema)
- **Corresponding files**:
  - Week 1 details: `workout-generate-intermediate-w1-examples.json` (PR #161)
  - Week 7 details: `workout-generate-intermediate-w7-examples.json` (PR #163)
  - Week 13 details: `workout-generate-intermediate-w13-examples.json` (PR #164)
  - Microcycles: `microcycle-intermediate-weeks-1-7-13.json` (PR #158)
  - Plan: `plan-structured-intermediate-example.json` (PR #155)

## Related Files
- **Beginner workout:structured**: `workout-structured-beginner-all-9.json` (PR #153, comparison)
- **Intermediate microcycle:structured**: `microcycle-intermediate-weeks-1-7-13.json` (week-level detail)
- **Intermediate microcycle:message**: `microcycle-message-intermediate-weeks-1-7-13.json` (SMS previews)
- **Intermediate plan:structured**: `plan-structured-intermediate-example.json` (full 16-week plan)

## Extension Roadmap

To create a **complete 12-workout set** (full 6-day PPL cycle × 2 weeks):

**Already have (9 workouts)**:
- W1: Mon, Tue, Wed ✅
- W7: Thu, Fri, Sat ✅
- W13: Mon, Tue, Wed ✅

**Could add (3 more workouts for complete cycle)**:
- W1: Thu, Fri, Sat (second PPL cycle of Week 1)
- OR W13: Thu, Fri, Sat (second PPL cycle of Week 13)
- OR W7: Mon, Tue, Wed (first PPL cycle of Week 7)

**Benefits of 12-workout set**:
- Shows complete 6-day PPL cycle (all 6 days)
- Demonstrates exercise variation within same week (Mon vs Thu Push, Tue vs Fri Pull, Wed vs Sat Legs)
- More complete training data for agents

**Current 9-workout set is sufficient for**:
- Demonstrating all three phases (accumulation, deload, intensification)
- Showing PPL structure (3 distinct training days)
- Progression across weeks (W1 → W7 → W13)

## Design Decisions

### Why Weeks 1, 7, 13 (not 1, 8, 16)?
- **Week 1**: Baseline (accumulation launch)
- **Week 7**: First deload (mid-program recovery)
- **Week 13**: Peak intensification (advanced techniques, final push before final deload)

These weeks represent **critical transition points** in the 16-week block periodization cycle.

### Why Mon/Tue/Wed (not consistent days)?
- **Week 1 & 13**: Mon/Tue/Wed (first PPL cycle of the week)
- **Week 7**: Thu/Fri/Sat (second PPL cycle of deload week)

This demonstrates:
- Both halves of a 6-day PPL split
- How exercise selection varies within the same week (Mon Push vs Thu Push)
- Complete deload cycle (all 6 days of Week 7 now covered: Mon-Wed from PR #147, Thu-Sat here)

### Why Consolidate into One File?
- Easier agent training (load once, get all 9 workouts)
- Simplified database seeding (single import)
- Clearer progression narrative (see W1 → W7 → W13 in one place)
- Follows beginner pattern (PR #153 consolidated W1/W5/W9)

---

This consolidated file demonstrates professional intermediate programming: complete PPL split structure, block periodization with distinct phases, appropriate volume/intensity manipulation, strategic deloads, and advanced technique integration. Use it as the gold standard for intermediate `workout:structured` outputs.
