# Examples Directory Migration Guide

This document guides the migration of example files from the pending PRs into the new `examples/<plan-name>/` structure.

## Migration Status

**Current:** Flat structure in examples/ root (legacy)  
**Target:** Organized structure by plan (examples/<plan-name>/)  
**Date:** 2026-02-16

## Pending PRs to Migrate

### Beginner Examples (PRs #147-154)

**From (current locations in PRs):**
```
examples/plan-structured-beginner-example.json
examples/microcycle-beginner-weeks-1-5-9.json
examples/microcycle-message-beginner-weeks-1-5-9.json
examples/workout-generate-beginner-w1-examples.json
examples/workout-generate-beginner-w5-examples.json
examples/workout-generate-beginner-w9-examples.json
examples/workout-structured-beginner-all-9.json
examples/workout-message-beginner-all-9.json
```

**To (new structure):**
```
examples/beginner/beginner-plan-structured.json
examples/beginner/beginner-microcycle-generate-weeks-1-5-9.json
examples/beginner/beginner-microcycle-message-weeks-1-5-9.json
examples/beginner/beginner-workout-generate-w1.json
examples/beginner/beginner-workout-generate-w5.json
examples/beginner/beginner-workout-generate-w9.json
examples/beginner/beginner-workout-structured-all-9.json
examples/beginner/beginner-workout-message-all-9.json
```

### Intermediate Examples (PRs #155-167)

**To:**
```
examples/intermediate/intermediate-plan-structured.json
examples/intermediate/intermediate-microcycle-generate-weeks-1-7-13.json
examples/intermediate/intermediate-microcycle-structured-weeks-1-7-13.json
examples/intermediate/intermediate-microcycle-message-weeks-1-7-13.json
examples/intermediate/intermediate-workout-generate-w1.json
examples/intermediate/intermediate-workout-generate-w7.json
examples/intermediate/intermediate-workout-generate-w13.json
examples/intermediate/intermediate-workout-structured-all-9.json
examples/intermediate/intermediate-workout-message-all-9.json
```

### Advanced Examples (PRs #169, 171, 174-179)

**To:**
```
examples/advanced/advanced-plan-structured.json
examples/advanced/advanced-microcycle-generate-weeks-2-6-10.json
examples/advanced/advanced-microcycle-structured-weeks-2-6-10.json
examples/advanced/advanced-microcycle-message-weeks-2-6-10.json
examples/advanced/advanced-workout-generate-w2.json
examples/advanced/advanced-workout-generate-w6.json
examples/advanced/advanced-workout-generate-w10.json
examples/advanced/advanced-workout-structured-all-9.json
examples/advanced/advanced-workout-message-all-9.json
```

### Time-Constrained Examples (PRs #180-187)

**To:**
```
examples/time-constrained/time-constrained-plan-structured.json
examples/time-constrained/time-constrained-microcycle-generate-weeks-1-4-6.json
examples/time-constrained/time-constrained-microcycle-structured-weeks-1-4-6.json
examples/time-constrained/time-constrained-microcycle-message-weeks-1-4-6.json
examples/time-constrained/time-constrained-workout-generate-w1.json
examples/time-constrained/time-constrained-workout-generate-w4.json
examples/time-constrained/time-constrained-workout-generate-w6.json
examples/time-constrained/time-constrained-workout-structured-all-9.json
examples/time-constrained/time-constrained-workout-message-all-9.json
```

### MMA Examples (PRs #188-195)

**To:**
```
examples/mma/mma-plan-structured.json
examples/mma/mma-microcycle-generate-weeks-1-4-7.json
examples/mma/mma-microcycle-structured-weeks-1-4-7.json
examples/mma/mma-microcycle-message-weeks-1-4-7.json
examples/mma/mma-workout-generate-w1.json
examples/mma/mma-workout-generate-w4.json (future)
examples/mma/mma-workout-generate-w7.json (future)
examples/mma/mma-workout-structured-w1.json (future)
examples/mma/mma-workout-message-w1.json (future)
```

## README Files to Migrate/Update

**From (in various PRs):**
```
examples/PLAN_STRUCTURED_BEGINNER_README.md
examples/MICROCYCLE_BEGINNER_README.md
examples/WORKOUT_GENERATE_BEGINNER_W1_README.md
... (35+ README files scattered)
```

