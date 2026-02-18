# Plan Agent User Prompt Template

## Purpose
This template defines how to structure the user prompt when requesting program design from the Plan Agent.

## Structure

```
Design a training program for [User Name] based on the following profile:

[Full profile OR key profile details]

Program requirements:
- [Training frequency]
- [Split or structure preference]
- [Primary goal]
- [Secondary goals if applicable]
- [Key constraints to address]
- [Timeline if event-based]

Use the standard program format with Program Philosophy, Phase structure, Progression Strategy, and Phase Cycling.
```

## Examples

### Example 1: General Fitness Client (Upper/Lower Split)

```
Design a training program for Alex Martinez based on the following profile:

**IDENTITY**
- Name: Alex Martinez
- Age: 28, Male
- Experience: Intermediate (2 years consistent lifting)

**GOALS**
- Primary: Build muscle and strength
- Secondary: Lose 10 lbs body fat, run 5K under 25 minutes

**TRAINING CONTEXT**
- Schedule: Mon/Wed/Fri/Sat, 45-60 min sessions
- Equipment: Home gym (barbell, DBs 5-50lb, rack, bench, bands), LA Fitness on weekends
- Constraints: [ACTIVE] Knee discomfort with barbell squats — using goblet/front squats instead (since 2026-02-16)

**METRICS**
- Bench Press: 145 lb x 5
- Deadlift: 225 lb x 5
- Bodyweight: 176 lb

Program requirements:
- 4 days/week (Mon/Wed/Fri/Sat)
- Upper/lower split
- Primary goal: muscle building + strength
- Secondary goal: 5K running (race in April 2026)
- Constraint: No barbell squats (use goblet/front squat)

Use the standard program format with Program Philosophy, Phase structure, Progression Strategy, and Phase Cycling.
```

### Example 2: Pure Endurance Athlete (Cyclist, Century Prep)

```
Design a training program for Jordan Lee based on the following profile:

**IDENTITY**
- Name: Jordan Lee
- Age: 34, Female
- Experience: 5 years cycling

**GOALS**
- Primary: Complete century ride (100 mi) in under 6 hours (May 2026)
- Secondary: Improve FTP from 180W to 200W

**TRAINING CONTEXT**
- Schedule: 5-6 days/week cycling, 1 rest day
- Equipment: Road bike, indoor trainer (Wahoo Kickr), power meter
- Constraints: [ACTIVE] Lower back tightness after rides > 3 hours

**METRICS**
- FTP: 180W (2.7 W/kg)
- Weekly volume: 8-10 hours, 150-200 miles
- Longest ride: 75 miles @ 16 mph avg
- HR zones: Z1 <130, Z2 130-145, Z3 145-160, Z4 160-175, Z5 >175

Program requirements:
- 5-6 days/week cycling
- Build from current 10 hours/week to peak 12-14 hours/week
- Primary goal: Complete century ride (race in 12 weeks)
- Secondary goal: Improve FTP (test every 4 weeks)
- Use periodization: Base (8 weeks) → Build (3 weeks) → Peak (1 week)

Use the standard program format. This is a pure endurance program (no lifting).
```

### Example 3: Rehab/Return-to-Training (ACL Reconstruction)

```
Design a training program for Sam Rivera based on the following profile:

**IDENTITY**
- Name: Sam Rivera
- Age: 42, Male
- Experience: Former college soccer player, 4 months post-ACL reconstruction

**GOALS**
- Primary: Return to pain-free movement and rebuild knee strength
- Secondary: Eventually return to recreational soccer (target: Fall 2026)

**TRAINING CONTEXT**
- Schedule: 3-4 days/week, 30-45 min sessions
- Equipment: Home (bodyweight, bands), PT clinic gym (cable machine, leg press)
- Constraints:
  - [ACTIVE] ACL reconstruction (Nov 2025) — cleared for bodyweight and light resistance (since Jan 2026)
  - [ACTIVE] Avoid pivoting/cutting until Month 6 post-op (May 2026)
  - [ACTIVE] Pain-free ROM: 0-120° knee flexion (working toward full ROM)

**METRICS**
- Bodyweight squat: pain-free to 90° (can't reach parallel yet)
- Single-leg balance: 30s eyes open
- Quad strength: noticeable atrophy on surgical leg
- Bodyweight: 185 lb (target: 178 lb)

Program requirements:
- 3-4 days/week
- Focus: Movement quality and load tolerance progression
- Phase 1 (4 weeks): ROM restoration + bodyweight strength
- Phase 2 (4 weeks): Light resistance + single-leg stability
- Phase 3 (4 weeks): Moderate resistance + sport-specific prep (no cutting yet)
- Avoid: Pivoting, cutting, high-impact movements (until cleared by PT)

Use the standard program format. Prioritize safety and gradual progression over performance.
```

