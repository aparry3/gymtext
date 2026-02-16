# Plan:Structured Example: Time-Constrained

Structured (parsed) version of a Time-Efficient Strength & Conditioning plan, demonstrating how `plan:structured` agent should parse text-based time-constrained plans.

## Purpose

This example shows:
- **How to structure efficient programming** for busy professionals
- **Superset and circuit integration** in plan structure
- **Flexible scheduling guidance** (any 3 non-consecutive days)
- **Time commitment transparency** (30-45 min sessions explicitly stated)
- **Progressive overload within time constraints** (density training, not volume training)

## Plan Overview

**Name:** Time-Efficient Strength & Conditioning  
**Duration:** 8 weeks (shorter than beginner's 12, intermediate's 16)  
**Frequency:** 3 days/week (Mon/Wed/Fri or any 3 non-consecutive days)  
**Session Time:** 30-45 minutes (excluding optional cardio finishers)  
**Split:** Full Body (most efficient for limited frequency)  
**Target Audience:** Busy professionals, parents, students—anyone with limited time but committed to training

## Key Differentiators

### 1. Time Efficiency as Primary Constraint

**Session time explicitly stated:**
- Foundation (Weeks 1-2): 30-35 minutes
- Progressive Overload (Weeks 3-6): 35-40 minutes
- Peak & Reassess (Weeks 7-8): 30-40 minutes (Week 8 deload even shorter)

**Comparison to other plans:**
- Beginner: 45-60 min sessions
- Intermediate: 65-75 min sessions
- Advanced: 70-90 min sessions
- **Time-Constrained: 30-45 min sessions** (33-50% shorter than advanced)

### 2. Superset Structure

**Weekly structure describes supersets explicitly:**

**Day 1 (Push Emphasis):**
- Superset 1: Squat + Push-ups
- Superset 2: Deadlift + Dumbbell Shoulder Press
- Superset 3: Dumbbell Row + Plank

**Why supersets?**
- Maximize exercise density (more work per minute)
- Maintain heart rate (cardiovascular benefit without separate cardio)
- Minimize rest (60-90sec between supersets, <15sec transition within)
- Antagonist pairing (push/pull) allows one muscle to recover while other works

### 3. Flexible Scheduling

**Explicitly addressed in multiple sections:**

**weeklyStructure.restDays:**
> "At least 1 day between training sessions. Recommended: Mon/Wed/Fri or Tue/Thu/Sat. Rest days: light walking, mobility work, or complete rest."

**flexibilityNotes:**
> "If you miss a session, don't double up the next day—just continue the sequence. If you can only train 2x/week, alternate Day 1 and Day 3 each week. The key is consistency over perfection."

**Comparison:**
- Beginner: Fixed Mon/Wed/Fri
- Intermediate: Fixed 6-day PPL (Mon-Sat)
- Advanced: Fixed 4-day Upper/Lower (Mon/Tue/Thu/Sat)
- **Time-Constrained: Flexible any 3 non-consecutive days**

### 4. Optional Cardio Finishers

**Dedicated section with multiple options:**

```json
"cardioFinishers": {
  "description": "Optional 5-10 minute high-intensity finishers...",
  "options": [
    "Row intervals: 8 rounds of 20sec hard, 40sec easy",
    "Assault bike: 10 rounds of 15sec sprint, 45sec easy",
    "Jump rope: 5 rounds of 1min on, 30sec off",
    "Hill sprints: 6-8 sprints of 10-15sec, walk back down",
    "Farmer carries: 4 rounds of 40-50 yards",
    "Burpees: 5 rounds of 10 burpees, rest 30sec"
  ]
}
```

**Why optional?**
- Time-constrained users may not have extra 10 min
- Energy levels vary (skip if fatigued)
- Allows customization (add if you have time/energy, skip if not)

### 5. Realistic Expectations

**expectedOutcomes section:**
> "After 8 weeks: strength increase of 10-20% on main lifts, improved work capacity, better cardiovascular conditioning from finishers, visible muscle definition from density training. Most users report feeling more energized and less stressed despite busy schedules—short, intense workouts are mentally manageable and produce endorphin release without excessive fatigue."

