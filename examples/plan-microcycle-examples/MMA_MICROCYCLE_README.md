# MMA Microcycle Generate Examples

## Purpose

Reference examples demonstrating the `microcycle:generate` agent output for **MMA (Mixed Martial Arts) fight camp** programming across three critical weeks representing different training phases.

These examples show how microcycle content should adapt based on:
- Training phase (Base Building → Fight-Specific Prep → Peak)
- Week number within the camp
- Integration with technical MMA training
- Progression of intensity, volume, and specificity

## Overview

**Sport:** MMA Fight Camp (8-week program)  
**Examples Included:** Weeks 1, 4, and 7  
**Format:** JSON array with `weekNumber`, `phase`, `overview`, and 7-day `days` array

### Three-Phase Structure

| Week | Phase | Focus | S&C Characteristics |
|------|-------|-------|---------------------|
| **1** | Base Building | Aerobic base + foundational strength | 70-75% 1RM, 4 sets, Zone 2 cardio, moderate technical volume |
| **4** | Fight-Specific Preparation | Explosive power + anaerobic capacity | 85-90% 1RM, 3 sets, 5min rounds, alactic sprints, peak technical volume |
| **7** | Final Peak | Neural sharpness + conditioning peak | 87-92% 1RM, 2 sets, max alactic volume, final hard sparring |

## File Structure

```json
[
  {
    "name": "MMA Fight Camp — Week 1 (Base Building)",
    "weekNumber": 1,
    "phase": "Base Building",
    "overview": "2-3 paragraph summary of week's goals, training philosophy, and key focus areas",
    "days": [
      "Day 1 content (Monday): Detailed session breakdown...",
      "Day 2 content (Tuesday): MMA training day...",
      // ... 7 days total
    ]
  }
  // ... additional weeks
]
```

### Overview Field

The `overview` provides:
- **Week's primary goal** (aerobic base, power development, peak conditioning)
- **Training philosophy** for this phase (progression logic, fatigue management)
- **S&C prescription changes** from previous weeks (load, volume, intensity)
- **Conditioning focus** (Zone 2 aerobic, 5min rounds, alactic sprints)
- **Technical training integration** (volume, sparring intensity)
- **Auto-regulation guidance** (when to scale back, recovery priorities)

Example (Week 4):
> "Week 4 marks the transition into fight-specific preparation. Strength work shifts toward explosive power development—loads increase slightly (85-90% 1RM) but volume decreases (3 sets vs 4) to manage fatigue..."

### Days Array (7 elements)

Each day contains:

#### S&C Training Days (Mon/Wed/Fri)
- **Session title** (e.g., "Lower Body Power + Alactic Conditioning (60min)")
- **Warm-up** (5min, specific drills)
- **Main work** structured by exercise:
  - Sets × Reps @ Intensity
  - Tempo or intent cues
  - Rest periods
- **Conditioning block** (alactic sprints, fight simulation rounds)
- **Cool-down** (stretching, breathwork)
- **MMA Integration note** (when to schedule, what to avoid)

Example (Week 1, Monday):
> "**Lower Body Power + Alactic Conditioning (60min)**
> 
> Start the week fresh with explosive lower body work. Begin with 5min dynamic warm-up... Neural activation: 3 sets × 3 reps Trap Bar Jumps—focus on maximal intent... Main strength: 4 sets × 6-8 reps Safety Bar Squat @ 70-75% 1RM..."

#### MMA Training Days (Tue/Thu/Sat)
- **Session focus** (striking, grappling, sparring, conditioning)
- **Why no S&C** (recovery rationale)
- **Technical training structure** (drilling, rounds, intensity)
- **Conditioning work** (if applicable: 5min rounds, anaerobic intervals)
- **Recovery guidance** (foam rolling, hydration, sleep targets)

Example (Week 1, Tuesday):
> "**MMA Training Day — Striking Technical**
> 
> Focus on striking technique, pad work, and drilling. No S&C session today—allow yesterday's lower body work to recover..."

#### Rest Day (Sunday)
- **Complete rest** or **active recovery** options
- **Recovery protocols** (sauna, massage, stretching)
- **Nutrition guidance** (protein targets, hydration)
- **Mental preparation** (visualization, opponent study)
- **Sleep targets** (8-9 hours)
- **Week review** (what to assess, adjustments for next week)

Example (Week 7, Sunday):
> "**Complete Rest — Mental & Physical Recovery**
> 
> This week you hit: Heaviest loads of camp (90% 1RM), Peak alactic volume (12 rounds sprints)... Your body and mind need recovery before the taper..."

## Progression Across Weeks

