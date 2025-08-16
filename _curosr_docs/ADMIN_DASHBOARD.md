# Admin Dashboard: Prompt Management MVP (GymText)

This document narrows Phase 1 to a minimal, high-impact scope: enable admins to see and edit LLM prompts used by agents. Broader admin capabilities (model config, test runners, system ops) move to later phases.

## Goals (Phase 1 Only)
- Centralize prompt management in the database, editable via admin UI and REST API
- Version prompts with draft/publish workflow and history
- Keep agents working immediately by falling back to code-defined prompts when no DB prompt is published

## In-Scope
- Admin web UI route at `src/app/admin` (pages/components for prompt viewing and editing)
- REST endpoints under `/api/agents/*` for listing agents and CRUD on prompts
- Repository/service layer for prompts and prompt revisions
- DB migrations for `agents`, `prompts`, `prompt_revisions`
- Feature-flagged prompt resolution utility with fallback to existing code templates

## Out of Scope (defer to Phase 2+)
- Agent runtime model/config management
- End-to-end flow testers, SMS tools, cron simulators
- Audit log, RBAC/SSO, rate limits

---

## A. Agents and Prompt Keys (current code)
Prompts live primarily under `src/server/agents/**/prompts.ts`. There is also a shared template in `src/server/prompts/templates.ts`.

Agent slugs map to folder names. Prompt keys should match the exported function names below to simplify fallback and seeding.

- `chat` (`src/server/agents/chat/prompts.ts`)
  - `chatPrompt`
  - `contextPrompt`
  - `motivationalPrompt`
  - `workoutReminderPrompt`
- `dailyWorkout` (`src/server/agents/dailyWorkout/prompts.ts`)
  - `dailyWorkoutPrompt`
- `microcyclePattern` (`src/server/agents/microcyclePattern/prompts.ts`)
  - `microcyclePatternPrompt`
- `fitnessPlan` (`src/server/agents/fitnessPlan/prompts.ts`)
  - `outlinePrompt`
- `dailyMessage` (`src/server/agents/dailyMessage/prompts.ts`)
  - `dailyMessagePrompt`
- `welcomeMessage` (`src/server/agents/welcomeMessage/prompts.ts`)
  - `welcomePrompt`
  - `onboardingPrompt`
  - `programReadyPrompt`
  - `firstWorkoutPrompt`
- `summary` (`src/server/agents/summary/prompts.ts`)
  - `conversationSummaryPrompt`
- `shared` (`src/server/prompts/templates.ts`)
  - `fitnessCoachPrompt`

Use these as the canonical `key` values in the DB. Variants are optional (e.g., `default`, `short_sms`).

---

## B. Prompt Resolution (runtime)
Introduce a shared resolver with DB-first, code-fallback behavior:

- `src/server/utils/resolveAgentPrompt.ts`
  - `resolveAgentPrompt(agentSlug, key, inputs)` → string
  - Looks up a published DB prompt for `{ agentSlug, key, variant? }`
  - Renders the template with a strict, mustache-like engine and input validation
  - If no active DB prompt, calls the code function (e.g., `chatPrompt(...)`)
  - Gate enablement via an env flag (e.g., `ADMIN_PROMPTS_ENABLED=true`)

Chains in `src/server/agents/**/chain.ts` can be migrated incrementally to call the resolver. When the feature flag is off, behavior remains unchanged.

---

## C. Data Model (Migrations)
Minimal tables for prompt management and versioning:

- `agents`
  - `id` (pk), `slug` (unique), `name`, `description`, `enabled` (bool), timestamps
- `prompts`
  - `id` (pk), `agentId` (fk), `key` (text), `variant` (text|null), `status` (`draft`|`published`), `currentRevisionId` (fk|null), timestamps
- `prompt_revisions`
  - `id` (pk), `promptId` (fk), `content` (text), `metadata` (jsonb), `createdBy`, `createdAt`, `publishedAt` (nullable), `publishedBy` (nullable)

Phase 2+: `audit_logs`, rate limits, RBAC.

---

## D. Backend Interfaces
- Repository layer (Kysely)
  - `agentRepository`: `listAgents()`, `getAgentBySlug(slug)`, `insertOrUpdateAgent(...)`
  - `promptRepository`: `listPrompts(agentId)`, `getPromptById(id)`, `createDraft(...)`, `updateDraft(...)`, `publishRevision(...)`, `listRevisions(...)`, `rollbackToRevision(...)`
- Services
  - `src/server/services/admin/promptAdminService.ts` (name avoids collision with existing `src/server/services/promptService.ts`)
    - `listPrompts(agentSlug)`
    - `createDraft(agentSlug, key, { variant?, content, metadata })`
    - `updateDraft(promptId, { content, metadata })`
    - `publishRevision(promptId)`
    - `getHistory(promptId)` / `rollback(promptId, revisionId)`
- Utilities
  - `resolveAgentPrompt` + strict template rendering and placeholder validation

---

## E. API Endpoints
All under `/api/agents` for clarity. Protect with an env-gated header (`ADMIN_SECRET`) or session role.

- `GET /api/agents` → list agents + prompt key summaries
- `GET /api/agents/:agent/prompts` → list prompts with current status and latest revision metadata
- `POST /api/agents/:agent/prompts` → create draft `{ key, variant?, content, metadata? }`
- `PUT /api/agents/:agent/prompts/:promptId` → update draft content/metadata
- `POST /api/agents/:agent/prompts/:promptId/publish` → publish current draft to new revision
- `GET /api/agents/:agent/prompts/:promptId/revisions` → list revisions
- `POST /api/agents/:agent/prompts/:promptId/rollback` → rollback to a prior revision

---

## F. Admin UI (MVP)
- Pages
  - `Admin Home`: quick links; environment banner; access guard
  - `Agents`: list agents and their prompt keys; agent detail with prompt editor and history
- Components
  - `PromptEditor` (monospace, syntax highlight, lint)
  - `PromptHistoryDiff`
  - Minimal table/listing components
- Wiring
  - Client components call server actions → admin endpoints

---

## G. Security & Access
- Restrict `/admin` routes and `/api/agents/*` with an env-based admin gate (`ADMIN_SECRET`) or session role
- All writes are POST/PUT with CSRF protection
- Optional IP allowlist in middleware (Phase 2)

---

## H. Migration & Seed Plan
1) Create tables (`agents`, `prompts`, `prompt_revisions`)
2) Seed `agents` from folders in `src/server/agents/*` (+ a `shared` pseudo-agent for `templates.ts`)
3) Capture current code prompts as initial published revisions (baseline), one row per function listed in section A
4) Implement repositories and `promptAdminService`
5) Add `/api/agents` prompt endpoints
6) Add `resolveAgentPrompt` and optionally migrate one chain behind a feature flag
7) Build minimal Admin UI pages for listing/editing prompts

---

## Definition of Done (Phase 1)
- `/admin` shows agents and their prompts; prompts can be drafted, edited, published, and rolled back
- DB-backed prompt resolution available behind a feature flag with safe fallback to code templates
- Green `pnpm build`, `pnpm lint`, and tests; public APIs unchanged
