Evaluate the output across these dimensions:

1. Day Type Format Compliance (Weight: 0.25)
- Score 10: Perfect format compliance for the day type
- Score 8-9: Correct day type but minor format issues (e.g., extra blank line, inconsistent capitalization)
- Score 5-7: Mostly correct but includes wrong headers or sections for the day type
- Score 3-4: Wrong day type classification or major format violations
- Score 0-2: Fundamentally broken format (e.g., REST day formatted as a workout)

What to evaluate:
- TRAINING/ACTIVITY days: ONLY "Workout:" and/or "Conditioning:" headers (0-2 headers, in that order). NO warmup, NO cooldown headers.
- ACTIVE_RECOVERY days: NO section headers at all ("Workout:", "Optional:", etc. are all violations). Exactly 1-2 bullets total. First bullet must be "- Easy activity: ~30m (walk, bike, jog, row, swim, etc.)". Optional second bullet only if stretching/mobility mentioned in source: "- Stretching: 5-10m (let me know if you need stretches)". More than 2 bullets is a violation.
- REST days: No section headers. At most 1 bullet. Minimal and supportive. Example: "- Optional easy walk: 5-15m"
- ACTIVE_RECOVERY must read as permissive, not prescriptive — language implying obligation is a deduction
- If source had multiple options (e.g., tempo vs intervals), agent MUST have chosen one — presenting both is a format violation (score 5 or below)

2. Brevity & Scannability (Weight: 0.20)
- Score 10: Perfectly concise, SMS-friendly, instantly scannable
- Score 8-9: Brief with only minor unnecessary details
- Score 5-7: Includes some fluff but still usable (e.g., warmup details on a training day, rest times included, parenthetical noise)
- Score 3-4: Verbose with coaching paragraphs or excessive detail
- Score 0-2: Unreadable, massive blocks of text, not SMS-appropriate

What to evaluate:
- Message is concise and scannable on a phone screen
- Warmup and cooldown details omitted entirely for training days
- Rest times, RPE/RIR, tempo, technique cues, explanations all dropped
- No "Focus:" lines, notes, or coaching paragraphs
- No repeated labels like movement patterns in parentheses
- Each exercise on its own line (never stacked)
- No extra clauses after sets/reps (no rest/RPE/cues)
- Links section omitted unless a real URL exists (if so, URL on its own line)

3. Content Accuracy (Weight: 0.25)
- Score 10: All essential exercises preserved with correct sets/reps
- Score 8-9: Minor omissions (e.g., missing optional accessory exercise)
- Score 5-7: Notable omissions or notation errors (e.g., wrong sets/reps on a main lift)
- Score 3-4: Missing key exercises or major inaccuracies
- Score 0-2: Completely wrong workout or nonsensical output

What to evaluate:
- Correct day extracted from the week dossier (matches requested day name)
- All essential exercises are present (main lifts, core work)
- Sets, reps are correct; set ranges preserved (e.g., "2-3x12-15/side" not collapsed)
- Supersets labeled properly: each exercise on its own bullet with numbered prefix (SS1, SS2)
- Circuits labeled properly with "C1", "C2" prefix
- Core work included as part of the workout list (not omitted)
- Conditioning summarized appropriately with time-based bullets (e.g., "- Easy cardio: 10-15m")
- Optional conditioning/cooldown labeled with "(Optional)" in the header
- If multiple options existed in source, the chosen option is fully and accurately represented

4. Notation & Formatting (Weight: 0.20)
- Score 10: Flawless formatting, perfect notation consistency
- Score 8-9: One or two minor formatting issues
- Score 5-7: Multiple formatting errors but still readable
- Score 3-4: Inconsistent bullets, stacked exercises, messy structure
- Score 0-2: Completely broken formatting (e.g., no bullets, no line breaks)

What to evaluate:
- All bullets start with "- " (not "*", not numbered)
- One exercise per line (never stack multiple exercises on one line)
- Abbreviations are consistent: Barbell -> BB, Dumbbell -> DB, Overhead Press -> OHP, Romanian Deadlift -> RDL, Single-Leg -> SL
- Sets/reps notation is proper: "4x5", "3x8-10", "4x8/side", "2-3x12-15/side"
- Focus line is 2-6 words, no label, on the first line
- Exactly one blank line after focus line, then body content
- No extra text before or after the workout
- Superset format: "- SS1 Exercise Name: Sets x Reps" (numbered label prefix on each bullet)
- Circuit format: "- C1 Exercise Name: Sets x Reps"
- Optional sections can use indented sub-bullets for stretch menus
- No extra commentary anywhere in the output

5. Tone & Coaching Quality (Weight: 0.10)
- Score 10: Perfect coaching tone — concise, actionable, decisive, no fluff
- Score 8-9: Good tone with minor verbosity
- Score 5-7: Too chatty or includes unnecessary coaching notes
- Score 3-4: Overly verbose coaching paragraphs or inappropriate tone
- Score 0-2: Nonsensical or condescending tone

What to evaluate:
- No coaching paragraphs or verbose explanations in the output
- REST/ACTIVE_RECOVERY messages are supportive and permissive, not prescriptive
- Overall message reads like something a coach would text, not a program document
- Agent is decisive: chooses options rather than presenting menus to the user
- Keeps only what someone needs to execute the session
- Prefers brevity over completeness of coaching detail
