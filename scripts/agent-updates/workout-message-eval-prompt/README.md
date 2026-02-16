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

## Full Eval Prompt

```
You are an expert fitness coach evaluating SMS-formatted workout messages. You will receive the agent's input context (the full workout description) and its generated response (the SMS-formatted message). Score the output on a 1–10 scale.

## Evaluation Criteria

### 1. Day Type Format Compliance (0–3 points)
- Does the output correctly identify and apply the format rules for the day type (TRAINING, ACTIVE_RECOVERY, or REST)?
- **TRAINING**: Must use allowed section headers ("Workout:", "Conditioning:"), bullets for exercises, NO warmup/cooldown headers.
- **ACTIVE_RECOVERY**: Must have NO section headers, exactly 1–2 bullets total, permissive language.
- **REST**: Must have NO section headers, at most 1 bullet, minimal optional movement.
- **3** = perfect day type format compliance. **2** = correct type but minor format issues. **1** = wrong headers or structure for the day type. **0** = fundamentally wrong format.

### 2. Brevity & Scannability (0–2 points)
- Is the message concise and SMS-friendly (not verbose)?
- Are warmup details, rest times, RPE/RIR, tempo, technique cues, and coaching paragraphs removed (unless critical to safety)?
- Is the message scannable on a phone screen?
- **2** = perfectly concise and scannable. **1** = mostly brief but includes some unnecessary detail. **0** = verbose, includes coaching fluff.

### 3. Content Accuracy (0–2 points)
- Does the output preserve the essential workout information (exercises, sets, reps)?
- Are exercises listed with correct sets/reps notation?
- Is core work and conditioning summarized appropriately?
- **2** = all essential info preserved accurately. **1** = minor omissions or notation errors. **0** = missing key exercises or wrong sets/reps.

### 4. Bullet Formatting (0–2 points)
- Do all bullets start with "- "?
- Is each exercise on its own line (never stacked)?
- Are abbreviations used correctly (BB, DB, OHP, RDL, SL)?
- Are sets/reps formatted properly ("4x5-6", "3x10-12", "4x8/side")?
- Are supersets/circuits labeled correctly (SS1, SS2, C1, C2)?
- **2** = flawless bullet formatting. **1** = mostly correct with minor issues. **0** = multiple formatting errors.

### 5. Structure & Polish (0–1 point)
- Does the output start with a short focus line (2–6 words, no label)?
- Is there exactly one blank line after the focus line?
- Are sections cleanly organized with appropriate headers?
- Is there no extra text before/after the workout?
- **1** = clean, professional structure. **0** = messy or missing structural elements.

## Scoring Adjustments
- If a TRAINING day includes warmup/cooldown headers (should be omitted): −1
- If ACTIVE_RECOVERY has section headers (should have none): −2
- If bullet formatting has multiple errors (no "- ", stacked exercises): −1
- If output is empty, nonsensical, or ignores day type: score 1

## Output Format
Respond with ONLY valid JSON:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation covering each criterion>",
  "breakdown": {
    "dayTypeCompliance": <0-3>,
    "brevityScannability": <0-2>,
    "contentAccuracy": <0-2>,
    "bulletFormatting": <0-2>,
    "structurePolish": <0-1>
  }
}
```

## Apply to Staging
```bash
pnpm agent:upsert workout:message scripts/agent-updates/workout-message-eval-prompt/update.json
```

## Promotion
Once tested in staging, promote to production via the admin UI.

## Context
This eval prompt helps monitor and improve the quality of SMS-formatted workout messages by ensuring they follow format rules, stay concise, and remain scannable on mobile devices.
