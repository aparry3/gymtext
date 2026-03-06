## Scoring System

Each dimension is scored **out of 10**, then multiplied by its **weight** to calculate the final score.

### Scoring Formula

```
Final Score = (Formatting × 0.30) + (Completeness × 0.20) + (Consistency × 0.20) + (Clarity × 0.15) + (Adherence × 0.15)
```

**Weights:**
- **Formatting Correctness:** 0.30 (most important - affects readability)
- **Completeness:** 0.20 (nothing should be lost)
- **Consistency:** 0.20 (patterns should be uniform)
- **Clarity:** 0.15 (should be clean and scannable)
- **Adherence to Rules:** 0.15 (follows format specifications)

**Total Weight:** 1.0 (all weights sum to 1.0)

---

## Scoring Categories

### 1. Formatting Correctness (Weight: 0.30)

**Criteria:**
- Workout name at top with colon (e.g., "Push Volume Day Workout:")
- All exercises use proper bullet format (dash + space)
- Correct sets x reps notation (4x10-12, 3x30s, 4x40m)
- Proper superset notation (SS1/SS2/SS3, numbered sequentially)

**Scoring:**
- **10/10:** Perfect formatting across all criteria
  - Workout name with colon ✓
  - All bullets correct ✓
  - All notation perfect (4x10-12, 3x30s, etc.) ✓
  - Superset notation correct (SS1, SS2, SS3) or N/A ✓

- **7-9/10:** Minor formatting issues
  - 1-2 small notation errors (e.g., extra spaces "4 x 10-12")
  - Superset numbering slightly off (e.g., SS1, SS1, SS3)
  - Minor bullet inconsistencies

- **4-6/10:** Several formatting problems
  - Multiple notation errors
  - Inconsistent bullet structure
  - Missing workout name colon
  - Wrong superset format (e.g., "Superset 1:")

- **1-3/10:** Major formatting failures
  - Verbose descriptions instead of notation (e.g., "4 sets of 10-12 reps")
  - No bullet structure
  - Wrong workout name format

- **0/10:** Completely incorrect formatting throughout

---

### 2. Completeness (Weight: 0.20)

**Criteria:**
- All exercises from input are present
- All details preserved (sets, reps, distances, times, effort levels)
- Warmup/cooldown included when present in input

**Scoring:**
- **10/10:** Everything included
  - All exercises present ✓
  - All details preserved (sets, reps, effort, notes) ✓
  - Warmup/cooldown present if in input ✓

- **7-9/10:** Minor omissions
  - 1 exercise detail missing (e.g., missing effort % on one exercise)
  - Minor note omitted

- **4-6/10:** Noticeable gaps
  - 1-2 exercises missing
  - Multiple details missing
  - Warmup/cooldown missing

- **1-3/10:** Significant omissions
  - 3+ exercises missing
  - Major sections omitted
  - Critical details missing throughout

- **0/10:** Most content missing or completely incomplete

---

### 3. Consistency (Weight: 0.20)

**Criteria:**
- Same notation style used throughout (all 4x10-12 format, not mixed)
- All cardio/running includes effort levels formatted as "@ 85%"
- Supersets numbered sequentially without gaps (SS1, SS2, SS3)

**Scoring:**
- **10/10:** Perfectly consistent
  - Same notation style throughout ✓
  - All effort percentages formatted correctly ✓
  - Superset numbering sequential ✓

- **7-9/10:** Mostly consistent
  - 1-2 notation inconsistencies (e.g., one "3 sets of 10" among "3x10")
  - Effort levels present but format slightly off (e.g., "at 85%")

- **4-6/10:** Multiple inconsistencies
  - Notation style mixed throughout
  - Several effort format errors
  - Superset numbering has gaps

- **1-3/10:** Highly inconsistent
  - Multiple notation styles mixed randomly
  - No consistent pattern

- **0/10:** Completely inconsistent, no discernible pattern

---

### 4. Clarity (Weight: 0.15)

**Criteria:**
- Clean, scannable layout; easy to read on phone
- Concise exercise names; no verbose descriptions
- No unnecessary motivational messages or coaching notes

**Scoring:**
- **10/10:** Crystal clear
  - Perfect readability ✓
  - Concise exercise names ✓
  - No coaching fluff ✓

- **7-9/10:** Clear but minor issues
  - Slightly cluttered but readable
  - Minimal unnecessary text
  - One or two verbose items

- **4-6/10:** Readability issues
  - Hard to scan
  - Some verbose descriptions
  - Minor coaching notes that interfere

