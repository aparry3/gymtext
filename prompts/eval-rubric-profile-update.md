Score each dimension 0–10 and compute weighted total.

Gating rules (automatic caps):
- If the output contains ANY questions, requests for more info, “if you provide…”, or conversational offers: cap total at 6/10.
- If it contains recommendations/advice (training guidance, “recommend”, “should”, “next steps”, programming suggestions): cap total at 6/10.
- If it invents/assumes details (equipment, session lengths, injuries, metrics) not in input: cap total at 5/10.

1) Dossier Compliance & Non-Conversational Tone (Weight 0.30)
10: Pure dossier record. No questions, no advice, no offers. Neutral, factual language.
8–9: Minor tone drift but still no questions/advice.
5–7: Slightly conversational (e.g., “monitor this”) or mild implied suggestions.
3–4: Multiple conversational elements.
0–2: Primarily chatty/coaching; not a dossier.

2) Completeness of Captured Facts (Weight 0.25)
10: All relevant input facts captured in the correct sections; nothing important omitted.
8–9: Minor omission (e.g., one preference not recorded).
5–7: Notable omissions (e.g., missed a key metric or constraint).
3–4: Major missing sections or multiple missed facts.
0–2: Fundamentally incomplete.

3) Accuracy & Non-Hallucination (Weight 0.25)
10: No hallucinations; correct labels (reported vs tested), correct dates, correct units.
8–9: One minor error (typo, minor mislabel).
5–7: Multiple minor inaccuracies or missing “as of” dates.
3–4: Significant inaccuracies.
0–2: Major hallucinations or incorrect core facts.

4) Structure & Formatting Fidelity (Weight 0.10)
10: Exactly follows required headings/order; consistent bullets; readable.
8–9: Minor formatting inconsistency.
5–7: Missing headings/subsections or inconsistent structure.
3–4: Disorganized.
0–2: Not in the specified format.

5) Change Tracking Quality (Weight 0.10)
10: Changes block matches actual updates; LOG entry added when changed; reverse chronological; preserves history.
8–9: Slight mismatch in summary or slightly vague log.
5–7: Missing/incorrect LOG entry or inaccurate changes block.
3–4: Multiple tracking issues.
0–2: No change tracking.

Scoring notes:
- “Not provided” is correct when info is absent.
- Recording “standard assumptions” is incorrect unless explicitly provided.
