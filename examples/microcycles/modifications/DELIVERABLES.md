# Modify Prompts for Plans and Microcycles — Deliverables

**Date:** February 18, 2026
**Task:** Design modify prompts for plans and microcycles with consistent dossier format and LOG tracking

---

## What Was Delivered

### 1. Three Modified Microcycle Examples

Located in: `examples/microcycles/modifications/`

#### a) General Fitness Example
**File:** `microcycle-modified-general-fitness.md`

**Scenario:** Schedule adjustment
- User went for a spontaneous 3-mile run on Tuesday (originally a rest day)
- Lower Strength workout moved from Wednesday to Thursday
- Demonstrates strikethrough notation in schedule
- Shows how to preserve performance data while adjusting timing

**Key features:**
- Schedule section shows: `~~Rest~~ → Cardio (outdoor run, 3 miles)`
- Workout moved with note: `*[moved from Wed]*`
- LOG entry explains user's spontaneous run and rationale for shift
- Weekly Summary updated to note schedule worked well

---

#### b) Powerlifter Example
**File:** `microcycle-modified-powerlifter.md`

**Scenario:** Injury management (elbow discomfort)
- User reported elbow pain during Tuesday's bench warm-ups
- Reduced pressing volume across multiple sessions
- Substituted neutral-grip variations to reduce strain
- Board press kept (partial ROM pain-free)

**Key features:**
- Volume modifications shown: `~~4 × 4~~ → **3 × 3**`
- Exercise substitutions documented with rationale
- Multiple LOG entries (Tuesday, Thursday, Saturday) tracking progression
- Weekly Summary explains conservative approach for meet prep context

---

#### c) Runner Example
**File:** `microcycle-modified-runner.md`

**Scenario:** Constraint flare-up (IT band tightness)
- IT band tightness after Thursday track intervals
- Friday lifting modified to protect Saturday's 18-mile long run
- Removed lateral/single-leg exercises temporarily
- Added extended foam rolling and stretching

**Key features:**
- Exercise substitution: `~~Trap Bar Deadlift~~ → Glute Bridge (BW)`
- Extended warm-up and cool-down sections
- LOG entries for Thursday (reporting) and Friday (outcome)
- Decision-making documented for future weeks

---

### 2. Comprehensive Documentation

**File:** `README-MODIFY-PROMPTS.md`

**Contents:**
- Overview of modify prompt design principles
- Four modification scenario types with examples:
  1. Schedule adjustments
  2. Volume/intensity changes
  3. Exercise substitutions
  4. Injury/constraint flare-ups
- LOG section format specification
- Recommended implementation approach (extend existing create prompts vs. new prompts)
- Example modify user prompts for each scenario
- Testing and validation guidance
- Future considerations (multi-session modifications, cumulative changes, plan-level modifications)

---

## Key Design Decisions

### 1. Reuse Create Prompts (Don't Duplicate)

**Decision:** Extend existing create prompts via user prompt modifications rather than creating separate modify system prompts.

**Rationale:**
- Modify and create outputs are 95% identical (same dossier structure)
- Only difference: strikethrough notation + LOG section
- Easier to maintain single source of truth
- User prompt can provide modification-specific context

**Implementation:**
- System prompts: `02-plan-agent.md`, `03-microcycle-agent.md` (unchanged)
- User prompts: Add "Modify Week X" template with modification context
- Agent receives same formatting instructions, just different input context

---

### 2. LOG Section Format

**Decision:** Append LOG at the end of document in reverse chronological order.

**Rationale:**
- Keeps modification history visible and searchable
- Doesn't interfere with main content structure
- Allows multiple modifications to stack over time
- Provides audit trail for coaching decisions

**Format:**
```markdown
## LOG

**[Day], [Date]:**
- User-reported context
- Changes made
- Rationale
- [Optional: Result/assessment]
```

---

### 3. Strikethrough Notation for Changes

**Decision:** Use `~~Original~~ → New` pattern for inline changes.

**Rationale:**
- Makes changes immediately visible
- Preserves original intent for reference
- Works in markdown rendering (GitHub, editors)
- Clear visual signal without disrupting format

