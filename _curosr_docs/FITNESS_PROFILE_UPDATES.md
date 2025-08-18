# AIContext & Profile Updates — Source of Truth

**Purpose.** Define the canonical approach for:

* Constructing deterministic AIContext from the JSON profile.
* Optional LLM polish/compress pass with strict guardrails.
* Handling profile updates via merge patches + domain operations with a ledger.
* API surfaces, examples, validation, telemetry, and tests.

**Non‑goals.** Workout generation logic, analytics schemas, or long‑term data warehousing.

**Decisions.**

* One canonical JSON profile (+ minimal generated columns).
* Deterministic bullets for AIContext + compact `facts` JSON; both sent to planners.
* Optional small‑model polish; never synthesize facts; strict post‑validation.
* Default writes are JSON merge patches; temporal/array entities use **domain ops** (server-converted to patches) and are recorded in a ledger.

---

## 1) Canonical Data Model

**Single source of truth**

* Table: `fitness_profiles(id, profile JSONB, created_at, updated_at, …)`
* Ledger: `profile_updates(id, user_id, patch JSONB, path TEXT NULL, source TEXT, reason TEXT NULL, created_at)`
* Generated columns (minimal): `primary_goal`, `experience_level`. Add others only when query hot paths emerge.

**Sections (scopes) inside JSON**

* `identity`, `goals`, `training`, `availability`, `equipment`, `preferences`, `metrics`, `constraints`, `nutrition`, `recovery`, `coaching`, `history`.

**When to split into child tables**

* Only for **high‑churn/time‑series** data (e.g., `metrics_timeseries`, `constraint_events`). The **latest snapshot** mirrors back into `profile.metrics` / `profile.constraints` for LLMs.

### Example: Profile JSON (trimmed)

```json
{
  "primaryGoal": "recomp",
  "specificObjective": "get shredded by Labor Day",
  "eventDate": "2025-09-01",
  "availability": { "daysPerWeek": 5, "minutesPerSession": 60 },
  "equipment": { "access": "Planet Fitness", "location": "near office" },
  "preferences": { "workoutStyle": "heavy with good rest", "dislikedExercises": ["burpees"] },
  "metrics": { "heightCm": 183, "bodyweight": { "value": 210, "unit": "lbs" } },
  "constraints": [
    { "id": "c1", "type": "injury", "label": "Tweaked shoulder doing overhead press",
      "severity": "moderate but improving", "affectedAreas": ["overhead"],
      "modifications": "No overhead work for 2 weeks, light bench only",
      "startDate": "2025-08-10", "status": "active" }
  ]
}
```

---

### Full FitnessProfile Schema (TypeScript)

> This is the canonical schema used by the platform. Fields marked optional may be omitted; unknown fields are allowed for forward compatibility. Keep this file as the single source of truth.

```ts
// Schema versioning
export type ISODate = string; // YYYY-MM-DD
export type UnitWeight = 'lbs' | 'kg';
export type ExperienceLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced';
export type PrimaryGoal = 'fat_loss' | 'muscle_gain' | 'recomp' | 'endurance' | 'strength' | 'mobility' | 'general_fitness';

export interface FitnessProfile {
  // ---- Identity / meta ----
  version?: number;              // schema/versioning (default 1)
  userId?: string;               // FK to users
  createdAt?: string;            // ISO timestamp
  updatedAt?: string;            // ISO timestamp

  // ---- Goals ----
  primaryGoal?: PrimaryGoal;     // e.g., 'recomp'
  specificObjective?: string;    // free text: "get shredded by Labor Day"
  eventDate?: ISODate;           // target event date, optional
  timelineWeeks?: number;        // derived or user-stated timeline
  experienceLevel?: ExperienceLevel; // self-reported training age

  // ---- Training status ----
  currentActivity?: string;      // short summary: "runs 10 mi/wk; lifts 3–4x"
  currentTraining?: {
    programName?: string;
    weeksCompleted?: number;
    focus?: string;              // e.g., "upper/lower split", "5x5"
    notes?: string;
  };

  // ---- Availability & access ----
  availability?: {
    daysPerWeek?: number;        // 0–7
    minutesPerSession?: number;  // 10–180
    preferredTimes?: Array<'morning' | 'midday' | 'evening' | 'varies'>

**Principle.** Deterministic → reproducible → cheap. Always pair prose with a compact `facts` object used for logic/tools. The planner receives `{ facts, prose }` and treats `facts` as ground truth.

**Format.** **5–8 labeled bullets** in fixed order. Each bullet: `LABEL: fact; fact; fact.` Short, unambiguous, numbers/units preserved.

**Order.**
1. GOAL
2. TRAINING STATUS
3. AVAILABILITY & ACCESS
4. CONSTRAINTS (ACTIVE)
5. PREFERENCES
6. METRICS
7. CONTEXT (optional)

**Style rules.**
- Use semicolons between facts; end each bullet with a period.
- Preserve dates & units verbatim (e.g., `210 lb`, `183 cm`, ISO dates `YYYY‑MM‑DD`).
- Omit empty sections (or emit `not specified` only in diagnostics).

### Example output (deterministic draft)
```

