# Structured Workout Schema

This document describes the JSON structure used for structured workouts in GymText. These structures power workout rendering, progress tracking, and the `/me` page.

## Overview

A structured workout is a tree: **Workout → Sections → Exercises (Activities)**

```
WorkoutStructure
├── title, focus, description, quote
├── sections[]
│   ├── title, overview
│   └── exercises[] (WorkoutActivity)
│       ├── name, type
│       ├── sets, reps (strength metrics)
│       ├── duration, distance (cardio metrics)
│       ├── rest, intensity, tempo
│       ├── notes, tags, supersetId
│       └── exerciseId, nameRaw, resolution (set by system)
├── estimatedDurationMin, intensityLevel
└── tags (WorkoutTags)
```

## Schema Reference

Source: `packages/shared/src/shared/types/workout/workoutStructure.ts`

### WorkoutStructure (top level)

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Concise name, 2-4 words (e.g., "Pull A", "Leg Day") |
| `focus` | string | ○ | Brief focus, 1-3 words (e.g., "Back & Biceps") |
| `description` | string | ○ | Longer description of the session |
| `quote` | `{ text, author }` | ○ | Optional motivational quote |
| `sections` | WorkoutSection[] | ✅ | The actual programming |
| `estimatedDurationMin` | number | ○ | Estimated total minutes (-1 if unknown) |
| `intensityLevel` | enum | ○ | `"Low"` \| `"Moderate"` \| `"High"` \| `"Severe"` |
| `tags` | WorkoutTags | ○ | Categorization tags (see below) |

### WorkoutSection

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | e.g., "Warm Up", "Main Lift", "Cooldown" |
| `overview` | string | ○ | Brief goal of the section |
| `exercises` | WorkoutActivity[] | ✅ | Exercises in this section |

### WorkoutActivity (exercise)

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Exercise name (fuzzy-matched to DB) |
| `type` | enum | ○ | `"Strength"` \| `"Cardio"` \| `"Plyometric"` \| `"Mobility"` \| `"Rest"` \| `"Other"` |
| `sets` | string | ○ | e.g., `"4"`, `"3-4"` |
| `reps` | string | ○ | e.g., `"6-8"`, `"AMRAP"`, `"5 each side"` |
| `duration` | string | ○ | e.g., `"45 min"`, `"30s"` (mainly for cardio) |
| `distance` | string | ○ | e.g., `"5km"`, `"800m"`, `"20m"` |
| `rest` | string | ○ | e.g., `"2-3 min"`, `"90s"`, `"0s"` |
| `intensity` | Intensity | ○ | See below |
| `tempo` | string | ○ | e.g., `"3-0-1"` (eccentric-pause-concentric) |
| `notes` | string | ○ | Execution cues for the user |
| `tags` | string[] | ○ | Exercise-level tags |
| `supersetId` | string | ○ | Group exercises into supersets/circuits (e.g., `"A"`, `"circuit1"`) |

**System-managed fields** (do NOT set in LLM output):

| Field | Description |
|---|---|
| `id` | Generated programmatically |
| `exerciseId` | FK to canonical exercise, set by resolution service |
| `nameRaw` | Original LLM output, preserved for audit |
| `resolution` | `{ method, confidence, version }` — how the name was resolved |

### Intensity

| Field | Type | Description |
|---|---|---|
| `type` | enum | `"RPE"` \| `"RIR"` \| `"Percentage"` \| `"Zone"` \| `"HeartRate"` \| `"Pace"` \| `"Other"` |
| `value` | string | e.g., `"7-8"`, `"2"`, `"75%"`, `"Zone 2"`, `"3:30/km"` |
| `description` | string | Context for the user |

### WorkoutTags

