# Microcycle Agent User Prompt Template

## Purpose
This template defines how to structure the user prompt when requesting weekly workout generation from the Microcycle Agent.

## Structure

```
Generate a microcycle for Week [N] of [User Name]'s [Phase Name].

Profile summary:
- Current metrics: [Key performance metrics]
- Constraints: [Active constraints]
- Schedule: [Training days with locations/times]

Program context:
- Phase: [Phase name, Week X of Y]
- Weekly pattern: [Day-by-day session focus]
- Week [N] goal: [Specific goal for this week]
- [Optional: Previous week context for progression]

Use the standard microcycle format with Schedule, Week Overview, daily Workouts (warm-up, main, cool down, notes), and Weekly Summary.
```

## Examples

### Example 1: Strength Training (Upper/Lower Split, Week 3)

```
Generate a microcycle for Week 3 of Alex Martinez's Accumulation Phase.

Profile summary:
- Current metrics: Bench 155 lb x 5, Goblet squat 50 lb x 8, RDL 215 lb x 6
- Constraints: [ACTIVE] Knee discomfort with barbell squats — using goblet/front squats instead
- Schedule: Mon (home, 6-7 AM), Wed (home, 6-7 AM), Fri (home, 6-7 AM), Sat (LA Fitness, 8-9 AM)

Program context:
- Phase: Accumulation, Week 3 of 4
- Weekly pattern:
  - Mon: Upper Strength
  - Wed: Lower Strength
  - Fri: Upper Hypertrophy
  - Sat: Lower Hypertrophy
- Week 3 goal: Push compounds to top of RPE range, last hard week before deload

Use the standard microcycle format with Schedule, Week Overview, daily Workouts, and Weekly Summary.
```

### Example 2: Endurance Training (Cyclist, Build Phase Week 2)

```
Generate a microcycle for Week 2 of Jordan Lee's Build Phase.

Profile summary:
- Current metrics: FTP 185W (up from 180W), weekly volume 10-11 hours
- Constraints: [ACTIVE] Lower back tightness after rides > 3 hours
- Schedule: Mon rest, Tue/Thu (indoor trainer, 6 AM), Wed/Fri (outdoor, 6 AM), Sat (long ride, 8 AM), Sun (recovery ride, 9 AM)

Program context:
- Phase: Build, Week 2 of 3
- Weekly pattern:
  - Tue: VO2max intervals (indoor)
  - Wed: Tempo ride (outdoor)
  - Thu: Sweet spot intervals (indoor)
  - Fri: Easy endurance (outdoor)
  - Sat: Long ride (3-4 hours)
  - Sun: Recovery spin (1 hour easy)
- Week 2 goal: Increase interval duration from Week 1, maintain 11-12 hours total volume
- Last week: 10.5 hours, Sat long ride was 3 hours (lower back felt tight at 2.5 hours)

Use the standard microcycle format. This is a pure cycling program (no lifting).
```

### Example 3: Rehab/Return-to-Training (ACL Reconstruction, Phase 1 Week 3)

```
Generate a microcycle for Week 3 of Sam Rivera's ROM Restoration Phase.

Profile summary:
- Current metrics: BW squat to 100° (improving from 90°), single-leg balance 35s, quad girth improving
- Constraints:
  - [ACTIVE] ACL reconstruction (4.5 months post-op) — cleared for bodyweight and light resistance
  - [ACTIVE] Avoid pivoting/cutting until Month 6
  - [ACTIVE] Pain-free ROM: 0-125° knee flexion (goal: full ROM by end of phase)
- Schedule: Mon/Wed/Fri (home, 7 AM), Sat (PT clinic gym, 9 AM)

Program context:
- Phase: ROM Restoration, Week 3 of 4
- Weekly pattern:
  - Mon: Lower body ROM + stability
  - Wed: Full body light resistance
  - Fri: Lower body ROM + stability
  - Sat: PT clinic (leg press, cable work)
- Week 3 goal: Achieve pain-free squat to 120°, begin light resistance on leg press
- Last week: Reached 110° on squat (no pain), single-leg balance improved to 35s

Use the standard microcycle format. Prioritize movement quality and pain-free progression.
```