**Comparison:**
- Beginner: "Build foundation, learn movements, expect initial strength gains"
- Intermediate: "Significant muscle growth, 15-20 lbs muscle gain potential over 16 weeks"
- Advanced: "Compete in powerlifting meet, hit PRs on platform"
- **Time-Constrained: "10-20% strength gains, improved energy/stress despite busy schedule"**

## Plan Structure

### Phases (3 total)

#### Phase 1: Foundation (Weeks 1-2)
- **Focus:** Learn superset technique, establish baseline, build work capacity
- **Intensity:** 60-65% estimated 1RM, RPE 6-7
- **Volume:** 3 supersets per session, 3 sets each = 9 total sets
- **Rest:** 60-90sec between supersets
- **Session time:** 30-35 min
- **Goal:** Master transitions (<15sec between exercises), maintain movement quality with short rest

#### Phase 2: Progressive Overload (Weeks 3-6)
- **Focus:** Increase load and volume systematically
- **Intensity:** 70-75% estimated 1RM, RPE 7-8
- **Volume:** 3-4 supersets per session (advanced trainees add 4th)
- **Rest:** 60-90sec between supersets (maintained)
- **Session time:** 35-40 min
- **Progression:** Add 5-10lbs to compounds or add 1-2 reps per set each week

#### Phase 3: Peak & Reassess (Weeks 7-8)
- **Week 7 (Peak):**
  - Intensity: 75-80% estimated 1RM, RPE 8-9
  - Volume: Maintained from Weeks 5-6
  - Goal: Test strength gains
- **Week 8 (Deload):**
  - Volume: 40% reduction (3 sets → 2 sets)
  - Intensity: 60-70% of Week 7 loads, RPE 6-7
  - Rest: 90-120sec (extended)
  - No cardio finishers
  - Goal: Active recovery, assess progress, plan next block

### Weekly Structure

**Split:** Full Body (3 variations rotating)

**Day 1 (Push Emphasis):**
- Superset 1: Squat + Push-ups
- Superset 2: Deadlift + Dumbbell Shoulder Press
- Superset 3: Dumbbell Row + Plank

**Day 2 (Pull Emphasis):**
- Superset 1: Deadlift + Pull-ups/Lat Pulldown
- Superset 2: Goblet Squat + Dumbbell Bench Press
- Superset 3: Dumbbell RDL + Dumbbell Curls

**Day 3 (Lower Emphasis):**
- Superset 1: Front Squat/Goblet Squat + Dumbbell Bench Press
- Superset 2: Barbell RDL + Pull-ups/Rows
- Superset 3: Walking Lunges + Dumbbell Overhead Press

**Rationale:**
- Each day hits all major movement patterns (squat, hinge, push, pull)
- Emphasis rotates (push/pull/lower) for variety
- Full body allows 3x/week frequency (each muscle hit 3x)
- Supersets pair non-competing movements (squat + upper push, hinge + upper pull)

### Progression Rules

**Phase-specific progression:**

**Foundation (Weeks 1-2):**
> "Focus on movement quality and pacing. If all sets feel RPE 6-7 (leave 3-4 reps in reserve) and you maintain <90sec rest between supersets, weights are appropriate. Track transition time—goal is <15sec between exercises in a superset."

**Progressive Overload (Weeks 3-6):**
> "Add weight when you complete all prescribed reps at RPE 7-8. For main compounds: add 5-10lbs per week if RPE allows. For accessories: add 2.5-5lbs or add 1-2 reps per set. If you fail to complete reps for 2 consecutive sessions, reduce weight by 10% and rebuild."

**Peak & Reassess (Weeks 7-8):**
> "Week 7: Push intensity to RPE 8-9, test what you can handle. Week 8 deload: reduce volume by 40%, use 60-70% of Week 7 loads, RPE 6-7 max. Assess progress: compare Week 1 weights to Week 7 weights."

### Deload Strategy

**Week 8 scheduled deload:**
- Volume: 40% reduction (3 sets → 2 sets per superset)
- Intensity: 60-70% of Week 7 working weights
- RPE: 6-7 maximum (leave 3-4 reps in reserve)
- Rest: 90-120sec between supersets (extended from 60-90sec)
- Cardio finishers: NONE during deload
- Recovery focus: Sleep 7-8 hours, maintenance calories, light mobility