### Strength Work Evolution

| Week | Load | Volume | Progression |
|------|------|--------|-------------|
| 1 | 70-75% | 4 sets × 6-8 reps | Building base strength |
| 4 | 85-90% | 3 sets × 3 reps | Explosive power transfer |
| 7 | 87-92% | 2 sets × 3 reps | Neural maintenance, sharpness |

**Rationale:** Volume decreases as intensity increases. Week 7 maintains strength with minimal volume to avoid excessive fatigue before taper.

### Conditioning Evolution

| Week | Focus | Volume | Prescription |
|------|-------|--------|--------------|
| 1 | Aerobic base | 6 rounds × 10sec sprint / 50sec rest | Alactic power, mitochondrial density |
| 4 | Anaerobic capacity | 5 rounds × 5min (30sec hard / 30sec moderate) | Fight-specific round structure |
| 7 | Conditioning peak | 12 rounds × 10sec sprint (alactic), 5×5min fight simulation | Peak volume before taper |

**Rationale:** Week 1 builds aerobic base. Week 4 shifts to fight-specific anaerobic work. Week 7 peaks both systems.

### Technical Training Volume

| Week | MMA Sessions | Sparring Intensity | Notes |
|------|-------------|-------------------|-------|
| 1 | 4-5 sessions | Light (no hard sparring) | Moderate volume, focus on physical development |
| 4 | 6 sessions | Moderate-high (70-80%) | Peak technical volume, first full 5min rounds |
| 7 | 6 sessions | High (final hard sparring) | Last hard sparring before taper |

**Rationale:** Technical volume peaks in Weeks 4-7. Week 7 includes final hard sparring before Week 8 taper.

## Key Design Features

### 1. Multi-Modal Integration

**Unlike pure strength programs:**
- S&C sessions are **scheduled around technical training** (not vice versa)
- Sparring days have **NO heavy S&C** (recovery priority)
- Strength days **avoid pairing with hard sparring** (injury prevention)

**Example:** Week 4, Thursday is sparring day—NO S&C session scheduled:
> "Thursday is primary sparring day. NO S&C session—full focus on technical performance and fight sharpness..."

### 2. Energy System Periodization

**Three energy systems targeted:**

- **Aerobic (Week 1 emphasis):** Zone 2 cardio, mitochondrial density, recovery capacity
- **Anaerobic (Week 4 emphasis):** 5min round structure, sustain high output
- **Alactic (Week 7 peak):** 10sec max sprints, explosive bursts for takedowns and knockouts

**Progression:** Build aerobic base → shift to fight-specific anaerobic + alactic → peak all systems

### 3. Auto-Regulation Guidance

**Every week includes recovery triggers:**
- Morning resting heart rate elevation (10+ bpm above baseline)
- Excessive soreness or joint pain
- Sleep disruption
- Technical training volume spikes

**Example:** Week 7, Monday:
> "If bar speed is slow, you're too fatigued—reduce to 87%"

**Example:** Week 4, Overview:
> "If morning resting heart rate is elevated or soreness is excessive, scale back S&C volume"

### 4. MMA Integration Notes

**Every S&C day includes integration guidance:**
- **When to schedule** (after light technical, on grappling-light day)
- **What to avoid** (hard sparring, heavy takedown drilling)
- **AM/PM split options** (S&C AM, technical PM)

**Example:** Week 1, Wednesday:
> "**MMA Integration:** Pair with striking-focused MMA session (technical, not hard sparring). Morning S&C, evening technique is ideal."

### 5. Fight-Specific Conditioning Structure

**5min round intervals** (introduced Week 4, peaks Week 7):
- Matches UFC round structure (3×5min or 5×5min)
- Work-to-rest ratio: 30sec hard / 30sec moderate
- Rotating modalities (Assault Bike, KB Swings, Burpees, Battle Ropes)

**Example:** Week 7, Friday:
> "**Fight Simulation Conditioning (PEAK VOLUME):** 5 rounds × 5min work / 1min rest... This is the highest conditioning volume of camp—matches championship fight duration (5×5min)."

### 6. Recovery & Mental Preparation

**Sunday (Rest Day) includes:**
- Physical recovery protocols (sauna, massage, ice bath)
- Nutritional guidance (protein targets, hydration, anti-inflammatory foods)
- Mental preparation (visualization, opponent study, fight-week routine practice)
- Sleep targets (8-9 hours, or 9-10 hours during peak weeks)
- Week review prompts (assess soreness, technical sharpness, adjust next week)

**Example:** Week 7, Sunday:
> "**Mental preparation:** Visualize the fight, review game plan, watch opponent footage, practice mental cues for managing adrenaline"