USER PROFILE (as of 2025-08-18)

* GOAL: get shredded by Labor Day; recomposition (muscle gain + fat loss); target date 2025-09-01.
* TRAINING STATUS: runs 10 mi/week; lifts 3–4x/week; alternating heavy and light weeks.
* AVAILABILITY & ACCESS: 5d/week; 45–60 min/session; gym: Planet Fitness near office.
* CONSTRAINTS (ACTIVE): Tweaked shoulder doing overhead press (start 2025-08-10); No overhead work for 2 weeks, light bench only.
* PREFERENCES: heavy with good rest; dislikes: burpees.
* METRICS: 183 cm; 210 lb; 95.3 kg.
* CONTEXT: wants visible abs by Labor Day; travels 1x/month.

````

### Reference TypeScript (constructor)
```ts
export type BuildOpts = { asOf?: string };

export function buildFacts(profile: any) {
  const kg = (lbs: number) => Math.round(lbs * 0.453592 * 10) / 10;
  const isLbs = profile?.metrics?.bodyweight?.unit?.toLowerCase() === 'lbs';
  const weightLbs = isLbs
    ? profile.metrics.bodyweight.value
    : Math.round(profile.metrics?.bodyweight?.value * 2.20462);
  const weightKg  = isLbs
    ? kg(profile.metrics.bodyweight.value)
    : profile.metrics?.bodyweight?.value;

  const activeConstraints = (profile.constraints || [])
    .filter((c: any) => c.status === 'active');

  return {
    goal: {
      primary: profile.primaryGoal,
      objective: profile.specificObjective,
      eventDate: profile.eventDate,
      timelineWeeks: profile.timelineWeeks,
    },
    training: {
      currentActivity: profile.currentActivity,
      weeksCompleted: profile.currentTraining?.weeksCompleted,
    },
    availability: {
      daysPerWeek: profile.availability?.daysPerWeek,
      minutesPerSession: profile.availability?.minutesPerSession,
      gym: profile.equipment?.access,
      location: profile.equipment?.location,
    },
    constraints: activeConstraints.map((c: any) => ({
      id: c.id,
      label: c.label,
      type: c.type,
      startDate: c.startDate,
      endDate: c.endDate,
      modifications: c.modifications,
      severity: c.severity,
    })),
    preferences: {
      style: profile.preferences?.workoutStyle,
      likes: profile.preferences?.enjoyedExercises,
      dislikes: profile.preferences?.dislikedExercises,
    },
    metrics: {
      heightCm: profile.heightCm ?? profile.metrics?.heightCm,
      weightLbs,
      weightKg,
      bodyFatPercent: profile.metrics?.bodyFatPercent,
    },
    context: {
      notes: profile.additionalContext?.whyStarted,
      motivators: profile.additionalContext?.motivators,
    },
  };
}

export function buildAIContext(profile: any, opts: BuildOpts = {}) {
  const asOf = opts.asOf || new Date().toISOString().slice(0, 10);
  const facts = buildFacts(profile);

  const bullets: string[] = [];
  const push = (s?: string) => s && bullets.push(s);

  // 1) GOAL
  push([
    'GOAL:',
    facts.goal?.primary,
    facts.goal?.objective,
    facts.goal?.eventDate && `target date ${facts.goal.eventDate}`,
  ].filter(Boolean).join(' '));

  // 2) TRAINING STATUS
  {
    const t: string[] = [];
    if (facts.training.currentActivity) t.push(facts.training.currentActivity);
    if (facts.training.weeksCompleted) t.push(`${facts.training.weeksCompleted} wks completed`);
    push(`TRAINING STATUS: ${t.join('; ') || 'not specified'}.`);
  }

  // 3) AVAILABILITY & ACCESS
  {
    const a: string[] = [];
    if (facts.availability.daysPerWeek) a.push(`${facts.availability.daysPerWeek}d/week`);
    if (facts.availability.minutesPerSession) a.push(`${facts.availability.minutesPerSession} min/session`);
    if (facts.availability.gym) a.push(`gym: ${facts.availability.gym}`);
    push(`AVAILABILITY & ACCESS: ${a.join('; ') || 'not specified'}.`);
  }

  // 4) CONSTRAINTS (ACTIVE)
  if (facts.constraints?.length) {
    const cs = facts.constraints.map((c: any) => `${c.label}${c.startDate ? ` (start ${c.startDate}${c.endDate ? ` → ${c.endDate}` : ''})` : ''}${c.modifications ? `; ${c.modifications}` : ''}`).join('; ');
    push(`CONSTRAINTS (ACTIVE): ${cs}.`);
  }

  // 5) PREFERENCES
  {
    const p: string[] = [];
    if (facts.preferences.style) p.push(facts.preferences.style);
    if (facts.preferences.likes?.length) p.push(`likes: ${facts.preferences.likes.slice(0, 3).join(', ')}`);
    if (facts.preferences.dislikes?.length) p.push(`dislikes: ${facts.preferences.dislikes.slice(0, 3).join(', ')}`);
    if (p.length) push(`PREFERENCES: ${p.join('; ')}.`);
  }

  // 6) METRICS
  {
    const m: string[] = [];
    if (profile.heightCm) m.push(`${Math.round(profile.heightCm)} cm`);
    if (facts.metrics.weightLbs) m.push(`${facts.metrics.weightLbs} lb`);
    if (facts.metrics.weightKg) m.push(`${facts.metrics.weightKg} kg`);
    if (facts.metrics.bodyFatPercent != null) m.push(`${facts.metrics.bodyFatPercent}% BF`);
    if (m.length) push(`METRICS: ${m.join('; ')}.`);
  }

  // 7) CONTEXT
  {
    const c: string[] = [];
    if (facts.context.notes) c.push(facts.context.notes);
    if (facts.context.motivators?.length) c.push(`motivators: ${facts.context.motivators.slice(0, 2).join(', ')}`);
    if (c.length) push(`CONTEXT: ${c.join('; ')}.`);
  }

  const header = `USER PROFILE (as of ${asOf})`;
  const prose = [header, ...bullets.map(b => `- ${b}`)].join('\n');
  return { facts, prose };
}
````

---

## 3) Optional LLM Polish/Compress

**Intent.** Tiny model rewrites deterministic bullets for tone/compression only. Never creates or alters facts. Budget ≤ 200 tokens.

**Flow.**

1. Build deterministic `{ facts, prose }`.
2. Call small model with guarded prompt.
3. Validate output (numbers/dates/units unchanged). If invalid → fallback to deterministic draft.

### Prompt (system + user)

```text
SYSTEM:
You are a copy editor for fitness profiles.
Rewrite the user's draft into 4–6 crisp bullets with the SAME facts.
Rules:
- Do NOT invent, remove, or change facts.
- Preserve ALL numbers, dates, units, and named entities EXACTLY.
- Keep ≤ {{MAX_TOKENS}} tokens. No emojis. No markdown headers.
- Output ONLY the bullet list. If any rule cannot be followed, output: UNCHANGED

