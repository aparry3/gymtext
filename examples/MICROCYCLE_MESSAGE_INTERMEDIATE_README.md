# Microcycle:Message Examples — Intermediate Level (Weeks 1, 7, 13)

## Purpose
These examples demonstrate how the `microcycle:message` agent should format **SMS weekly preview messages** for intermediate-level trainees following the "Intermediate — Hypertrophy Focus" plan (16-week PPL split).

## Format: Weekly Preview Messages

Unlike daily workout messages (which prescribe exercises), weekly previews communicate:
- **What's happening this week** (phase context, training focus)
- **7-day training rhythm** (which days are push/pull/legs/rest)
- **Volume and intensity targets** (sets per muscle, RPE guidance)
- **Key execution details** (technique focus, tracking requirements)

## Week Selection Rationale
Weeks 1, 7, and 13 represent critical transition points in intermediate programming:

- **Week 1**: Accumulation phase launch — Introduces 6-day PPL split, establishes baseline volume (12-14 sets/muscle)
- **Week 7**: First scheduled deload — Dissipates 6 weeks of accumulated fatigue, prepares for intensification
- **Week 13**: Peak intensification — Maximum intensity (RPE 8-9), advanced techniques deployed

## Message Structure

```
WEEK [N] — [Title]

[Brief overview: 1-3 sentences, phase context + key focus]

This Week:
- [Day]: [Brief focus]
- [Day]: [Brief focus]
...

Intensity: [RPE guidance]
Volume: [Sets per muscle group]

[Closing note: context/motivation/safety reminder]
```

## Key Features

### Week 1 (Accumulation Launch)
- **Tone**: Welcoming but confident (intermediate trainees can handle more detail)
- **Key message**: Start conservative, track everything, build tolerance over 6 weeks
- **Education**: Explains accumulation phase concept ("build volume tolerance")
- **Action items**: Track weight, reps, RPE for every lift
- **PPL structure**: Monday-Saturday training, Sunday rest/optional cardio

### Week 7 (Deload)
- **Tone**: Reassuring and educational (corrects guilt about lighter training)
- **Key message**: Active recovery, not a break; adaptation happens during deloads
- **Specific parameters**: 50% volume (half the sets), 70-80% loads, RPE 6-7 max
- **Recovery emphasis**: Sleep 8-9 hours, eat at maintenance, no cardio Sunday
- **Forward-looking**: "Ready for intensification phase" (prepares mentally)

### Week 13 (Peak Intensification)
- **Tone**: Celebratory but grounded (acknowledges difficulty, emphasizes safety)
- **Key message**: Hardest week, advanced techniques deployed, form is still king
- **Technique definitions**: Rest-pause, drop sets, slow eccentrics with execution details
- **Daily highlights**: Each day notes which technique is featured
- **Safety reminder**: "Form is still king—don't sacrifice technique for reps"
- **Context**: "One more week, then final deload" (end in sight)

## Beginner vs. Intermediate Comparison

| Dimension | Beginner (Weeks 1, 5, 9) | Intermediate (Weeks 1, 7, 13) |
|-----------|--------------------------|-------------------------------|
| **Training frequency** | 3 days/week | 6 days/week (PPL) |
| **Day descriptions** | "Full body (lower emphasis)" | "Push (chest/shoulders)" |
| **Volume communication** | "2-3 sets x 12-15 reps" | "12-14 sets per muscle group" |
| **Intensity range** | RPE 5-6 → 6-7 | RPE 7-8 → 8-9 |
| **Tracking emphasis** | Introduced in Week 5 | Emphasized from Week 1 |
| **Technique detail** | Basic (tempo cues) | Advanced (rest-pause, drop sets, slow eccentrics) |
| **Deload guidance** | "Reduce volume/intensity" | "50% volume, 70-80% loads, RPE 6-7 max" |
| **Tone** | Welcoming, cautious, educational | Confident, precise, performance-focused |
| **Message length** | 120-150 words | 150-180 words (more complexity requires more words) |

## Message Length

- **Week 1**: ~160 words (introduces PPL structure, tracking requirements)
- **Week 7**: ~140 words (clear parameters, reassuring tone)
- **Week 13**: ~170 words (technique definitions require detail)

All messages stay SMS-friendly (under 200 words) while conveying intermediate-appropriate complexity.

## Education vs. Prescription Balance

**Beginner messages:**
- Heavy education ("What is RPE?", "Expect soreness", "If something hurts...")
- Cautious tone ("Keep it conservative", "Every rep is a learning opportunity")
- Builds confidence gradually

**Intermediate messages:**
- Assumes knowledge (no need to explain RPE, soreness, form basics)
- Provides precise parameters (50% volume, 70-80% loads, 15sec rest in rest-pause)
- Focuses on execution and periodization strategy

## Advanced Technique Definitions (Week 13)

The Week 13 message includes explicit execution instructions for advanced techniques:

