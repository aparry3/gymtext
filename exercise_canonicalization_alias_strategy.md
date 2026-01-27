# Exercise Canonicalization & Alias Strategy (GymText)

## Core idea

- **Canonical Exercise** = the single, stable entity you track progress against
- **Exercise Alias** = any string that should resolve to that canonical exercise

**One canonical exercise can (and should) have many aliases.**

This design allows:
- messy human + LLM input
- stable progress tracking
- fast, deterministic matching over time

---

## Mental model

Think of this like usernames vs user IDs.

- The **canonical exercise ID** is the user ID (stable, internal, reliable)
- The **alias** is the username (many variants, changeable, user-facing)

You *never* track progress on the alias.  
You *always* track progress on the canonical ID.

---

## Canonical Exercise

Represents a real, meaningful exercise identity you want to chart over time.

**Examples**
- `barbell bench press`
- `dumbbell bench press`
- `romanian deadlift`
- `pull-up`
- `lat pulldown`

### Canonical rules
- Canonicals should be:
  - stable
  - intentional
  - analytically meaningful
- If two exercises should have **separate PRs**, they should be **separate canonicals**

---

## Exercise Alias

Represents *how someone might refer to an exercise*.

Aliases exist to catch:
- spelling variants
- abbreviations
- casing differences
- LLM phrasing differences
- user phrasing differences

**All aliases point to a canonical exercise ID.**

### Example

Canonical:
- `id: uuid-123`
- `canonical_name: barbell bench press`

Aliases (all → `uuid-123`):
- `bench press`
- `barbell bench press`
- `bb bench press`
- `flat bench`
- `bench`
- `benchpress`
- `barbell bench`

Yes — popular exercises will accumulate **many aliases**.  
That’s expected and good.

---

## Why aliases exist (and why they’re critical)

Humans and LLMs are inconsistent:

- “bench press”
- “barbell bench”
- “bb bench”
- “flat bench press”
- “bench”

Without aliases, you would:
- duplicate exercises
- fragment progress
- constantly re-resolve names

Aliases let the system **learn once and remember forever**.

---

## Matching flow (alias-first)

When resolving an exercise from workout JSON:

1. Take `name_raw` from the workout
2. Normalize it (lowercase, punctuation removed, etc.)
3. Look up an exact match in `exercise_alias.alias`
4. If found → return `exercise_id`
5. If not found → fallback (rules, fuzzy, vector, LLM judge)
6. Once resolved → **insert a new alias** for future exact matches

This means:
- the system improves automatically over time
- common exercises quickly become instant matches

---

## Alias learning loop

### First time
LLM outputs:
```
"Single Arm Cable Row"
```

- No alias exists
- Resolver chooses canonical: `single-arm cable row`
- Workout JSON is saved with:
  - `exercise_id`
  - `name_raw = "Single Arm Cable Row"`

Then insert:
```
alias = "single arm cable row" → exercise_id
```

### Next time
LLM outputs:
```
"Single Arm Cable Row"
```

- Exact alias hit
- No fuzzy / vector / LLM needed
- Fast and deterministic

---

## Ambiguous names (important rule)

Some strings are genuinely ambiguous:
- `row`
- `press`
- `curl`
- `fly`

**Do NOT create global aliases that collapse meaning**, e.g.:

❌ `row → barbell row`  
❌ `press → bench press`

Instead:
- rely on hints (equipment, pattern)
- resolve once using vector / LLM
- create a **specific alias from the full phrase**, not the generic word

Good alias:
- `single arm cable row`
Bad alias:
- `row`

---

## Canonical vs alias: what goes where

### Canonical exercise
Represents:
- what you want to chart
- what has a PR
- what shows trends over time

### Alias
Represents:
- how input text refers to that exercise
- strings you want to resolve deterministically

Rule of thumb:
> If two inputs should land on the **same progress graph**, they belong under the same canonical with different aliases.

---

## Workout JSON usage

Workouts remain stored as JSON.  
Each exercise entry contains the canonical ID.

Example:

```json
{
  "name_raw": "Bench Press",
  "display_name": "Bench Press",
  "exercise_id": "uuid-123",
  "resolution": {
    "method": "exact",
    "confidence": 1.0,
    "version": 1
  },
  "sets": [
    { "reps": 8, "load_lb": 185 }
  ]
}
```

- `exercise_id` is the **only thing used for progress**
- `name_raw` is kept forever for audit + future re-resolution
- aliases make future matches instant

---

## Expected scale (rough)

Over time, expect:
- **Canonicals**: 1k–10k
- **Aliases**: 2x–20x canonicals (heavily skewed toward popular lifts)

This is normal and healthy.

---

## Key takeaways

- Canonical exercises are **few and stable**
- Aliases are **many and growing**
- Aliases exist to protect your canonicals from messy input
- Progress always keys off the canonical ID
- Every successful resolution should create a new alias

This design gives GymText:
- consistent analytics
- fast resolution
- a system that improves automatically with use