### Example 4: Non-Periodized Maintenance (2x/Week Full-Body)

```
Generate a microcycle for Casey Kim's Week 1 of Maintenance Program.

Profile summary:
- Current metrics: Goblet squat 50 lb x 10, Push-ups 25, Energy 6/10
- Constraints: Unpredictable schedule — needs flexible program
- Schedule: Tue (24-Hour Fitness, 6:30 AM), Sat (24-Hour Fitness, 9 AM)

Program context:
- Phase: Maintenance (no phases, steady-state)
- Weekly pattern:
  - Tue: Full-body A
  - Sat: Full-body B
- Week goal: Establish baseline working weights, feel good leaving the gym
- Note: This is Week 1, so start conservative (RPE 7) and gauge readiness

Use the standard microcycle format. This is a non-periodized program — same structure repeats weekly.
```

### Example 5: Powerlifter Meet Prep (Intensification Week 10)

```
Generate a microcycle for Week 10 of Chen Wu's Intensification Phase.

Profile summary:
- Current metrics: Squat 305 lb x 2, Bench 260 lb x 2, Deadlift 465 lb x 2 (all recent doubles)
- Constraints: Bench lockout weakness (using board press as accessory)
- Schedule: Mon/Tue/Thu/Sat (powerlifting gym, evenings)
- Bodyweight: 155.8 lb (comfortable in 74kg class, 6 weeks to weigh-in)

Program context:
- Phase: Intensification, Week 10 of 12 (2 weeks left before Realization)
- Weekly pattern:
  - Mon: Squat + Bench accessories
  - Tue: Bench + Deadlift accessories
  - Thu: Squat variation + Light bench
  - Sat: Competition day simulation (heavy doubles)
- Week 10 goal: Last heavy doubles before tapering to singles. Squat 310 x 2, Bench 265 x 2, Deadlift 475 x 2.
- Last week (Week 9): Squat 305x2 RPE 8.5, Bench 260x2 RPE 8, Deadlift 465x2 RPE 8.5. Board press 275x3 (lockout improving).

Use the standard microcycle format. Competition is 6 weeks away — this is last heavy double week.
```

### Example 6: With Previous Microcycle Context (Schedule Adjustment)

```
Generate a microcycle for Week 4 of Alex Martinez's Accumulation Phase.

Profile summary:
- Current metrics: Bench 155 lb x 5, Goblet squat 50 lb x 8, RDL 215 lb x 6
- Constraints: [ACTIVE] Knee discomfort with barbell squats
- Schedule: Mon/Wed/Fri/Sat (normal)

Program context:
- Phase: Accumulation, Week 4 of 4 (deload week)
- Weekly pattern: Same as Week 3 but deload volume (50% sets, 80% intensity)
- Week 4 goal: Active recovery, prepare for Intensification Phase

Previous week note:
- Last week, Alex moved Saturday's workout to Sunday due to family event
- This meant Sunday legs → Monday upper had only 1 day rest (normally 2)
- Consider lightening Monday upper if needed for recovery

Use the standard microcycle format. This is a deload week — volume down, intensity moderate.
```

## Update Protocol Example

```
Regenerate Monday's workout for Alex Martinez from Week 3.

Profile summary: [Same as above]

Program context: [Same as above]

Change needed: Replace overhead press with landmine press due to new shoulder constraint (since Feb 20).

Use the standard microcycle format for the single day.
```

## Key Elements

Every user prompt should include:
1. **Week context** (Week N of Phase X, what week in the phase)
2. **Profile summary** (current metrics, active constraints, schedule)
3. **Program context** (phase name, weekly pattern, week-specific goal)
4. **Optional: Previous week context** (if relevant for progression or schedule adjustments)
5. **Format reminder** (light touch, 1 sentence)

## What NOT to Include

- ❌ Full role description (that's in the system prompt)
- ❌ Detailed format specification (that's in the system prompt)
- ❌ Examples of good/bad microcycles (that's in the system prompt)
- ❌ General instructions about warm-ups or rest periods (that's in the system prompt)