**Comparison to other deload strategies:**
- Beginner: No explicit deload (linear progression throughout)
- Intermediate: 50% volume reduction, 70-80% loads (Weeks 7-8, 15-16)
- Advanced: Scheduled every 4th week during accumulation, then Wave 4 (Week 8)
- **Time-Constrained: 40% volume reduction, 60-70% loads, Week 8 only**

## Safety Notes

**Explicitly addresses superset safety:**

1. "Supersets are demanding—ensure proper warm-up (5-10min light cardio + dynamic stretching before first superset)"
2. "Rest periods are short (60-90sec)—if form breaks down significantly, extend rest to 2min or reduce weight"
3. "Cardio finishers are optional—only add if you have energy and time. Skip if fatigued."
4. "If training 3x/week is too much, reduce to 2x/week (Day 1 and Day 3) until work capacity improves"
5. "Listen to your body—if consistently exhausted or sleep-deprived, skip cardio finishers or take an extra rest day"

**Focus on sustainability:**
- Acknowledges busy lifestyle constraints
- Provides downgrade options (3x → 2x/week)
- Emphasizes "consistency over perfection"

## Nutrition Guidance

**Tailored to time-constrained lifestyle:**

> "Time-constrained training is metabolically demanding. Eat at maintenance calories or slight surplus (200-300 cal above maintenance). Prioritize protein (0.8-1g per lb bodyweight). Pre-workout: light meal 1-2hr before (carbs + protein, e.g., banana + Greek yogurt). Post-workout: protein shake or meal within 1-2hr. Hydrate throughout the day—half your bodyweight in oz of water minimum."

**Practical examples:**
- Pre-workout: Banana + Greek yogurt (easy to prepare, portable)
- Post-workout: Protein shake (quick, no cooking required)
- Hydration: Specific target (half bodyweight in oz)

**Comparison:**
- Beginner: General guidance (eat whole foods, protein, hydration)
- Intermediate: Calorie surplus for hypertrophy, macros specified
- Advanced: Precise nutrition for competition prep, weight class considerations
- **Time-Constrained: Practical, quick-prep meal examples for busy people**

## Schema Compliance

All fields follow `PlanStructureSchema`:

### ✅ Required Fields
- `name`: "Time-Efficient Strength & Conditioning"
- `description`: Multi-sentence overview with time commitment stated
- `durationWeeks`: 8 (shorter than other plans)
- `frequency`: "3 days per week" (with flexibility noted)
- `experienceLevel`: "beginner-intermediate"
- `goals`: 4 goals listed (strength, conditioning, work capacity, muscle maintenance)
- `equipment`: Basic gym equipment (barbell, dumbbells, pull-up bar, bench)

### ✅ Phases Array
- 3 phases: Foundation (1-2), Progressive Overload (3-6), Peak & Reassess (7-8)
- Each phase: name, weeks, focus, description

### ✅ Weekly Structure
- `split`: "Full Body"
- `trainingDays`: 3 days with exercises and duration
- `restDays`: Explicit guidance on scheduling

### ✅ Progression Rules
- Phase-specific rules (3 total)
- Concrete guidance (add 5-10lbs, track transition time)

### ✅ Additional Sections
- `deloadStrategy`: Week 8 explicit deload
- `safetyNotes`: 5 specific notes about supersets, fatigue, flexibility
- `nutritionGuidance`: Practical meal examples
- `cardioFinishers`: Optional 5-10 min finisher options
- `flexibilityNotes`: How to handle missed sessions, 2x/week option
- `expectedOutcomes`: Realistic 8-week expectations
- `nextSteps`: 4 options for progression after completion

## Use Cases

### 1. Agent Training
- **Teach `plan:structured` to handle time-constrained programming**
- **Learn superset structure parsing** (exercise pairings)
- **Flexible scheduling representation** (any 3 non-consecutive days)
- **Optional component handling** (cardio finishers)

### 2. Agent Evaluation
Compare generated time-constrained plans against this benchmark:
- ✅ Session time explicitly stated (30-45 min)
- ✅ Superset structure described in weekly breakdown
- ✅ Flexible scheduling guidance provided
- ✅ Optional components clearly marked
- ✅ Realistic expectations for limited time commitment
- ✅ Practical nutrition examples (quick-prep meals)