**Examples:**
- Schedule: `~~Rest~~ → Cardio (outdoor run, 3 miles)`
- Volume: `~~4 × 4~~ → **3 × 3**`
- Exercise: `~~Larsen Press~~ → Neutral-Grip DB Press`

---

### 4. Modification Notes in Context

**Decision:** Add inline notes explaining modifications within affected sections.

**Rationale:**
- Context is preserved where it matters (in the workout itself)
- Coach can see reasoning when reviewing specific exercises
- Notes explain both WHAT changed and WHY
- Complements LOG section (LOG is chronological, notes are contextual)

---

## Modification Scenarios Covered

### 1. Schedule Adjustments
- User swaps training days
- User adds unplanned activity (run, pickup game, etc.)
- User misses a session and needs to reschedule
- **Example:** General fitness microcycle — run on Tuesday, move legs to Thursday

### 2. Volume/Intensity Adjustments
- Reduce sets/reps due to fatigue
- Increase/decrease weight based on readiness
- Adjust RPE targets mid-week
- **Example:** Powerlifter microcycle — reduce bench volume from 4×4 to 3×3

### 3. Exercise Substitutions
- Equipment unavailable
- Exercise causes discomfort
- Preference change (e.g., neutral grip vs. pronated)
- **Example:** Powerlifter microcycle — neutral-grip DB press for Larsen press

### 4. Injury/Constraint Management
- Pain or discomfort appears mid-week
- Existing constraint flares up
- New limitation discovered
- **Example:** Runner microcycle — IT band tightness, remove lateral exercises

---

## How to Use These Examples

### For Prompt Engineering:
1. Use examples as reference for modify agent training
2. Show format consistency (create vs. modify)
3. Demonstrate LOG entry structure
4. Highlight user-context → modification → rationale flow

### For Testing:
1. Take an existing create output
2. Simulate a modification scenario
3. Compare against these examples for format accuracy
4. Verify LOG section follows the pattern

### For Documentation:
1. Show clients/users what modifications look like
2. Explain how change history is tracked
3. Demonstrate transparency in coaching decisions

---

## Next Steps (If Implementing in System)

### 1. Update Agent Definitions
- Add modify capability to `plan:create` and `microcycle:create` agents
- OR create new agent IDs: `plan:modify`, `week:modify`
- Decision depends on whether you want separate agents or unified create/modify agents

### 2. User Prompt Templates
- Create modify-specific user prompt templates
- Include fields for:
  - Original plan/microcycle reference
  - Modification request (user's words)
  - Specific changes to implement
  - LOG entry date/context

### 3. Frontend UI Considerations
- Render strikethrough properly (most markdown renderers support it)
- Highlight LOG section (maybe collapsible)
- Show modification history timeline
- Allow inline editing that triggers modify flow

### 4. Database Schema
- Track modification history (timestamp, user request, changes)
- Store original vs. modified versions
- Link modifications to parent plan/microcycle
- Potentially version microcycles (v1, v2, v3 as modifications occur)

---

## Files Delivered

```
examples/microcycles/modifications/
├── DELIVERABLES.md                              (this file)
├── README-MODIFY-PROMPTS.md                     (documentation)
├── microcycle-modified-general-fitness.md       (example 1: schedule change)
├── microcycle-modified-powerlifter.md           (example 2: injury management)
└── microcycle-modified-runner.md                (example 3: constraint flare-up)
```

---

## Summary

**Goal:** Design modify prompts that maintain dossier format consistency while tracking changes.

**Approach:**
1. ✅ Reuse existing create prompt structure
2. ✅ Add strikethrough notation for changes
3. ✅ Append LOG section for modification history
4. ✅ Preserve all original formatting

**Deliverables:**
1. ✅ Three diverse modification examples (general fitness, powerlifter, runner)
2. ✅ Comprehensive documentation of modify approach
3. ✅ Format specification for LOG section
4. ✅ User prompt templates for common modification scenarios

**Result:** Modify outputs are indistinguishable from create outputs except for change tracking. Users get the same familiar dossier format whether creating or modifying, with full transparency on what changed and why.
