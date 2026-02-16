# Microcycle Structured Examples — MMA Fighter

This file contains **microcycle:structured** agent output examples for the Sport-Specific MMA Fighter plan.

## Purpose

These examples demonstrate how the `microcycle:structured` agent should parse text-based microcycle descriptions into structured format. Each microcycle shows the agent's ability to:

- Parse weekly overview into phase, weekNumber, and summary
- Extract daily focus summaries from detailed descriptions
- Classify activity types (TRAINING, ACTIVE_RECOVERY, REST)
- Preserve detailed programming notes while creating structured metadata
- Maintain 1:1 correspondence with microcycle:generate examples

## Schema Compliance

Each example follows the `MicrocycleStructureSchema`:

```typescript
{
  weekNumber: number,
  phase: string,
  overview: string,
  days: [
    {
      day: "Monday" | "Tuesday" | ... | "Sunday",
      focus: string,              // Brief summary
      activityType: "TRAINING" | "ACTIVE_RECOVERY" | "REST",
      notes: string               // Detailed description
    },
    // ... 7 days total
  ]
}
```

## Week Selection Rationale

Same as microcycle:generate examples:
- **Week 1 (Strength Emphasis):** Foundation building (4x5 @ 80-85% 1RM, 6 rounds alactic)
- **Week 4 (Power Development):** Peak training demand (3x3 @ 85-90%, 8 rounds alactic, 3 rounds fight simulation)
- **Week 7 (Fight Peak):** Final active preparation (2x3 @ 92% CNS priming, 5 rounds fight simulation)

## Activity Type Classification

### TRAINING
All S&C sessions (Mon/Wed/Fri) and MMA training days (Tue/Thu/Sat) are classified as TRAINING:
- **S&C Training:** Lower power, upper strength, full body explosive
- **MMA Training:** Technical drilling, sparring, open mat, conditioning
- **Rationale:** Both contribute to fight preparation and performance

### ACTIVE_RECOVERY
Sunday is classified as ACTIVE_RECOVERY in all weeks:
- **Week 1 & 4:** "Rest / Active Recovery" with options (walk, yoga, sauna)
- **Week 7:** "Active Recovery / Light Technical Work" (yoga, shadow boxing, very light drilling)
- **Rationale:** Optional light activity, no training stimulus, recovery priority

### REST
Not used in this MMA plan (no complete rest days during active camp weeks).

## Structured vs. Generate Format

### microcycle:generate (source)
```json
{
  "weekNumber": 1,
  "phase": "Strength Emphasis (Week 1/3)",
  "overview": "Opening week of fight camp...",
  "days": [
    "**Lower Body Power + Alactic Conditioning** — 60min session...",
    "**MMA Training Day** — Prioritize technical drilling...",
    // ... 7 string descriptions
  ]
}
```

### microcycle:structured (parsed)
```json
{
  "weekNumber": 1,
  "phase": "Strength Emphasis (Week 1/3)",
  "overview": "Opening week of fight camp...",
  "days": [
    {
      "day": "Monday",
      "focus": "Lower Body Power + Alactic Conditioning",
      "activityType": "TRAINING",
      "notes": "60min session focused on explosive lower body..."
    },
    {
      "day": "Tuesday",
      "focus": "MMA Training — Technical Drilling & Light Sparring",
      "activityType": "TRAINING",
      "notes": "Prioritize technical drilling and positional sparring..."
    },
    // ... 7 MicrocycleDay objects
  ]
}
```

## Parsing Methodology

### 1. Extract Focus from Day Descriptions
- **Pattern:** Bold text before "—" or first sentence summary
- **Week 1 Monday:** "**Lower Body Power + Alactic Conditioning**" → `focus: "Lower Body Power + Alactic Conditioning"`
- **Week 1 Tuesday:** "**MMA Training Day**" → Enhanced to `focus: "MMA Training — Technical Drilling & Light Sparring"` (adds context from notes)

### 2. Classify Activity Types
- **S&C sessions** (Mon/Wed/Fri): Always TRAINING
- **MMA training** (Tue/Thu/Sat): Always TRAINING (integral to fight preparation)
- **Sunday:** Always ACTIVE_RECOVERY (optional light activity, recovery emphasis)

### 3. Assign Day Names
- Array index maps to day name:
  - `days[0]` → Monday
  - `days[1]` → Tuesday
  - `days[6]` → Sunday

### 4. Preserve Notes
- Everything after "—" in original description becomes `notes`
- Maintains all programming details (sets, reps, load, rest, timing, integration notes)
- No information loss in parsing

## Concurrent Training Day Structure

### Monday / Wednesday / Friday (S&C)
```json
{
  "day": "Monday",
  "focus": "Lower Body Power + Alactic Conditioning",
  "activityType": "TRAINING",
  "notes": "60min session focused on explosive lower body development..."
}
```
**Duration:** 50-60min  
**Components:** Warm-up → Neural activation → Max strength → Explosive strength → Plyometrics → Conditioning → Cool-down

