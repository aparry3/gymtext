# Microcycle Message Examples: Beginner Weekly Previews (Weeks 1, 5, 9)

SMS-formatted weekly summaries that correspond to the detailed microcycle examples in `microcycle-beginner-weeks-1-5-9.json`.

## Purpose

These examples demonstrate:
- **How weekly preview messages should be formatted** (SMS-friendly, scannable)
- **Appropriate level of detail** (overview, not full workout prescription)
- **Tone and language** (encouraging, realistic, action-oriented)
- **Progression communication** (how to explain phase transitions to users)

## Message Structure

```
WEEK [N] — [Title]

[Brief overview: 1-2 sentences about the week's focus and key objective]

This Week:
- [Day]: [Brief focus]
- [Day]: [Brief focus]
...

Intensity: [RPE or % guidance]
Volume: [Sets x reps]

[Closing note: encouragement, coaching cue, or important reminder]
```

### Format Rules

1. **Line 1 — Week Title**: `WEEK [N] — [Title]` (all caps for emphasis)
2. **Blank line** after title
3. **Overview**: 1-2 sentences max. What's the focus this week? What changed from last week?
4. **Blank line** before schedule
5. **This Week:** section with 7 bullet points (one per day)
   - Format: `- [Day]: [Brief focus]` (e.g., `- Mon: Full body (lower emphasis)`)
   - Training days: Describe focus (upper/lower/balanced, or specific lift introduction)
   - Rest days: Just say "Rest" or "Active recovery (optional)"
6. **Blank line** before intensity/volume
7. **Intensity/Volume**: Two lines summarizing the week's prescription
   - `Intensity: RPE X-Y (description)` OR `Intensity: X-Y% 1RM`
   - `Volume: [sets] sets x [reps] reps`
8. **Blank line** before closing
9. **Closing note**: 1-2 sentences. Encouragement, key coaching cue, or action item.

### Length Guidelines

- **Total length**: 120-180 words (fits SMS limits, not overwhelming)
- **Overview**: 20-40 words
- **Day descriptions**: 2-6 words each
- **Closing note**: 15-30 words

## Week-by-Week Breakdown

### Week 1: Movement Pattern Introduction

**Phase:** Form Mastery (Weeks 1-4)

**Key themes:**
- First week of training (acknowledge this is new)
- Learning movement patterns (squat, hinge, push, pull)
- Conservative intensity (RPE 5-6)
- Expectation setting (soreness is normal, pain is not)

**Tone:** Welcoming, reassuring, foundational

**Progression note:** N/A (baseline week)

**Critical elements:**
- "Your first week" acknowledgment
- "Light loads" emphasis
- "Building the foundation" framing
- Soreness vs. pain distinction

---

### Week 5: Progressive Overload Begins

**Phase:** Progressive Overload (Weeks 5-8)

**Key themes:**
- Transition from form mastery to progressive overload
- Introduction of tracking (log weights)
- Clear progression rule (add weight at 3x15)
- Increased volume (2 sets → 3 sets)
- Increased intensity (RPE 5-6 → 6-7)

**Tone:** Confident, action-oriented, empowering

**Progression note:** "You've completed form mastery!" (celebrate previous phase)

**Critical elements:**
- Reference to previous phase completion
- Explicit tracking instruction ("Write down your weights")
- Progression trigger (3x15 = add weight)
- Volume/intensity increase communicated
- Focus shift: "learning the pattern → challenging the muscles"

---

### Week 9: Introduction to Barbell Lifts

**Phase:** Barbell Introduction (Weeks 9-12)

**Key themes:**
- Major equipment transition (dumbbells → barbells)
- Introduction of "big three" lifts (squat, bench, deadlift)
- Start light (just the bar)
- Technical focus over weight
- Film lifts for form feedback

**Tone:** Exciting milestone, technical emphasis, safety-conscious

**Progression note:** "You're ready for the big three" (earning the transition)

**Critical elements:**
- Name the specific barbell lifts (squat, bench, deadlift)
- "Start light" instruction (bar only or bar + 10-20lbs)
- "Film your lifts" coaching cue
- "Barbells feel different" context
- Reps reduced to 10-12 (acknowledge learning curve)
- "Master the movement first" priority

## Relationship to Other Examples

### Microcycle:Generate Examples
**File:** `microcycle-beginner-weeks-1-5-9.json`

These message examples are derived from the detailed microcycle examples. The relationship is:
- **Microcycle:Generate output** = Detailed 7-day programming (overview + day-by-day descriptions)
- **Microcycle:Message output** = SMS-formatted weekly summary

**1:1 correspondence:**
- Week 1 message ← Week 1 microcycle
- Week 5 message ← Week 5 microcycle
- Week 9 message ← Week 9 microcycle

### Workout:Message Examples
**File:** `workout-message-examples.json`

Microcycle messages are **NOT** the same as workout messages:
- **Workout message** = Daily SMS with full exercise prescription (sets, reps, exercises)
- **Microcycle message** = Weekly SMS preview (what to expect this week)

