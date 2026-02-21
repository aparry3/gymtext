# Modify Prompts for Plans and Microcycles

## Overview

The **modify** prompts are designed to update existing plans or microcycles based on user feedback, schedule changes, injuries, or other real-world adjustments. The output format remains identical to the **create** prompts (same dossier markdown structure), with the addition of a **LOG section** to track all changes over time.

## Key Design Principles

1. **Same dossier format** — Output is indistinguishable from create output except for:
   - Strikethrough notation for changed schedule items
   - LOG section at the end
   - Modified content within workouts/sessions

2. **LOG section** — Appended at the very end of the document:
   - Reverse chronological order (newest first)
   - Date/time stamp for each modification
   - Clear description of what changed and why
   - User-reported context (e.g., "User went for a run," "User reported elbow pain")

3. **Preserve original structure** — Don't restructure the entire document. Make surgical changes to affected sections only.

4. **Track rationale** — Every modification should explain WHY the change was made (user request, injury prevention, schedule conflict, etc.)

## Modification Scenarios

### 1. Schedule Adjustments

**User reports:** "I went for a run on Tuesday, can you move my back workout to Wednesday?"

**Modifications:**
- Update Schedule section with strikethrough: `~~Rest~~ → Cardio (outdoor run, 3 miles)`
- Move affected workout to new day
- Adjust subsequent days if needed for recovery
- Update Week Overview if schedule change is significant

**Example:**
```markdown
## Schedule
- **Mon:** Upper Strength (home gym, 6-7 AM)
- **Tue:** ~~Rest~~ → Cardio (outdoor run, 3 miles)
- **Wed:** ~~Lower Strength~~ → Rest
- **Thu:** Lower Strength (home gym, 6-7 AM) *[moved from Wed]*
```

### 2. Volume/Intensity Adjustments

**User reports:** "My elbow hurts during pressing. Can you reduce the bench volume?"

**Modifications:**
- Reduce sets/reps on affected exercises
- Substitute less stressful variations if needed
- Add notes explaining the modification
- Update Weekly Summary with constraint status

**Example:**
```markdown
### 1. Competition Bench Press
**Target:** ~~4 × 4~~ → **3 × 3** @ ~78-80% (RPE 7.5-8)
- **Set 1:** 135 lbs × 4 (RPE 6)
- **Set 2:** 155 lbs × 4 (RPE 7)
- **Set 3:** 175 lbs × 3 (RPE 8) — *reduced from 4 reps*
- **Set 4:** 175 lbs × 3 (RPE 8)
- **Set 5:** 175 lbs × 3 (RPE 8)
**Rest:** 3-4 minutes between working sets
**Notes:** Cut to 3×3 due to elbow discomfort. Competition pause on every rep. Elbow felt manageable with reduced volume — no sharp pain, just awareness.
```

### 3. Exercise Substitutions

**User reports:** "The gym didn't have a barbell today, what can I do instead?"

**Modifications:**
- Substitute equivalent exercises with available equipment
- Maintain similar volume/intensity targets
- Explain the substitution in notes
- Track in LOG if this becomes a recurring issue

**Example:**
```markdown
### 2. Neutral-Grip Dumbbell Press (feet-up)
**Target:** ~~Larsen Press~~ → **3 × 6** @ ~68% (RPE 6-7)
- **Set 1:** 50 lbs (each) × 6 (warm-up)
- **Set 2:** 60 lbs × 6 (RPE 6)
- **Set 3:** 65 lbs × 6 (RPE 6.5)
- **Set 4:** 65 lbs × 6 (RPE 7)
**Rest:** 2 minutes between working sets
**Notes:** Substituted neutral-grip DB press for Larsen press to give elbow a break. Neutral grip = less elbow stress. Feet off bench like Larsen for stability work.
```

### 4. Injury/Constraint Flare-Ups

**User reports:** "My IT band is tight after yesterday's run. What should I change?"

**Modifications:**
- Remove or reduce exercises that stress the affected area
- Add rehab/prehab work if appropriate
- Extend warm-up/cool-down with targeted mobility
- Update constraint status in Weekly Summary

**Example:**
```markdown
### 3. Glute Bridge (Bilateral, Modified)
**Target:** ~~Trap Bar Deadlift~~ → **2 × 12 @ RPE 5**
- **Set 1:** BW × 12
- **Set 2:** BW × 12
**Rest:** 60 seconds between sets
**Notes:** Substituted bilateral glute bridges for trap bar deadlift. IT band sensitive — keeping it gentle. Focus on glute activation without loading.

## Cool Down (Extended — 5 minutes)
1. IT band foam roll: 2 minutes (slow, methodical)
2. Glute stretch (figure-4): 1 minute each side
3. Hip flexor stretch: 30 sec each side
4. Quad stretch: 30 sec each side
```

