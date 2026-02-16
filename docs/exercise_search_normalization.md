# Exercise Search & Normalization System

## Purpose

This document describes the **canonical exercise resolution system** used for:

1. **Human-facing search** (UI search, autocomplete)
2. **LLM-generated workout normalization** (agent → canonical exercise IDs)

The goal is to robustly match exercise strings that may contain:
- Misspellings (`dumbell` → `dumbbell`)
- Morphological variants (`laying` → `lying`, `curls` → `curl`)
- Word order changes (`leg curl lying` vs `lying leg curl`)
- Abbreviations (`rdl`, `db bench`)
- Formatting differences (`situp`, `sit-up`, `sit up`)

while producing:
- A **stable canonical exercise ID**
- A **confidence score**
- A clear indication when **manual review or disambiguation** is required

---

## Core Principles

1. **Lexical correctness > semantic similarity**  
   (Vectors are helpful but should not override obvious lexical intent.)

2. **Normalization must be deterministic and explainable**

3. **Ambiguity is safer than silent misclassification**

4. **The system should learn over time**

---

## Data Model Enhancements

### Existing
- `exercise`
- `exercise_alias`
  - `alias`
  - `alias_searchable` (lowercase, alphanumeric only)

### New Columns

#### `alias_lex`
A lightly normalized, token-based representation used for typo and morphology tolerance.

**Generation rules:**
- lowercase
- remove accents (optional)
- tokenize on whitespace
- remove stopwords (`with`, `and`, `the`, etc.)
- singularize basic plurals (`curls` → `curl`)
- apply domain synonym map (see below)
- optionally sort tokens (order invariant)
- rejoin with spaces

**Examples:**

| Original Alias | alias_lex |
|---------------|-----------|
| `Laying Leg Curls` | `curl leg lying` |
| `Dumbell Bench Press` | `bench press dumbbell` |
| `3/4 Sit-Up` | `sit up` |

---

#### (Optional) `alias_phon`
A phonetic representation (e.g., Double Metaphone) used to catch sound-alike misspellings.

Useful for:
- `dumbell` ↔ `dumbbell`
- `presss` ↔ `press`

> If phonetic extensions are unavailable, **pg_trgm alone is sufficient**.

---

## Domain Synonym Map (High-ROI, Small)

This is **not** for every misspelling — only **systematic equivalences**.

Apply during `alias_lex` generation **and query preprocessing**.

### Recommended Initial Map

```ts
{
  laying: "lying",
  dumbell: "dumbbell",
  pullup: "pull up",
  situp: "sit up",
  rdl: "romanian deadlift",
  db: "dumbbell",
  bb: "barbell"
}
```

> Start small. Expand only when patterns repeat.

---

## Indexing Strategy (Postgres)

Enable:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Indexes:
```sql
CREATE INDEX ON exercise_alias USING gin (alias_searchable gin_trgm_ops);
CREATE INDEX ON exercise_alias USING gin (alias_lex gin_trgm_ops);
```

(Optional phonetic index if supported.)

---

## Resolver Pipeline (Ordered)

### Phase 1: Candidate Generation (Wide Net)
Generate up to ~50 candidates using:
1. Exact match on `alias_searchable`
2. Exact match on `alias_lex`
3. Trigram similarity on `alias_searchable`
4. Trigram similarity on `alias_lex`
5. (Optional) phonetic match
6. (Optional) vector similarity

---

### Phase 2: Candidate Re-Ranking (Deterministic)

Each candidate receives weighted scores:

| Signal | Description |
|------|------------|
| `s_exact_norm` | Exact `alias_searchable` match |
| `s_exact_lex` | Exact `alias_lex` match |
| `s_trgm_norm` | Trigram similarity (raw string) |
| `s_trgm_lex` | Trigram similarity (token-normalized) |
| `s_token_overlap` | Jaccard similarity of token sets |
| `s_vector` | Semantic similarity (tie-breaker only) |

#### Example Weighting

```text
final_score =
  3.0 * s_exact_norm +
  2.0 * s_exact_lex +
  1.5 * s_trgm_lex +
  1.0 * s_trgm_norm +
  1.0 * s_token_overlap +
  0.5 * s_vector
```

Lexical correctness dominates. Vectors never “win alone”.

---

## Acceptance & Confidence Rules

### Auto-Accept
- Exact `alias_searchable` OR `alias_lex`
- OR:
  - `top_score ≥ 0.75`
  - AND `top_score - second_score ≥ 0.10`

### Needs Review
- Low absolute score
- Small margin between top candidates
- Candidates span different movement families / equipment

---

## Resolver Output Contract

```json
{
  "input": "laying leg curls",
  "canonical_exercise_id": "ex_lying_leg_curl",
  "confidence": 0.92,
  "method": "exact_lex",
  "top_candidates": [
    { "id": "ex_lying_leg_curl", "score": 0.92 },
    { "id": "ex_seated_leg_curl", "score": 0.63 }
  ]
}
```

**Never silently normalize when confidence is low.**

---

## LLM Workout Normalization Flow

1. LLM generates workout JSON (unnormalized exercise strings)
2. Each exercise string passes through resolver
3. Resolver returns:
   - canonical ID
   - confidence
4. If `confidence < threshold`:
   - trigger second LLM pass **or**
   - flag for admin / user review

---

## Learning & Alias Expansion

Log every resolution attempt:
- raw input
- selected canonical ID
- confidence
- top candidates
- downstream acceptance or correction

### Automatic Improvements
- Repeated low-confidence → propose new alias
- Repeated synonym pattern → promote to synonym map
- Confirmed human edits → add alias automatically

This avoids hand-curation and improves agent accuracy over time.

---

## Why This Solves Current Issues

### “Laying Leg Curls” vs “Lying Leg Curl”
- Synonym map normalizes `laying → lying`
- Plural singularization
- Token overlap + exact `alias_lex` match
- Correct result ranks first

### “dumbell bench press”
- Trigram similarity catches missing letter
- Optional synonym promotes to exact `alias_lex`
- No need to manually add misspelling aliases

---

## Summary

This system provides:
- Robust typo tolerance
- Deterministic normalization
- Safe handling of ambiguity
- Shared logic for humans **and** agents
- A feedback loop that improves over time

**Lexical first. Semantic last. Confidence always.**