- **Rest-pause**: "failure → 15sec rest → 2-3 more reps"
- **Drop sets**: "failure → reduce 30% → failure again"
- **Slow eccentrics**: "4-5sec negatives"

This level of detail is appropriate for intermediate trainees who:
- Understand basic training concepts (failure, RPE, eccentrics)
- Can execute techniques safely without extensive coaching
- Benefit from precise parameters to guide self-coaching

## Daily Highlights (Week 13 Innovation)

Week 13 notes which technique is featured each day:
- Monday: "Push (rest-pause bench)"
- Tuesday: "Pull (rest-pause deadlift)"
- Saturday: "Legs (drop set RDL/leg curls)"

This helps trainees mentally prepare for the session and manage cognitive load (one advanced technique focus per day, not all at once).

## Schema Compliance

Each example follows this structure:

```typescript
{
  microcycleId: string;              // Unique identifier linking to microcycle:structured
  weekNumber: number;                 // Week number within plan (1-16 for intermediate)
  metadata: {
    title: string;                    // Week title (matches message header)
    phase: string;                    // Current training phase
    planId: string;                   // Links to plan (intermediate-hypertrophy)
    messageType: "weekly_preview";    // Distinguishes from daily workout messages
    experienceLevel: "intermediate";  // Target audience
  };
  message: string;                    // SMS-formatted weekly preview (150-180 words)
  qualityNotes: string[];             // What makes this a high-quality example
}
```

## Usage

### For Agent Training
Use these examples to teach the `microcycle:message` agent:
1. **How to structure weekly previews** (vs daily workout messages)
2. **How to communicate PPL split structure** (Push/Pull/Legs days)
3. **How to frame deloads** (active recovery, not breaks)
4. **How to define advanced techniques** (rest-pause, drop sets, eccentrics)
5. **How to balance brevity with intermediate-appropriate complexity**

### For Evaluation
Compare generated messages against these references for:
- **Structure compliance**: Title → Overview → This Week → Intensity/Volume → Closing
- **Tone appropriateness**: Confident, precise, assumes intermediate knowledge
- **Detail level**: Specific parameters without over-explaining basics
- **Length**: 150-180 words (SMS-friendly but sufficient for complexity)
- **Periodization communication**: Phase context, progression strategy, forward-looking notes

### For Database Seeding
These examples can populate a `microcycle_messages` table with realistic intermediate weekly previews that correspond to the "Intermediate — Hypertrophy Focus" plan.

## Relationship to Other Examples

**1:1 Correspondence with microcycle:structured:**
- Week 1 message ↔ Week 1 structured microcycle (PR #158)
- Week 7 message ↔ Week 7 structured microcycle (PR #158)
- Week 13 message ↔ Week 13 structured microcycle (PR #158)

**Same workout, different formats:**
- `microcycle:structured` = detailed 7-day descriptions (~3,000 words per week)
- `microcycle:message` = SMS weekly preview (~160 words)

**Related to beginner examples:**
- Follows same structure as beginner microcycle:message examples (PR #149)
- Different tone, detail level, and complexity appropriate for intermediate trainees

## File Details
- **Location**: `examples/microcycle-message-intermediate-weeks-1-7-13.json`
- **Size**: ~5KB (3 weekly preview messages)
- **Format**: JSON array of weekly preview message objects
- **Corresponding structured data**: `microcycle-intermediate-weeks-1-7-13.json` (PR #158)
- **Corresponding plan**: `plan-structured-intermediate-example.json` (PR #155)

## Quality Standards

High-quality intermediate weekly preview messages:
- ✅ Communicate PPL split structure clearly (which days are Push/Pull/Legs)
- ✅ Provide precise volume/intensity parameters (sets per muscle, RPE ranges)
- ✅ Assume intermediate knowledge (no need to explain RPE, soreness, basic form)
- ✅ Define advanced techniques with execution details when used
- ✅ Frame deloads as active recovery (educate on purpose, correct guilt)
- ✅ Stay SMS-friendly (150-180 words max)
- ✅ Include forward-looking context (what's coming next)
- ✅ Balance confidence with safety reminders
- ✅ Match tone to experience level (precise and performance-focused)

## Anti-Patterns

Avoid these in intermediate weekly previews:
- ❌ Over-explaining basics ("RPE means...") — assume knowledge
- ❌ Beginner-level caution ("Be very careful!") — trust competence
- ❌ Vague guidance ("Push hard") — provide specific parameters
- ❌ Missing technique definitions (Week 13 needs rest-pause/drop set details)
- ❌ Framing deloads as "easy week" or "break" — correct this misconception
- ❌ Inconsistent structure (don't skip "This Week:" section or volume/intensity)
- ❌ Excessive length (>200 words breaks SMS-friendly goal)

---

These examples demonstrate intermediate-appropriate weekly communication: precise, confident, and educational without being condescending. Use them as the gold standard for intermediate `microcycle:message` outputs.