## Comparison to Other Microcycle Examples

### MMA vs Beginner (General Fitness)

| Feature | Beginner | MMA |
|---------|----------|-----|
| **Training days/week** | 3 | 6 (3 S&C + 3-6 technical) |
| **Language** | Simple, everyday terms | Technical but accessible (RPE, 1RM, energy systems) |
| **Conditioning** | Optional "easy cardio" | Core component (3 energy systems periodized) |
| **External training** | None | MMA technical training 4-6x/week |
| **Auto-regulation** | Basic (form breakdown triggers) | Advanced (HR, soreness, technical volume, sparring damage) |
| **Progression** | Linear (add weight when form is clean) | Block periodization (strength → power → peak) |
| **Deload** | Every 4th week | No scheduled deload (Week 8 taper serves this role) |

### MMA vs Intermediate (Hypertrophy)

| Feature | Intermediate | MMA |
|---------|--------------|-----|
| **Goal** | Muscle growth | Explosive power + conditioning + fight readiness |
| **Volume** | 14-20 sets/muscle/week | 2-4 sets/lift (minimal volume, maximal intent) |
| **Intensity** | RPE 7-9 (train close to failure) | Explosive intent (zero grind, bar speed matters) |
| **Conditioning** | Optional Zone 2 cardio | Essential (alactic sprints, 5min rounds) |
| **Periodization** | Volume accumulation → intensification | Strength → power transfer → peak |
| **Rest days** | 1 day/week | 1 day/week (but 3 days are MMA-only, not S&C rest) |

### MMA vs Advanced (Powerlifting)

| Feature | Powerlifting | MMA |
|---------|--------------|-----|
| **Primary goal** | Max strength (squat/bench/deadlift) | Fight readiness (power, conditioning, skill) |
| **Competition lifts** | Squat, bench, deadlift | No single lifts (all movements support fight performance) |
| **Conditioning** | Eliminated during peak | Core component through entire camp |
| **External activity** | None (S&C is only training) | Technical MMA training 4-6x/week |
| **Peak timing** | Week 12 (meet day) | Week 7 (final hard week before taper) |
| **Taper** | 1 week (openers only) | 1 week (70-80% volume reduction) |

## Use Cases

### 1. Agent Training

**Fine-tune `microcycle:generate` agent on:**
- Multi-modal integration (S&C + technical training scheduling)
- Energy system periodization (aerobic → anaerobic/alactic progression)
- Auto-regulation specificity (recovery triggers appropriate for MMA)
- Phase-appropriate progression (base → fight-specific → peak)

**Dataset characteristics:**
- 3 microcycles covering 8-week fight camp
- Each week reflects different training phase
- Detailed S&C prescriptions (sets, reps, load, rest, tempo, intent)
- MMA integration notes for every S&C day
- Conditioning prescription that evolves across camp

### 2. Agent Evaluation

**Benchmark microcycle quality:**
- Does S&C schedule around technical training (not vice versa)?
- Are energy systems periodized correctly (aerobic base → fight-specific conditioning)?
- Is auto-regulation guidance specific and actionable (HR, soreness, sparring damage)?
- Do prescriptions match training phase (Week 1: 4 sets, Week 7: 2 sets)?
- Are MMA integration notes present and accurate?

**Comparison benchmarks:**
- MMA vs Beginner: Multi-modal vs standalone, technical language vs simple
- MMA vs Intermediate: Power focus vs hypertrophy, explosive intent vs failure training
- MMA vs Powerlifting: Conditioning essential vs eliminated, multi-goal vs single-goal

### 3. Database Seeding

**Seed production database with:**
- MMA-specific microcycle templates
- Fight camp periodization examples (Weeks 1, 4, 7)
- Energy system progression examples
- Multi-modal integration templates

### 4. UI Testing

**Test microcycle rendering:**
- Weekly overview display (2-3 paragraph summary)
- Daily breakdown display (7 days, S&C vs MMA vs Rest)
- MMA integration notes (callout boxes or highlighted sections)
- Progression indicators (Week 1 vs 4 vs 7 comparison)

### 5. User Onboarding

**Show prospective MMA athletes:**
- What a complete fight camp week looks like
- How S&C integrates with technical training (scheduling, recovery)
- Energy system development across camp (aerobic → anaerobic → alactic)
- Weekly structure (S&C days, MMA days, rest days)

## Related Files

### Microcycle Examples
- **Beginner, Intermediate, Advanced, Time-Constrained:** `examples/plan-microcycle-examples/plan-examples.json` (plan:generate examples, not microcycle:generate)
- **MMA Microcycles** (this file): `examples/plan-microcycle-examples/microcycle-mma-examples.json`