**When each is sent:**
- Microcycle message: Sunday evening or Monday morning (start of week)
- Workout message: Day of workout (e.g., Monday morning for Monday workout)

**Detail level:**
- Microcycle message: High-level overview ("Full body — lower emphasis")
- Workout message: Specific prescription ("Goblet squat: 2x12-15")

## Usage

### For Agent Training
Use these as ground truth for `microcycle:message` agent fine-tuning. The agent should:
1. Read the microcycle:generate output (overview + 7 days)
2. Extract the key themes and progression elements
3. Format into SMS-friendly weekly preview
4. Match the tone and structure shown in these examples

### For Agent Evaluation
Compare agent output against these examples. Check for:
1. ✅ Follows structure (title, overview, 7-day list, intensity/volume, closing)
2. ✅ Appropriate length (120-180 words, not a novel)
3. ✅ Tone matches experience level (beginner-friendly, not overly technical)
4. ✅ Acknowledges phase transitions (Week 5: "form mastery complete", Week 9: "ready for barbells")
5. ✅ Includes actionable guidance (Week 5: "track your weights", Week 9: "film your lifts")
6. ✅ Clear intensity/volume communication
7. ✅ Encouraging but realistic (soreness expected, pain is not)

### For UI Development
Test weekly message views with these examples:
- Message preview in conversation thread
- Week planning interface
- Onboarding flow (Week 1 preview before first workout)

## Anti-Patterns Avoided

❌ **Too detailed** — Don't include full exercise lists (that's for daily workouts)  
✅ **High-level overview** — "Full body (lower emphasis)" is enough

❌ **Too vague** — "Train hard this week!"  
✅ **Specific guidance** — "RPE 6-7, 3 sets x 12-15 reps"

❌ **No progression context** — Week 5 message identical to Week 1  
✅ **Acknowledge transitions** — "You've completed form mastery!"

❌ **Overwhelming length** — 300+ word SMS messages  
✅ **Scannable brevity** — 120-180 words, fits on one phone screen

❌ **Inconsistent structure** — Week 1 has intensity/volume, Week 5 doesn't  
✅ **Consistent format** — Same structure every week (builds familiarity)

❌ **Generic encouragement** — "You got this!"  
✅ **Specific coaching** — "Film your lifts—barbell technique matters"

❌ **Missing safety cues** — No mention of starting light with barbells  
✅ **Contextual safety** — "Start light (just the bar or bar + 10-20lbs)"

## Quality Standards

All examples meet these criteria:

### ✅ Format Compliance
- Week title on Line 1 (all caps)
- Overview (1-2 sentences)
- 7-day breakdown (bullet list)
- Intensity/volume guidance
- Closing note

### ✅ Length Appropriateness
- Total: 120-180 words
- Not too short (lacks context)
- Not too long (overwhelming)

### ✅ Tone Consistency
- Beginner-friendly language
- No jargon without explanation
- Encouraging but realistic
- Action-oriented

### ✅ Progression Clarity
- Acknowledges phase transitions
- Explains what changed from previous week
- Clear guidance on progression triggers

### ✅ SMS-Friendly Formatting
- Works without markdown/formatting
- Scannable on small phone screen
- Line breaks improve readability
- Bullet points use simple dashes

## Design Decisions

**Why all caps for week title?** — Creates visual hierarchy. First thing user sees on phone.

**Why 7-day list instead of just training days?** — Sets realistic expectations. Users see rest days are part of the plan.

**Why intensity/volume section?** — Helps users prepare mentally. They know what to expect (light vs. heavy week).

**Why closing note?** — Last impression matters. Reinforces key coaching point or action item.

**Why 120-180 words?** — Fits SMS limits (~160 chars per message = ~2-3 messages). Not overwhelming to read.

**Why consistent structure across weeks?** — Familiarity reduces cognitive load. Users know where to find info.

## Extending These Examples

To complete the beginner plan weekly messages, add:
- Week 2 (form mastery continues)
- Week 3 (confidence building)
- Week 4 (first deload)
- Week 6 (progressive overload continues)
- Week 7 (progressive overload peak)
- Week 8 (second deload)
- Week 10-12 (barbell progression)

This would provide full coverage of all 12 weeks and all 3 phases.

For other plans (intermediate, advanced, sport-specific), follow the same format but adjust:
- Tone (intermediate = more technical, advanced = performance-focused)
- Intensity/volume (higher for advanced)
- Progression context (intermediate/advanced have more complex periodization)

## Related Documentation

- [microcycle-beginner-weeks-1-5-9.json](./microcycle-beginner-weeks-1-5-9.json) — Source microcycle data
- [MICROCYCLE_BEGINNER_README.md](./MICROCYCLE_BEGINNER_README.md) — Microcycle:generate documentation
- [workout-message-examples.json](./workout-message-examples.json) — Daily workout messages (different format)
- [MESSAGE_FORMAT.md](../docs/MESSAGE_FORMAT.md) — Workout message format standard

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 3 (Weeks 1, 5, 9 of Beginner plan)  
**Message Type:** Weekly preview (microcycle:message)  
**Target:** SMS delivery (beginner experience level)
