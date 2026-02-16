# Microcycle Message Examples — MMA Fighter

This file contains **microcycle:message** agent output examples for the Sport-Specific MMA Fighter plan.

## Purpose

These examples demonstrate how the `microcycle:message` agent should create SMS weekly preview messages for an 8-week fight camp. Each message shows the agent's ability to:

- Summarize concurrent training (S&C + MMA) in SMS-friendly format
- Communicate dual intensity systems (RPE for S&C, % effort for sparring)
- Balance sport-specific complexity with brevity
- Frame training within fight preparation context
- Provide interference management guidance
- Emphasize mental preparation and recovery protocols
- Use fight-focused language appropriate for combat athletes

## Schema Compliance

Each example follows the microcycle message structure:

```typescript
{
  microcycleId: string,
  weekNumber: number,
  metadata: {
    title: string,
    phase: string,
    planId: string,
    messageType: "weekly_preview",
    experienceLevel: "advanced",
    sportContext: "mma"
  },
  message: string  // SMS-formatted weekly preview
}
```

## Week Selection Rationale

Same as microcycle:generate/structured examples:
- **Week 1 (Strength Emphasis):** Foundation building, baseline strength (4x5 @ 80-85%)
- **Week 4 (Power Development):** Peak training demand, power transfer (3x3 @ 85-90%)
- **Week 7 (Fight Peak):** Final active preparation, expressing capacity (2x3 @ 92%)

## Message Structure

```
WEEK [N] — [Title]

[Brief overview: 1-3 sentences, phase context + key focus + mental framing]

This Week:
- [Day]: [Brief focus + details]
...

S&C Intensity: [RPE guidance]
Sparring: [% effort guidance]
Recovery: [Sleep/nutrition parameters]

[Closing note: interference management + context + forward-looking]
```

## Message Examples

### Week 1 (Strength Emphasis)
```
WEEK 1 — Strength Emphasis (Fight Camp Opening)

Opening week builds baseline strength capacity (4x5 @ 80-85% 1RM) and 
introduces alactic conditioning (6 rounds x 10sec sprints). Focus on movement 
quality and technical proficiency—don't chase PRs. Leave room for high-quality 
MMA training. Build the foundation for power development in Weeks 4-5.

This Week:
- Mon: Lower Power + Alactic (60min)
- Tue: MMA Technical (light sparring)
- Wed: Upper Strength + Core (60min)
- Thu: MMA Sparring (moderate-high)
- Fri: Explosive + Fight Sim (60min)
- Sat: MMA Open Mat (highest volume)
- Sun: Rest/Active Recovery

S&C Intensity: RPE 7-8 (controlled)
Sparring: 60-85% effort
Recovery: 8-9hr sleep, maintenance calories

Manage fatigue carefully. Pair lower power (Mon) with lighter MMA day (Tue). 
If bar speed drops, reduce load. Strength serves your fight game—not the other 
way around.
```

**Length:** ~185 words  
**Tone:** Educational, foundational, hierarchy-establishing

### Week 4 (Power Development)
```
WEEK 4 — Power Development (Peak Training Demand)

Most demanding week of camp. Strength volume drops (3x3 @ 85-90%) but explosive 
work ramps up (5 sets Olympic lifts, 4 sets plyos). Goal: convert accumulated 
strength into explosive power. Bar speed and intent are primary metrics—if rep 
speed drops, reduce load. Conditioning peaks: 3 rounds fight simulation. Expect 
higher perceived exertion during MMA sessions.

This Week:
- Mon: Lower Power + 8rd Alactic (60min)
- Tue: MMA Technical (moderate, recover)
- Wed: Upper Strength + Core (60min)
- Thu: MMA Sparring (test power transfer)
- Fri: Explosive + 3rd Fight Sim (60min)
- Sat: MMA Hard Sparring (2-3 comp rounds)
- Sun: Rest/Recovery (mental prep)

S&C Intensity: RPE 8-9 (high)
Sparring: 75-90% effort
Recovery: 8-9hr sleep, calorie surplus if weight allows

This is peak demand—manage carefully. If overly fatigued Thu, scale back sparring 
1-2 rounds. Monitor bar speed Fri Olympic lifts. Notice increased snap in punches, 
faster scrambles. Week 5 continues power, then Week 6-7 shift to fight peak.
```

**Length:** ~200 words  
**Tone:** Urgent, performance-focused, auto-regulatory

