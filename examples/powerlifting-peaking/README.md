# Powerlifting Peaking Program - 12 Weeks to Meet Day

## Purpose

This directory contains comprehensive training examples demonstrating the **GymText agent workflow** for powerlifting meet preparation. These examples show the complete TEXT → STRUCTURE pipeline for a 12-week peaking program leading to competition day.

**Key Learning Points:**
- Block periodization for meet prep (accumulation → intensification → realization → taper)
- Percentage-based programming with RPE overlay
- Sport-specific training (squat, bench press, deadlift)
- Progressive overload through intensity manipulation (volume decreases as meet approaches)
- Taper strategy to peak on competition day
- Meet day attempt selection and strategy

## Fictional Athlete Profile

**Sarah Chen** — 29-year-old powerlifting competitor
- **Training Experience:** 4 years powerlifting (competed 3 times previously)
- **Current Competition PRs:**
  - Squat: 315lbs
  - Bench Press: 185lbs
  - Deadlift: 365lbs
  - **Total:** 865lbs @ 72kg
- **Training Maxes (95% of PRs):**
  - Squat: 300lbs
  - Bench: 176lbs  
  - Deadlift: 347lbs
- **Competition Goal:** Break 900lb total at state meet (April 15, 2026)
- **Target Meet PRs:**
  - Squat: 315lbs (maintain or exceed)
  - Bench: 190lbs (+5lbs PR)
  - Deadlift: 395lbs (+30lbs PR, priority lift)
- **Weak Points:** Bench lockout, deadlift start position
- **Schedule:** 4 days per week (Mon/Tue/Thu/Sat)
- **Equipment:** Powerlifting gym with competition equipment

## Program Structure

**Duration:** 12 weeks organized into 4 training blocks + meet week

**Meet Prep Timeline:**
- **Weeks 1-4:** Accumulation Block (Build work capacity, address weaknesses)
- **Weeks 5-8:** Intensification Block (Increase load, reduce volume)
- **Weeks 9-10:** Realization Block (Peak intensity, test strength)
- **Weeks 11-12:** Taper Block (Reduce fatigue, maintain sharpness)
- **Week 12 (end):** MEET DAY (April 15, 2026)

**Training Split:** 4-day powerlifting focus
- **Monday:** Squat Day (primary squat, bench accessory)
- **Tuesday:** Bench Day (primary bench, speed deadlift)
- **Thursday:** Deadlift Day (primary deadlift, squat variation)
- **Saturday:** Accessories Day (hypertrophy, recovery, weakness work)

**Why This Split:**
- Each competition lift gets dedicated focus once per week
- Adequate recovery between max-effort sessions (48-72 hours)
- Saturday accessories allow extra recovery before Monday squat
- Mirrors typical meet order in weekly structure

## File Structure & Flow

This example set demonstrates the complete GymText agent pipeline:

### 1. Plan Generation (TEXT)
**File:** `01-plan-generate.txt`

The `plan:generate` agent creates the overall 12-week meet prep program. This establishes:
- Block periodization framework (accumulation → intensification → realization → taper)
- Training philosophy (meet day is the only day that matters)
- Percentage-based loading with auto-regulation
- Weak point addressing strategy (bench lockout, deadlift start)
- Meet day strategy and attempt selection
- Recovery and lifestyle guidance

**Output:** Unstructured TEXT that an LLM generated for Sarah's meet prep

---

### 2. Microcycle Generation (TEXT)
**Files:**
- `02-microcycle-generate-week-01.txt` (Accumulation: high volume, moderate intensity)
- `02-microcycle-generate-week-05.txt` (Intensification: moderate volume, high intensity)
- `02-microcycle-generate-week-09.txt` (Realization: low volume, peak intensity - testing PRs)

The `microcycle:generate` agent creates weekly training plans showing:
- **Week 1:** High-volume accumulation (5×5 @ 75%, RPE 7-8)
- **Week 5:** Intensification with increased load (5×3 @ 82.5%, RPE 8-9)
- **Week 9:** Realization/testing (work to 95% single, RPE 9-10)

These examples demonstrate **meet prep progression** — how volume decreases and intensity increases as competition approaches.

**Output:** Unstructured TEXT for each representative week

---

### 3. Microcycle Structure (JSON)
**File:** `03-microcycle-structure.json`