### Example 4: Non-Periodized Maintenance (Busy Professional, 2x/Week)

```
Design a training program for Casey Kim based on the following profile:

**IDENTITY**
- Name: Casey Kim
- Age: 36, Non-binary
- Experience: 10 years on/off gym training, recently inconsistent

**GOALS**
- Primary: Maintain fitness during busy work season, sustain 2x/week habit for 6 months
- Secondary: Feel strong and energized (not chasing PRs)

**TRAINING CONTEXT**
- Schedule: Tuesday and Saturday mornings, 45 min max
- Equipment: 24-Hour Fitness (full commercial gym)
- Constraints: Unpredictable work schedule — needs flexible, forgiving program

**METRICS**
- Goblet squat: 50 lb x 10
- Push-ups: 25 consecutive
- Bodyweight: 165 lb (comfortable)
- Energy level: 6/10 (wants to improve through movement)

Program requirements:
- 2 days/week (Tue/Sat)
- Full-body sessions
- Primary goal: Habit consistency (not progression)
- Simple, repeatable structure
- Autoregulated intensity (adjust based on daily readiness)
- No deloads or phase cycling (steady-state maintenance)

Use the standard program format. This is a non-periodized maintenance program.
```

### Example 5: Powerlifter Meet Prep (Event-Based, 16 Weeks)

```
Design a training program for Chen Wu based on the following profile:

**IDENTITY**
- Name: Chen Wu
- Age: 26, Male
- Experience: Advanced powerlifter (4 years competing), 74kg weight class

**GOALS**
- Primary: Total 500 kg at local meet (April 15, 2026) — 16 weeks out
- Competition openers (estimated): Squat 165 kg, Bench 115 kg, Deadlift 210 kg

**TRAINING CONTEXT**
- Schedule: Mon/Tue/Thu/Sat, 90-120 min sessions
- Equipment: Powerlifting gym (specialty bars, monolift, calibrated plates)
- Constraints: Bench lockout is weak point (sticking point 2" from lockout)

**METRICS**
- Squat: 300 lb x 4 (estimated 1RM: 335 lb / 152 kg)
- Bench: 245 lb x 4 (estimated 1RM: 273 lb / 124 kg) — lockout weakness
- Deadlift: 405 lb x 4 (estimated 1RM: 452 lb / 205 kg)
- Bodyweight: 155 lb (comfortably in 74kg class)

Program requirements:
- 4 days/week (Mon/Tue/Thu/Sat)
- Meet prep structure: 16 weeks total
- Phase 1: Accumulation (Weeks 1-8)
- Phase 2: Intensification (Weeks 9-12)
- Phase 3: Realization & Taper (Weeks 13-16)
- Address weak point: Bench lockout (include board press, pin press, or close-grip variations)
- Openers: Squat 365 lb (165 kg), Bench 255 lb (115 kg), Deadlift 465 lb (210 kg)

Use the standard program format with meet-specific taper and opener strategy.
```

## Update Protocol Example

```
Update Alex Martinez's program based on the following profile change:

- New constraint: Right shoulder discomfort during overhead press (since Feb 20, 2026)
- Modification needed: Replace overhead press with landmine press or neutral-grip DB press

Add entry to Modification History documenting this change and update affected phases.
```

## Key Elements

Every user prompt should include:
1. **User name and profile summary** (key details from IDENTITY, GOALS, TRAINING CONTEXT, METRICS)
2. **Program requirements** (frequency, structure, goals, constraints, timeline)
3. **Format reminder** (light touch, 1 sentence)
4. **Optional modality-specific guidance** (e.g., "This is a pure endurance program" or "This is a non-periodized maintenance program")

## What NOT to Include

- ❌ Full role description (that's in the system prompt)
- ❌ Detailed format specification (that's in the system prompt)
- ❌ Examples of good/bad programs (that's in the system prompt)
- ❌ General instructions about periodization (that's in the system prompt)
