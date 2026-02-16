# Time-Constrained Week 1 workout:generate Examples

## Purpose

Reference examples demonstrating the `workout:generate` agent output for **Time-Constrained Week 1** (Foundation Phase start).

These examples show how the `workout:generate` agent should transform a microcycle day description into a detailed structured workout following the `WorkoutStructureLLMSchema`.

## Context

- **Plan**: Time-Efficient Strength & Conditioning (8 weeks, 30-45min sessions, 3 days/week)
- **Week 1**: Foundation Phase (Weeks 1-2)
- **Phase Goals**: Learn superset technique, establish baseline strength, build work capacity
- **Training Parameters**: 60-65% loads, RPE 6-7 (leave 3-4 reps in reserve), 30-35min sessions
- **Session Structure**: 3 supersets per workout, <15sec transitions within supersets, 60-90sec rest between supersets
- **Philosophy**: Density training for time efficiency, consistency over perfection

## Week 1 Characteristics

### Foundation Phase (Weeks 1-2)
- **Primary Goal**: Learn superset pacing and movement quality
- **Loads**: 60-65% estimated 1RM
- **RPE**: 6-7 (leave 3-4 reps in reserve)
- **Session Time**: 30-35min (excluding optional finishers)
- **Transitions**: <15sec between exercises in a superset
- **Rest**: 60-90sec between supersets
- **Cardio Finishers**: Optional (5min, only if time/energy allows)

### Week 1 Training Days
- **Monday (Day 1)**: Full Body A — Push Emphasis
- **Wednesday (Day 3)**: Full Body B — Pull Emphasis  
- **Friday (Day 5)**: Full Body C — Lower Emphasis

### Superset Structure
Each workout contains 3 supersets:
- **Superset format**: Exercise A → <15sec transition → Exercise B → 60-90sec rest → repeat
- **Purpose**: Achieve 30% time savings vs traditional training (7.5min vs 10.5min for same work)

## Examples Included

### 1. Monday (Day 1) — Full Body A: Push Emphasis
**File ID**: `time-constrained-w1-monday`

**Workout Structure**:
- **Superset 1**: Goblet Squat 3×10-12 + Push-ups 3×8-12
- **Superset 2**: Dumbbell RDL 3×10-12 + Dumbbell Shoulder Press 3×8-10
- **Superset 3**: Dumbbell Row 3×10/arm + Plank 3×30-45sec
- **Optional Finisher**: 8 rounds × 20sec hard row, 40sec easy (5min total)

**Key Features**:
- Introduction to superset pacing
- Movement quality baseline establishment
- Transition time tracking (<15sec goal)
- Moderate loads for learning (60-65%, RPE 6-7)

**Educational Focus**:
- How to transition efficiently between exercises
- When to extend rest if gasping for air or form breaks down
- Importance of tracking transition times and loads for future progression

---

### 2. Wednesday (Day 3) — Full Body B: Pull Emphasis
**File ID**: `time-constrained-w1-wednesday`

**Workout Structure**:
- **Superset 1**: Barbell Deadlift 3×8-10 + Pull-ups or Lat Pulldown 3×6-10
- **Superset 2**: Goblet Squat 3×10-12 + Dumbbell Bench Press 3×8-10
- **Superset 3**: Dumbbell RDL 3×10-12 + Dumbbell Curls 3×10-12
- **Optional Finisher**: 5 rounds × 1min jump rope, 30sec rest (7.5min total)

**Key Features**:
- Introduction of barbell work (deadlift)
- Pull-ups or lat pulldown (vertical pulling pattern)
- Lighter deadlift loads than traditional programming (focus on bar speed and form)
- Comparison to Day 1 pacing (are transitions improving?)

**Progression Check**:
- May increase goblet squat load slightly if Day 1 felt too easy (RPE 6 → RPE 6-7)
- Transition efficiency should be improving

---

### 3. Friday (Day 5) — Full Body C: Lower Emphasis
**File ID**: `time-constrained-w1-friday`