### Week 7 (Fight Peak)
```
WEEK 7 — Fight Peak (Final Active Preparation)

Final week of active prep before taper. Strength is minimal (2x3 @ 92% CNS priming 
only, not muscle building). Explosive work maintains quality over volume (3-4 sets 
max intent). Conditioning peaks: 5 rounds fight simulation (full fight structure). 
Every session should feel SHARP—if movements grind, reduce load immediately. 
Priority shifts from building capacity to expressing capacity.

This Week:
- Mon: Lower Power + 6rd Alactic (50min)
- Tue: MMA Technical (game plan drilling)
- Wed: Upper Strength + Core (50min)
- Thu: MMA Last Hard Sparring (4x5min)
- Fri: Explosive + 5rd Peak Sim (60min)
- Sat: MMA Final Hard Day (game plan)
- Sun: Active Recovery (mental prep)

S&C Intensity: RPE 9-9.5 (crisp, explosive)
Sparring: 85-90% effort (controlled)
Recovery: 8-9hr sleep NON-NEGOTIABLE, 3-4L water

You're peaking, not proving toughness. Thu is last full-intensity sparring. Fri 
conditioning session should feel like you went 5 rounds. Sat: game plan implementation, 
film review with coaches. Next week is taper—trust the process, arrive fresh, perform.
```

**Length:** ~195 words  
**Tone:** Focused, fight-imminent, mental-prep emphasis

## Dual Intensity Systems

MMA messages communicate two intensity systems:

### S&C Intensity (RPE)
- **Week 1:** RPE 7-8 (controlled) — moderate load, leave 2-3 reps in reserve
- **Week 4:** RPE 8-9 (high) — heavy load, leave 1-2 reps in reserve
- **Week 7:** RPE 9-9.5 (crisp, explosive) — very heavy but quality reps, CNS priming

### Sparring Intensity (% Effort)
- **Week 1:** 60-85% effort — light-to-moderate (skill acquisition priority)
- **Week 4:** 75-90% effort — moderate-high (test power transfer, 2-3 comp rounds)
- **Week 7:** 85-90% effort (controlled) — high intensity but technical precision

**Why two systems?**
- RPE standard for strength training (based on reps in reserve)
- % effort more intuitive for combat sports (effort/speed/power output)
- Separating systems prevents confusion between S&C and MMA training

## Fight-Specific Language

### Week 1 (Foundation)
- "Fight camp opening"
- "Build foundation for power development"
- "Leave room for high-quality MMA training"
- "Strength serves your fight game—not the other way around"

### Week 4 (Peak Demand)
- "Most demanding week of camp"
- "Test power transfer"
- "2-3 comp rounds" (competition-pace rounds)
- "Notice increased snap in punches, faster scrambles"

### Week 7 (Fight Peak)
- "Final active preparation before taper"
- "You're peaking, not proving toughness"
- "Game plan drilling", "game plan implementation"
- "Film review with coaches"
- "Trust the process, arrive fresh, perform"

## Day Breakdown Format

### S&C Days (Mon/Wed/Fri)
- **Format:** `[Type] + [Conditioning] (duration)`
- **Week 1:** "Lower Power + Alactic (60min)"
- **Week 4:** "Lower Power + 8rd Alactic (60min)" — conditioning volume noted
- **Week 7:** "Lower Power + 6rd Alactic (50min)" — reduced duration for freshness

### MMA Days (Tue/Thu/Sat)
- **Format:** `MMA [Type] (context)`
- **Week 1 Tue:** "MMA Technical (light sparring)"
- **Week 4 Thu:** "MMA Sparring (test power transfer)"
- **Week 7 Sat:** "MMA Final Hard Day (game plan)"

### Recovery Day (Sun)
- **Week 1:** "Rest/Active Recovery"
- **Week 4:** "Rest/Recovery (mental prep)"
- **Week 7:** "Active Recovery (mental prep)"

## Interference Management Guidance

### Week 1
> "Pair lower power (Mon) with lighter MMA day (Tue). If bar speed drops, reduce load."

### Week 4
> "If overly fatigued Thu, scale back sparring 1-2 rounds. Monitor bar speed Fri Olympic lifts."

### Week 7
> "Thu is last full-intensity sparring. Fri conditioning session should feel like you went 5 rounds."

These notes guide athletes on:
- Strategic session sequencing (lower power before lighter MMA)
- Auto-regulation cues (bar speed, fatigue level)
- Volume adjustments (scale back sparring if needed)
- Performance indicators (feel like 5 rounds)

## Recovery Parameters Evolution