## LOG Section Format

The LOG section is appended at the very end of the document, after the Weekly Summary (for microcycles) or Phase Cycling (for plans).

### Structure

```markdown
---

## LOG

**[Day of Week], [Full Date]:**
- [User-reported context or trigger]
- [List of changes made]
- [Rationale for changes]
- [Optional: Assessment or result]

**[Day of Week], [Full Date]:**
- [Additional modification]
- ...

[Older entries continue in reverse chronological order]
```

### Example LOG Entries

```markdown
## LOG

**Thursday, February 19, 2026 (evening):**
- User reported IT band tightness (left side) after Thursday's track workout (6 × 800m intervals)
- Tightness rating: 4/10 — noticeable but not painful
- No tightness during the run, appeared 2 hours post-workout
- Adjusted Friday's plan:
  - Removed trap bar deadlift (loading concern with IT band sensitive)
  - Substituted bilateral glute bridges (bodyweight only)
  - Removed banded lateral walks (abduction stress)
  - Extended foam rolling time from 2 min to 3 min
  - Added extended cool down with IT band-specific stretching
- Rationale: Peak week + 18-mile long run on Saturday. Priority is protecting the run, not pushing through lifting. IT band needs rest and gentle care.

**Friday, February 20, 2026 (post-workout):**
- Modified session completed successfully
- IT band felt stable during lifting (no worsening)
- User iced IT band post-workout and will foam roll again tonight
- Plan for Saturday's long run: assess IT band in first 2 miles, have contingency to cut run short if pain appears

**Result:** Conservative modification approach appropriate. Will continue to monitor IT band through weekend and into next week's step-back volume.
```

## Modify Prompt Approach

### Option 1: Extend Existing Create Prompts

**Recommendation:** Reuse the existing system prompts (02-plan-agent.md, 03-microcycle-agent.md) with **additional instructions** in the user prompt to handle modifications.

**User Prompt Structure for Modify:**

```
Modify [Week X / Phase Y] for [User Name].

Original context:
- [Brief summary of original plan/microcycle]

Modification requested:
- [User's request, injury report, schedule change, etc.]

Changes to make:
- [Specific changes needed]

Output format:
- Use the standard [plan/microcycle] dossier format
- Maintain all original structure
- Show changes with strikethrough where appropriate (e.g., ~~Rest~~ → Cardio)
- Add LOG section at the end with this modification entry

LOG entry should include:
- Date/time of modification
- User-reported context
- List of changes made
- Rationale for changes
```

### Option 2: Create Dedicated Modify Prompts

**Alternative:** Create new system prompts (02-plan-agent-MODIFY.md, 03-microcycle-agent-MODIFY.md) that inherit most of the create prompt content but add explicit modify-specific instructions.

**Additional sections for modify prompts:**
- How to track changes (strikethrough notation)
- When to update vs. regenerate sections
- LOG section requirements
- Modification history tracking

## Recommended Implementation

**Use Option 1** (extend existing create prompts via user prompt):

**Why:**
- Avoids duplication (create and modify prompts are 95% identical)
- Easier to maintain (single source of truth for format)
- User prompt can specify modify-specific context
- LOG section is the only structural difference

**User Prompt Template for Microcycle Modify:**

```markdown
Modify Week [N] of [User Name]'s [Phase Name].

Original context:
- Week [N] of [Phase], created on [Date]
- Key exercises: [Summary of main lifts/runs]
- Original schedule: [Mon/Tue/Wed/etc.]

Modification requested:
[User's request in their own words, e.g.:]
- "I went for a 3-mile run on Tuesday instead of resting. Can you move my lower body workout to Thursday?"
- "My elbow hurts during pressing. Can you reduce bench volume and substitute some exercises?"
- "IT band is tight after yesterday's intervals. What should I adjust for Friday's lifting?"

Changes to implement:
- [Specific instruction 1]
- [Specific instruction 2]
- ...

Output:
- Use the standard microcycle dossier format
- Update affected sections only (don't regenerate unchanged workouts)
- Use strikethrough for schedule changes: ~~Original~~ → New
- Add modification notes in relevant workout sections
- Append LOG section at the end with entry for this modification (date, context, changes, rationale)

Preserve all unaffected content exactly as originally written.
```

## Examples of Modify User Prompts

### Example 1: Schedule Change (General Fitness)

