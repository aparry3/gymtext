# Workout Modify Microcycle Context

## Purpose
Updates the `workout:modify` agent to include microcycle (weekly schedule) context when modifying workouts.

## Changes
- **Fields**: `contextTypes`, `systemPrompt`
- **Agent**: `workout:modify`

## What This Update Does
Enhances the workout modification agent to:
1. **Access microcycle data** - Sees the full weekly training schedule, not just the current day
2. **Make smarter swaps** - When a user requests a different muscle group (e.g., "Can I do chest today instead?"), the agent can look up what intensity/volume was planned for chest on its original day and replicate that appropriately
3. **Preserve training balance** - Maintains the overall weekly training structure even when individual days are shifted

## Apply to Staging
```bash
pnpm agent:upsert workout:modify scripts/agent-updates/workout-modify-microcycle/update.json
```

## Promotion
Once tested in staging, promote to production via the admin UI.

## Context
This allows more intelligent workout modifications when users need to swap training focuses between days while maintaining the integrity of the overall training plan.