Converts Week 1 microcycle text into structured JSON following GymText schema. Shows:
- Week-level metadata (block, phase, focus, weeks out from meet)
- 4-day session structure (Squat, Bench, Deadlift, Accessories)
- Session-level volume/intensity targets
- Training maxes and percentage calculations

**Output:** Structured JSON that the GymText backend can consume

**Schema Pattern:**
```json
{
  "microcycleId": "powerlifting-peaking-week-01",
  "athleteName": "Sarah Chen",
  "weekNumber": 1,
  "weeksOutFromMeet": 12,
  "blockName": "Accumulation",
  "primaryFocus": "Build work capacity, establish baseline volumes",
  "sessions": [...]
}
```

---

### 4. Workout Generation (TEXT)
**Files:**
- `04-workout-generate-week01-monday-squat.txt`
- `04-workout-generate-week01-tuesday-bench.txt`
- `04-workout-generate-week01-thursday-deadlift.txt`
- `04-workout-generate-week01-saturday-accessories.txt`

The `workout:generate` agent creates detailed individual workout plans for Week 1. These show:
- Warm-up protocols specific to each lift
- Main lift execution with detailed cues
- Variation work (pause squats, close-grip bench, deficit deadlifts)
- Accessory movements with purpose explanations
- Cool-down and recovery guidance
- Expected subjective feel (RPE, fatigue level)

**Example (Monday Squat Day):**
- Warm-up: Bike, leg swings, goblet squats, hip circles
- Competition Squat: 5×5 @ 75% (225lbs), RPE 7-8
- Pause Squat: 3×3 @ 65% (195lbs), RPE 7
- RDL, Leg Press, Hanging Leg Raises, Planks

**Output:** Unstructured TEXT ready for SMS delivery or JSON structuring

---

### 5. Workout Messages (SMS Format)
**Files:**
- `05-workout-message-week01-monday-squat.txt`
- `05-workout-message-week01-tuesday-bench.txt`
- `05-workout-message-week01-thursday-deadlift.txt`
- `05-workout-message-week01-saturday-accessories.txt`

Converts detailed workout text into **SMS-ready format** following `workout-messages.md` style:
- Concise, scannable format
- Clear warm-up → workout structure
- Removes verbose coaching (keeps essential cues only)
- Mobile-friendly line breaks

**What Sarah Actually Receives:** These messages are what she would get via SMS on workout day.

**Output:** SMS-formatted TEXT ready to send via Twilio

---

### 6. Workout Structure (JSON)
**Files:**
- `06-workout-structure-week01-monday-squat.json`
- `06-workout-structure-week01-tuesday-bench.json`
- `06-workout-structure-week01-thursday-deadlift.json`
- `06-workout-structure-week01-saturday-accessories.json`

Converts workout text into **structured JSON** following `structured-workouts.json` schema. Shows:
- Exercise library IDs
- Sets/reps/intensity prescriptions
- Percentage-based loading (% of training max)
- RPE targets for auto-regulation
- Rest periods and tempo notation
- Exercise categories (main lift, variation, accessory)

**What the Backend Uses:** These JSON structures drive workout tracking, progression logic, and analytics.

**Output:** Structured JSON for database storage

**Schema Pattern:**
```json
{
  "title": "Week 1 - Monday: Squat Day",
  "sections": [
    {
      "title": "Main Lift",
      "exercises": [
        {
          "name": "Back Squat",
          "sets": "5",
          "reps": "5",
          "intensity": {
            "type": "Percentage",
            "value": "75",
            "description": "225lbs — RPE 7-8"
          }
        }
      ]
    }
  ]
}
```

---

### 7. README Documentation
**File:** `README.md` (this file)

Documents the entire example set, explaining:
- Purpose and learning objectives
- Athlete profile and meet prep goals
- Program structure and periodization rationale
- File flow and schema patterns
- When/why to use peaking programs for powerlifting

---

## Block Periodization Breakdown

**How Sarah Progresses Through 12 Weeks:**

### Block 1: Accumulation (Weeks 1-4)
- **Volume:** High (5×5, 4×6, total 25-35 lifts per session)
- **Intensity:** Moderate (70-80% of training max)
- **RPE Target:** 7-8 (manageable, not grinding)
- **Goal:** Build work capacity, refine technique, address weak points
- **Example:** Squat 5×5 @ 75% (225lbs), should have 2-3 reps in reserve

