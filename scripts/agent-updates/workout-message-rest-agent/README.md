# Workout Message REST Agent

## Purpose
Adds comprehensive system prompt to `workout:message:rest` extension agent for generating properly formatted REST day messages.

## What This Updates

**Agent**: `workout:message:rest`

**Changes**:
- Adds full system prompt with REST day format rules
- Provides strict guidelines for minimal, supportive messaging
- Documents what to include/omit on rest days
- References example 8 from `examples/workout-messages.md`

## REST Day Characteristics

### Format
- Focus line: "Rest Day" (exact words)
- Blank line
- 1-2 sentences about recovery
- At most 1 optional bullet for light suggestions
- **NO section headers** (critical difference from training days)

### Content
- **Include**: Validation that rest is part of training, brief recovery message
- **Omit**: Section headers, multiple bullets, prescriptive language, structured activities
- **Tone**: Warm, supportive, permissive (not prescriptive)

### Key Constraints
- Maximum 4-5 lines total
- At most 1 bullet (or none)
- No "Workout:", "Optional:", or any section headers
- No sets/reps or workout-like structure
- Permissive language only: "if you feel like", "optional"

## Example Referenced

**Example 8 - REST Day:**
```
Rest Day

No workout today. Recovery is part of the program.

If you feel like moving:
- Easy walk or light stretching: 5-15m
```

**Format analysis:**
- ✅ "Rest Day" focus line
- ✅ Blank line after focus
- ✅ Recovery validation message
- ✅ Permissive framing ("If you feel like")
- ✅ Single optional bullet
- ✅ NO section headers
- ✅ Brief and supportive

## Application

```bash
# Source environment
set -a && source .env.local && set +a

# Apply update
pnpm agent:upsert workout:message:rest scripts/agent-updates/workout-message-rest-agent/update.json
```

## Testing

Test with various REST day scenarios:
1. Simple rest (no suggestions) → verify 2-3 lines, no bullets
2. Rest with optional walk → verify 1 bullet max, permissive language
3. Rest with light activity suggestions → verify no section headers, stays brief

Verify output:
- ✅ Focus: "Rest Day"
- ✅ Blank line after focus
- ✅ No section headers (Workout:, Optional:, etc.)
- ✅ At most 1 bullet
- ✅ Permissive tone ("if you feel like", "optional")
- ✅ Total length: 4-5 lines max
- ✅ No prescriptive or structured workout activities

## Common Mistakes to Prevent

❌ Adding section headers (should have NONE)  
❌ Multiple bullets (max 1)  
❌ Prescriptive language ("you should", "make sure")  
❌ Detailed recovery protocols (foam rolling sequences, etc.)  
❌ Verbose coaching text  
❌ Workout-like activities with structure  

## Context

This agent extends `workout:message` for REST day specifics, working alongside:
- `workout:message:training` - For strength/hypertrophy/circuits
- `workout:message:active-recovery` - For light recovery days
- `workout:message` (base) - For general workout formatting

REST days require the most minimal format: no headers, max 1 bullet, supportive tone only.
