# Workout Message Agent User Prompt Template

## Purpose
This template defines how to structure the user prompt when requesting daily workout message formatting from the Workout Message Agent.

## Structure

```
Convert the following workout into a daily text message for [User Name].

[Full workout details from microcycle]

Message preferences:
- [Tone/style preference]
- [Emoji usage preference]
- [Any special context for this day]

Use the standard message format: Session title, warm-up (brief), workout (sets×reps@weight), notes (1-2 sentences).
```

## Examples

### Example 1: Strength Training (Upper Strength Day)

```
Convert the following workout into a daily text message for Alex Martinez.

## Workout — Monday, February 16, 2026
**Focus:** Upper Strength
**Location:** Home gym
**Duration:** ~60 minutes

**Warm-Up (5 minutes)**
1. Band pull-apart: 2 × 15
2. Push-up to downward dog: × 5
3. Empty bar bench press: × 10

**Main Workout**

### 1. Barbell Bench Press
**Target:** 4 × 5 @ RPE 8
- Set 1: 95 lbs × 8 (warm-up)
- Set 2: 125 lbs × 5 (warm-up)
- Set 3: 150 lbs × 5 (RPE 7.5)
- Set 4: 155 lbs × 5 (RPE 8)
- Set 5: 155 lbs × 5 (RPE 8)
- Set 6: 155 lbs × 4 (RPE 8.5)
**Rest:** 3 minutes between working sets
**Notes:** Up 5 lb from last week. Last set ground to a 4 — that's fine for week 3.

### 2. Barbell Row
**Target:** 4 × 6 @ RPE 7
- Set 1: 135 lbs × 8 (warm-up)
- Set 2: 155 lbs × 6 (RPE 7)
- Set 3: 155 lbs × 6 (RPE 7)
- Set 4: 155 lbs × 6 (RPE 7.5)
- Set 5: 155 lbs × 6 (RPE 7.5)
**Rest:** 2-3 minutes

### 3. Overhead Press
**Target:** 3 × 8 @ RPE 7
- Set 1: 85 lbs × 8 (RPE 6.5)
- Set 2: 90 lbs × 8 (RPE 7)
- Set 3: 90 lbs × 8 (RPE 7.5)
**Rest:** 2 minutes

### 4. Weighted Pull-Up
**Target:** 3 × 6 @ RPE 7
- Set 1: +10 lbs × 6 (RPE 7)
- Set 2: +10 lbs × 6 (RPE 7)
- Set 3: +10 lbs × 5 (RPE 7.5)
**Rest:** 2 minutes

### 5. Band Face Pull
**Target:** 2 × 15
- Set 1: Heavy band × 15
- Set 2: Heavy band × 15
**Rest:** 60 seconds

**Cool Down (5 minutes)**
1. Chest doorway stretch: 30s each side
2. Overhead lat stretch: 30s each side
3. Shoulder circles: 10 each direction

**Notes**
Total time: 62 minutes. Bench felt strong — 5 lb jump was appropriate. Cut last set of pull-ups by a rep (fatigue from row). Face pulls felt great for rear delt.

Message preferences:
- Concise, coach-like tone
- Minimal emoji (0-1 per message)
- Week 3 context reminder

Use the standard message format.
```

### Example 2: Endurance Training (Cycling Interval Day)

```
Convert the following workout into a daily text message for Jordan Lee.

## Workout — Tuesday, February 17, 2026
**Focus:** VO2max Intervals
**Location:** Indoor trainer (Wahoo Kickr)
**Duration:** ~90 minutes

**Warm-Up (15 minutes)**
1. Easy spin: 10 min @ Z1 (115-125 bpm)
2. Build: 3 × 1 min @ Z2/Z3/Z4 with 1 min easy between
3. Easy spin: 2 min

**Main Workout**

### VO2max Intervals
**Target:** 5 × 4 min @ 105% FTP (194W), 4 min easy recovery between
- Interval 1: 4:00 @ 195W, avg HR 168, RPE 9
- Recovery 1: 4:00 @ 100W
- Interval 2: 4:00 @ 194W, avg HR 171, RPE 9
- Recovery 2: 4:00 @ 100W
- Interval 3: 4:00 @ 193W, avg HR 172, RPE 9+
- Recovery 3: 4:00 @ 100W
- Interval 4: 4:00 @ 190W, avg HR 170, RPE 9 (backed off power slightly, HR still high)
- Recovery 4: 4:00 @ 100W
- Interval 5: 4:00 @ 188W, avg HR 169, RPE 9 (maintained effort, power drifted down)

**Cool Down (15 minutes)**
Easy spin: 15 min @ Z1 (110-120 bpm)

**Notes**
Total time: 92 minutes. Power drifted slightly on last 2 intervals but effort and HR stayed consistent — that's normal for VO2max work. HR response was good (hit Z5 on all intervals). Felt strong overall.

Message preferences:
- Supportive, coach-like tone
- Use cycling emoji
- Note that power drift is expected

Use the standard message format.
```

### Example 3: Rehab/Return-to-Training (Lower Body ROM + Stability)

