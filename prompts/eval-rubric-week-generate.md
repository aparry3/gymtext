# Week:Generate — Evaluation Rubric

Evaluate the **week:generate** output across these dimensions (score each 1–10). Weights must sum to **1.0**.

---

## 1. Global Format Compliance (Weight: 0.20)

- **Score 10:** Perfect compliance with required week dossier structure and ordering  
- **Score 8–9:** Correct overall format with 1–2 minor issues (e.g., extra blank line, minor header inconsistency)  
- **Score 5–7:** Mostly correct but missing/incorrect major section elements (e.g., missing Weekly Summary or Schedule)  
- **Score 3–4:** Major structural issues (e.g., missing header, schedule not present, multiple days not fenced)  
- **Score 0–2:** Fundamentally broken format (cannot be reliably parsed)

**What to evaluate:**
- Header present with: `# Microcycle — Week of [YYYY-MM-DD]`, `**Program:**`, `**User:**`
- `## Schedule` present and lists all days for the week
- `### This Week` present with short plain-language bullets
- Every day included and wrapped in correct fence delimiters:
  - Open: `=== DAYNAME - Month DD, YYYY: Type ===`
  - Close: `=== END DAYNAME ===`
- `## Weekly Summary (Plan)` present at end

---

## 2. Day Fence & Day Header Correctness (Weight: 0.20)

- **Score 10:** All days correctly fenced, day names/dates consistent, type labels sensible  
- **Score 8–9:** One minor mismatch (e.g., capitalization, small date formatting inconsistency) but still parseable  
- **Score 5–7:** Several inconsistencies (e.g., wrong day name, missing type on one day) but most days usable  
- **Score 3–4:** Multiple broken fences or missing day headers; parsing unreliable  
- **Score 0–2:** Days not fenced or repeated/omitted in ways that break the week structure

**What to evaluate:**
- Each day has both fence lines + an internal `# DAYNAME - Month DD, YYYY: [Type]` heading
- Dates and day-of-week align across Schedule and day blocks
- No extra “day-like” content outside fences

---

## 3. Executability & Completeness (Weight: 0.25)

- **Score 10:** Every day is immediately executable with no follow-up questions; includes all key parameters  
- **Score 8–9:** Very usable; minor missing detail in 1–2 spots (e.g., rest on one lift, intensity cue slightly vague)  
- **Score 5–7:** Some days are under-specified or require interpretation (e.g., “do a tempo run” with no structure)  
- **Score 3–4:** Many days unclear or missing core prescription information  
- **Score 0–2:** Not executable; unclear, contradictory, or largely placeholders

**What to evaluate:**
- Each day answers (explicitly or via simple rules):
  - What am I doing?
  - How much/how long?
  - How hard?
  - How to adjust today if needed?
- Uses numbers where they matter (sets/reps/time/distance/load/rest), OR provides a simple selection rule when unknown
- Includes necessary safety/constraint guidance **only** if supported by inputs

---

## 4. Simplicity, Clarity, and Low Jargon (Weight: 0.15)

- **Score 10:** Simple, plain-language instructions; minimal technical jargon; easy to scan  
- **Score 8–9:** Mostly plain language; a few technical terms appear but don’t hurt clarity  
- **Score 5–7:** Overly technical in places; jargon adds confusion or feels trainer-to-trainer  
- **Score 3–4:** Consistently jargon-heavy; requires prior training knowledge to understand  
- **Score 0–2:** Dense, technical, or theory-heavy to the point of being unusable for most users

**What to evaluate:**
- Avoids phase/progression jargon (e.g., “hypertrophy,” “deload,” “mesocycle,” “microcycle,” “intensification”)
- Progression guidance (if included) is short and concrete (e.g., “add a little weight if last week felt comfortable”)
- Avoids unnecessary systems (RPE/Zones) unless clearly beneficial for this user/context

---

## 5. Activity-Appropriate Structure (Not Overfit) (Weight: 0.10)

- **Score 10:** Day structures match the activity; blocks/sections used only when helpful; not forced into one template  
- **Score 8–9:** Generally matched; occasional unnecessary sectioning but still clear  
- **Score 5–7:** Over-templates days (e.g., forces warm-up/main/cool-down even when not needed) or uses awkward structure  
- **Score 3–4:** Structure repeatedly mismatches the activity (confusing or irrelevant blocks)  
- **Score 0–2:** Rigid template dominates; content feels misfit or incoherent for the activities

**What to evaluate:**
- LLM chooses an appropriate structure per day (simple days remain simple; complex days have enough structure)
- No forced lifting/running-centric assumptions when the plan implies other modalities
- Uses headings/blocks only when they improve understanding

---

## 6. No Hallucinated Results / Input Fidelity (Weight: 0.10)

- **Score 10:** No invented outcomes, “how it felt,” “reported” feedback, injury status, or times; strictly plan-only  
- **Score 8–9:** One small “sounds like / felt like” style slip but not substantial  
- **Score 5–7:** Multiple invented post-session notes or implied outcomes  
- **Score 3–4:** Frequent hallucinations; confuses plan vs. results throughout  
- **Score 0–2:** Output heavily fabricated and cannot be trusted as a plan document

**What to evaluate:**
- Notes are either plan rationale (why) or blank post-session placeholders
- No claims about completion, soreness, pain, PRs, or actual performance unless explicitly provided in inputs
- No “monitor X pain” unless the profile/inputs specify it as a constraint

---

## Scoring instructions

- Score each dimension **1–10**
- Multiply each score by its weight
- Sum weighted scores to get an overall rubric score (**1.0–10.0** scale)
