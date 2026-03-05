Score each dimension 0–10. Use weights to compute weighted total.

GATING / CAPS:
- If the output asks questions or includes “assumptions/next steps/notes to user”: cap total at 6/10.
- If it outputs week-by-week calendars, spreadsheets, or long exercise menus without necessity: cap total at 7/10.
- If technical jargon is used heavily AND the profile does not justify it (beginner/average user): cap total at 7/10.

1) Personal Fit & Constraint Respect (Weight 0.38)
10: Clearly built for THIS user; availability, equipment, preferences, and constraints are integrated into schedule + guardrails.
8–9: Strong fit; one small mismatch.
5–7: Generally sensible but somewhat generic.
3–4: Major mismatch (wrong frequency, ignores constraints).
0–2: Inappropriate or unsafe.

2) Weekly Schedule Quality (Weight 0.22)
10: Each day has a distinct purpose tied to goals; recovery/rest is placed well; interference is managed when relevant.
8–9: Solid; one day slightly vague.
5–7: Template-like; day purposes blur.
3–4: Disorganized or redundant.
0–2: No meaningful structure.

3) Communication Fit (Plain vs Technical) (Weight 0.18)
10: Language matches the user. Plain language for average users; technical language only when it helps and is explained.
8–9: Mostly aligned; minor jargon creep.
5–7: Too technical for the likely user OR overly simplified for an advanced user.
3–4: Hard to follow; “programming speak” dominates.
0–2: Inaccessible.

4) Right Level of Specificity (Weight 0.10)
10: Program-level intent + ranges; avoids weekly-plan prescriptions; uses specificity only when essential.
8–9: One minor drift into specifics.
5–7: Frequent drift into prescriptions.
3–4: Overly prescriptive or unhelpfully vague.
0–2: Outputs a full weekly plan/spreadsheet.

5) Markdown Hierarchy & Scan-ability (Weight 0.07)
10: Exact required section order; clean headings; consistent day formatting; easy to scan quickly.
8–9: Minor formatting inconsistency.
5–7: Cluttered; key info doesn’t pop.
3–4: Hard to scan; missing headings.
0–2: Noncompliant.

6) “How this changes over time” Quality (Weight 0.05)
10: Short, simple, and appropriately framed (e.g., “Before your race / After your race” when relevant). No unnecessary “Phase 1/2” labeling. Practical expectations.
8–9: Good but slightly wordy or missing one key point.
5–7: Vague or slightly too technical.
3–4: Overcomplicated (phase/deload-heavy) for a normal user, or uses “Phase 1/2” when “Before/After” would be clearer.
0–2: Missing or confusing.

SCORING NOTES:
- If the plan has an event date and uses “Phase 1/2” instead of a clearer frame (“Before the event / After the event”) without a good reason: -2 in Dimension 6.
- If the plan uses technical terms, it must define them once in plain language; otherwise -2 in Dimension 3.