```
Convert the following workout into a daily text message for Sam Rivera.

## Workout — Monday, February 16, 2026
**Focus:** Lower Body ROM + Stability
**Location:** Home
**Duration:** ~35 minutes

**Warm-Up (5 minutes)**
1. Foam roll quads + IT band: 2 min
2. Banded clamshells: × 10 each side
3. Glute bridge: × 10

**Main Workout**

### 1. Bodyweight Squat (ROM Focus)
**Target:** 3 × 8 to deepest pain-free depth
- Set 1: × 8 to 105° (pain-free, improving!)
- Set 2: × 8 to 110° (slight stretch sensation, no pain)
- Set 3: × 8 to 110° (consistent depth)
**Rest:** 60 seconds
**Notes:** ROM improving! Up from 100° last week. Monitoring knee — no pain, just stretch.

### 2. Single-Leg Balance
**Target:** 3 × 40s each leg, eyes open
- Left leg: 40s, 40s, 40s (stable)
- Right leg (surgical): 35s, 40s, 38s (still slightly less stable, but improving)
**Rest:** 30 seconds between legs

### 3. Banded Leg Extension
**Target:** 2 × 15 each leg (light band)
- Set 1: × 15 each leg (focusing on quad activation)
- Set 2: × 15 each leg
**Rest:** 45 seconds
**Notes:** Quad activation improving on right leg. No pain, good contraction.

### 4. Glute Bridge (Isometric Hold)
**Target:** 3 × 20s
- Set 1: 20s (solid squeeze)
- Set 2: 20s
- Set 3: 20s

**Cool Down (5 minutes)**
1. Quad stretch: 30s each side
2. Hamstring stretch: 30s each side
3. Figure-4 hip stretch: 30s each side

**Notes**
Total time: 34 minutes. Great session — ROM is clearly improving on squat (110° today vs 100° last week). Balance on surgical leg is catching up. No pain throughout session.

Message preferences:
- Encouraging, supportive tone
- Emphasize progress (ROM improvement)
- No emoji needed

Use the standard message format.
```

### Example 4: Rest Day Message

```
Convert the following rest day into a message for Alex Martinez.

## Sunday, February 22, 2026
**Rest Day**

No training today. Recovery is part of the program.

If you feel like moving:
- Walk: 20-30 min
- Stretching: 10-15 min
- Foam rolling: IT band, quads, glutes

Next week is a deload week (Week 4). Same movements, lighter weights (40% volume, 80% intensity). Focus on recovery and prepare for Intensification Phase.

Message preferences:
- Simple, supportive tone
- Note next week's deload
- Invite feedback on how the week went

Use the standard message format.
```

### Example 5: Powerlifter Competition Simulation Day

```
Convert the following workout into a daily text message for Chen Wu.

## Workout — Saturday, February 21, 2026
**Focus:** Competition Day Simulation
**Location:** Powerlifting gym
**Duration:** ~150 minutes

**Warm-Up (Meet-Style, 20 minutes)**
Full meet warm-up protocol:
- Foam roll + band work: 5 min
- Squat progression: bar×5, 135×3, 185×2, 225×1, 255×1
- Bench progression: bar×5, 95×3, 135×2
- Deadlift progression: 135×3, 225×1

**Main Workout**

### 1. Competition Squat
**Target:** Work to 310 × 2 (RPE 8.5)
- 275 × 2 (RPE 7, full commands practiced)
- 290 × 2 (RPE 7.5)
- 305 × 2 (RPE 8)
- 310 × 2 (RPE 8.5)
**Rest:** 5-7 minutes between heavy sets
**Notes:** Full competition standards. Commands practiced on all sets. 310×2 was a grind on rep 2 but locked out clean. Depth was good on all reps (white lights). Belt and sleeves from 275+.

### 2. Competition Bench Press (Paused)
**Target:** Work to 265 × 2 (RPE 8.5)
- 205 × 2 (RPE 6, paused)
- 225 × 2 (RPE 7)
- 245 × 2 (RPE 7.5)
- 260 × 2 (RPE 8)
- 265 × 2 (RPE 8.5)
**Rest:** 5 minutes between heavy sets
**Notes:** Full pause on every rep (2 count). Lockout felt stronger than last week — board press is transferring. Last rep of 265 was slow but stable.

### 3. Competition Deadlift
**Target:** Work to 475 × 2 (RPE 8.5)
- 365 × 2 (RPE 6)
- 405 × 2 (RPE 7)
- 440 × 2 (RPE 7.5)
- 465 × 2 (RPE 8)
- 475 × 2 (RPE 8.5+)
**Rest:** 5-7 minutes between heavy sets
**Notes:** Off the floor is noticeably faster (deficit + pause work paying off). 475×2 was RPE 8.5-9 — second rep was very heavy. Lockout was controlled on both.

### Accessories (Light)
4. Pendlay Row: 3 × 5 @ 155 lb (back pump, support deadlift)
5. Dips: 2 × 6 BW (lockout strength, light tricep work)

**Cool Down (10 minutes)**
1. Hang from bar: 30s × 2 (decompress spine)
2. Couch stretch: 60s each side
3. Foam roll: upper back, glutes

**Notes**
Total time: 148 minutes. Heaviest doubles of the prep. All lifts moved well — 310/265/475 are solid for 6 weeks out. Squat depth was competition-ready. Bench lockout is improving (265 lockout was controlled). Deadlift off floor is much faster. Ready for 2 more weeks of Intensification before transitioning to singles in Realization. Bodyweight: 155.6 lb (comfortable).

Message preferences:
- Direct, coach-like tone
- Note this is heaviest double week
- Emphasize competition standards
- Use strength emoji

Use the standard message format.
```

## Key Elements

Every user prompt should include:
1. **Full workout details** (from microcycle)
2. **Message preferences** (tone, emoji usage, special context)
3. **Format reminder** (light touch, 1 sentence)

## What NOT to Include

- ❌ Full role description (that's in the system prompt)
- ❌ Detailed format specification (that's in the system prompt)
- ❌ Examples of good/bad messages (that's in the system prompt)
- ❌ General instructions about compression (that's in the system prompt)
