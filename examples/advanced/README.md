# Advanced — Powerlifting Peaking Examples

Reference examples for the Advanced training plan (4-day Upper/Lower, 12-week meet prep).

## Plan Characteristics

- **Name:** Advanced — Powerlifting Peaking
- **Split:** 4-Day Upper/Lower (Competition Lift Specificity)
- **Frequency:** 4 days/week (2x per lift)
- **Duration:** 12 weeks (meet preparation)
- **Primary Focus:** Maximal strength development for competition (squat, bench, deadlift)
- **Progression:** 4-block periodization (Accumulation → Strength → Peaking → Taper)
- **Target Audience:** Advanced lifters with competition goals, 2+ years experience

## Week Selection Rationale

**Week 2 (Mid-Accumulation):**
- 5x5 @ 70-75% 1RM (moderate volume, moderate intensity)
- RPE 7-8 (leave 2-3 RIR)
- Focus: Building volume tolerance, technique refinement
- 4 days: Squat (Mon), Bench (Tue), Deadlift (Thu), Bench volume (Sat)

**Week 6 (Mid-Wave Loading):**
- 4x3 @ 82.5% 1RM (reduced volume, higher intensity)
- RPE 8-9 (leave 1-2 RIR)
- Week 6 of wave: 80% (Week 5) → 82.5% (Week 6) → 85% (Week 7) → deload (Week 8)
- Focus: Strength building with weekly intensity undulation

**Week 10 (Mid-Peaking):**
- 3x2 @ 92.5% 1RM (low volume, very high intensity)
- RPE 9.5 (near-maximal, precise technique required)
- Focus: Expressing capacity, heavy doubles/singles
- Mental: Competition proximity, technical precision

## Example Files

### Pending Migration (from PRs #169, 171, 174-179)

- `advanced-plan-structured.json` — Structured 12-week meet prep
- `advanced-microcycle-generate-weeks-2-6-10.json` — 3 weekly patterns
- `advanced-microcycle-structured-weeks-2-6-10.json` — Parsed microcycles
- `advanced-microcycle-message-weeks-2-6-10.json` — SMS weekly previews
- `advanced-workout-generate-w2.json` — Week 2 workouts (Mon/Tue/Thu)
- `advanced-workout-generate-w6.json` — Week 6 workouts (Mon/Tue/Thu)
- `advanced-workout-generate-w10.json` — Week 10 workouts (Mon/Tue/Thu)
- `advanced-workout-structured-all-9.json` — All 9 workouts consolidated
- `advanced-workout-message-all-9.json` — 9 SMS daily messages

## 4-Block Periodization Structure

**Accumulation (Weeks 1-4):**
- Volume: 4-5 sets × 5-8 reps
- Intensity: 75-82% 1RM, RPE 7-8
- Focus: Build work capacity, hypertrophy base

**Strength Building (Weeks 5-8):**
- Volume: 3-4 sets × 2-4 reps
- Intensity: 80-88% 1RM, RPE 8-9
- Wave loading: Week 5 (80% 4×4) → Week 6 (82.5% 4×3) → Week 7 (85% 3×3) → Week 8 (deload)
- Focus: Convert volume to strength

**Peaking (Weeks 9-11):**
- Volume: 3-5 sets × 1-3 reps
- Intensity: 87-95% 1RM, RPE 9-9.5
- Focus: Express capacity, heavy singles/doubles
- Technique precision critical

**Taper (Week 12):**
- Monday/Tuesday: Openers only (1-2 reps @ 85-90%)
- Wednesday-Saturday: Complete rest
- Sunday: COMPETE

## Inverse Volume/Intensity Relationship

| Week | Phase | Sets × Reps | % 1RM | Total Reps | Intensity Change | Volume Change |
|------|-------|-------------|-------|------------|------------------|---------------|
| W2 | Accumulation | 5×5 | 70-75% | 25 | Baseline | Baseline |
| W6 | Wave Loading | 4×3 | 82.5% | 12 | +15% | -52% |
| W10 | Peaking | 3×2 | 92.5% | 6 | +32% | -76% |

## Competition-Focused Programming

**Specificity Increases:**
- Weeks 1-4: 60% competition lifts, 40% variations
- Weeks 5-8: 75% competition lifts, 25% variations
- Weeks 9-11: 90% competition lifts, 10% variations (minimal accessories)

**RPE Auto-Regulation:**
- Prescribed percentages are guidelines
- If RPE >9, reduce load 5%
- If RPE <7, add 2.5-5lbs
- Goal: Hit prescribed reps at target RPE

**Bar Speed Monitoring:**
- Week 2: Qualitative ("if bar speed slows significantly")
- Week 6: Quantitative ("if grinds >3sec")
- Week 10: Strict fail-safe ("if first rep >4sec, do NOT attempt second")

**Deload Protocol (Week 8):**
- 60% volume reduction
- 70-75% 1RM (no heavy singles)
- Competition lifts only (no accessories)
- Dissipate fatigue before peaking block

## Advanced Technique Deployment (Week 10)

**Rest-Pause (Final Sets Only):**
- Squat/Bench/Deadlift: 2 reps @ 92.5% → rack → 20-30sec rest → 1 more rep
- Purpose: Overload beyond standard doubles, recruit additional motor units

**Slow Eccentrics:**
- Accessories (pause squats, close-grip bench): 4-5sec eccentric
- Purpose: Build strength at weak points (bottom of squat, lockout strength)

**Safety Emphasis:**
- "Form is CRITICAL—don't round back chasing reps" (deadlift)
- "If first rep >4sec, do NOT attempt second" (bar speed fail-safe)
- "Competition > hitting percentages" (injury prevention over ego)

## Weekly Schedule Template

- **Mon:** Lower — Squat emphasis (competition squat + accessories)
- **Tue:** Upper — Bench emphasis (competition bench + pressing volume)
- **Wed:** Rest or light mobility
- **Thu:** Lower — Deadlift emphasis (competition deadlift + posterior chain)
- **Fri:** Upper — Bench volume (variations + overhead work)
- **Sat:** Optional technique work or rest
- **Sun:** Rest

## Usage

These examples demonstrate:
- Competition-focused periodization (meet prep)
- 4-block structure (Accumulation → Strength → Peaking → Taper)
- Specificity increase across blocks
- RPE auto-regulation with percentage guidelines
- Bar speed monitoring evolution (qualitative → quantitative → fail-safe)
- Inverse volume/intensity relationship
- Deload timing between blocks
- Competition-day preparation (openers, taper protocol)
- Advanced technique deployment (rest-pause, slow eccentrics)

---

**Plan ID:** `advanced-powerlifting`  
**Status:** Examples pending migration from PRs #169, 171, 174-179  
**Last Updated:** 2026-02-16