**Workout Structure**:
- **Superset 1**: Front Squat or Goblet Squat 3×8-10 + Dumbbell Bench Press 3×8-10
- **Superset 2**: Barbell RDL 3×10-12 + Dumbbell Row (bent-over, both arms) 3×10/arm
- **Superset 3**: Walking Lunges 3×10/leg + Dumbbell Overhead Press 3×8-10
- **Optional Finisher**: 6 hill sprints × 10-15sec, walk back down (5min total)

**Key Features**:
- Lower body emphasis (front squat, barbell RDL, walking lunges)
- Barbell RDL allows heavier load than dumbbell RDL (natural progression)
- Introduction of unilateral work (walking lunges—balance and stability)
- Week 1 completion milestone

**Week 1 Reflection**:
- Did you hit all 3 sessions?
- How did pacing feel (60-90sec rest between supersets)?
- Were transitions smooth (<15sec within supersets)?
- Any soreness (normal, should be manageable)?

---

## Format Compliance

All examples follow `WorkoutStructureLLMSchema`:
- ✅ `structuredWorkout` field (not `workout`)
- ✅ Omits `id`, `exerciseId`, `nameRaw`, `resolution` fields
- ✅ Uses `intensity` object with `type`, `value`, `description`
- ✅ Includes `supersetId` field (e.g., "S1", "S2", "S3", "" for non-supersets)
- ✅ Optional fields handled correctly (empty strings for unused fields like `distance`, `duration`)

### Superset Tagging
- Exercises in the same superset share a `supersetId` (e.g., "S1")
- Non-superset exercises (warm-up, cooldown, optional finishers) use `supersetId: ""`
- Consistent tagging allows UI to display supersets visually grouped

## Time-Constrained Program Features

### Session Time Breakdown
- **Warm-up**: 5-10min
- **Main Supersets**: 20-25min (3 supersets × 3 sets × ~2.5min per superset round)
- **Cooldown**: 5min
- **Total**: 30-35min (or 35-40min with optional finisher)

### Time Efficiency Mechanisms
1. **Supersets**: 30% time savings (eliminates inter-set rest for antagonist/non-competing movements)
2. **Short Rest Periods**: 60-90sec between supersets (vs 2-3min in traditional training)
3. **Fast Transitions**: <15sec between superset exercises (deliberate movement, no dawdling)
4. **Compound Movements**: Multi-joint exercises (more work per movement)

### Flexible Scheduling
- **Recommended**: Mon/Wed/Fri (non-consecutive days)
- **Flexible**: Any 3 non-consecutive days (e.g., Tue/Thu/Sat, Wed/Fri/Sun)
- **Downgrade Option**: If life gets busy, can do 2 sessions/week (Day 1 + Day 3, skip Day 5)
- **Philosophy**: "Consistency over perfection"—missing 1 session doesn't derail progress

## Week 1 Progression Expectations

### Physical Adaptations
- **Cardiovascular**: Will feel more cardiovascular fatigue than muscular fatigue initially
- **Work Capacity**: Body adapts to short rest periods by Week 2
- **Movement Quality**: Form should improve across 3 sessions as you practice patterns

### Load Management
- **Week 1**: Establish baseline (track all loads and reps)
- **Week 2**: Slight increases if Week 1 felt RPE 6 (too easy)
- **Weeks 3-6**: Progressive Overload Phase (70-75% loads, RPE 7-8, add 5-10lbs or 1-2 reps per week)

### Metrics to Track
1. **Loads Used**: Weight for each exercise (baseline for future progression)
2. **Reps Completed**: Did you hit prescribed rep ranges?
3. **RPE Per Set**: Was it actually RPE 6-7, or higher/lower?
4. **Transition Times**: Are you achieving <15sec transitions?
5. **Session Duration**: Are sessions staying 30-35min, or creeping longer?

## Usage

### For Agent Training/Evaluation
- Use as reference for `workout:generate` agent output quality
- Validate schema compliance
- Check superset structure and tagging
- Assess detail level in exercise notes

### For Database Seeding
- Seed structured workout examples for time-constrained plans
- Demonstrate Foundation Phase programming
- Show superset-based time efficiency

### For Development
- Test workout rendering UI (superset grouping)
- Validate `WorkoutStructureLLMSchema` parsing
- Check REST period handling between supersets

## Related Files