### Tuesday / Thursday / Saturday (MMA)
```json
{
  "day": "Tuesday",
  "focus": "MMA Training — Technical Drilling & Light Sparring",
  "activityType": "TRAINING",
  "notes": "Prioritize technical drilling and positional sparring..."
}
```
**Intensity:** Varies by day (60-70% → 70-80% → 70-90% effort across Tue/Thu/Sat)  
**Components:** Technical work → Live sparring → Conditioning circuits → Recovery protocols

### Sunday (Recovery)
```json
{
  "day": "Sunday",
  "focus": "Rest / Active Recovery",
  "activityType": "ACTIVE_RECOVERY",
  "notes": "Complete rest or light active recovery only..."
}
```
**Duration:** 20-40min light activity or complete rest  
**Options:** Walk, yoga, sauna, light shadow boxing (Week 7)  
**Priority:** Sleep (8-9 hours), nutrition, mental preparation

## Progression Across Weeks

### Week 1 (Strength Emphasis)
**Focus Patterns:**
- Mon: "Lower Body Power + Alactic Conditioning"
- Tue: "MMA Training — Technical Drilling & Light Sparring"
- Wed: "Upper Body Strength + Anti-Rotation Core"
- Thu: "MMA Training — Sparring & Conditioning"
- Fri: "Full Body Explosive + Fight Simulation Conditioning"
- Sat: "MMA Training — Open Mat & Sparring"
- Sun: "Rest / Active Recovery"

**Activity Types:** 6 TRAINING + 1 ACTIVE_RECOVERY

### Week 4 (Power Development)
**Focus Patterns:**
- Mon: "Lower Body Power + Alactic Conditioning"
- Tue: "MMA Training — Technical Emphasis & Light Sparring"
- Wed: "Upper Body Strength + Anti-Rotation Core"
- Thu: "MMA Training — Moderate-to-High Sparring"
- Fri: "Full Body Explosive + Fight Simulation Conditioning"
- Sat: "MMA Training — Hard Sparring & High Volume"
- Sun: "Rest / Active Recovery"

**Activity Types:** 6 TRAINING + 1 ACTIVE_RECOVERY

### Week 7 (Fight Peak)
**Focus Patterns:**
- Mon: "Lower Body Power + Alactic Conditioning"
- Tue: "MMA Training — Technical Refinement & Light Sparring"
- Wed: "Upper Body Strength + Anti-Rotation Core"
- Thu: "MMA Training — Last Hard Sparring Before Taper"
- Fri: "Full Body Explosive + Peak Fight Simulation Conditioning"
- Sat: "MMA Training — Final Hard Day Before Taper"
- Sun: "Active Recovery / Light Technical Work"

**Activity Types:** 6 TRAINING + 1 ACTIVE_RECOVERY

**Notable Evolution:**
- MMA day focus titles become more specific and context-aware across weeks
- Sunday evolves from "Rest / Active Recovery" to "Active Recovery / Light Technical Work" (Week 7 allows very light drilling)
- S&C day focus titles remain consistent (activity doesn't change, only programming parameters)

## Integration Notes Preservation

All MMA training days preserve integration notes in the `notes` field:

**Week 1 Monday:**
> "Pair with light technical MMA work or schedule on grappling-light day to manage fatigue."

**Week 4 Thursday:**
> "Monitor bar speed in tomorrow's Olympic lifts; if you're overly fatigued today, scale back sparring volume by 1-2 rounds."

**Week 7 Friday:**
> "Schedule away from hard sparring (ideally after light technical work)."

These notes guide athletes and coaches on optimal session timing and interference management.

## Use Cases

1. **Agent Training:** Train `microcycle:structured` agent on parsing concurrent training microcycles
2. **Agent Evaluation:** Validate parsing accuracy (focus extraction, activity type classification)
3. **Database Seeding:** Seed structured microcycle data for querying and UI display
4. **UI Development:** Test microcycle display components (weekly calendar, day cards, activity type filters)
5. **User Onboarding:** Show prospective MMA athletes what structured weekly programming looks like

## Quality Standards

- ✅ Schema compliance (`MicrocycleStructureSchema` with 7 `MicrocycleDay` objects)
- ✅ Accurate focus extraction (brief, descriptive summaries for each day)
- ✅ Correct activity type classification (6 TRAINING + 1 ACTIVE_RECOVERY)
- ✅ Day name mapping (Monday through Sunday in order)
- ✅ Notes preservation (no information loss from generate format)
- ✅ 1:1 correspondence with microcycle:generate examples (same 3 weeks)
- ✅ Consistent structure across all weeks
- ✅ Integration notes preserved (session timing, fatigue management)

## Related Examples

- **Source:** `microcycle-mma-weeks-1-4-7.json` (microcycle:generate examples)
- **Plan:** `plan-structured-mma-example.json` (source plan for both examples)
- **Next:** `microcycle-message-mma-weeks-1-4-7.json` (SMS weekly previews, once created)
- **Pattern:** Follows beginner/intermediate/advanced/time-constrained microcycle:structured patterns

---

**File:** `examples/microcycle-structured-mma-weeks-1-4-7.json`  
**Schema:** `MicrocycleStructureSchema` (`weekNumber`, `phase`, `overview`, `days: MicrocycleDay[]`)  
**Created:** 2026-02-16  
**Context:** Task "Create microcycle:structured examples (MMA - Weeks 1, 4, 7)"
