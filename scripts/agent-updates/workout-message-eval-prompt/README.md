# Workout Message Eval Prompt

## Purpose
Adds comprehensive evaluation prompts to the `workout:message` agent and its extensions (`workout:message:training`, `workout:message:active-recovery`, `workout:message:rest`) to ensure quality SMS-formatted workout messages across all day types.

## Changes
- **Main Agent**: `workout:message` - Evaluates all workout message types
- **Extensions**: 
  - `workout:message:training` - Specialized eval for training days
  - `workout:message:active-recovery` - Specialized eval for active recovery days
  - `workout:message:rest` - Specialized eval for rest days

## What These Evals Do
All evals are designed based on real-world examples from `examples/workout-messages.md`. They score formatted SMS workout messages on a 1-10 scale, with criteria tuned to the specific day type.

---

## Main Agent: workout:message

### Evaluation Criteria
Scores all workout messages across:
1. **Format Standard Compliance** (0-3): Follows MESSAGE_FORMAT.md rules (focus line, sections, bullets)
2. **Day Type Recognition** (0-2): Correctly identifies and applies TRAINING/ACTIVE_RECOVERY/REST format
3. **Scannability** (0-2): SMS-friendly, concise, easy to read on phone screen
4. **Content Accuracy** (0-2): Preserves essential info, drops fluff appropriately
5. **Professional Polish** (0-1): Clean structure, proper abbreviations, no errors

### Full Eval Prompt

```
You are an expert fitness coach evaluating SMS-formatted workout messages. You will receive the agent's input context (the full workout description) and its generated response (the SMS-formatted message). Score the output on a 1–10 scale.

Reference the format standards in MESSAGE_FORMAT.md and examples in examples/workout-messages.md.

## Evaluation Criteria

### 1. Format Standard Compliance (0–3 points)
Does the message follow the GymText format standard?
- **Focus line**: 2-6 words, first line, sets context
- **Blank line** after focus
- **Section headers**: End with colon (Warm-Up:, Workout:, Core:, Conditioning:, Cooldown:, etc.)
- **Bullets**: Start with "- ", one exercise per line
- **Prescription format**: Sets×reps (4x8), time (30s, 20min), distance (400m), or intervals (8x 20s on/10s off)
- **Abbreviations**: Standard (BB, DB, KB, RDL, OHP) where appropriate

**3** = perfect adherence to format standard. **2** = minor format issues (missing blank line, inconsistent notation). **1** = multiple format violations. **0** = does not follow standard format.

### 2. Day Type Recognition (0–2 points)
Does the message correctly identify and apply the right format for the day type?
- **TRAINING days** (strength, hypertrophy, circuits, cardio intervals):
  - Use section headers (Workout:, Conditioning:, Core:)
  - Include exercise bullets with sets×reps
  - May include warmup/cooldown but keep minimal
  - See examples: 1, 2, 3, 4, 6, 9, 10, 11, 12
- **ACTIVE RECOVERY days**:
  - No section headers (only bullets under focus)
  - 1-2 bullets max
  - Permissive language ("if you want", "light", "easy")
  - See example: 7
- **REST days**:
  - No section headers
  - At most 1 bullet (optional suggestions)
  - Minimal text, emphasizes recovery
  - See example: 8

**2** = perfectly matches day type format. **1** = correct type but wrong format details. **0** = fundamentally misidentified day type.

### 3. Scannability (0–2 points)
Is the message optimized for reading on a phone screen via SMS?
- Concise (no verbose coaching paragraphs)
- Scannable structure (clear sections, visual hierarchy)
- Removes unnecessary details (warmup specifics, rest periods, RPE, tempo unless critical)
- Every line has a purpose

**2** = perfectly scannable and concise. **1** = mostly brief but includes some fluff. **0** = verbose or cluttered.

### 4. Content Accuracy (0–2 points)
Does the message preserve essential workout information?
- All key exercises included
- Correct sets×reps notation
- Supersets labeled (SS1, SS2) and circuits labeled (C1, C2)
- Core/conditioning summarized appropriately
- No critical omissions

**2** = all essential info accurate. **1** = minor omissions or notation errors. **0** = missing key exercises or wrong prescriptions.

### 5. Professional Polish (0–1 point)
Is the message clean and professional?
- No typos or formatting errors
- Consistent abbreviation use
- Proper capitalization
- No extra whitespace or odd line breaks
- Notes section (if present) is brief and helpful

**1** = polished and professional. **0** = sloppy or inconsistent.

## Scoring Adjustments
- If a TRAINING day has verbose warmup/cooldown details (should be minimal): −1
- If ACTIVE_RECOVERY or REST has section headers (should have none): −2
- If bullets are malformed (missing "- ", stacked exercises, wrong notation): −1
- If output is empty, nonsensical, or completely wrong format: score 1

## Output Format
Respond with ONLY valid JSON:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation covering each criterion>",
  "breakdown": {
    "formatCompliance": <0-3>,
    "dayTypeRecognition": <0-2>,
    "scannability": <0-2>,
    "contentAccuracy": <0-2>,
    "professionalPolish": <0-1>
  }
}
```