USER:
FACTS_JSON (authoritative):
{{FACTS_JSON}}

DRAFT_BULLETS (deterministic):
{{DRAFT}}

Rewrite the draft for clarity and brevity, following the rules above.
Preserve every numeric token, unit, and date exactly as they appear in FACTS_JSON or DRAFT_BULLETS.
Return bullets only.
```

### Output validation (required)

Implement a validator that:

* Extracts numeric tokens, ISO dates, and unit-suffixed numbers from `facts + draft`.
* Asserts each appears unchanged in the model result.
* On any mismatch/omission: discard polished text; use deterministic draft.
* Log: model name, tokens in/out, validation pass/fail.

---

## 4) Updates Model

**Default:** JSON merge patches + deep-merge application; every write appended to `profile_updates` ledger with metadata (`who/what/when/source`, optional JSON Pointer `path`).

**Temporal / array-heavy:** Use **domain operations** to express intent safely (arrays are tricky to patch blindly). Server converts ops → deterministic patches, writes to ledger, returns new snapshot.

### Domain operation types (TypeScript)

```ts
type ConstraintId = string;

export type ProfileUpdateOp =
  | { kind: 'add_constraint'; constraint: Omit<any, 'id'|'status'> & { id?: ConstraintId; status?: 'active' }; effective_at?: string }
  | { kind: 'update_constraint'; id: ConstraintId; patch: Partial<any>; effective_at?: string }
  | { kind: 'resolve_constraint'; id: ConstraintId; endDate?: string; effective_at?: string }
  | { kind: 'set'; path: string; value: unknown; effective_at?: string }; // JSON Pointer set
