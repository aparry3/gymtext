# Microcycle Generate Examples — MMA Fighter

This file contains **microcycle:generate** agent output examples for the Sport-Specific MMA Fighter plan.

## Purpose

These examples demonstrate how the `microcycle:generate` agent should create weekly training breakdowns for an 8-week fight camp. Each microcycle shows the agent's ability to:

- Balance concurrent training demands (strength, power, conditioning, MMA skills)
- Integrate strength training with technical MMA sessions
- Progress through distinct training phases (Strength → Power → Fight Peak → Taper)
- Manage interference between strength work and sparring
- Provide detailed session breakdowns with exercise selection, loading, and timing
- Consider recovery and fatigue management in high-volume training
- Include sport-specific conditioning (fight simulation circuits, alactic sprints)
- Address athlete safety (shoulder-safe pressing variations, CNS management)

## Schema Compliance

Each example follows the `MicrocycleGenerationOutput` schema:

```typescript
{
  overview: string,  // Week-level focus, progression context, key objectives
  days: string[]     // Array of 7 day descriptions (detailed training breakdowns)
}
```

**Note:** These are `microcycle:generate` examples (LLM output format). The corresponding structured examples (`microcycle:structured`) parse this content into `MicrocycleStructureSchema` format.

## Week Selection Rationale

- **Week 1 (Strength Emphasis start):** Opening week establishes baseline strength (4x5 @ 80-85% 1RM), introduces alactic conditioning, focuses on movement quality and technical proficiency
- **Week 4 (Power Development start):** Transition week reduces strength volume (3x3 @ 85-90%) while ramping up explosive work (5 sets Olympic lifts, 4 sets plyometrics), represents peak training demand
- **Week 7 (Fight Peak end, before taper):** Final active preparation week with minimal strength (2x3 @ 92% CNS priming), peak conditioning (5-round fight simulations), emphasis on sharpness and fight readiness

These weeks showcase the progression from building strength capacity → converting to power → expressing power in fight-specific contexts.

## Training Integration

The MMA plan uses a **3-day concurrent training** model (strength + power + conditioning) integrated with technical MMA training:

### Weekly Structure
- **Mon:** Lower Body Power + Alactic Conditioning (60min)
- **Tue:** MMA Training (technical work, light-to-moderate sparring)
- **Wed:** Upper Body Strength + Anti-Rotation Core (60min)
- **Thu:** MMA Training (sparring emphasis, conditioning)
- **Fri:** Full Body Explosive + Fight Simulation Conditioning (60min)
- **Sat:** MMA Training (open mat, hard sparring, highest volume)
- **Sun:** Rest / Active Recovery

### Interference Management Strategies

1. **Session Timing:** Lower power work (Mon) positioned before light MMA day (Tue); avoid pairing heavy strength with hard sparring
2. **Volume Modulation:** Strength volume decreases as fight approaches (4x5 → 3x3 → 2x3) while conditioning increases
3. **Intensity Auto-Regulation:** Bar speed monitoring, RPE checks, "if grinding stop immediately" protocols
4. **Recovery Integration:** Active recovery days, contrast therapy recommendations, 8-9 hour sleep targets

## Block Periodization Structure

### Weeks 1-3: Strength Emphasis
- **Focus:** Build force production capacity
- **Strength:** 4x5 @ 80-85% 1RM (RPE 7-8)
- **Conditioning:** Moderate volume (6-8 rounds alactic)
- **MMA Integration:** Moderate sparring intensity (70-80%)

### Weeks 4-5: Power Development
- **Focus:** Convert strength to explosive power
- **Strength:** 3x3 @ 85-90% 1RM (RPE 8-9, reduced volume)
- **Explosive Work:** 5 sets Olympic lifts, 4 sets plyometrics
- **Conditioning:** High volume (3-4 rounds fight simulation)
- **MMA Integration:** Moderate-high sparring (75-85%)

