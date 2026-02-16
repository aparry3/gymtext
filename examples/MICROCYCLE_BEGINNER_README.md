# Microcycle Examples: Beginner General Fitness (Weeks 1, 5, 9)

Detailed microcycle examples showing progression across the 12-week beginner plan.

## Purpose

These examples demonstrate:
- **How microcycles evolve across phases** (Form Mastery → Progressive Overload → Barbell Introduction)
- **Appropriate detail level for each week** (coaching cues, progression context, exercise specifics)
- **Schema compliance** (`overview`, `isDeload`, `days` array with exactly 7 entries)
- **Realistic beginner progression** (light loads → adding weight → complexity increase)

## Week Selection Rationale

**Week 1 — Movement Pattern Introduction (Form Mastery Phase)**
- Weeks 1-4 progression goal: "Learn movement patterns with light loads"
- Intensity: RPE 5-6 (~50-60% 1RM)
- Volume: 2 sets of 12-15 reps
- Equipment: Dumbbells, machines, bodyweight
- Focus: Technique education, DOMS management, habit building

**Week 5 — Progressive Overload Begins (Load Increase Phase)**
- Weeks 5-8 progression goal: "Increase load by 5-10lbs when hitting 3x15 reps with perfect form"
- Intensity: RPE 6-7 (~60-70% 1RM)
- Volume: 3 sets of 12-15 reps
- Equipment: Still dumbbells/machines (no barbells yet)
- Focus: Progressive overload, tracking weights, building strength

**Week 9 — Introduction to Barbell Lifts (Complexity Phase)**
- Weeks 9-12 progression goal: "Introduction to barbell lifts (squat, deadlift, bench press)"
- Intensity: RPE 6-7 (~60-70% 1RM), but starting very light with barbells
- Volume: 3 sets of 10-12 reps (slightly reduced for learning curve)
- Equipment: Barbells introduced (big three: squat, bench, deadlift)
- Focus: Technical mastery of barbell movements, filming lifts, form checks

## Progression Highlights

### Week 1 → Week 5 Changes:
- ✅ **Volume increase:** 2 sets → 3 sets
- ✅ **Intensity increase:** RPE 5-6 → RPE 6-7
- ✅ **Confidence shift:** "Learn the pattern" → "Challenge the muscles"
- ✅ **Tracking introduced:** No tracking → Log weights to know when to add load
- ✅ **Exercise consistency:** Same movements = pattern reinforcement

### Week 5 → Week 9 Changes:
- ✅ **Equipment progression:** Dumbbells/machines → Barbells
- ✅ **Complexity increase:** Isolated limb work → Bilateral barbell lifts
- ✅ **Rep range adjustment:** 12-15 reps → 10-12 reps (to accommodate learning curve)
- ✅ **Technical focus:** Progressive overload → Barbell technique mastery
- ✅ **New skill:** Filming lifts for form feedback

## Schema Compliance

All examples follow the `MicrocycleGenerationOutput` schema:

```typescript
{
  overview: string;     // Weekly training focus (100-250 words)
  isDeload: boolean;    // false for all three (no deload until Week 12 or 8)
  days: string[7];      // Exactly 7 day descriptions
}
```

### Overview Field

**Purpose:** Sets weekly context
- Phase identification (Form Mastery, Progressive Overload, Barbell Introduction)
- Primary objective for the week
- Intensity/volume guidance
- Progression from previous week (if applicable)
- Key coaching points

**Example (Week 1):**
> "Week 1 — Movement Pattern Introduction. This is your first week of structured training. The goal is to learn fundamental movement patterns (squat, hinge, push, pull) with light loads while building confidence and creating a sustainable training rhythm..."

### Days Array

**Structure:** Exactly 7 strings (Day 1 through Day 7)

**Training day format:**
- Day identifier + focus (e.g., "Day 1 (Monday) — Full Body: Lower Emphasis")
- Primary objective for that day
- Volume guidance (sets x reps)
- Exercise list with specific details
- Coaching cues and safety notes
- Tracking reminders (Week 5+)

**Rest day format:**
- Day identifier (e.g., "Day 2 (Tuesday) — Rest")
- Recovery guidance (optional walk, hydration, sleep, nutrition)
- Context (why rest is important this day)

**Length:** 150-300 words per training day, 30-80 words per rest day

## Usage

### For Agent Training
Use these as ground truth for `microcycle:generate` agent fine-tuning. Shows progression across phases within a single plan.

### For Agent Evaluation
Compare agent output for beginner plan against these examples. Check for:
1. Appropriate progression across weeks (not static)
2. Volume/intensity alignment with phase
3. Equipment progression (dumbbells → barbells at Week 9)
4. Realistic coaching cues and detail level
5. Consistency within each phase (similar exercises Week 1-4, 5-8, 9-12)

### For UI Development
Test microcycle detail views with these examples:
- Week-to-week progression visualization
- Phase labeling (metadata.phase)
- Day-by-day expansion/collapse
- Progress tracking integration

## Anti-Patterns Avoided

❌ **Week 1 too intense** — Starting heavy destroys form and causes excessive soreness  
✅ **Week 1 very light** — RPE 5-6, focus on learning, not lifting

❌ **No progression Week 1 → Week 5** — Static programming doesn't build strength  
✅ **Clear progression** — Volume increase (2 → 3 sets), intensity increase (RPE 5-6 → 6-7), tracking introduced

❌ **Barbells in Week 1** — Beginners aren't ready for barbell complexity  
✅ **Barbell introduction at Week 9** — After 8 weeks of pattern mastery

❌ **Vague day descriptions** — "Do an upper body workout"  
✅ **Specific guidance** — Exercise names, sets/reps, coaching cues, RPE targets

❌ **All 7 days identical** — No variation, no rest days  
✅ **Realistic schedule** — 3 training days (Mon/Wed/Fri), 4 rest/recovery days

❌ **Missing weekly context** — Days described in isolation  
✅ **Overview ties it together** — Phase, progression, intensity, what changed from last week

## Relationship to Plan Example

These microcycles correspond to the **Beginner — General Fitness Foundation** plan from `plan-examples.json`.

**Plan progression strategy:**
- Weeks 1-4: Form mastery
- Weeks 5-8: Progressive overload (5-10lbs when hitting 3x15)
- Weeks 9-12: Barbell introduction

**Microcycle examples demonstrate:**
- Week 1: Form mastery phase in action
- Week 5: Progressive overload phase begins
- Week 9: Barbell introduction phase begins

## Extending These Examples

To complete the beginner plan, add:
- Week 2 (form mastery continues, confidence building)
- Week 4 (deload before progressive overload phase)
- Week 8 (deload before barbell introduction)
- Week 12 (final week, assessment, plan next block)

This would provide full coverage of all 4 phases:
- Form Mastery (Weeks 1-4)
- Progressive Overload (Weeks 5-8)
- Barbell Introduction (Weeks 9-12)
- Deloads (Weeks 4, 8, 12)

## Related Documentation

- [plan-examples.json](./plan-microcycle-examples/plan-examples.json) — Parent plan
- [SCHEMA.md](./plan-microcycle-examples/SCHEMA.md) — Microcycle schema documentation
- [microcycle-examples.json](./plan-microcycle-examples/microcycle-examples.json) — Full collection (15 examples across 5 plans)

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 3 (Weeks 1, 5, 9 of Beginner plan)  
**Schema:** `MicrocycleGenerationOutput` (overview + isDeload + 7 days)