```

### Server conversion (op → patch + ledger)

```ts
export async function applyOp(userId: string, op: ProfileUpdateOp, source: string, reason?: string) {
  const current = await getProfile(userId);
  let patch: any = {};

  if (op.kind === 'add_constraint') {
    const id = op.constraint.id ?? crypto.randomUUID();
    const newC = { status: 'active', ...op.constraint, id };
    patch = { constraints: [ ...(current.profile.constraints || []), newC ] };
  } else if (op.kind === 'update_constraint') {
    const next = (current.profile.constraints || [])
      .map((c: any) => c.id === op.id ? { ...c, ...op.patch } : c);
    patch = { constraints: next };
  } else if (op.kind === 'resolve_constraint') {
    const next = (current.profile.constraints || [])
      .map((c: any) => c.id === op.id ? { ...c, status: 'resolved', endDate: op.endDate ?? new Date().toISOString().slice(0,10) } : c);
    patch = { constraints: next };
  } else if (op.kind === 'set') {
    patch = setByJsonPointer(current.profile, op.path, op.value);
  }

  return applyProfilePatch(userId, patch, source, reason); // deep-merge + ledger append
}
```

### Expiry & materialization

* Nightly job resolves constraints whose `endDate < today`.
* `profile.constraints` always reflects the **current active** set for LLM consumption; history lives in the ledger (and optional `constraint_events`).

---

## 5) API Surfaces

**Context projection** (LLM reads)

* `GET /profiles/:id/context?sections=goals,constraints,availability&polish=true`

  * Response: `{ facts: {...}, prose: "..." }`

**Section-scoped updates** (human or tool writes)

* `PATCH /profiles/:id/constraints` → merge patch scoped to section
* `POST /profiles/:id/ops` → domain operations (recommended for constraints)

**Querying**

* Use only necessary generated columns initially; add more as hot paths appear.

---

## 6) Observability & Cost

**Targets.** SMS P95 < 2s; context tokens per send; <\$0.02/user/day.

**Practices.**

* Cache per‑section using content hashes; recompute only changed sections.
* Log polish token usage; auto-disable polish if cost/latency regress.
* OpenTelemetry spans for: profile fetch, context build, polish, planner call, patch write.

---

## 7) Validation & Testing

**Unit tests (≥80%)**

* Deterministic constructor preserves numbers/units/dates.
* Polish validator rejects mutated outputs and falls back to draft.
* Op application handles add/update/resolve correctly and keeps array stability.

**Property tests**

* Deep‑merge semantics: arrays not accidentally replaced/nuked.

**Redaction**

* No raw PII in logs; middleware masks names, emails, and phone numbers.

---

## 8) Security & Compliance

* Encrypt PII at rest (AES‑256) and in transit (TLS 1.3).
* Rotate API keys via Secret Manager; principle of least privilege on patch/ops endpoints.
* Full audit trail via ledger (who/what/when/source, diff materialized by server).

---

## 9) A/B Experiments

* Deterministic‑only vs. +polish: plan quality score, token cost/user/day, SMS latency.
* Warm‑start prompt variants for tone; run for ≥2 weeks; success = ≥+5% user rating, no latency regression.

---

## 10) Appendix

**A. `{ facts, prose }` payload example**

```json
{
  "facts": { "goal": {"primary": "recomp", "objective": "get shredded by Labor Day", "eventDate": "2025-09-01" }, "metrics": {"heightCm": 183, "weightLbs": 210, "weightKg": 95.3 } },
  "prose": "USER PROFILE (as of 2025-08-18)\n- GOAL: get shredded by Labor Day; recomposition (muscle gain + fat loss); target date 2025-09-01.\n- ..."
}
```

**B. Example op payloads**

```json
{ "kind": "add_constraint", "constraint": { "type": "injury", "label": "Tweaked shoulder doing overhead press", "severity": "moderate but improving", "affectedAreas": ["overhead"], "modifications": "No overhead work for 2 weeks, light bench only", "startDate": "2025-08-10" } }
```

```json
{ "kind": "update_constraint", "id": "c1", "patch": { "modifications": "Light overhead work with dumbbells only" } }
```

```json
{ "kind": "resolve_constraint", "id": "c1", "endDate": "2025-08-24" }
```

**C. JSON Pointer examples (`set` op)**

```json
{ "kind": "set", "path": "/availability/minutesPerSession", "value": 45 }
```

**D. LLM guardrails checklist**

* Facts JSON always accompanies prose to the planner.
* Polisher never runs without deterministic draft.
* Validator enforces numeric/date/unit preservation.
* Fallback path is deterministic draft; never block the planner.

---

## 11) Acceptance Criteria

* Single Markdown file, valid GitHub‑flavored Markdown.
* Includes sections above with headings, compact paragraphs, and code blocks.
* Code samples compile or are readily adaptable to TypeScript/Node 18.
* Deterministic bullet format and LLM prompts are copy‑paste ready.
* Clear guidance on when to use merge patches vs domain ops.