| Week | Sleep | Nutrition | Hydration | Notes |
|------|-------|-----------|-----------|-------|
| W1 | 8-9hr | Maintenance calories | Not specified | Building tolerance |
| W4 | 8-9hr | Calorie surplus if weight allows | Not specified | Peak demand support |
| W7 | 8-9hr NON-NEGOTIABLE | Not specified (implied maintenance) | 3-4L water | Fight week prep |

**Evolution:**
- Sleep remains constant (8-9hr) but emphasis increases ("NON-NEGOTIABLE" Week 7)
- Nutrition shifts from maintenance → optional surplus (Week 4 peak demand) → implied maintenance (Week 7 weight management)
- Hydration introduced Week 7 (fight week proximity, weight cutting considerations)

## Mental Framing Progression

### Week 1 (Foundation Setting)
- "Don't chase PRs" (tempers ego)
- "Build the foundation" (long-term perspective)
- "Strength serves your fight game" (hierarchy clear)

### Week 4 (Peak Demand Management)
- "Most demanding week of camp" (prepares mentally)
- "Bar speed and intent are primary metrics" (shifts focus from load)
- "Expect higher perceived exertion" (normalizes difficulty)

### Week 7 (Fight Readiness)
- "You're peaking, not proving toughness" (prevents overtraining)
- "Every session should feel SHARP" (quality over quantity)
- "Trust the process, arrive fresh, perform" (confidence building)

## Message Length Analysis

| Week | Phase | Words | SMS Segments | Complexity |
|------|-------|-------|--------------|------------|
| W1 | Strength | ~185 | 2-3 | Moderate (educational, foundational) |
| W4 | Power | ~200 | 3 | High (peak demand, auto-regulation details) |
| W7 | Fight Peak | ~195 | 3 | Very High (mental prep, fight context dense) |

**Notes:**
- All stay SMS-friendly (<200 words, typically 2-3 SMS segments)
- Complexity increases with fight proximity (more mental prep, game plan references)
- Week 4 longest due to auto-regulation guidance and performance indicators

## Sport-Specific vs. General Population Comparison

### General Population (Beginner/Intermediate/Advanced)
- **Focus:** Exercise selection, volume/intensity parameters, progression rules
- **Language:** Gym-centric ("bench press", "sets", "RPE")
- **Motivation:** Personal improvement, aesthetics, health

### Combat Sports (MMA)
- **Focus:** Concurrent training integration, fight preparation, performance transfer
- **Language:** Sport-centric ("sparring", "game plan", "camp", "comp rounds")
- **Motivation:** Fight performance, competition readiness, skill expression

## Use Cases

1. **Agent Training:** Train `microcycle:message` agent on sport-specific weekly previews
2. **Agent Evaluation:** Validate sport-specific language, dual intensity communication, interference management
3. **Database Seeding:** Seed MMA weekly preview templates
4. **SMS Delivery Testing:** Test actual delivery with concurrent training content
5. **User Onboarding:** Show prospective MMA athletes what weekly SMS previews look like
6. **Coach Communication:** Demonstrate how to summarize complex concurrent training for athletes

## Quality Standards

- ✅ SMS-friendly length (185-200 words, 2-3 segments)
- ✅ Dual intensity systems clearly communicated (RPE + % effort)
- ✅ Fight camp context maintained (opening, peak demand, final prep)
- ✅ Concurrent training structure visible (3 S&C + 3 MMA + 1 recovery)
- ✅ Interference management guidance included
- ✅ Recovery parameters specified and evolving
- ✅ Mental framing appropriate for each phase
- ✅ Fight-specific language (game plan, comp rounds, sparring types)
- ✅ Auto-regulation cues provided (bar speed, fatigue monitoring)
- ✅ Forward-looking context (previews next phases)
- ✅ Performance indicators noted (snap in punches, faster scrambles)

## Related Examples

- **Source:** `microcycle-structured-mma-weeks-1-4-7.json` (structured microcycles, PR #193)
- **Plan:** `plan-structured-mma-example.json` (source plan, PR #188)
- **Generate:** `microcycle-mma-weeks-1-4-7.json` (detailed day descriptions, PR #189)
- **Pattern:** Follows beginner/intermediate/advanced/time-constrained microcycle:message patterns but with sport-specific adaptations

---

**File:** `examples/microcycle-message-mma-weeks-1-4-7.json`  
**Format:** SMS weekly preview messages (~185-200 words each)  
**Created:** 2026-02-16  
**Context:** Task "Create microcycle:message examples (MMA - Weeks 1, 4, 7)"