- **1-3/10:** Poor clarity
  - Confusing layout
  - Long-winded descriptions
  - Excessive motivational text

- **0/10:** Unreadable or extremely cluttered

---

### 5. Adherence to Rules (Weight: 0.15)

**Criteria:**
- Uses appropriate format for workout type (AMRAP, EMOM, Circuit, Standard)
- No forbidden headers (no "Warmup:", "Main:", "Cooldown:" headers for running)
- Proper section usage (Conditioning/notes sections used appropriately)

**Scoring:**
- **10/10:** Perfect adherence
  - Correct format type ✓
  - No anti-patterns ✓
  - Proper section usage ✓

- **7-9/10:** Minor rule deviations
  - Correct format but minor details wrong
  - Sections present but formatting slightly off

- **4-6/10:** Several rule violations
  - Wrong format type
  - One or two anti-patterns used
  - Section structure incorrect

- **1-3/10:** Major rule violations
  - Uses multiple forbidden patterns
  - Wrong format throughout
  - Missing required sections

- **0/10:** Completely violates formatting rules

---

## Grade Scale

| Final Score | Grade | Verdict |
|-------------|-------|---------|
| 9.0-10.0 | A | Excellent - Production ready |
| 8.0-8.9 | B | Good - Minor improvements needed |
| 7.0-7.9 | C | Acceptable - Several issues to address |
| 6.0-6.9 | D | Poor - Significant problems |
| 0.0-5.9 | F | Fail - Does not meet basic standards |

**Pass Threshold:** 8.0 out of 10

---

## Example Evaluations

### ✅ Example 1: Excellent Formatting (Final Score: 9.5/10)

**Input:**
```
Weekly Plan:

Monday: Push Volume Day
- DB Flat Bench Press: 4 sets of 10-12 reps
- Incline DB Bench Press: 3 sets of 12-15 reps
- Seated DB Shoulder Press: 3 sets of 10-12 reps
- Cable Lateral Raise: 3 sets of 15-20 reps (superset with reverse pec deck fly)
- Reverse Pec Deck Fly: 3 sets of 15-20 reps
- Rope Tri Pushdown: 3 sets of 12-15 reps (superset with DB OH tri extension)
- DB OH Tri Extension: 3 sets of 12-15 reps
- Dead Bug: 3 sets of 8-10 reps per side (superset with front plank)
- Front Plank: 3 sets of 30-45 seconds
- Conditioning: 20-25 minutes moderate steady-state cardio

Format Monday's workout.
```

**Output:**
```
Push Volume Day Workout:
- DB Flat Bench Press: 4x10-12
- Incline DB Bench Press: 3x12-15
- Seated DB Shoulder Press: 3x10-12
- SS1 Cable Lateral Raise: 3x15-20
- SS1 Reverse Pec Deck Fly: 3x15-20
- SS2 Rope Tri Pushdown: 3x12-15
- SS2 DB OH Tri Extension: 3x12-15
- SS3 Dead Bug: 3x8-10/side
- SS3 Front Plank: 3x30-45s

Conditioning:
- Moderate steady-state cardio: 20-25m
```

**Scoring Breakdown:**

| Dimension | Score | Weight | Weighted Score | Rationale |
|-----------|-------|--------|----------------|-----------|
| **Formatting Correctness** | 10/10 | 0.30 | 3.00 | Perfect notation, bullets, superset format |
| **Completeness** | 10/10 | 0.20 | 2.00 | All exercises and details included |
| **Consistency** | 10/10 | 0.20 | 2.00 | Uniform notation throughout |
| **Clarity** | 10/10 | 0.15 | 1.50 | Clean, scannable, concise |
| **Adherence to Rules** | 10/10 | 0.15 | 1.50 | Perfect format, proper sections |

**Final Score: 3.00 + 2.00 + 2.00 + 1.50 + 1.50 = 10.0/10**  
**Grade: A**  
**Verdict:** Excellent - Production ready

---

### ❌ Example 2: Poor Formatting (Final Score: 4.2/10)

**Input:**
```
Weekly Plan:

Tuesday: Tempo Run
- Warmup: 2 mile easy jog
- Main set: 5 miles at 85% effort (tempo pace)
- Cooldown: 1 mile easy jog

Format Tuesday's workout.
```

**Output:**
```
Tempo Run Workout for Tuesday

Warmup:
- Easy jog for 2 miles

Main:
- Run 5 miles at tempo pace (85% effort)

Cooldown:
- Easy jog for 1 mile

Great job today! Focus on maintaining that steady tempo pace. You've got this! 💪
```

**Scoring Breakdown:**