### Plan Examples
- **MMA Structured Plan:** `examples/plan-structured-mma-example.json` (8-week overview)
- **MMA Plan README:** `examples/PLAN_STRUCTURED_MMA_README.md` (detailed documentation)

### Schema & Types
- **Microcycle Model:** `packages/shared/src/server/models/microcycle.ts`
- **Microcycle Prompts:** `packages/shared/src/shared/utils/microcyclePrompts.ts`

## Key Design Decisions

### Why Weeks 1, 4, and 7 (vs consecutive weeks)?

**8-week fight camp has 3 distinct phases:**
- **Base Building (Weeks 1-3):** Aerobic base, foundational strength
- **Fight-Specific Prep (Weeks 4-6):** Explosive power, anaerobic capacity
- **Peak & Taper (Weeks 7-8):** Final hard week + taper

**Week 1** = Base Building example  
**Week 4** = Fight-Specific Prep example  
**Week 7** = Final Peak example

This gives agents exposure to all three training philosophies within a single fight camp.

### Why Include MMA Training Days (no S&C content)?

**MMA is multi-modal training:**
- S&C sessions are only part of the weekly training load
- Technical MMA training (4-6 sessions/week) influences S&C prescription
- Sparring days require NO heavy S&C (injury prevention, recovery)

**Including MMA days shows:**
- How S&C fits into total training volume
- When to schedule S&C (around sparring, not on sparring days)
- Recovery priorities (S&C serves technical training, not vice versa)

### Why Detailed S&C Prescriptions (sets, reps, load, tempo, rest)?

**MMA S&C requires precision:**
- Explosive intent matters (bar speed, zero grinding)
- Load must be appropriate for phase (70% Week 1, 90% Week 7)
- Rest periods differ by goal (2min strength, 3min power, 50sec alactic)
- Tempo influences training effect (explosive concentric vs controlled eccentric)

**Detailed prescriptions teach agents:**
- How to write actionable S&C content
- Phase-appropriate programming (base vs peak)
- Intensity techniques (explosive intent, tempo, rest manipulation)

### Why Auto-Regulation Guidance in Every Week?

**MMA training is inherently fatiguing:**
- Sparring causes CNS fatigue and potential damage
- Technical volume can spike unexpectedly (coach adds extra session)
- Concurrent training (S&C + technical) accumulates fatigue quickly

**Auto-regulation allows:**
- Scaling S&C based on technical training demands
- Injury prevention (reduce volume if soreness is excessive)
- Fight-readiness priority (arrive at sparring sharp, not fatigued)

**Example triggers:**
- Resting heart rate elevation
- Excessive soreness or joint pain
- Sleep disruption
- Unexpected technical volume increase

### Why Sunday Rest Day Includes Mental Preparation?

**MMA is as mental as physical:**
- Fight-week nerves must be managed (visualization practice)
- Opponent study informs game plan adjustments
- Mental cues for adrenaline management (breathwork, self-talk)

**Week 7 Sunday is critical:**
- Final week before taper
- Review game plan, opponent footage, fight-week routine
- Build mental confidence for fight night

**Including mental prep teaches agents:**
- MMA programming is holistic (physical + mental)
- Rest days serve multiple purposes (physical recovery + mental preparation)
- Fight camp is progressive mental preparation (Week 1: basics, Week 7: fight-specific visualization)

## File Stats

- **File Size:** ~22KB
- **Microcycles:** 3 (Weeks 1, 4, 7)
- **Total Days:** 21 (7 days × 3 weeks)
- **S&C Sessions:** 9 (3 per week)
- **MMA Sessions:** 9-12 (varies by week: 4-5 Week 1, 6 Week 4, 6 Week 7)
- **Rest Days:** 3 (Sundays)

## Notes

- MMA microcycles differ fundamentally from strength-focused microcycles (beginner, intermediate, advanced)
- Primary difference: **Multi-modal integration** (S&C + technical training)
- S&C is **secondary to technical training**—scheduled around sparring, not vice versa
- Energy system periodization is **core feature** (not mentioned in strength plans)
- Auto-regulation is **recovery-centric** (HR, soreness, technical volume) vs **load-centric** (RPE only)
- Fight-specific conditioning (5min rounds) **matches competition demands** (UFC: 3×5min or 5×5min)
- Explosive power emphasis (alactic work) **develops knockout power and takedown explosiveness**
- Week 7 is final hard week before Week 8 taper (not included in these examples)
- These examples are **training data** for fine-tuning agents to generate MMA-specific microcycles
