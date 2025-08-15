# Admin Dashboard Requirements (GymText)

This document outlines the requirements to implement an internal Admin Dashboard for GymText to manage LLM prompts/config, test workflows, and operate core system tasks without code changes.

## Goals
- **Centralize prompt management**: Store all agent prompts in the database, editable via the admin UI and REST API.
- **Configurable agent behavior**: Define per-agent context, model settings, and runtime config in the DB.
- **Test and operate flows**: Run end-to-end actions (create user, generate plan, send/test messages, cron sims) from the UI.
- **Auditability and safety**: Version prompts/config, track changes, publish/draft flows, and safely roll back.

## Scope (Phase 1)
- Admin web UI (Next.js App Router route at `src/app/admin`)
- Backend REST endpoints under `/api/admin/*` (or `/api/agents` for agent prompt/config)
- Services/repositories to load, version, and apply prompts
- DB migrations to store prompts, agent config, and revisions
- Basic role-gated access (feature flag or env-protected)
- Minimal read-only dashboards for system health

## Out of Scope (Phase 1)
- Full RBAC/SSO
- Realtime collaboration
- Complex analytics

---

## A. Prompt and Agent Configuration Management

### Functional Requirements
- **List agents**: Display all agents found in `src/server/agents/*` (e.g., `chat`, `generateFitnessPlan`, `dailyWorkout`, `microcyclePattern`, `dailyMessage`, `welcomeMessage`, `summary`).
- **Prompt sources**:
  - Primary: Database-stored prompts (authoritative once enabled per agent)
  - Fallback: Code-defined prompt builders in `src/server/agents/**/prompts.ts` when DB has no published prompt
- **CRUD**:
  - Create new prompt draft(s) per agent and prompt type (e.g., `chatPrompt`, `dailyMessagePrompt`, etc.)
  - Edit drafts in a rich textarea with preview
  - Validate placeholders/variables (e.g., `${user.name}`, `${fitnessProfile}`) and provide a reference schema for each agent
  - Save as **Draft** or **Publish** (publish creates a new revision and marks it active)
  - View revision history and diff between revisions
  - Roll back to a prior revision
- **Prompt variants**:
  - Optional named variants per agent (e.g., `default`, `short_sms`, `strict_json`)
  - Attach metadata: description, owner, tags
- **Agent runtime config** (per agent):
  - Model: `gemini-2.0-flash` / OpenAI, temperature, max output tokens
  - Context flags: include user profile, include workout history, message limit, etc. (mirrors usage in `ConversationContextService` and `FitnessProfileContext`)
  - Output format: free text vs. structured schema (e.g., `FitnessPlanModel`)
  - Safety settings: max daily calls, rate limits (Phase 2)

### Non-Functional Requirements
- **Versioning**: Immutable revision rows with `createdBy`, `createdAt`, `publishedAt`, `publishedBy`.
- **Audit log**: Actions (create/edit/publish/rollback) captured with actor and reason.
- **Validation**: Lint prompts for common issues (unbalanced braces, missing placeholders).

### Data Model (Migrations)
- `agents`:
  - `id` (pk), `slug` (unique), `name`, `description`, `enabled` (bool)
- `agent_configs`:
  - `id` (pk), `agentId` (fk), `modelProvider` (`gemini` | `openai`), `modelName`, `temperature` (float), `maxOutputTokens` (int), `contextFlags` (jsonb), `outputSchema` (jsonb|null), `isActive` (bool), timestamps
- `prompts`:
  - `id` (pk), `agentId` (fk), `key` (e.g., `chatPrompt`, `dailyMessagePrompt`, `outlinePrompt`, `microcyclePatternPrompt`, `dailyWorkoutPrompt`), `variant` (nullable), `status` (`draft`|`published`), `currentRevisionId` (fk, nullable), timestamps
- `prompt_revisions`:
  - `id` (pk), `promptId` (fk), `content` (text), `metadata` (jsonb), `createdBy`, `createdAt`, `publishedAt` (nullable), `publishedBy` (nullable)
- `audit_logs` (Phase 2):
  - `id`, `entityType`, `entityId`, `action`, `actor`, `data` (jsonb), timestamps

### Backend Interfaces
- Service: `AgentConfigService`
  - `getAgentList()`
  - `getConfig(agentSlug)` / `updateConfig(agentSlug, payload)`
  - `resolvePrompt(agentSlug, key, { variant?, context? })` → returns active content
- Service: `PromptService`
  - `listPrompts(agentSlug)`
  - `createDraft(agentSlug, key, { variant?, content, metadata })`
  - `updateDraft(promptId, { content, metadata })`
  - `publishRevision(promptId)`
  - `getHistory(promptId)` / `rollback(promptId, revisionId)`
- Repository layer for above tables using Kysely

