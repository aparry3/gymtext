# Workout Message Examples

Curated collection of "perfect" workout messages that demonstrate the [Message Format Standard](../docs/MESSAGE_FORMAT.md).

## Purpose

These examples serve as:
- **Reference material** — Show what high-quality output looks like
- **Training data** — Ground truth for agent fine-tuning
- **Evaluation benchmarks** — Test cases for `workout:message` agent quality
- **Onboarding material** — Help new team members understand the format

## File Structure

**`workout-message-examples.json`** — Structured examples with metadata

Each example includes:
- **id**: Unique identifier
- **metadata**: Context (activity type, experience level, focus, key features)
- **message**: The actual SMS-formatted workout message
- **qualityNotes**: What makes this example "perfect"

## Coverage Matrix

### Activity Types
- ✅ **TRAINING** (10 examples) — Various workout types, supersets, circuits, conditioning
- ✅ **ACTIVE_RECOVERY** (2 examples) — Minimal format, permissive language
- ✅ **REST** (2 examples) — Minimal format, supportive messaging

### Training Styles
- ✅ Strength (upper, lower, full body)
- ✅ Hypertrophy (higher volume, rep ranges)
- ✅ Supersets (SS1, SS2 formatting)
- ✅ Circuits (C1, C2 formatting)
- ✅ Hybrid (strength + conditioning)
- ✅ Bodyweight only (no equipment)
- ✅ HIIT/Intervals (sprint work, cardio)
- ✅ Steady-state cardio (running, cycling)
- ✅ Sport-specific (running intervals, track work)

### Experience Levels
- ✅ Beginner (simplified, fewer exercises)
- ✅ Intermediate (standard programming)
- ✅ Advanced (implied in some examples)

## Format Compliance Checklist

All examples follow the [Message Format Standard](../docs/MESSAGE_FORMAT.md):

**TRAINING day requirements:**
- ✅ Focus line (short label)
- ✅ One blank line after focus
- ✅ Section headers with colons (Workout:, Warm-Up:, Conditioning:, etc.)
- ✅ Bullets start with `- `
- ✅ Sets/reps format: `4x8`, `3x10-12`, `3x8/side`
- ✅ Abbreviations: BB, DB, KB, SL, etc.
- ✅ Supersets: SS1, SS2, etc.
- ✅ Circuits: C1, C2, etc.
- ✅ Optional Notes section (brief, actionable)

**ACTIVE_RECOVERY requirements:**
- ✅ NO section headers
- ✅ Exactly 1-2 bullets
- ✅ Permissive language (~30m, 5-10m, etc.)
- ✅ Optional stretching bullet only if mentioned in source

**REST requirements:**
- ✅ NO section headers
- ✅ At most 1 bullet
- ✅ Minimal, supportive language
- ✅ Optional gentle movement only

## Anti-Patterns NOT Present

These examples avoid common mistakes:

❌ **Verbose coaching** — No paragraph-long explanations  
❌ **Unnecessary sections** — No separate Main/Accessory for training  
❌ **Overly detailed warmups** — Brief or omitted in most cases  
❌ **REST/ACTIVE_RECOVERY with headers** — These formats have NO headers  
❌ **Inconsistent abbreviations** — Standardized (BB, DB, KB)  
❌ **Missing per-side notation** — Always include /side or /leg for unilateral  
❌ **Stacked exercises** — One exercise per bullet line  

## Usage

### For Agent Training
Use the `message` field as ground truth for fine-tuning the `workout:message` agent.

### For Agent Evaluation
Compare agent output against these examples. Check for:
1. Format compliance (headers, bullets, notation)
2. Brevity (no junk volume)
3. Clarity (immediately understandable)
4. Day-type appropriateness (TRAINING vs ACTIVE_RECOVERY vs REST)

### For PRD/Design
Reference these when designing new features or explaining the format to stakeholders.

## Adding New Examples

When adding examples:
1. Ensure format compliance (use the checklist above)
2. Add metadata (activity type, experience level, focus, key features)
3. Include qualityNotes explaining what makes it "perfect"
4. Cover gaps in the coverage matrix
5. Test the message on a real phone screen (does it scan well?)

## Related Documentation

- [Message Format Standard](../docs/MESSAGE_FORMAT.md) — The specification
- [workout-messages.md](./workout-messages.md) — Extended examples with scenarios
- [SCHEMA.md](./plan-microcycle-examples/SCHEMA.md) — Technical schemas for plan/microcycle generation

---

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Examples:** 14 (10 TRAINING, 2 ACTIVE_RECOVERY, 2 REST)
