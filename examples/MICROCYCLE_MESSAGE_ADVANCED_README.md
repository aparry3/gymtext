# Microcycle Message Examples: Advanced Powerlifting Peaking (Weeks 2, 6, 10)

SMS-formatted weekly preview messages for advanced powerlifting competition preparation program.

## Purpose

These examples demonstrate:
- **How `microcycle:message` should structure advanced sport-specific weekly previews**
- **Competition-focused communication** (references meet preparation, taper, competition day)
- **Technical precision** (specific percentages, RPE targets, bar speed guidance)
- **RPE-based auto-regulation** integrated into weekly guidance
- **Periodization awareness** (wave loading context, block progression)

## Week Selection Rationale

**Week 2 — Mid-Accumulation:**
- Represents typical volume-building programming (5×5 @ 70-75% RPE 7-8)
- Shows progression guidance based on previous week's RPE
- Introduces secondary variations (pause squats, close-grip bench, deficit deadlifts)
- Emphasizes tracking (weight, reps, RPE, bar speed)

**Week 6 — Mid-Strength Building (Wave Loading):**
- Demonstrates wave loading communication (80% → 82.5% → 85%)
- Shows intensity increase with volume reduction (4×3 vs 5×5)
- Emphasizes bar speed as load adjustment trigger
- Notes accessory reduction strategy and variation elimination

**Week 10 — Mid-Peaking (Heavy Doubles):**
- Demonstrates near-maximal intensity communication (92.5% RPE 9.5)
- Shows competition prioritization ("Competition > hitting percentages")
- Emphasizes safety (spotter required, form breaks = too heavy)
- Provides competition countdown context (Week 11: singles, Week 12: taper + compete)

## Comparison: Beginner vs Intermediate vs Advanced

### Message Length

| Level | Avg Words | Purpose |
|-------|-----------|---------|
| Beginner | 120-150 | Educational, welcoming, cautious |
| Intermediate | 150-180 | Prescriptive, confident, performance-focused |
| Advanced | 140-170 | Technical, terse, competition-focused |

Advanced messages are slightly shorter than intermediate despite higher complexity—assumes reader understands concepts, needs less explanation.

### Tone Differences

**Beginner:**
- "Welcome to your first week!"
- "Movement quality is the priority"
- "If something hurts, stop immediately"

**Intermediate:**
- "Welcome to 6-day PPL training"
- "Track everything: weight, reps, RPE"
- "Don't max out Week 1—build volume tolerance"

**Advanced:**
- "Building on Week 1's foundation"
- "Bar speed is critical: if 3rd rep grinds (>3sec), reduce load"
- "Competition > hitting percentages"

## Schema Compliance

All three messages follow the same schema:

### ✅ Required Fields
- `microcycleId`: ✅ Unique identifier
- `weekNumber`: ✅ 2, 6, 10
- `metadata`: ✅ title, phase, planId, messageType, experienceLevel
- `message`: ✅ SMS-formatted weekly preview (~140-170 words)
- `qualityNotes`: ✅ Array of observations

## Related Documentation

- [microcycle-advanced-weeks-2-6-10.json](./microcycle-advanced-weeks-2-6-10.json) — Source microcycles (detailed 7-day descriptions)
- [plan-structured-advanced-example.json](./plan-structured-advanced-example.json) — Source plan
- [microcycle-message-beginner-examples.json](./microcycle-message-beginner-examples.json) — Beginner comparison
- [microcycle-message-intermediate-weeks-1-7-13.json](./microcycle-message-intermediate-weeks-1-7-13.json) — Intermediate comparison

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 3 complete advanced-level weekly preview messages  
**Schema:** Microcycle message format (microcycleId, weekNumber, metadata, message, qualityNotes)  
**Complexity Level:** Advanced (sport-specific powerlifting peaking with competition endpoint)  
**Message Length:** 140-170 words (SMS-friendly, 2-3 segments)  
**Tone:** Technical, terse, competition-focused