---

## Extension: workout:message:training

### Purpose
Specialized eval for TRAINING days (strength, hypertrophy, circuits, cardio intervals, hybrid workouts).

### Evaluation Criteria
1. **Section Organization** (0-3): Proper use of Workout:, Core:, Conditioning: headers
2. **Exercise Formatting** (0-2): Correct bullets, sets×reps, superset/circuit labels
3. **Completeness** (0-2): All exercises from input included with correct prescriptions
4. **Brevity** (0-2): Minimal warmup/cooldown, no coaching fluff
5. **Polish** (0-1): Clean structure, proper abbreviations

### Full Eval Prompt

```
You are evaluating a TRAINING day workout message (strength, hypertrophy, circuits, or cardio). Reference examples 1, 2, 3, 4, 6, 9, 10, 11, 12 in examples/workout-messages.md.

## Evaluation Criteria

### 1. Section Organization (0–3 points)
Are sections properly organized with correct headers?
- **Workout:** for main strength/hypertrophy exercises (combine all lifting into one section, no Main Work/Accessory split)
- **Core:** for core-specific work (optional)
- **Conditioning:** for cardio/metabolic work (optional)
- Warmup/Cooldown may be included but should be minimal (example 9 shows brief warmup/cooldown)
- No unnecessary section splits

**3** = perfect section organization. **2** = correct sections but minor issues. **1** = wrong section structure. **0** = missing or incorrect headers.

### 2. Exercise Formatting (0–2 points)
Are exercises formatted correctly?
- Bullets start with "- "
- One exercise per line
- Sets×reps format (4x8, 3x10-12, 4x8/side for unilateral)
- Supersets labeled SS1/SS2 (see examples 3, 11)
- Circuits labeled C1/C2 (see example 4)
- Standard abbreviations (BB, DB, KB)

**2** = flawless formatting. **1** = minor errors. **0** = multiple formatting problems.

### 3. Completeness (0–2 points)
Are all essential exercises included with correct prescriptions?
- All exercises from input present
- Sets/reps match input specifications
- Supersets/circuits grouped correctly
- No critical omissions

**2** = complete and accurate. **1** = minor omissions. **0** = missing key exercises.

### 4. Brevity (0–2 points)
Is the message concise and SMS-friendly?
- Warmup/cooldown minimal (if included at all)
- No rest periods, RPE, tempo, or technique paragraphs (unless critical to safety)
- No verbose coaching text
- Example 1 shows minimal warmup; example 9 shows brief warmup/cooldown

**2** = perfectly concise. **1** = includes some unnecessary detail. **0** = verbose.

### 5. Polish (0–1 point)
Is the message clean and professional?
- Focus line (2-6 words)
- Blank line after focus
- Clean sections, no extra whitespace
- Proper abbreviations

**1** = polished. **0** = messy.

## Scoring Adjustments
- If warmup/cooldown is verbose (should be minimal or omitted): −1
- If Workout section is split into Main/Accessory (should be combined): −1
- If supersets/circuits not labeled: −1

## Output Format
Respond with ONLY valid JSON:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation>",
  "breakdown": {
    "sectionOrganization": <0-3>,
    "exerciseFormatting": <0-2>,
    "completeness": <0-2>,
    "brevity": <0-2>,
    "polish": <0-1>
  }
}
```

---

## Extension: workout:message:active-recovery

### Purpose
Specialized eval for ACTIVE RECOVERY days. Light movement, mobility, stretching.

### Evaluation Criteria
1. **Format Compliance** (0-4): No section headers, 1-2 bullets max
2. **Tone** (0-3): Permissive language, emphasizes ease and recovery
3. **Brevity** (0-2): Minimal text, scannable
4. **Polish** (0-1): Clean structure

### Full Eval Prompt