### Weeks 6-7: Fight Peak
- **Focus:** Express capacity, peak conditioning
- **Strength:** 2x3 @ 87-92% 1RM (CNS priming, not fatiguing)
- **Explosive Work:** 3-4 sets (quality > volume)
- **Conditioning:** Peak volume (5 rounds fight simulation)
- **MMA Integration:** High sparring intensity (85-90%)

### Week 8: Taper
- **Focus:** Dissipate fatigue, arrive fresh
- **Strength:** 2x3 @ 75-80% (light, crisp)
- **Explosive Work:** 3x3 (low volume, max intent)
- **Conditioning:** Cut by 70% (1-2 light rounds)
- **MMA:** Technical work only (no sparring Wed-Sat)

## Key Programming Principles

### 1. Power Over Hypertrophy
- Stay within weight class (no bodybuilding-style training)
- Focus: explosive intent, bar speed, rate of force development
- Rep schemes: 2-5 reps for strength/power work

### 2. Shoulder Safety
- No heavy strict overhead press (injury history consideration)
- Alternatives: Landmine press, push press, horizontal pressing
- Maintains shoulder health for striking and grappling

### 3. Conditioning Specificity
- Fight simulation circuits: 3-5 rounds x 5min work / 1min rest
- Alactic sprints: 6-10 rounds x 10sec sprint / 50sec rest
- Mimics MMA fight structure (5min rounds, short explosive bursts)

### 4. Grip Strength Priority
- Dead hangs (45-50sec holds)
- Farmer's carries (40m @ heavy load)
- Critical for grappling control and clinch work

### 5. Concurrent Training Management
- Balance strength, power, conditioning, and skill across the week
- Don't stack hard sessions back-to-back
- If choosing between strength and sparring, choose sparring (technique wins fights)

### 6. Taper Discipline
- Week 8 is about arriving fresh, not "getting one more session in"
- Trust the process: 7 weeks of hard work, 1 week of sharpening
- Competition > training: stay healthy, stay sharp, compete

## Technical Considerations

### Exercise Selection
- **Lower Power:** Trap bar variations (safer spinal loading than conventional), box/broad jumps, lateral bounds
- **Upper Strength:** Landmine press (shoulder-safe), weighted pull-ups, barbell rows
- **Explosive:** Power cleans/hang snatches, plyo push-ups, jump squats, med ball throws
- **Conditioning:** Assault bike, kettlebell swings, battle ropes, burpees (multi-modal)
- **Core:** Pallof press, Turkish get-ups (anti-rotation + full-body integration)

### Loading Progressions
- Week 1: 80-85% 1RM (4x5)
- Week 4: 85-90% 1RM (3x3)
- Week 7: 92% 1RM (2x3)
- Olympic lifts: 70-77% 1RM (explosive intent, not max effort)

### Bar Speed Monitoring
- Primary quality metric for power development
- "If rep speed drops, reduce load 5-10lbs"
- "If grinding >3sec, stop set immediately"
- Emphasizes intent and power output over absolute load

## Usage

Use these examples to:
1. **Train the microcycle:generate agent** on concurrent training programming for combat sports
2. **Validate agent output** against reference examples showing appropriate detail, integration, and progression
3. **Seed the database** with high-quality MMA microcycle patterns for testing and development
4. **Demonstrate sport-specific programming** that balances multiple training qualities without excessive interference

## Related Examples

- `plan-examples.json` — Source plan ("Sport-Specific — MMA Fighter")
- `microcycle-structured-mma-weeks-1-4-7.json` — Structured versions (once created)
- `microcycle-message-mma-weeks-1-4-7.json` — SMS weekly previews (once created)
- `workout-generate-mma-*.json` — Individual workout examples (once created)

---

**File:** `examples/microcycle-mma-weeks-1-4-7.json`  
**Schema:** `MicrocycleGenerationOutput` (`overview` + `days` array)  
**Created:** 2026-02-16  
**Context:** Task "Create microcycle:generate examples (MMA - Weeks 1, 4, 7)"