| Field | Values |
|---|---|
| `category` | strength, hypertrophy, power, cardio, hiit, conditioning, mobility, flexibility, active_recovery, rest, sport, mindfulness, assessment, rehab |
| `split` | push, pull, legs, upper, lower, full_body, core, arms, back, chest, shoulders |
| `muscles` | quads, hamstrings, glutes, calves, chest, lats, traps, rhomboids, rear_delts, front_delts, side_delts, biceps, triceps, forearms, abs, obliques, hip_flexors, erectors |
| `patterns` | squat, hinge, press, row, pullup, pulldown, lunge, carry, rotation, anti_extension, anti_rotation, jump, sprint, gait |
| `equipment` | barbell, dumbbell, kettlebell, cable, machine, bodyweight, bands, pullup_bar, bench, no_equipment |

## Supersets and Circuits

Group exercises by giving them the same `supersetId`:

```json
{ "name": "Bench Press", "supersetId": "A", "rest": "60s", "notes": "Go directly to A2" },
{ "name": "Barbell Row",  "supersetId": "A", "rest": "2 min", "notes": "Rest then back to A1" }
```

For circuits (3+ exercises), use the same pattern:
```json
{ "name": "Goblet Squat",   "supersetId": "circuit1", "rest": "0s" },
{ "name": "Push-Up",        "supersetId": "circuit1", "rest": "0s" },
{ "name": "Kettlebell Swing","supersetId": "circuit1", "rest": "2 min" }
```

The last exercise in the group typically carries the between-round rest time.

## Exercise Name Resolution

Exercise names go through a multi-signal resolution pipeline (`exerciseResolutionService.ts`):

1. **Exact normalized match** (weight 3.0) — exact match on normalized alias
2. **Exact lex match** (weight 2.0) — exact match on lexeme-reduced alias
3. **Trigram lex similarity** (weight 1.5) — `pg_trgm` fuzzy matching on lexemes
4. **Trigram normalized similarity** (weight 1.0) — `pg_trgm` on normalized text
5. **Token overlap** (weight 1.0) — Jaccard similarity on lex tokens
6. **Text/ILIKE match** (weight 1.5) — substring search
7. **Intent priority** (weight 2.5) — popularity-based ranking boost

**Practical implications:**
- "Bench Press" → resolves to "Barbell Bench Press" (high popularity + token overlap)
- "DB Lateral Raise" → resolves to "Dumbbell Lateral Raise" (fuzzy + lex matching)
- Exercise names don't need to be exact — close is good enough
- High-confidence matches (≥70%) auto-learn as new aliases for future resolution

## Annotated Example

```json
{
  "title": "Pull A",                          // Short, descriptive
  "focus": "Back & Biceps",                    // 1-3 words
  "description": "Heavy pull day",
  "quote": { "text": "", "author": "" },
  "sections": [
    {
      "title": "Main Lift",
      "overview": "Heavy rowing",
      "exercises": [
        {
          "name": "Bent-Over Barbell Row",     // ← Fuzzy-matched to DB exercise
          "type": "Strength",
          "sets": "4",                         // ← String, not number
          "reps": "6-8",                       // ← Ranges OK
          "duration": "",                      // ← Empty for strength
          "distance": "",                      // ← Empty for strength
          "rest": "2-3 min",
          "intensity": {
            "type": "RPE",
            "value": "8",
            "description": "Heavy but controlled"
          },
          "tempo": "1-1-2",                    // ← Concentric-pause-eccentric
          "notes": "Pull to lower chest",
          "tags": [],
          "supersetId": ""                     // ← Empty = standalone exercise
        }
      ]
    }
  ],
  "estimatedDurationMin": 50,
  "intensityLevel": "High",
  "tags": {
    "category": ["strength"],
    "split": ["pull", "back"],
    "muscles": ["lats", "rhomboids", "biceps"],
    "patterns": ["row"],
    "equipment": ["barbell"]
  }
}
```

## Examples

See `examples/structured-workouts.json` for 12 complete examples covering:
1. Strength training (heavy compounds)
2. Hypertrophy (high volume)
3. Supersets (antagonist pairing)
4. Circuits (full body)
5. Steady-state cardio (running)
6. HIIT (bike intervals)
7. Active recovery (mobility)
8. Rest day
9. Hybrid (strength + cardio)
10. Bodyweight / travel
11. Sport-specific conditioning (basketball)
12. Running intervals (track)
