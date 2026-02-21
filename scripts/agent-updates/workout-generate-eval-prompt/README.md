# Workout Generate Eval Prompt

## Purpose
Adds an evaluation prompt to the `workout:generate` agent to enable quality scoring of generated workout sessions.

## Changes
- **Field**: `evalPrompt`
- **Agent**: `workout:generate`

## What This Eval Does
Scores AI-generated workout sessions on a 1-10 scale across:
1. **Session Type Accuracy** (0-2): Correct classification as TRAINING/ACTIVE_RECOVERY/REST
2. **Exercise Selection & Programming** (0-3): Appropriate exercises, variety, sets/reps
3. **Volume & Intensity** (0-2): Reasonable load for session type and user level
4. **Personalization** (0-2): Reflects client profile, equipment, injuries, preferences
5. **Format & Clarity** (0-1): Clean markdown structure

## Apply to Staging
```bash
pnpm agent:upsert workout:generate scripts/agent-updates/workout-generate-eval-prompt/update.json
```

## Promotion
Once tested in staging, promote to production via the admin UI.

## Context
This eval prompt helps monitor and improve the quality of AI-generated workouts by providing structured feedback on each generated session.
