# Workout Message Eval Prompt

## Purpose
Adds an evaluation prompt to the `workout:message` agent to enable quality scoring of SMS-formatted workout messages.

## Changes
- **Field**: `evalPrompt`
- **Agent**: `workout:message`

## What This Eval Does
Scores formatted SMS workout messages on a 1-10 scale across:
1. **Day Type Format Compliance** (0-3): Follows correct format rules for TRAINING/ACTIVE_RECOVERY/REST
2. **Brevity & Scannability** (0-2): SMS-friendly length, no verbose coaching text
3. **Content Accuracy** (0-2): Preserves essential workout info, drops fluff appropriately
4. **Bullet Formatting** (0-2): Proper bullets, sets/reps notation, abbreviations
5. **Structure & Polish** (0-1): Focus line, blank line, clean sections

## Apply to Staging
```bash
pnpm agent:upsert workout:message scripts/agent-updates/workout-message-eval-prompt/update.json
```

## Promotion
Once tested in staging, promote to production via the admin UI.

## Context
This eval prompt helps monitor and improve the quality of SMS-formatted workout messages by ensuring they follow format rules, stay concise, and remain scannable on mobile devices.
