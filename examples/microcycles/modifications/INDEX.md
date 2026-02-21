# Microcycle Modifications — Index

This folder contains examples and documentation for **modifying** existing microcycles based on user feedback, schedule changes, injuries, or constraints.

---

## Quick Links

### 📋 Documentation
- **[README-MODIFY-PROMPTS.md](README-MODIFY-PROMPTS.md)** — Complete guide to modify prompt design, LOG format, and implementation approach
- **[DELIVERABLES.md](DELIVERABLES.md)** — Summary of what was delivered, key decisions, and next steps

### 📝 Modified Microcycle Examples

#### 1. General Fitness (Schedule Adjustment)
**[microcycle-modified-general-fitness.md](microcycle-modified-general-fitness.md)**

**User:** Alex Martinez  
**Scenario:** User went for a spontaneous run on Tuesday (rest day) and needed to reschedule Wednesday's lower body workout to Thursday  
**Demonstrates:**
- Schedule changes with strikethrough notation
- Moving workouts between days
- LOG entry for user-initiated schedule change
- Minimal disruption to overall week structure

---

#### 2. Powerlifter (Injury Management)
**[microcycle-modified-powerlifter.md](microcycle-modified-powerlifter.md)**

**User:** Chen Wu  
**Scenario:** Elbow discomfort during Tuesday's bench session required reducing pressing volume and substituting exercises  
**Demonstrates:**
- Volume reduction (4×4 → 3×3)
- Exercise substitutions (neutral-grip DB press for Larsen press)
- Multiple LOG entries across the week (Tuesday, Thursday, Saturday)
- Conservative approach during meet prep
- Keeping pain-free variations (board press)

---

#### 3. Runner (Constraint Flare-Up)
**[microcycle-modified-runner.md](microcycle-modified-runner.md)**

**User:** David  
**Scenario:** IT band tightness after track intervals, needed to modify Friday's lifting to protect Saturday's 18-mile long run  
**Demonstrates:**
- Exercise removal (trap bar deadlift)
- Exercise substitution (glute bridges for heavy loading)
- Extended warm-up and cool-down sections
- LOG entries for both reporting (Thursday) and outcome (Friday)
- Prioritizing primary activity (running) over supplemental (lifting)

---

## How to Use These Examples

### For Understanding the Modify Approach:
1. Start with **[README-MODIFY-PROMPTS.md](README-MODIFY-PROMPTS.md)** to understand the design principles
2. Review the three examples to see different modification scenarios
3. Compare modified examples to original examples in `examples/microcycles/` to see format consistency

### For Implementing Modify Prompts:
1. Read **[DELIVERABLES.md](DELIVERABLES.md)** for key design decisions
2. Use the user prompt templates in README-MODIFY-PROMPTS.md
3. Reference the examples when building the modify agent logic

### For Testing:
1. Take any example from `examples/microcycles/`
2. Simulate a modification scenario (schedule change, injury, etc.)
3. Compare output against these examples for format accuracy

---

## Format Summary

All modified microcycles follow this structure:

```
# Microcycle — Week of [Date]
[Standard header with Program/Phase/User]

## Schedule
[With strikethrough notation for changes: ~~Old~~ → New]

## Week Overview
[Updated with modification notes if significant]

# Workout — [Day], [Date]
[Standard workout format, with modification notes where relevant]

...

## Weekly Summary
[Updated to reflect modifications and their impact]

---

## LOG

**[Date]:**
- User-reported context
- Changes made
- Rationale
- [Optional: Result/assessment]
```

**Key Difference from Create:** The LOG section is appended at the end, tracking all modifications over time.

---

## Modification Types Covered

| Type | Example | User Trigger |
|------|---------|--------------|
| **Schedule Adjustment** | General Fitness | "I went for a run on Tuesday, can you move my workout?" |
| **Volume/Intensity** | Powerlifter | "My elbow hurts, can you reduce bench volume?" |
| **Exercise Substitution** | Powerlifter | "I need a less stressful pressing variation" |
| **Constraint Flare-Up** | Runner | "My IT band is tight, what should I change?" |

---

## Next Steps

1. **Review** the documentation and examples
2. **Decide** on implementation approach:
   - Extend existing create prompts (recommended)
   - OR create separate modify agents
3. **Test** modify prompts with real scenarios
4. **Integrate** LOG section rendering in UI
5. **Track** modification history in database

---

_Created: February 18, 2026_  
_Project: GymText — Prompts Reverse Engineering_  
_Branch: `prompts-reverse-engineering`_