```
Modify Week 3 of Alex Martinez's Accumulation Phase.

Original context:
- Week 3 of 4, created February 16, 2026
- Key exercises: Bench 155×5, Goblet squat 50×8, RDL 215×6
- Original schedule: Mon/Wed/Fri/Sat

Modification requested:
"I went for a spontaneous 3-mile run on Tuesday instead of resting. Can you move my Wednesday lower body workout to Thursday so I have enough recovery?"

Changes to implement:
- Update Tuesday schedule: Rest → Cardio (outdoor run, 3 miles)
- Move Wednesday's Lower Strength workout to Thursday
- Make Wednesday a rest day
- Update Week Overview to note the schedule adjustment
- Add note in Thursday's workout explaining the move

Output:
- Use standard microcycle format
- Show schedule changes with strikethrough
- Add LOG entry for Tuesday, February 17, 2026 explaining the modification
```

### Example 2: Injury Management (Powerlifter)

```
Modify Week 7 of Chen Wu's Accumulation B Phase.

Original context:
- Week 7 of 8, USAPL meet prep
- Key lifts: Squat 295×4, Bench 175×4, Deadlift 320×2
- Bench lockout is a known weak point

Modification requested:
"My right elbow started hurting during Tuesday's bench warm-ups. It's not sharp pain but it's definitely tender. Can you reduce the pressing volume for the rest of this week?"

Changes to implement:
- Reduce Tuesday's bench from 4×4 to 3×3
- Substitute neutral-grip dumbbell press for Thursday's Larsen press (less elbow strain)
- Reduce Saturday's bench doubles (stop at 170 instead of progressing to 175-180)
- Keep board press (partial ROM is pain-free per user)
- Add elbow stretching to cool downs
- Update Weekly Summary with elbow constraint status

Output:
- Use standard microcycle format
- Mark modified exercises with strikethrough for original targets
- Add detailed notes about elbow management in each affected workout
- LOG entries for Tuesday, Thursday, and Saturday modifications
```

### Example 3: Constraint Flare-Up (Runner)

```
Modify Week of February 16, 2026 for David's Build Phase.

Original context:
- Peak mileage week: 52 miles planned
- Friday session originally: light full-body with trap bar deadlift
- Saturday: 18-mile long run

Modification requested:
"My IT band is feeling tight after yesterday's track intervals (Thursday). I have my 18-mile long run tomorrow (Saturday) and I'm worried. Should I change Friday's lifting?"

Changes to implement:
- Remove Friday's trap bar deadlift (loading concern)
- Substitute bilateral glute bridges (bodyweight only, gentle activation)
- Remove banded lateral walks (abduction stress on IT band)
- Extend foam rolling time (2 min → 3 min, focus on IT band)
- Add extended cool down with IT band-specific stretching
- Update Weekly Summary with IT band flare-up status
- Note decision to reduce lateral/single-leg work if IT band persists next week

Output:
- Use standard microcycle format
- Show exercise substitutions with strikethrough
- Add extended warm-up/cool-down sections to Friday
- LOG entry for Thursday evening (when tightness reported) and Friday post-workout
```

## Testing the Modify Approach

To validate the modify prompts:

1. **Use existing examples as base:**
   - Take `microcycle.md`, `microcycle-powerlifter.md`, `microcycle-runner.md`
   - Simulate modifications like the examples created

2. **Verify LOG format:**
   - Each modification should have clear date/time
   - User context should be present
   - Changes should be listed explicitly
   - Rationale should be documented

3. **Check format consistency:**
   - Modified microcycle should be indistinguishable from create output (aside from LOG)
   - Strikethrough notation should be used appropriately
   - Unaffected sections should remain unchanged

## Future Considerations

### Multi-Session Modifications

If a user reports an issue mid-week and it affects multiple future sessions:
- Update all remaining sessions in the week
- Add a single LOG entry explaining the cascading changes
- Update Weekly Summary to reflect the modified plan

### Cumulative Modifications

If a microcycle is modified multiple times:
- LOG entries stack in reverse chronological order
- Each entry is independent but may reference previous modifications
- Weekly Summary should reflect the final state after all modifications

### Plan-Level Modifications

For plans (not just microcycles):
- Modification might affect an entire phase or multiple phases
- LOG should capture high-level changes (e.g., "Extended Accumulation Phase from 4 weeks to 6 weeks due to meet date change")
- Update Modification History section (already part of plan format) as well as LOG

## Summary

**Modify prompts follow the same structure as create prompts**, with these additions:

1. **Strikethrough notation** for changed items in schedules/targets
2. **Modification notes** in affected workout sections
3. **LOG section** appended at the end tracking all changes
4. **User prompt** specifies the modification context and requested changes

The examples in `examples/microcycles/modifications/` demonstrate:
- Schedule adjustment (general fitness)
- Injury management (powerlifter)
- Constraint flare-up (runner)

All three maintain the dossier format and include detailed LOG entries.