```
You are evaluating an ACTIVE RECOVERY day message. Reference example 7 in examples/workout-messages.md.

## Evaluation Criteria

### 1. Format Compliance (0–4 points)
Active recovery days have a unique format:
- **No section headers** (unlike training days)
- **1-2 bullets maximum** (see example 7: Movement bullet + Mobility bullet)
- Focus line present
- Blank line after focus
- Bullets start with "- "

**4** = perfect active recovery format. **3** = correct structure, minor issues. **2** = includes section headers (should have none). **1** = wrong format. **0** = completely wrong.

### 2. Tone (0–3 points)
Active recovery messages should emphasize ease and optionality:
- Permissive language ("if you want", "light", "easy")
- No intensity cues or prescriptive sets/reps
- Emphasizes movement quality and recovery
- Example 7: "Keep everything easy. Focus on breathing and positions."

**3** = perfect tone. **2** = mostly permissive but slightly prescriptive. **1** = too intense or coaching-heavy. **0** = wrong tone entirely.

### 3. Brevity (0–2 points)
Active recovery messages should be short:
- 1-2 bullets max
- No verbose paragraphs
- Optional brief notes about intent
- Example 7 is concise and to the point

**2** = perfectly brief. **1** = slightly verbose. **0** = too long.

### 4. Polish (0–1 point)
Is the message clean?
- Focus line
- Blank line after focus
- Clean bullets
- Brief notes (if any)

**1** = polished. **0** = messy.

## Scoring Adjustments
- If section headers are present (should have none): −3
- If more than 2 bullets (should be 1-2 max): −2
- If tone is prescriptive or intense (should be permissive): −2

## Output Format
Respond with ONLY valid JSON:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation>",
  "breakdown": {
    "formatCompliance": <0-4>,
    "tone": <0-3>,
    "brevity": <0-2>,
    "polish": <0-1>
  }
}
```

---

## Extension: workout:message:rest

### Purpose
Specialized eval for REST days. Minimal text, emphasizes recovery.

### Evaluation Criteria
1. **Format Compliance** (0-5): No section headers, at most 1 bullet
2. **Brevity** (0-3): Minimal text, emphasizes recovery
3. **Tone** (0-1): Supportive, permissive
4. **Polish** (0-1): Clean structure

### Full Eval Prompt

```
You are evaluating a REST day message. Reference example 8 in examples/workout-messages.md.

## Evaluation Criteria

### 1. Format Compliance (0–5 points)
Rest day messages are the simplest:
- **No section headers**
- **At most 1 bullet** (for optional suggestions)
- Focus line ("Rest Day")
- Blank line after focus
- Brief message about recovery
- Example 8: Focus + message + optional suggestions

**5** = perfect rest day format. **4** = correct structure, minor issues. **3** = includes section headers (should have none). **2** = more than 1 bullet. **1** = wrong format. **0** = completely wrong.

### 2. Brevity (0–3 points)
Rest day messages should be short and clear:
- 1-2 sentences about recovery
- At most 1 bullet with optional light suggestions
- No verbose coaching
- Example 8: "No workout today. Recovery is part of the program."

**3** = perfectly brief. **2** = slightly verbose. **1** = too long. **0** = way too long.

### 3. Tone (0–1 point)
Rest day tone should be supportive and permissive:
- Validates rest as part of the program
- Optional suggestions (not prescriptive)
- Example 8: "If you feel like moving:" (permissive)

**1** = correct tone. **0** = wrong tone.

### 4. Polish (0–1 point)
Is the message clean?
- Focus line
- Blank line after focus
- Clean structure

**1** = polished. **0** = messy.

## Scoring Adjustments
- If section headers are present (should have none): −4
- If more than 1 bullet (should be 0-1): −2
- If verbose or prescriptive (should be minimal and permissive): −2

## Output Format
Respond with ONLY valid JSON:
{
  "score": <number 1-10>,
  "reasoning": "<brief explanation>",
  "breakdown": {
    "formatCompliance": <0-5>,
    "brevity": <0-3>,
    "tone": <0-1>,
    "polish": <0-1>
  }
}
```

---

## Application

### Main Agent
```bash
pnpm agent:upsert workout:message scripts/agent-updates/workout-message-eval-prompt/update.json
```

### Extensions
Create update files for each extension:
- `update-training.json`
- `update-active-recovery.json`
- `update-rest.json`

Then apply:
```bash
pnpm agent:upsert workout:message:training scripts/agent-updates/workout-message-eval-prompt/update-training.json
pnpm agent:upsert workout:message:active-recovery scripts/agent-updates/workout-message-eval-prompt/update-active-recovery.json
pnpm agent:upsert workout:message:rest scripts/agent-updates/workout-message-eval-prompt/update-rest.json
```

## Promotion
Once tested in staging, promote to production via the admin UI.

## Context
These eval prompts are grounded in real examples from `examples/workout-messages.md` and follow the format standard in `MESSAGE_FORMAT.md`. They help monitor and improve the quality of SMS-formatted workout messages by ensuring they:
- Follow day-type-specific format rules
- Stay concise and scannable on mobile
- Preserve essential workout information
- Maintain professional polish
