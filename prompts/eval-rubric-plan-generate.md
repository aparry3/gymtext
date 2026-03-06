Score each dimension 0–10. Use weights to compute weighted total.

GATING / CAPS:
- If the output asks questions or includes “assumptions/next steps/notes to user”: cap total at 6/10.
- If it outputs week-by-week calendars, spreadsheets, or long exercise menus without necessity: cap total at 7/10.
- If technical jargon is used heavily AND the profile does not justify it: cap total at 7/10.

1) Personal Fit & Constraint Respect (Weight 0.35)
10: Tailored to THIS user; availability, equipment, preferences, and constraints are integrated into schedule + guardrails.
8–9: Strong fit; one minor mismatch.
5–7: Somewhat generic but still reasonable.
3–4: Major mismatch or ignores constraints.
0–2: Inappropriate or unsafe.

2) Weekly Schedule Quality (Weight 0.22)
10: Each day has a distinct purpose tied to goals; recovery/rest is sensible; interference is managed when relevant.
8–9: Solid; one day slightly vague.
5–7: Template-like; day purposes blur.
3–4: Disorganized or redundant.
0–2: No meaningful structure.

3) Communication Fit (Plain vs Technical) (Weight 0.15)
10: Language matches the user; plain by default; technical only when helpful and explained.
8–9: Mostly aligned; minor jargon creep.
5–7: Too technical for a typical user OR overly simplified for an advanced user.
3–4: Hard to follow; programming-speak dominates.
0–2: Inaccessible.

4) Right Level of Specificity (Weight 0.10)
10: Program-level intent + ranges; avoids weekly-plan prescriptions; specificity only when essential.
8–9: One minor drift into specifics.
5–7: Frequent drift into prescriptions.
3–4: Overly prescriptive or unhelpfully vague.
0–2: Outputs a full weekly plan/spreadsheet.

5) Markdown Structure & Visual Hierarchy (Weight 0.18)
10: Perfectly formatted per spec; instantly scannable.
8–9: Minor formatting issues but still very readable.
5–7: Usable but inconsistent or cluttered.
3–4: Hard to scan; missing required structure.
0–2: Noncompliant.

Markdown compliance checklist for Dimension 5:
- H1 is program name (not “Program Dossier”)  ✅ required
- Meta list directly under H1 with bold labels and required order ✅ required
- H2 sections present and in exact order ✅ required
- Each day is H3 and uses the four bullet labels in order ✅ required
Penalties:
- Missing/incorrect H1: -4 (and cap Dimension 5 at 5)
- Meta not directly under H1 or missing required fields/order: -2
- Any missing/misordered H2 section: -2 each
- Any day missing a required bullet label: -1 per day

6) “How this changes over time” Quality (Weight 0.00)
Folded into Dimensions 3 and 5. (Still evaluate informally: it should be short, plain, and framed as Before/After or First/Later unless advanced user warrants phases.)