### API Endpoints (Phase 1)
- `GET /api/agents` → list agents + active config summary + prompt keys/variants
- `GET /api/agents/:agent` → agent details, active config, prompts with statuses
- `GET /api/agents/:agent/prompts` → list prompts and active revision summaries
- `POST /api/agents/:agent/prompts` → create draft { key, variant?, content, metadata? }
- `PUT /api/agents/:agent/prompts/:promptId` → update draft content/metadata
- `POST /api/agents/:agent/prompts/:promptId/publish` → publish current draft
- `GET /api/agents/:agent/prompts/:promptId/revisions` → list revisions
- `POST /api/agents/:agent/prompts/:promptId/rollback` → rollback to revision
- `GET /api/agents/:agent/config` → get config
- `PUT /api/agents/:agent/config` → update config (validate/sanitize)

Note: Auth gating for `/api/admin/*` or `/api/agents/*` via env-secret header or session check.

### Prompt Resolution in Agents (Design Note)
- Maintain backward compatibility: if no published DB prompt, use current code prompt builders (`prompts.ts`).
- Introduce a shared util: `resolveAgentPrompt(agentSlug, key, inputs)`:
  - fetch active DB prompt by `{agentSlug, key, variant?}`
  - render with a simple template engine (e.g., mustache-like with strict mode) using inputs we already pass in chains
  - else fallback to code prompt function
- Long-term: migrate chains in `src/server/agents/**/chain.ts` to call `resolveAgentPrompt`.

---

## B. Prompt Testing and Operational Tools (Admin UI)

### Functional Requirements
- **Ad-hoc prompt test** (per agent & key):
  - Form to provide inputs: user id, conversation id, message, programType, microcycle week, example workout JSON, etc.
  - Choose model and temperature (override active config for the run)
  - Preview final rendered prompt before send
  - Execute and display raw model output and any structured parse result
  - Save test case for reuse; compare outputs across revisions
- **Flow runners** (move script logic into UI):
  - Create test user (calls existing checkout endpoint used in `scripts/utils/users.ts`)
  - Update profile
  - Generate fitness plan (`fitnessPlanAgent`) and persist
  - Generate daily microcycle/week and a daily workout
  - Send test SMS (mirror `scripts/test/messages/sms.ts` request to `/api/sms` and parse TwiML)
  - Cron simulator for daily messages (mirror `scripts/archive/test-cron-daily-messages.ts` against `/api/cron/daily-messages` with `testMode`, `dryRun`, hour/date)
- **History & comparison**:
  - Persist test runs with inputs, prompt revision, model params, outputs
  - Side-by-side compare outputs from two runs/revisions

### Non-Functional
- **Safety**: Mark endpoints/actions as TEST by default; explicit toggle required to send live messages.
- **Rate limits**: Guardrails for bulk ops.

### Backend Endpoints for Testing
- `POST /api/agents/:agent/test` → run one prompt with inputs and temporary params
- `POST /api/test/users` → create user (wrapping current public flow in a safe admin path)
- `POST /api/test/sms` → hit local `/api/sms` with provided message/phone (no Twilio auth)
- `GET /api/test/cron/daily-messages` → proxy to existing cron endpoint with `testMode` & `dryRun`
- `POST /api/test/fitness-plan` → generate plan for a user and return result (no write, optional write flag)

---

## C. Admin UI (Phase 1 MVP)

### Pages
- `Admin Home`: Quick links, environment banner, guardrails
- `Agents`:
  - List agents, active model/temp, prompt keys and statuses
  - Agent detail: edit config; manage prompts (draft/publish/history); test runner
- `Testing`:
  - SMS tester (phone/message)
  - Cron simulator (hour/date/users)
  - User utilities (create, update profile, delete test user)

### UI Specs
- Use existing Next.js/Tailwind stack in `src/app/admin/*`.
- Client components for editors and runners; server actions call admin endpoints.
- Use monospaced editor with syntax highlight and linting for prompt text.

---

## D. Security & Access
- Restrict access to admin UI and APIs:
  - Basic gate: env-based admin secret header or session role check
  - Optionally IP allowlist in middleware
- All write actions require CSRF protection and are POST/PUT only
- Audit trail for writes (Phase 2)

---

## E. Integration with Existing Architecture
- Keep repositories/services pattern; create `src/server/repositories/promptRepository.ts` and `src/server/services/admin/promptService.ts` & `agentConfigService.ts`.
- Chains (`chatChain`, `fitnessPlanAgent`, `dailyMessageAgent`, `dailyWorkout`, `microcyclePattern`) should be able to call `resolveAgentPrompt`.
- No breaking changes to public APIs; admin endpoints under `/api/admin` or `/api/agents`.

---

## F. Migration Plan
1. Create tables (`agents`, `agent_configs`, `prompts`, `prompt_revisions`).
2. Seed `agents` from `src/server/agents/index.ts` and known slugs.
3. Capture current code prompts as initial published revisions (for audit baseline).
4. Implement repositories and services.
5. Add `/api/agents` endpoints.
6. Update chains to optionally load DB prompts via `resolveAgentPrompt` (feature-flagged).
7. Build Admin UI pages.

---

## G. Phase 2+ (Future)
- Full RBAC and multi-admin workflows
- Experiments/A-B testing across prompt variants
- Live production toggles & rollout strategy
- Prompt lint rules, unit tests per prompt
- Analytics for model cost and performance
- Export/import prompts as JSON
