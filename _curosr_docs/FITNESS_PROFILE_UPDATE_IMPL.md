### Fitness Profile Update — Implementation Plan

Reference: `_curosr_docs/FITNESS_PROFILE_UPDATES.md`

### Goals
- **Unify profile writes**: All user-info updates flow through a single patch/ops API with a ledger.
- **Agent adoption**: Onboarding and SMS chat agents emit structured profile updates (patch/ops) alongside natural-language replies.
- **Deterministic context**: Downstream agents consume `{ facts, prose }` built deterministically from the canonical JSON profile.
- **Low risk rollout**: Ship behind flags, add observability, keep latency and token costs in check.

### Current state (codebase)
- Agents
  - `src/server/agents/onboarding/chain.ts` streams text replies only; prompt lacks structured update guidance.
  - `src/server/agents/chat/chain.ts` handles conversational replies; no profile update extraction.
  - `src/server/agents/welcomeMessage/chain.ts` generates welcome text only.
- Context
  - `src/server/services/context/fitnessProfileContext.ts` returns a template substring from the `UserWithProfile`; not the deterministic `{ facts, prose }` model.
- Data/Repos
  - No `fitnessProfiles.profile` JSON or `profile_updates` ledger implemented yet; current `fitnessProfiles` has scalar columns (e.g., `fitnessGoals`, `skillLevel`).

### Target architecture (high level)
- **Canonical profile**: `fitness_profiles.profile JSONB` stores the full `FitnessProfile` (see reference schema). Existing scalar columns remain for now; mirror critical fields from JSON for compatibility.
- **Ledger**: `profile_updates(user_id, patch JSONB, path TEXT NULL, source TEXT, reason TEXT NULL, created_at)` records every mutation.
- **Merge-patch semantics**: Default writes are deep-merge patches; array-heavy/temporal updates expressed as domain ops and converted server-side to deterministic patches.
- **Context service**: Deterministic `{ facts, prose }` builder with optional polish+validator.

### Data model and migrations
- Phase 1 (additive, safe):
  - Add `profile JSONB NULL` to `fitnessProfiles`.
  - Create `profile_updates` table.
  - Backfill `profile` from existing columns when present (simple mapper).
  - Write path: start writing to `profile` + ledger; keep existing columns in sync for reads.
- Phase 2 (consolidation):
  - Read from `profile` for downstream agents/context.
  - Optionally add minimal generated columns (e.g., `primary_goal`, `experience_level`) when needed.
  - De-emphasize legacy scalar fields (do not remove yet).

### Repositories (new)
- `src/server/repositories/fitnessProfileRepository.ts`
  - `getByUserId(userId)` → `{ profile, updatedAt }`
  - `applyProfilePatch(userId, patch, meta)` → deep-merge into `profile`, update `fitnessProfiles.profile`, append ledger entry, return snapshot.
  - `applyOp(userId, op, meta)` → convert domain op → patch (per reference), then `applyProfilePatch`.
- `src/server/repositories/profileUpdateRepository.ts`
  - `append(userId, patch, path, source, reason)`
  - `listByUserId(userId, { limit })`

### Services (new/updated)
- `src/server/services/profileUpdateService.ts`
  - Thin orchestration over repos; exposes `applyPatch`, `applyOp` with validation and OpenTelemetry spans.
- `src/server/services/context/fitnessProfileContext.ts` (replace implementation)
  - `getContext()` → builds `{ facts, prose }` deterministically from JSON `profile`; optional `polish` with validator fallback.

### Agent changes
- Onboarding agent: `src/server/agents/onboarding/prompts.ts`
  - Update system prompt to support structured output with natural reply.
  - Expected model output (json-first, strict):
    ```json
    {
      "reply": "text to send to user",
      "profileUpdate": {
        "type": "mergePatch",
        "patch": { "primaryGoal": "recomp", "availability": { "daysPerWeek": 5 } }
      }
    }
    ```
    - Alternative op form for arrays/temporal data:
    ```json
    {
      "reply": "…",
      "profileUpdate": {
        "type": "op",
        "op": { "kind": "add_constraint", "constraint": { "type": "injury", "label": "Tweaked shoulder", "startDate": "2025-08-10" } }
      }
    }
    ```
  - Chain changes (`onboarding/chain.ts`): parse JSON; if `profileUpdate` present → call `profileUpdateService.applyPatch|applyOp`; always return `reply` for SMS/UI.
