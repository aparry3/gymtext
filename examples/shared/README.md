# Shared Examples & Resources

Cross-plan examples and reference materials used across multiple training plans.

## Contents

### workout-messages.md

Collection of **14 perfect SMS workout messages** demonstrating diverse formats and contexts:

- **Beginner messages** (120-150 words): Educational, form-focused, simple structure
- **Intermediate messages** (130-155 words): Prescriptive, volume-specific, technique detail
- **Advanced messages** (140-155 words accumulation, 125 words peaking): Technical, terse, performance-focused
- **Deload messages** (105 words): Active recovery framing, strategic omissions explained
- **Intensification messages** (147 words): Advanced techniques with execution details

**Purpose:**
- Reference examples for workout:message agent training
- Format standards for SMS daily workouts
- Quality benchmarks (structure, length, tone, detail level)
- Demonstrates progression across experience levels

**Key Characteristics:**
- SMS-friendly length (100-180 words, 2-3 segments)
- Clear exercise categorization (Compounds → Accessories → Isolation)
- RPE guidance and rest periods specified
- Tracking emphasis where appropriate
- Safety reminders and execution notes
- Expectation setting (DOMS warnings, session time)

---

### plan-microcycle-examples/

Original **plan:generate** examples for all 5 training plans:

1. **Beginner — General Fitness Foundation** (3-day full body, 12 weeks)
2. **Intermediate — Hypertrophy Focus** (6-day PPL, 16 weeks)
3. **Advanced — Powerlifting Peaking** (4-day upper/lower, 12 weeks meet prep)
4. **Time-Constrained — Busy Professional** (3-day full body with supersets, 8 weeks)
5. **Sport-Specific — MMA Fighter** (3-day S&C + 4-day MMA, 8-week fight camp)

**File:** `plan-examples.json`

**Purpose:**
- Source material for plan:structured agent (parsing text plans into structured format)
- Demonstrates range of plan types (general fitness → sport-specific)
- Shows varied periodization models (linear, block, wave loading, concurrent)
- Reference for plan generation quality standards

**Structure:**
Each plan contains:
- Program architecture (split strategy, rationale, primary focus)
- Weekly schedule template (day-by-day breakdown)
- Session guidelines (sets/reps, tempo, rest, load ranges)
- Cardio/conditioning protocols
- Anchor integration (if applicable)
- Progression strategy (method, cadence, milestones)
- Deload protocol (trigger, implementation)
- Key principles (7-10 core programming concepts)

**README:** `plan-microcycle-examples/README.md`
- Detailed breakdown of all 5 plans
- Highlights unique characteristics
- Usage guidance for agent training

---

## Usage

### For Agent Training

**workout:message agent:**
- Load `workout-messages.md` for diverse message examples
- Train on format standards, length targets, tone variations
- Validate output against quality benchmarks

**plan:structured agent:**
- Load `plan-microcycle-examples/plan-examples.json`
- Train on parsing text plans into `PlanStructureSchema`
- Learn to extract weekly schedules, session guidelines, progression strategies

### For Reference

**When creating new plan examples:**
- Check `workout-messages.md` for message format standards
- Review `plan-examples.json` for plan generation patterns
- Maintain consistency with established quality benchmarks

**When evaluating agent output:**
- Compare to reference examples in this directory
- Check adherence to format standards
- Validate content quality against benchmarks

### For Documentation

**Demonstrating capabilities:**
- Use examples to show range of plans supported
- Highlight format variations across experience levels
- Showcase quality standards

---

## File Manifest

| File | Type | Content | Lines | Purpose |
|------|------|---------|-------|---------|
| `workout-messages.md` | Markdown | 14 SMS workout messages | ~300 | Message format reference |
| `plan-microcycle-examples/plan-examples.json` | JSON | 5 plan:generate outputs | ~650 | Plan generation examples |
| `plan-microcycle-examples/README.md` | Markdown | Plan documentation | ~300 | Plan context & usage |

---

## Maintenance

**When adding new shared resources:**
1. Ensure content is truly cross-plan (not specific to one plan)
2. Document purpose and usage clearly
3. Update this README with new file details
4. Maintain consistency with existing examples

**Examples of cross-plan resources:**
- Message format standards (applicable to all plans)
- Schema documentation (shared across all agents)
- General programming principles (universal concepts)
- Evaluation rubrics (common quality metrics)

**Examples of plan-specific resources (NOT shared):**
- Plan-specific microcycles (belongs in `<plan>/` directory)
- Plan-specific workout examples (belongs in `<plan>/` directory)
- Plan-specific progression notes (belongs in `<plan>/` README)

---

**Last Updated:** 2026-02-16  
**Directory Purpose:** Cross-plan reference materials and format standards