| Dimension | Score | Weight | Weighted Score | Rationale |
|-----------|-------|--------|----------------|-----------|
| **Formatting Correctness** | 3/10 | 0.30 | 0.90 | Missing colon, verbose descriptions, wrong notation |
| **Completeness** | 8/10 | 0.20 | 1.60 | All segments included, details present but verbose |
| **Consistency** | 0/10 | 0.20 | 0.00 | Wrong effort format, inconsistent notation |
| **Clarity** | 3/10 | 0.15 | 0.45 | Extra headers, too verbose, motivational fluff |
| **Adherence to Rules** | 0/10 | 0.15 | 0.00 | Uses forbidden section headers (Warmup:, Main:, Cooldown:) |

**Final Score: 0.90 + 1.60 + 0.00 + 0.45 + 0.00 = 2.95/10**  
**Grade: F**  
**Verdict:** Fail - Does not meet basic standards

**What's Wrong:**
1. ❌ Uses forbidden section headers ("Warmup:", "Main:", "Cooldown:")
2. ❌ Verbose descriptions instead of concise notation
3. ❌ Wrong effort format ("(85% effort)" instead of "@ 85%")
4. ❌ Adds unnecessary motivational text and emoji
5. ❌ "for Tuesday" in workout name (should just be "Tempo Run:")
6. ❌ Distance notation wrong ("2 miles" instead of "2 mi")

**Correct Output:**
```
Tempo Run:
- 2 mi: warmup jog
- 5 mi @ 85%
- 1 mi: cooldown jog
```

---

### ❌ Example 3: Incomplete Formatting (Final Score: 5.8/10)

**Input:**
```
Weekly Plan:

Wednesday: Pull Strength Day
- Deadlift: 5 sets of 5 reps (heavy)
- Weighted Pull-ups: 4 sets of 6-8 reps
- Barbell Row: 4 sets of 6-8 reps
- Chest-Supported Row: 3 sets of 8-10 reps
- Face Pulls: 3 sets of 15-20 reps
- Barbell Curl: 3 sets of 8-10 reps
- Hammer Curl: 3 sets of 10-12 reps
- Rest: 2-3 minutes between main lifts

Format Wednesday's workout.
```

**Output:**
```
Pull Strength Workout:
- Deadlift: 5x5
- Weighted Pull-ups: 4x6-8
- Barbell Row: 4x6-8
- Chest-Supported Row: 3 sets of 8-10
- Face Pulls: 3x15-20
- Barbell Curl: 3 sets of 8-10
```

**Scoring Breakdown:**

| Dimension | Score | Weight | Weighted Score | Rationale |
|-----------|-------|--------|----------------|-----------|
| **Formatting Correctness** | 7/10 | 0.30 | 2.10 | Mostly correct but mixes "3x" with "3 sets of" |
| **Completeness** | 3/10 | 0.20 | 0.60 | Missing Hammer Curl, missing "(heavy)" note, missing rest guidance |
| **Consistency** | 3/10 | 0.20 | 0.60 | Notation inconsistent (mixing "3x8-10" and "3 sets of 8-10") |
| **Clarity** | 9/10 | 0.15 | 1.35 | Clean and readable, concise, no fluff |
| **Adherence to Rules** | 5/10 | 0.15 | 0.75 | Correct format type but missing notes section |

**Final Score: 2.10 + 0.60 + 0.60 + 1.35 + 0.75 = 5.40/10**  
**Grade: F**  
**Verdict:** Fail - Incomplete and inconsistent

**What's Wrong:**
1. ❌ Missing "Hammer Curl" exercise entirely
2. ❌ Inconsistent notation ("3 sets of 8-10" vs "3x8-10")
3. ❌ Missing "(heavy)" note on Deadlift
4. ❌ Missing rest period guidance at the end

**Correct Output:**
```
Pull Strength Workout:
- Deadlift: 5x5 (heavy)
- Weighted Pull-ups: 4x6-8
- Barbell Row: 4x6-8
- Chest-Supported Row: 3x8-10
- Face Pulls: 3x15-20
- Barbell Curl: 3x8-10
- Hammer Curl: 3x10-12

Rest: 2-3 min between main lifts
```

---

### ✅ Example 4: Good Running Workout (Final Score: 8.8/10)

**Input:**
```
Weekly Plan:

Thursday: Track Intervals
- Warmup: 1.5 mile jog
- Main set: 6 rounds of 400m at 95% effort with 90 second jog recovery
- Cooldown: 1 mile jog

Format Thursday's workout.
```