### Block 2: Intensification (Weeks 5-8)
- **Volume:** Moderate (5×3, total 15-25 lifts per session)
- **Intensity:** High (80-87% of training max)
- **RPE Target:** 8-9 (challenging, 1-2 reps in reserve)
- **Goal:** Increase load on the bar, adapt to heavier weights
- **Example:** Squat 5×3 @ 82.5% (248lbs), bar speed slows but completes

### Block 3: Realization (Weeks 9-10)
- **Volume:** Low (work to heavy singles, 8-15 total lifts)
- **Intensity:** Peak (90-97% of training max)
- **RPE Target:** 9-10 (maximal effort)
- **Goal:** Test strength, establish meet openers and second attempts
- **Example:** Squat work to 95% single (285lbs), then backoff @ 90% (270lbs)

### Block 4: Taper (Weeks 11-12)
- **Week 11:** Light technique work (75-80%, minimal volume)
- **Week 12:** Openers only (Monday), then rest until meet (Saturday)
- **Goal:** Dissipate accumulated fatigue while maintaining sharpness
- **Critical:** Do NOT test maxes during taper (trust the process)

---

## Percentage-Based Loading Strategy

**Training Max vs. True Max:**
- Sarah's training maxes are 95% of her competition PRs
- All percentages calculated from training max (not true max)
- This builds in a buffer for fatigue and bad days

**Example Calculations (Squat):**

| Week | Block | Working Weight | % of Training Max | % of True Max | RPE | Volume |
|------|-------|----------------|-------------------|---------------|-----|--------|
| 1 | Accumulation | 225lbs | 75% | 71% | 7-8 | 5×5 (25 reps) |
| 5 | Intensification | 248lbs | 82.5% | 79% | 8-9 | 5×3 (15 reps) |
| 9 | Realization | 285lbs | 95% | 90% | 9-10 | Singles (5-8 reps) |
| 11 | Taper | 225lbs | 75% | 71% | 6-7 | 2×1 (2 reps) |

**Auto-Regulation:**
- Percentages provide structure, RPE provides flexibility
- If 85% feels like RPE 9, reduce to 82.5%
- If 85% feels like RPE 7, can push to 87.5%
- Trust feel on the day, especially in taper

---

## Weak Point Addressing

**Sarah's Identified Weaknesses:**

### Bench Press Lockout
- **Problem:** Bar slows significantly in top 3-4 inches of press
- **Solution:**
  - Close-grip bench press (4×6 @ 65%, emphasizes triceps)
  - Board press in later blocks (overload lockout ROM)
  - Tricep accessory work (pushdowns, overhead extensions)
- **Progress Indicator:** Bar speed at lockout improves weeks 1→9

### Deadlift Start Position
- **Problem:** Hips shoot up on first pull, losing leverage
- **Solution:**
  - Deficit deadlifts (3×4 @ 65%, strengthen start position)
  - Deliberate setup cues (Sarah tends to rush setup)
  - Paused deadlifts in later blocks (build position strength)
- **Progress Indicator:** Setup consistency and bar path improvement

---

## Meet Day Strategy

### Attempt Selection Framework

**First Attempt (Opener):**
- **Weight:** 90% of Week 9-10 top single
- **Goal:** Guaranteed lift on worst day
- **Sarah's Openers:** Squat 270lbs, Bench 158lbs, Deadlift 310lbs
- **Rationale:** Go 3/3 on openers, get on the board, build confidence

**Second Attempt:**
- **Weight:** 95-97% of Week 9-10 top single (based on opener speed)
- **Goal:** Realistic PR or match current best
- **Decision:** If opener fast → aggressive (97%), if slow → conservative (95%)
- **Sarah's Targets:** Squat 285-290lbs, Bench 167-170lbs, Deadlift 325-335lbs

**Third Attempt:**
- **Weight:** 100-103% of Week 9-10 top single
- **Goal:** Stretch goal, maximize total
- **Decision:** Based on second attempt and total strategy
- **Sarah's Targets:** Squat 300-305lbs, Bench 178-185lbs, Deadlift 350-360lbs

**Total Strategy:**
- Conservative approach: 738-745 opener total → 777-795 second attempt total → competitive third attempts
- Goal is to MAKE LIFTS, not chase numbers
- Better to hit 895 going 9/9 than bomb out chasing 920

---

## When to Use This Programming Style

