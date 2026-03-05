Evaluate the output across these dimensions:

1. Day Type Format Compliance (Weight: 0.25)
- Score 10: Perfect format compliance for the day type
- Score 8-9: Correct day type but minor format issues (e.g., extra blank line, inconsistent capitalization)
- Score 5-7: Mostly correct but includes wrong headers (e.g., TRAINING day with "Cooldown:" header)
- Score 3-4: Wrong day type classification or major format violations
- Score 0-2: Fundamentally broken format (e.g., REST day formatted as a workout)

What to evaluate:
- TRAINING days: Must include "Warm-Up:" and "Workout:" sections, NO "Cooldown:" header
- REST days: No sections, supportive message, optional light activities
- ACTIVE_RECOVERY days: NO section headers, 1-2 bullets max, permissive language

2. Brevity & Scannability (Weight: 0.20)
- Score 10: Perfectly concise, SMS-friendly, instantly scannable
- Score 8-9: Brief with only minor unnecessary details
- Score 5-7: Includes some fluff but still usable (e.g., warm-up sets listed in detail)
- Score 3-4: Verbose with coaching paragraphs or excessive detail
- Score 0-2: Unreadable, massive blocks of text, not SMS-appropriate

What to evaluate:
- Message is concise and scannable on a phone screen
- Removes warm-up details, rest times, RPE/RIR, tempo, technique cues (unless critical to safety)
- No coaching paragraphs or verbose explanations
- Each exercise on its own line (never stacked)

3. Content Accuracy (Weight: 0.25)
- Score 10: All essential info preserved with perfect accuracy
- Score 8-9: Minor omissions (e.g., missing optional accessory exercise)
- Score 5-7: Notable omissions or notation errors (e.g., wrong sets/reps on a main lift)
- Score 3-4: Missing key exercises or major inaccuracies
- Score 0-2: Completely wrong workout or nonsensical output

What to evaluate:
- All essential exercises are present
- Sets, reps, and weights are correct
- Supersets and circuits are labeled properly (SS1, SS2, C1, C2)
- Core work and conditioning are summarized appropriately (not omitted entirely)
- Injury modifications are preserved (e.g., goblet squat instead of barbell squat)

4. Notation & Formatting (Weight: 0.20)
- Score 10: Flawless formatting, perfect notation consistency
- Score 8-9: One or two minor formatting issues (e.g., missing space after bullet)
- Score 5-7: Multiple formatting errors but still readable
- Score 3-4: Inconsistent bullets, stacked exercises, messy structure
- Score 0-2: Completely broken formatting (e.g., no bullets, no line breaks)

What to evaluate:
- All bullets start with "- " (not "*", not numbered)
- Abbreviations are consistent (BB = barbell, DB = dumbbell, BW = bodyweight)
- Sets/reps notation is proper: "4x5", "3x8-10", "2x12/side"
- Focus line (if present) is 2-6 words, no label
- Exactly one blank line after focus line
- No extra text before/after workout

5. Tone & Coaching Quality (Weight: 0.10)
- Score 10: Perfect coaching tone, concise and actionable notes
- Score 8-9: Good notes with minor verbosity or missing context
- Score 5-7: Too chatty or missing key coaching points
- Score 3-4: Overly verbose coaching paragraphs or no useful notes
- Score 0-2: Inappropriate tone (e.g., overly casual, condescending) or nonsensical notes

What to evaluate:
- Notes section is 1-3 sentences (not a paragraph)
- Coaching points are actionable and specific
- Tone is supportive but direct (coach-like, not cheerleader-like)
- Week context provided when appropriate (e.g., "Week 3 — last hard week before deload")
- Injury monitoring cues are included when relevant (e.g., "Knee check — should be pain-free")