**Output:**
```
Track Intervals:
- 1.5 mi: warmup jog
- 6x: 400m @ 95% + 90s jog
- 1 mi: cooldown jog
```

**Scoring Breakdown:**

| Dimension | Score | Weight | Weighted Score | Rationale |
|-----------|-------|--------|----------------|-----------|
| **Formatting Correctness** | 10/10 | 0.30 | 3.00 | Perfect interval notation, correct format |
| **Completeness** | 10/10 | 0.20 | 2.00 | All segments and details included |
| **Consistency** | 10/10 | 0.20 | 2.00 | Uniform notation, correct effort format |
| **Clarity** | 10/10 | 0.15 | 1.50 | Clean, scannable, concise |
| **Adherence to Rules** | 10/10 | 0.15 | 1.50 | Perfect interval format, no anti-patterns |

**Final Score: 3.00 + 2.00 + 2.00 + 1.50 + 1.50 = 10.0/10**  
**Grade: A**  
**Verdict:** Excellent - Production ready

---

### ✅ Example 5: Perfect EMOM (Final Score: 10.0/10)

**Input:**
```
Weekly Plan:

Friday: Full Body EMOM
- 30 minute EMOM alternating:
  - Minute 1: 15 KB swings
  - Minute 2: 12-15 push-ups
  - Minute 3: 12 goblet squats
  - Minute 4: 8 renegade rows per side
  - Minute 5: 50 jump rope skips
  - Minute 6: Rest
- Repeat 5 times through for 30 minutes total

Format Friday's workout.
```

**Output:**
```
30-Minute EMOM (Every Minute On the Minute):
- Min 1: KB Swing x15
- Min 2: Push-ups x12-15
- Min 3: Goblet Squat x12
- Min 4: Renegade Row x8/side
- Min 5: Jump Rope x50
- Min 6: Rest

Repeat 5 times through (30 min total)
```

**Scoring Breakdown:**

| Dimension | Score | Weight | Weighted Score | Rationale |
|-----------|-------|--------|----------------|-----------|
| **Formatting Correctness** | 10/10 | 0.30 | 3.00 | Perfect EMOM format with "Min X: Exercise x reps" |
| **Completeness** | 10/10 | 0.20 | 2.00 | All exercises, rest, and instructions included |
| **Consistency** | 10/10 | 0.20 | 2.00 | Consistent notation throughout |
| **Clarity** | 10/10 | 0.15 | 1.50 | Perfect readability, concise, clean |
| **Adherence to Rules** | 10/10 | 0.15 | 1.50 | Exemplary EMOM format, proper instructions |

**Final Score: 3.00 + 2.00 + 2.00 + 1.50 + 1.50 = 10.0/10**  
**Grade: A**  
**Verdict:** Perfect - Exemplary formatting

---

## Automated Evaluation Guidelines

### Implementation Notes

**For automated evaluation tools:**

1. **Score Each Dimension (0-10):** Evaluate each of the 5 dimensions on a scale of 0-10
2. **Apply Weights:** Multiply each dimension score by its weight
3. **Calculate Final Score:** Sum all weighted scores to get final score out of 10
4. **Pattern Matching:** Use regex to validate notation (e.g., `\d+x\d+-?\d*`, `@ \d+%`)
5. **Anti-Pattern Detection:** Flag forbidden patterns (deduct heavily from Adherence score)
6. **Consistency Checks:** Ensure same notation style throughout

**Suggested Regex Patterns:**
```
Sets x Reps: ^\d+x\d+(-\d+)?$
Time-based: ^\d+x\d+s$
Distance: ^\d+x\d+m$
Superset: ^SS\d+\s
Effort: @ \d+%
Intervals: ^\d+x:\s.*@\s\d+%\s\+\s.*$
```

**Weighted Scoring Example:**
```python
def calculate_final_score(formatting, completeness, consistency, clarity, adherence):
    """
    Calculate weighted final score out of 10.
    Each dimension is scored 0-10.
    """
    weights = {
        'formatting': 0.30,
        'completeness': 0.20,
        'consistency': 0.20,
        'clarity': 0.15,
        'adherence': 0.15
    }
    
    final_score = (
        formatting * weights['formatting'] +
        completeness * weights['completeness'] +
        consistency * weights['consistency'] +
        clarity * weights['clarity'] +
        adherence * weights['adherence']
    )
    
    return round(final_score, 1)
```

**Edge Cases:**
- When a category doesn't apply (e.g., no supersets), score that sub-component as N/A and base score on remaining criteria
- Partial credit for minor spacing issues (7-9/10 range)
- Zero tolerance for major anti-patterns (0-3/10 in Adherence)
