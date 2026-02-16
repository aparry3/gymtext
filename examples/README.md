# Training Examples Directory

This directory contains comprehensive reference examples for all GymText AI agents, organized by training plan.

## Directory Structure

```
examples/
├── README.md                    # This file
├── beginner/                    # Beginner — General Fitness Foundation
├── intermediate/                # Intermediate — Hypertrophy Focus  
├── advanced/                    # Advanced — Powerlifting Peaking
├── time-constrained/            # Time-Constrained — Busy Professional
├── mma/                         # MMA — Sport-Specific Fighter
└── shared/                      # Cross-plan examples and resources
```

## Plan Directories

Each plan directory contains the full example lifecycle for that training plan:

### File Naming Convention

```
<plan-slug>-<example-type>-<context>.json
```

**Examples:**
- `beginner-plan-structured.json`
- `beginner-microcycle-generate-weeks-1-5-9.json`
- `beginner-microcycle-structured-weeks-1-5-9.json`
- `beginner-microcycle-message-weeks-1-5-9.json`
- `beginner-workout-generate-w1.json`
- `beginner-workout-structured-w1.json`
- `beginner-workout-message-w1.json`

### Example Types

Each plan directory should contain examples for the following agent outputs:

1. **plan:generate** → `<plan>-plan-generate.json`  
   Raw text output from plan generation agent

2. **plan:structured** → `<plan>-plan-structured.json`  
   Parsed plan following `PlanStructureSchema`

3. **microcycle:generate** → `<plan>-microcycle-generate-weeks-X-Y-Z.json`  
   Weekly training patterns (3 representative weeks)

4. **microcycle:structured** → `<plan>-microcycle-structured-weeks-X-Y-Z.json`  
   Parsed microcycles following `MicrocycleStructureSchema`

5. **microcycle:message** → `<plan>-microcycle-message-weeks-X-Y-Z.json`  
   SMS weekly preview messages

6. **workout:generate** → `<plan>-workout-generate-wN.json`  
   Detailed workout structures for specific week/days

7. **workout:structured** → `<plan>-workout-structured-wN.json`  
   Parsed workouts following `WorkoutStructureLLMSchema`

8. **workout:message** → `<plan>-workout-message-wN.json`  
   SMS daily workout messages

### README Files

Each plan directory contains a `README.md` documenting:
- Plan overview and key characteristics
- Week selection rationale (why these specific weeks)
- Example file manifest with descriptions
- Quality standards demonstrated
- Usage instructions for each example type

## Shared Directory

The `shared/` directory contains cross-plan resources:

- **workout-messages.md** — Collection of perfect message examples (diverse formats)
- **plan-microcycle-examples/** — Original plan:generate examples for all 5 plans

## Plan Characteristics Summary

### Beginner — General Fitness Foundation
- **Split:** 3-Day Full Body
- **Duration:** 12 weeks
- **Focus:** Movement quality, stabilization, habit building
- **Progression:** Linear (form mastery → progressive overload → barbell introduction)
- **Example Weeks:** 1, 5, 9

### Intermediate — Hypertrophy Focus
- **Split:** 6-Day Push/Pull/Legs
- **Duration:** 16 weeks
- **Focus:** Muscle growth via progressive volume
- **Progression:** Block periodization (accumulation → deload → intensification)
- **Example Weeks:** 1, 7, 13

### Advanced — Powerlifting Peaking
- **Split:** 4-Day Upper/Lower
- **Duration:** 12 weeks
- **Focus:** Maximal strength for competition
- **Progression:** 4-block periodization (accumulation → strength → peaking → taper)
- **Example Weeks:** 2, 6, 10

### Time-Constrained — Busy Professional
- **Split:** 3-Day Full Body
- **Duration:** 8 weeks
- **Focus:** Strength maintenance in 45min sessions
- **Progression:** Simplified wave loading with supersets
- **Example Weeks:** 1, 4, 6

### MMA — Sport-Specific Fighter
- **Split:** 3-Day S&C + 4-Day MMA
- **Duration:** 8 weeks (fight camp)
- **Focus:** Concurrent training (strength + power + conditioning + skills)
- **Progression:** Strength → Power → Fight Peak → Taper
- **Example Weeks:** 1, 4, 7

## Usage

### For Agent Training
1. Load plan-specific examples from `<plan>/` directory
2. Use examples to fine-tune agent on that plan's characteristics
3. Validate agent output against reference examples

### For Agent Evaluation
1. Compare agent-generated output to reference examples
2. Check schema compliance, format adherence, content quality
3. Verify plan-specific programming principles

### For Database Seeding
1. Import examples from `<plan>/` directories
2. Use for testing, development, or user onboarding
3. Demonstrate realistic GymText content

### For Development
1. Reference examples when building new features
2. Test UI components with realistic data
3. Validate schema changes don't break existing examples

## Migration from Flat Structure

**Previous structure** (all files in `examples/` root):
```
examples/
├── plan-examples.json
├── microcycle-advanced-weeks-2-6-10.json
├── workout-generate-beginner-w1.json
└── ... (scattered files)
```

**New structure** (organized by plan):
```
examples/
├── README.md
├── beginner/
│   ├── README.md
│   ├── beginner-plan-structured.json
│   ├── beginner-microcycle-generate-weeks-1-5-9.json
│   └── ... (all beginner examples)
├── intermediate/
│   ├── README.md
│   └── ... (all intermediate examples)
└── shared/
    ├── workout-messages.md
    └── plan-microcycle-examples/
```

**Benefits:**
- Easier to find examples for specific plan
- Clear organization by training context
- Scalable as more plans are added
- Reduces root directory clutter

## Contributing New Examples

When adding new examples:

1. **Determine plan context** — Which plan does this example support?
2. **Choose appropriate directory** — Place in `<plan>/` or `shared/`
3. **Follow naming convention** — Use `<plan>-<type>-<context>.json`
4. **Update plan README** — Document the new example
5. **Maintain consistency** — Match quality standards of existing examples

## Quality Standards

All examples in this directory should:

- ✅ Follow the appropriate schema exactly
- ✅ Include comprehensive README documentation
- ✅ Demonstrate realistic, high-quality programming
- ✅ Be validated against actual trainer/coach review
- ✅ Include detailed execution notes where appropriate
- ✅ Show plan-specific characteristics clearly
- ✅ Serve as reference benchmarks for agent evaluation

## Questions?

See individual plan `README.md` files for plan-specific details, or refer to:
- `packages/shared/src/shared/types/` — Schema definitions
- `docs/` — GymText architecture and agent documentation
- `ARCHITECTURE.md` — System design and data flow

---

**Last Updated:** 2026-02-16  
**Structure Version:** 2.0 (consolidated by plan)
