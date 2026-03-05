Evaluate the output across these dimensions:

1. Completeness (Weight: 0.30)
- Score 10: Every relevant detail captured, nothing omitted
- Score 8-9: Minor omissions (e.g., secondary preference not mentioned)
- Score 5-7: Notable missing information (e.g., forgot to add new constraint to CONSTRAINTS section)
- Score 3-4: Major omissions (e.g., missing entire METRICS section for a strength athlete)
- Score 0-2: Fundamentally incomplete or nonsensical output

What to evaluate:
- All relevant information from the input is captured in the appropriate section
- No missing metrics, constraints, preferences, or goal details
- Training context includes schedule, equipment, and constraints
- LOG includes all historical context

2. Accuracy (Weight: 0.25)
- Score 10: Perfect accuracy, all dates present, no hallucinations
- Score 8-9: One or two minor errors (e.g., date typo)
- Score 5-7: Missing dates on metrics or minor factual errors
- Score 3-4: Multiple inaccuracies or missing dates throughout
- Score 0-2: Fundamentally wrong information or massive hallucinations

What to evaluate:
- Metrics include dates (e.g., "Bench Press: 145 lb x 5 (2026-01-15)")
- Constraints marked as [ACTIVE] or [RESOLVED] with dates
- Experience level matches training history (Novice: <1yr, Intermediate: 1-3yr, Advanced: 3+yr)
- Information matches the input (no hallucinated details)
- LOG entries are dated and accurate

3. Structure & Organization (Weight: 0.20)
- Score 10: Perfect structure, follows format exactly
- Score 8-9: Minor formatting inconsistencies (e.g., inconsistent bullet style)
- Score 5-7: Missing sections or major formatting issues
- Score 3-4: Disorganized, hard to navigate
- Score 0-2: No discernible structure

What to evaluate:
- Follows the profile format: IDENTITY, GOALS, TRAINING CONTEXT, METRICS, LOG
- Uses proper markdown headers (## for major sections, ### for subsections)
- Bullet points are consistent and readable
- Sections are in logical order
- LOG entries use `## YYYY-MM-DD — Title` format

4. Personalization & Context (Weight: 0.15)
- Score 10: Perfectly personalized, clear adaptation to user type
- Score 8-9: Good personalization with minor generic elements
- Score 5-7: Some personalization but mostly generic
- Score 3-4: Minimal personalization, template-like
- Score 0-2: Completely generic, ignores user context

What to evaluate:
- Structure adapts to user type (powerlifter includes meet history, runner includes pace zones)
- Metrics prioritized by user focus (strength first for lifters, endurance first for runners)
- Experience level explanation includes context (e.g., "Intermediate — 2 years consistent training")
- Preferences and constraints reflect individual needs
- Goals include specifics (not generic like "get stronger")

5. Change Tracking (Weight: 0.10)
- Score 10: Perfect change tracking, all updates documented
- Score 8-9: Minor issues (e.g., vague LOG entry)
- Score 5-7: Missing LOG entry or inaccurate changes block
- Score 3-4: Multiple tracking issues (e.g., updated metrics but no LOG entry)
- Score 0-2: No change tracking or completely wrong changes block

What to evaluate:
- `changes` metadata block is present and accurate
- If profile was updated, "changed": true with descriptive summary
- If no changes needed, "changed": false with explanation
- LOG entries document all updates with dates
- Constraints are marked [ACTIVE] or [RESOLVED] with dates