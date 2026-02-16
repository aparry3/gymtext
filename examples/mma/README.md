# MMA — Sport-Specific Fighter Examples

Reference examples for the MMA Fighter plan (8-week fight camp, concurrent training).

## Plan Characteristics

- **Name:** Sport-Specific — MMA Fighter
- **Split:** 3-Day S&C + 4-Day MMA + 1-Day Recovery
- **Frequency:** 7 days/week (high-volume concurrent training)
- **Duration:** 8 weeks (fight camp)
- **Primary Focus:** Power development, alactic capacity, strength maintenance + technical MMA skills
- **Progression:** Strength Emphasis → Power Development → Fight Peak → Taper
- **Target Audience:** MMA fighters in active fight camp

## Week Selection Rationale

**Week 1 (Strength Emphasis):**
- Baseline strength building (4x5 @ 80-85% 1RM)
- Alactic conditioning introduction (6 rounds x 10sec/50sec)
- RPE 7-8 (controlled), sparring 60-85% effort
- Focus: Foundation for power development

**Week 4 (Power Development):**
- Peak training demand
- Strength volume drops (3x3 @ 85-90%) but explosive work ramps (5 sets Olympic lifts)
- Alactic peaks (8 rounds), fight simulation (3 rounds x 5min)
- RPE 8-9, sparring 75-90% effort

**Week 7 (Fight Peak):**
- Final active preparation before taper
- Minimal strength (2x3 @ 92% CNS priming only)
- Peak conditioning (5 rounds x 5min fight simulation)
- RPE 9-9.5, sparring 85-90% effort (controlled)
- Mental preparation intensifies

## Example Files

### Pending Migration (from PRs #188-195)

- `mma-plan-structured.json` — Structured 8-week fight camp
- `mma-microcycle-generate-weeks-1-4-7.json` — 3 weekly patterns
- `mma-microcycle-structured-weeks-1-4-7.json` — Parsed microcycles
- `mma-microcycle-message-weeks-1-4-7.json` — SMS weekly previews
- `mma-workout-generate-w1.json` — Week 1 S&C workouts (Mon/Wed/Fri)
- `mma-workout-structured-w1.json` — Week 1 parsed workouts (pending)
- `mma-workout-message-w1.json` — Week 1 SMS daily messages (pending)

## Concurrent Training Structure

### S&C Days (Mon/Wed/Fri, 60min each)

**Monday:** Lower Body Power + Alactic Conditioning
- Trap bar jumps (neural activation)
- Trap bar deadlift 4x5 @ 80% (Week 1) → 3x3 @ 87% (Week 4) → 2x3 @ 92% (Week 7)
- KB swings, broad jumps, alactic sprints

**Wednesday:** Upper Body Strength + Anti-Rotation Core
- Landmine press 4x5 @ 82% (shoulder-safe)
- Weighted pull-ups 4x5 (grappling strength)
- Med ball rotational throws, Pallof press, dead hangs (grip work)

**Friday:** Full Body Explosive + Fight Simulation Conditioning
- Hang power clean 5x3 @ 72%
- Plyo push-ups, jump squats
- Fight simulation circuits: 2 rounds (W1) → 3 rounds (W4) → 5 rounds (W7)

### MMA Days (Tue/Thu/Sat, variable duration)

**Tuesday:** Technical drilling, light-to-moderate sparring (60-75% effort)  
**Thursday:** Sparring emphasis, moderate-to-high intensity (70-85% effort)  
**Saturday:** Open mat, highest volume (6-8 x 5min rounds, 70-90% effort)

### Recovery Day (Sunday)

Active recovery or complete rest (8-9hr sleep priority)

## Block Periodization Progression

| Phase | Weeks | Strength | Explosive Work | Conditioning | Sparring |
|-------|-------|----------|----------------|--------------|----------|
| Strength Emphasis | 1-3 | 4x5 @ 80-85% | Moderate | 6-8 rounds alactic | 60-80% |
| Power Development | 4-5 | 3x3 @ 85-90% | High (5 sets Olympic) | 8rd alactic + 3rd fight sim | 75-90% |
| Fight Peak | 6-7 | 2x3 @ 87-92% | Quality>volume | 5rd fight simulation | 85-90% |
| Taper | 8 | 2x3 @ 75-80% | Minimal | 1-2 rounds | Technical only |

## Interference Management Strategies

**Session Timing:**
- Lower power (Mon) → lighter MMA day (Tue)
- Hard sparring (Thu/Sat) separated from heavy S&C

**Volume Modulation:**
- Strength volume decreases as conditioning increases
- Week 1: 4x5, 6 alactic rounds, 2 fight sim rounds
- Week 7: 2x3, 6 alactic rounds, 5 fight sim rounds

**Bar Speed Monitoring:**
- Week 1: "If bar slows significantly, reduce load"
- Week 4: "If grinds >3sec, stop immediately"
- Week 7: "If first rep >4sec, do NOT attempt second"

**Recovery Emphasis:**
- 8-9hr sleep non-negotiable (especially Week 7)
- Hydration: 16-24oz post-S&C, 3-4L/day Week 7
- Nutrition: Maintenance (W1) → surplus if weight allows (W4) → maintenance (W7)

## Dual Intensity Systems

**S&C Intensity (RPE-based):**
- Week 1: RPE 7-8 (controlled)
- Week 4: RPE 8-9 (high)
- Week 7: RPE 9-9.5 (crisp, explosive)

**Sparring Intensity (% effort-based):**
- Week 1: 60-85% effort (skill acquisition)
- Week 4: 75-90% effort (test power transfer)
- Week 7: 85-90% effort (controlled, technical precision)

## Exercise Selection Rationale

**Trap Bar > Conventional Deadlift:**
- Safer spinal loading (neutral spine easier)
- More explosive intent (less technical complexity)
- Builds takedown power, scramble strength

**Landmine Press > Strict OHP:**
- Shoulder-safe (angled press reduces impingement)
- Unilateral (trains stability + anti-rotation core)
- Builds punching power

**Hang Power Clean (not Full Clean):**
- Simpler catch position (quarter-squat vs full squat)
- Speed emphasis over load
- Explosive triple extension = takedown/sprawl power

**Dead Hangs (Grip Priority):**
- Grappling-critical (45sec TUT builds capacity)
- Maintaining grips in late rounds, top control

## Fight-Specific Language Evolution

**Week 1 (Foundation):**
- "Fight camp opening"
- "Build foundation for power development"
- "Strength serves your fight game—not the other way around"

**Week 4 (Peak Demand):**
- "Most demanding week of camp"
- "Test power transfer"
- "Notice increased snap in punches, faster scrambles"

**Week 7 (Fight Peak):**
- "Final active preparation before taper"
- "You're peaking, not proving toughness"
- "Game plan drilling", "film review with coaches"
- "Trust the process, arrive fresh, perform"

## Usage

These examples demonstrate:
- Concurrent training programming (S&C + MMA skills)
- Sport-specific periodization (Strength → Power → Peak → Taper)
- Interference management (session timing, bar speed monitoring)
- Dual intensity systems (RPE for S&C, % effort for sparring)
- Fight-specific conditioning (alactic sprints, fight simulation circuits)
- Olympic lift integration with proper technique notes
- Recovery protocols for high-volume training
- Mental preparation and fight-focused language

---

**Plan ID:** `mma-fighter-8week`  
**Status:** Examples pending migration from PRs #188-195  
**Last Updated:** 2026-02-16