**To (consolidated):**
```
examples/beginner/README.md (single comprehensive file)
examples/intermediate/README.md
examples/advanced/README.md
examples/time-constrained/README.md
examples/mma/README.md
```

**Note:** Individual README files for each example type should be consolidated into the plan-level README with sections for each example type.

## Migration Steps (For Each PR)

### 1. Rename Files

Use git mv to preserve history:

```bash
# Example for Beginner Plan PR #147
git mv examples/plan-structured-beginner-example.json \
        examples/beginner/beginner-plan-structured.json
```

### 2. Update Internal References

Check if any files reference other example files (cross-references in READMEs, etc.) and update paths:

```
OLD: ../plan-structured-beginner-example.json
NEW: beginner-plan-structured.json
```

### 3. Consolidate READMEs

Merge individual README files into the plan-level README:

```markdown
# examples/beginner/README.md

## Plan Overview
...

## Example Files

### plan:structured
[content from PLAN_STRUCTURED_BEGINNER_README.md]

### microcycle:generate  
[content from MICROCYCLE_BEGINNER_README.md]

...
```

### 4. Update PR Description

Add migration note to PR description:

```
**Migration Note:** Files reorganized into `examples/beginner/` directory 
per new structure (see examples/MIGRATION.md).
```

### 5. Verify Structure

Before merging, verify:
- [ ] All files in correct `examples/<plan>/` directory
- [ ] File names follow `<plan>-<type>-<context>.json` convention
- [ ] Plan-level README.md exists and is comprehensive
- [ ] No broken cross-references
- [ ] Individual READMEs consolidated (removed from file tree)

## Automation Script (Optional)

```bash
#!/bin/bash
# migrate-examples.sh - Helper script for migration

PLAN=$1  # beginner|intermediate|advanced|time-constrained|mma

if [ -z "$PLAN" ]; then
  echo "Usage: ./migrate-examples.sh <plan>"
  exit 1
fi

# Create directory if doesn't exist
mkdir -p "examples/$PLAN"

# Move files matching pattern (adjust per PR)
for file in examples/*-$PLAN-*.json; do
  if [ -f "$file" ]; then
    newname=$(basename "$file" | sed "s/^/${PLAN}-/")
    git mv "$file" "examples/$PLAN/$newname"
  fi
done

# Move READMEs (consolidate later)
for readme in examples/*${PLAN^^}*README.md; do
  if [ -f "$readme" ]; then
    git mv "$readme" "examples/$PLAN/"
  fi
done

echo "Migration complete. Review changes and consolidate READMEs."
```

## Naming Convention Reference

### Pattern
```
<plan-slug>-<example-type>-<context>.json
```

### Plan Slugs
- `beginner`
- `intermediate`
- `advanced`
- `time-constrained`
- `mma`

### Example Types
- `plan-structured`
- `plan-generate` (if created)
- `microcycle-generate`
- `microcycle-structured`
- `microcycle-message`
- `workout-generate`
- `workout-structured`
- `workout-message`

### Contexts
- `weeks-X-Y-Z` (for microcycles)
- `wN` (for workouts, e.g., `w1`, `w5`, `w13`)
- `all-9` (for consolidated workout files)

### Examples
- `beginner-plan-structured.json`
- `intermediate-microcycle-generate-weeks-1-7-13.json`
- `advanced-workout-generate-w10.json`
- `time-constrained-workout-message-all-9.json`
- `mma-microcycle-message-weeks-1-4-7.json`

## Post-Migration Cleanup

After all PRs are merged with new structure:

1. **Remove old structure references** from docs
2. **Update agent loading code** to use new paths
3. **Update database seeding scripts** to use new structure
4. **Archive this MIGRATION.md** (or mark as completed)

## Questions?

- **Conflict with existing examples?** New structure uses plan prefixes to avoid conflicts
- **What about shared examples?** Move to `examples/shared/` (workout-messages.md, plan-microcycle-examples/)
- **README consolidation breaking changes?** Individual READMEs can remain temporarily, consolidate in follow-up PR
- **Git history preservation?** Use `git mv` (not rm+add) to preserve file history

---

**Migration Lead:** @scout  
**Started:** 2026-02-16  
**Target Completion:** When all pending PRs (#140-195) are merged  
**Status:** Structure created, pending PRs to be updated on merge