**Appropriate For:**
- ✅ Powerlifting competitors with fixed meet date
- ✅ Intermediate to advanced lifters (2+ years consistent training)
- ✅ Athletes who can commit to 12-16 week prep cycle
- ✅ Lifters comfortable with percentage-based programming
- ✅ Those who respond well to structured periodization
- ✅ Competitive lifters seeking to peak for performance

**Not Appropriate For:**
- ❌ Beginners (use linear progression instead)
- ❌ Lifters not competing (use open-ended strength programs)
- ❌ Athletes with unpredictable schedules (can't commit to 12 weeks)
- ❌ Lifters who prefer intuitive/autoregulated training without percentages
- ❌ Off-season training (use hypertrophy or base-building blocks)

---

## Technical Notes

### RPE/RIR Scale
- **RPE 7:** Could do 3 more reps (RIR 3)
- **RPE 8:** Could do 2 more reps (RIR 2)
- **RPE 9:** Could do 1 more rep (RIR 1)
- **RPE 10:** Max effort, no more reps possible (RIR 0)

### Tempo Notation
Format: `[eccentric]-[pause]-[concentric]`
- **3-0-X:** 3-second lower, no pause, explosive up
- **3-2-X:** 3-second lower, 2-second pause, explosive up

### Exercise Categories
- **main-lift:** Competition lifts (squat, bench, deadlift)
- **variation:** Competition lift variations (pause, deficit, close-grip)
- **accessory:** Secondary movements (RDL, rows, leg press)
- **isolation:** Single-joint work (leg curls, tricep pushdowns)

---

## Integration with GymText System

These examples demonstrate how GymText agents work together for meet prep:

1. **plan:generate** → Creates 12-week meet prep framework (TEXT)
2. **microcycle:generate** → Creates weekly plans for each block (TEXT)
3. **structure:microcycle** → Converts microcycle to JSON (STRUCTURE)
4. **workout:generate** → Creates individual workout details (TEXT)
5. **message:workout** → Formats for SMS delivery (TEXT)
6. **structure:workout** → Converts workout to JSON (STRUCTURE)

**The Pattern:** TEXT → STRUCTURE

Agents generate natural language training plans optimized for meet prep, then specialized structuring agents convert that text into JSON that drives the application backend.

---

## Post-Meet Recovery

**Week 1 Post-Meet:**
- Complete rest or very light movement
- Reflect on meet performance, watch videos
- Celebrate successes or process disappointments

**Weeks 2-4 Post-Meet:**
- Light training (50-60% volume)
- Address weaknesses identified during meet
- Enjoy training without meet pressure

**Next Meet Cycle:**
- Minimum 12 weeks between peaking cycles
- Ideally 20-24 weeks for optimal improvement
- Use off-season for hypertrophy and base building

---

## Expected Outcomes

**If Prep Goes Well:**
- Sarah tests 285-295 squat, 167-175 bench, 325-340 deadlift in Week 9-10
- She hits conservative openers going 3/3
- Second attempts are PRs (at least 2/3)
- Third attempts push limits (1-2/3)
- **Total Range:** 885-905lbs (meets or exceeds 900lb goal)

**If Prep is Challenging:**
- Sarah adjusts expectations based on Week 9-10 performance
- Opens conservatively, focuses on making lifts
- Prioritizes total over individual lift PRs
- **Total Range:** 870-890lbs (respectable, builds for next meet)

**Regardless of Outcome:**
- Gains meet experience and confidence
- Learns response to peaking stimulus
- Identifies areas for next training cycle
- Builds mental toughness

---

## Related Examples

- **Beginner 3-Day Plan Examples** (`examples/beginner-3-day/`) — Linear progression and full-body training
- **Intermediate Upper/Lower Split** (`examples/intermediate-upper-lower/`) — Block periodization for intermediates
- **Bodybuilding Hypertrophy Examples** (coming soon) — Hypertrophy-focused training
- **Athletic Performance Examples** (coming soon) — Sport-specific training

---

## Questions or Feedback

This is a living example set. If you find issues, inconsistencies, or opportunities for improvement, document them and iterate.

**Created:** February 16, 2026  
**Author:** Shackleton (Product Researcher)  
**Athlete Profile:** Sarah Chen (fictional)  
**Program Duration:** 12 weeks  
**Training Split:** 4-day powerlifting focus (Squat/Bench/Deadlift/Accessories)  
**Meet Date:** April 15, 2026  
**Goal:** 900+ lb total @ 72kg