### 3. Database Seeding
- Seed time-efficient plan templates
- Provide reference for busy professional audience segment
- Test UI with superset display and flexible scheduling

### 4. User Matching
- Match users who indicate time constraints (e.g., "I can only train 30-40 min")
- Recommend this plan type when user selects "3 days/week" and "minimal time"
- Alternative to traditional beginner plans for time-limited users

## Quality Standards

This time-constrained plan meets all standards:

### ✅ Time Transparency
- Session duration stated for each phase
- Total weekly time commitment clear (90-120 min/week excluding finishers)
- Comparison to traditional plans (50% shorter sessions)

### ✅ Efficiency Focus
- Supersets maximize exercise density
- Rest periods tight but sustainable (60-90sec)
- Compound movements prioritized (multi-joint, time-efficient)
- Optional finishers don't extend required session time

### ✅ Flexibility Integration
- Scheduling options explicit (Mon/Wed/Fri or any 3 days)
- Downgrade path provided (3x → 2x/week if needed)
- Missed session guidance ("don't double up, just continue sequence")

### ✅ Sustainability Emphasis
- "Consistency over perfection" philosophy
- Acknowledges real-life constraints (fatigue, sleep deprivation, busy schedule)
- Provides permission to skip optional components

### ✅ Realistic Outcomes
- 10-20% strength gains (modest but achievable)
- Focus on energy/stress improvement (quality of life, not just performance)
- Acknowledges mental benefits ("short intense workouts are mentally manageable")

## Design Decisions

### Why 8 Weeks (not 12 or 16)?

**Time-constrained users benefit from shorter blocks:**
- Easier to commit ("just 8 weeks" more psychologically manageable than 16)
- Allows frequent reassessment (every 2 months, adjust based on life changes)
- Prevents plateau (density training loses effectiveness after 8-10 weeks)

### Why Full Body (not Upper/Lower or PPL)?

**Full body is most efficient for 3x/week:**
- Each muscle hit 3x/week (vs 1-2x with split)
- Every session productive (no "arm day"—all sessions are full-body compound work)
- Better for busy schedules (miss one session = still hit each muscle 2x that week)

### Why Supersets (not Straight Sets)?

**Supersets maximize time efficiency:**
- 2 exercises in time of 1 (with similar total rest)
- Maintains heart rate (cardiovascular benefit without separate cardio)
- Antagonist pairing (push/pull) allows recovery without waiting

**Example:**
- Traditional: Squat 3 sets (rest 2min) = 6 min, then Push-ups 3 sets (rest 90sec) = 4.5 min → **10.5 min total**
- Superset: Squat + Push-ups alternating, rest 90sec between = **7.5 min total** (30% time savings)

### Why Optional Cardio Finishers?

**Acknowledges variable time availability:**
- Some days: extra 10 min available → add finisher for conditioning
- Other days: strict 30-40 min limit → skip finisher, still got strength work done
- Provides choice (empowerment, not obligation)

### Why Week 8 Deload (not Week 4)?

**8-week blocks match busy professional reality:**
- Aligns with calendar (every 2 months, easy to plan around)
- Most lifters can sustain density training for 7 weeks before fatigue accumulates
- Week 8 deload provides reset before starting next block

## Related Documentation

- **Beginner Plan:** [plan-structured-beginner-example.json](./plan-structured-beginner-example.json) — 12 weeks, 3 days/week, linear progression, 45-60 min sessions
- **Intermediate Plan:** [plan-structured-intermediate-example.json](./plan-structured-intermediate-example.json) — 16 weeks, 6 days/week, block periodization, 65-75 min sessions
- **Advanced Plan:** [plan-structured-advanced-example.json](./plan-structured-advanced-example.json) — 12 weeks, 4 days/week, wave loading + peaking, 70-90 min sessions

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Plan Type:** Time-Constrained (Efficiency-Focused)  
**Target Audience:** Busy professionals, parents, students  
**Duration:** 8 weeks  
**Frequency:** 3 days/week (flexible scheduling)  
**Session Time:** 30-45 minutes  
**Schema:** `PlanStructureSchema` compliant  
**Total:** ~8KB demonstrating time-efficient programming structure
