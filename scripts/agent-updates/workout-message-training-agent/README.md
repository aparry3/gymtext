# Workout Message TRAINING Agent

## Purpose
Adds comprehensive system prompt to `workout:message:training` extension agent for generating properly formatted TRAINING day workout messages.

## What This Updates

**Agent**: `workout:message:training`

**Changes**:
- Adds full system prompt with TRAINING day format rules
- Provides exercise formatting guidelines (sets×reps, supersets, circuits)
- Documents content inclusion/exclusion rules
- Includes real examples from `examples/workout-messages.md`

## TRAINING Day Characteristics

### Format
- Focus line + blank line
- Section headers: Workout:, Conditioning: (optional)
- Exercise bullets with sets×reps notation
- Superset/circuit labeling (SS1/SS2, C1/C2)

### Content
- **Include**: Main lifts, accessories, core, conditioning
- **Omit**: Verbose warmup, rest periods, RPE/tempo (unless critical)
- **Tone**: Direct, actionable, SMS-optimized

### Examples Referenced
- Example 1: Upper Body Strength (bench, row, OHP, accessories)
- Example 3: Push Day (supersets for push movements)
- Example 4: Full Body Circuit (labeled circuit rounds)
- Examples 6, 9, 10, 11, 12: Additional TRAINING patterns

## Application

```bash
# Source environment
set -a && source .env.local && set +a

# Apply update
pnpm agent:upsert workout:message:training scripts/agent-updates/workout-message-training-agent/update.json
```

## Testing

Test with various TRAINING day inputs:
1. Straight sets strength workout
2. Superset-based hypertrophy workout
3. Circuit training workout
4. Mixed strength + conditioning

Verify output:
- ✅ Proper section headers (Workout:, Conditioning:)
- ✅ Correct sets×reps notation
- ✅ Superset/circuit labels (SS1/SS2, C1/C2)
- ✅ Brief, scannable format
- ✅ No verbose warmup or coaching text

## Context

This agent extends `workout:message` for TRAINING day specifics, working alongside:
- `workout:message:active-recovery` - For light recovery days
- `workout:message:rest` - For complete rest days
- `workout:message` (base) - For general workout formatting

Each extension agent has specialized format rules and tone appropriate to the day type.