- SMS handler agent (chat): `src/server/agents/chat/chain.ts`
  - Incorporate the same structured-output block into its system prompt, enabling in-conversation updates.
  - After LLM response, attempt JSON parse; if `profileUpdate` present → apply via service, then persist assistant message.
  - Keep reply text concise for SMS; respect `SMS_MAX_LENGTH` handling already tested elsewhere.
- Welcome message agent: no write; ensure it reads new `{ facts, prose }` context via updated `FitnessProfileContext` when available.

### Prompt guidelines (both agents)
- Add explicit rules from reference doc:
  - Prefer merge patches for simple scalar/nested object updates.
  - Use domain ops for arrays/temporal (`constraints` add/update/resolve) and let server convert to patches.
  - Never invent facts; only update when the user states or confirms them.
  - Output strictly-valid JSON as the first block; include a `reply` string under 150 words for SMS.

### API/Routes
- If/when an inbound SMS webhook route exists, ensure it forwards messages to chat/onboarding handling and executes `profileUpdateService` on structured updates before sending the reply.
- Internal endpoints (future):
  - `POST /profiles/:id/ops` (service-backed) for admin or tool integrations.
  - `GET /profiles/:id/context` to return `{ facts, prose }` for UI/testing.

### Observability
- Add spans: profile fetch, context build, polish, agent call, patch/ops apply, ledger append.
- Log validator outcomes (polish pass/fail), token in/out, update type (patch vs op), and source (`onboarding`, `sms`, `admin`).

### Testing
- Unit
  - Context builder: deterministic bullets preserve numbers/units/dates; polish validator fallback.
  - Op conversion: add/update/resolve constraint round-trips and array stability.
  - Repo applyPatch: deep-merge semantics (arrays replaced only when intended), ledger append.
- Integration
  - Onboarding flow: agent emits patch; service applies; context reflects change; reply returned.
  - SMS chat: user reports injury via SMS; agent emits `add_constraint` op; service applies; subsequent prompts include constraint in context.
- E2E (mock Twilio): ensure no latency regressions; respect SMS length.

### Rollout plan
- Feature flag: `PROFILE_UPDATES_FROM_AGENTS` initially enabled for onboarding only; then enable for chat cohort.
- Backfill task: map existing scalar columns → JSON `profile` for all users.
- Shadow mode (optional): parse/record updates to ledger without mutating `profile` for 1–2 days; compare diffs, then enable writes.

### Risks & mitigations
- JSON parse errors → catch, log, skip update, still reply; consider retry heuristics.
- Array replacement bugs → domain ops for arrays; unit tests; code reviews.
- Prompt drift → add schema examples and few-shot; monitor invalid JSON rate and iterate.
- Data divergence between legacy columns and JSON → nightly reconciliation, eventually read exclusively from JSON.

### Concrete changes (files)
- Migrations
  - `migrations/xxxx_add_profile_json_and_updates_ledger.ts`
- Repositories
  - `src/server/repositories/fitnessProfileRepository.ts`
  - `src/server/repositories/profileUpdateRepository.ts`
- Services
  - `src/server/services/profileUpdateService.ts`
  - `src/server/services/context/fitnessProfileContext.ts` (replace logic to build `{ facts, prose }`)
- Agents
  - `src/server/agents/onboarding/prompts.ts` (structured output + rules)
  - `src/server/agents/onboarding/chain.ts` (parse + apply update + return reply)
  - `src/server/agents/chat/prompts.ts` (structured output + rules)
  - `src/server/agents/chat/chain.ts` (parse + apply update + persist reply)
  - `src/server/agents/index.ts` (ensure exports if needed)
- Optional
  - `src/server/app/api/profiles/[id]/context` and `/ops` endpoints for internal use.

### Acceptance criteria
- Agents emit and apply profile updates via the patch/ops pathway with a ledger.
- Deterministic context `{ facts, prose }` powers welcome/daily/workout prompts.
- All tests pass; new unit + integration coverage for update flows.
- Telemetry in place; SMS P95 < 2s maintained; token budget tracked.