### Time-Constrained Plan Files
- **Plan Structure**: `examples/plan-structured-time-constrained-example.json` (8-week plan overview)
- **Microcycle Structure**: `examples/microcycle-time-constrained-weeks-1-4-6.json` (Weeks 1, 4, 6 detailed microcycles)
- **Microcycle Messages**: `examples/microcycle-message-time-constrained-weeks-1-4-6.json` (SMS weekly previews)

### Other Week 1 Examples
- **Beginner Week 1**: `examples/workout-generate-beginner-w1-examples.json` (3 days/week full body, form mastery)
- **Intermediate Week 1**: `examples/workout-generate-intermediate-w1-examples.json` (6 days/week PPL, accumulation phase)
- **Advanced Week 2**: `examples/workout-generate-advanced-w2-examples.json` (4 days/week powerlifting, accumulation phase)

### Documentation
- **MESSAGE_FORMAT.md**: SMS message format standard (for workout:message examples)
- **WorkoutStructureLLMSchema**: `packages/shared/src/shared/types/workout/workoutStructure.ts`

## Key Design Decisions

### Superset Pairings
- **Antagonist Pairs**: Push + Pull (e.g., push-ups + rows) → allows one muscle to recover while other works
- **Non-Competing Pairs**: Upper + Lower (e.g., deadlift + pull-ups) → minimal interference
- **Core as Finisher**: Plank at end of Superset 3 (core work doesn't interfere with main lifts)

### Exercise Selection Rationale
- **Dumbbells First**: Week 1 emphasizes dumbbells (easier for beginners, safer to learn with)
- **Barbell Introduction**: Deadlift on Day 3, RDL on Day 5 (progressive complexity)
- **Bodyweight Options**: Push-ups, pull-ups, planks (scalable for all levels)

### RPE Calibration Language
- **"Leave 3-4 reps in reserve"**: Clear RPE 6-7 guidance (not "moderately hard" which is vague)
- **"If you're gasping for air, extend rest"**: Auto-regulation built into instructions
- **"If bar speed slows, reduce load"**: Bar speed monitoring for load appropriateness

### Educational Tone
- **Week 1 = Learning**: Focus on "how to superset" not "lift as heavy as possible"
- **Reflection Prompts**: End-of-session questions (How did pacing feel? Were transitions smooth?)
- **Progression Guidance**: Clear criteria for when to add weight Week 2 (if RPE 6, increase; if RPE 7-8, maintain)

### Optional Finisher Philosophy
- **True Optional**: Explicitly stated "only add if time/energy allows"
- **No Guilt**: "The main supersets are the priority, finishers are optional"
- **5min Cap**: Never exceed 5min (keeps total session <40min)

## Progression Path

### Within Week 1
- **Day 1**: Learn superset technique, establish baseline
- **Day 3**: Refine transitions, introduce barbell work
- **Day 5**: Confidence in pacing, complete Week 1 milestone

### Week 1 → Week 2
- If RPE was 6 (too easy): Add 5-10lbs to compounds, or 1-2 reps to accessories
- If RPE was 7-8 (appropriate): Maintain loads, focus on refining transitions
- If RPE was 8.5+ (too hard): Reduce loads by 5-10%

### Week 2 → Week 3 (Phase Transition)
- **Foundation → Progressive Overload**: Loads increase to 70-75% (RPE 7-8)
- Session times extend to 35-40min (more volume, same superset structure)
- Cardio finishers become more challenging (longer duration or higher intensity)

---

## File Stats
- **File Size**: ~37KB
- **Workouts**: 3 (Monday, Wednesday, Friday)
- **Total Exercises**: 33 (including warm-up, cooldown, finishers)
- **Supersets**: 9 (3 per workout)
- **Warm-up Movements**: 6 (2 per workout)
- **Main Exercises**: 18 (6 per workout—9 sets per session)
- **Optional Finishers**: 3 (1 per workout, 5min each)
- **Cooldown**: 3 (1 per workout, 5min each)

## Notes
- All workouts are full-body (train all major movement patterns each session)
- Each major muscle group trained 3x/week (Mon/Wed/Fri)
- Superset structure remains consistent across all 8 weeks (only loads/volume change)
- Week 1 establishes the habit: 3 focused sessions, ~100min total commitment per week
