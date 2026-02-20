# GymText Workout Message Format Standard

## Why This Matters

The workout message is the core product experience. Users read these on a small phone screen via SMS. Every character counts. The format must be:

- **Scannable** — users glance at their phone between sets
- **Unambiguous** — no confusion about what to do
- **Compact** — SMS has character limits and long messages feel overwhelming
- **Consistent** — same structure every time builds familiarity

## Format Structure

```
Focus

Section Title:
- Exercise name: setsxreps OR time/distance
- Exercise name: setsxreps OR time/distance

Section Title:
- Exercise name: setsxreps OR time/distance

Notes: [if any]
```

### Rules

1. **Line 1 — Focus**: A short label for the session (e.g., "Upper Body Strength", "Active Recovery", "Rest Day"). Always present.
2. **Blank line** after Focus.
3. **Section Titles** end with a colon. For standard weight training, combine all strength exercises into a single **Workout:** section (no separate Main Work/Accessory). Use distinct sections for different training modes (Warm-Up, Workout, Core, Conditioning, Cooldown, etc.).
4. **Exercises** start with `- ` (dash + space). Format: `Exercise name: prescription`.
5. **Prescription formats**:
   - Strength/hypertrophy: `setsxreps` (e.g., `4x6`, `3x10-12`)
   - Timed: `time` (e.g., `30s`, `2min`, `20min`)
   - Distance: `distance` (e.g., `400m`, `1mi`)
   - Cardio steady-state: `time @ intensity` (e.g., `30min @ moderate pace`)
   - Intervals: `rounds x work/rest` (e.g., `8x 20s on/10s off`)
6. **Abbreviations** — Use standard fitness abbreviations to keep lines short (e.g., BB = barbell, DB = dumbbell, KB = kettlebell). Don't over-abbreviate — every line should be immediately understandable.
7. **Notes** are optional. Use for important cues (rest periods, RPE, tempo, equipment notes). Keep brief.

### Special Formatting

#### Supersets

Exercises performed back-to-back share a `SS` prefix with the same number:

```
- SS1 Bench press: 4x8
- SS1 Barbell row: 4x8
```

Multiple supersets increment the number:

```
- SS1 Bench press: 4x8
- SS1 Barbell row: 4x8
- SS2 Lateral raise: 3x12
- SS2 Face pull: 3x15
```

#### Circuits

Exercises performed in a circuit share a `C` prefix with the same number:

```
- C1 Goblet squat: 3x10
- C1 Push-up: 3x12
- C1 Plank: 3x30s
```

#### Rest Days

Keep it simple — Focus line, a brief message, and optional suggestions:

```
Rest Day

No workout today. Let your body recover.

Light activity if you want:
- Walk: 20-30min
- Stretching: 10-15min
```

## Design Decisions

**Why `setsxreps` not `sets x reps`?** — Saves characters. `4x8` is universally understood in fitness.

**Why dashes for exercises?** — Creates a visual list. Easy to scan on a phone screen.

**Why Focus on line 1?** — First thing the user sees. Sets context immediately.

**Why section titles?** — Groups exercises logically so users know when they're transitioning (warm-up → main work → cooldown).

**Why SS/C prefixes instead of brackets or indentation?** — SMS doesn't reliably preserve formatting. Prefixes are robust and scannable.

**Why minimal notes?** — SMS isn't the place for paragraphs. If it's critical, include it. Otherwise, keep it clean.
