## Admin Dashboard Prompt Management Checklist (Phase 1)

Use this checklist to deliver the MVP for "see & edit prompts" only.

### Pre-flight
- [ ] Ensure `.env.local` includes required vars (see `CLAUDE.md`)
- [ ] Add `ADMIN_SECRET` for gating UI and APIs
- [ ] Add feature flag `ADMIN_PROMPTS_ENABLED` to toggle DB resolution
- [ ] Verify scripts: `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm test`

## 1) Database Schema & Seed
- [ ] Create migration for minimal prompt tables
  - [ ] `agents` — id, slug (unique), name, description, enabled, timestamps
  - [ ] `prompts` — id, agentId (fk), key, variant (nullable), status (draft|published), currentRevisionId (fk|null), timestamps
  - [ ] `prompt_revisions` — id, promptId (fk), content (text), metadata (jsonb), createdBy, createdAt, publishedAt (nullable), publishedBy (nullable)
- [ ] Run migrations and regenerate types
  - [ ] `pnpm migrate:create`
  - [ ] `pnpm migrate:up`
  - [ ] `pnpm db:codegen`
- [ ] Seed `agents`
  - [ ] Detect agents from `src/server/agents/*` and add a `shared` pseudo-agent for `src/server/prompts/templates.ts`
  - [ ] Mark `enabled` appropriately
- [ ] Baseline capture of existing code prompts
  - [ ] Parse exports from:
    - [ ] `src/server/agents/chat/prompts.ts` → `chatPrompt`, `contextPrompt`, `motivationalPrompt`, `workoutReminderPrompt`
    - [ ] `src/server/agents/dailyWorkout/prompts.ts` → `dailyWorkoutPrompt`
    - [ ] `src/server/agents/microcyclePattern/prompts.ts` → `microcyclePatternPrompt`
    - [ ] `src/server/agents/fitnessPlan/prompts.ts` → `outlinePrompt`
    - [ ] `src/server/agents/dailyMessage/prompts.ts` → `dailyMessagePrompt`
    - [ ] `src/server/agents/welcomeMessage/prompts.ts` → `welcomePrompt`, `onboardingPrompt`, `programReadyPrompt`, `firstWorkoutPrompt`
    - [ ] `src/server/agents/summary/prompts.ts` → `conversationSummaryPrompt`
    - [ ] `src/server/prompts/templates.ts` → `fitnessCoachPrompt`
  - [ ] Insert initial published revisions for each function above

## 2) Repository Layer (Kysely)
- [ ] `src/server/repositories/agentRepository.ts`
  - [ ] `listAgents()` / `getAgentBySlug(slug)` / `insertOrUpdateAgent(...)`
- [ ] `src/server/repositories/promptRepository.ts`
  - [ ] `listPrompts(agentId)` / `getPromptById(id)` / `createDraft(...)`
  - [ ] `updateDraft(promptId, { content, metadata })` / `publishRevision(promptId)`
  - [ ] `listRevisions(promptId)` / `rollbackToRevision(promptId, revisionId)`

## 3) Services & Utilities
- [ ] `src/server/services/admin/promptAdminService.ts`
  - [ ] `listPrompts(agentSlug)`
  - [ ] `createDraft(agentSlug, key, { variant?, content, metadata })`
  - [ ] `updateDraft(promptId, { content, metadata })`
  - [ ] `publishRevision(promptId)`
  - [ ] `getHistory(promptId)` / `rollback(promptId, revisionId)`
- [ ] `src/server/utils/resolveAgentPrompt.ts`
  - [ ] `resolveAgentPrompt(agentSlug, key, inputs)` (DB-first; fallback to code function)
  - [ ] Strict mustache-like rendering + placeholder validation
  - [ ] Feature flag: respect `ADMIN_PROMPTS_ENABLED`

## 4) API Endpoints (Prompt CRUD)
- [ ] Protected under `/api/agents/*` with `ADMIN_SECRET` or session-role gate
- [ ] `GET /api/agents` — agents + prompt key summaries
- [ ] `GET /api/agents/:agent/prompts` — list prompts and latest revision metadata
- [ ] `POST /api/agents/:agent/prompts` — create draft `{ key, variant?, content, metadata? }`
- [ ] `PUT /api/agents/:agent/prompts/:promptId` — update draft
- [ ] `POST /api/agents/:agent/prompts/:promptId/publish` — publish
- [ ] `GET /api/agents/:agent/prompts/:promptId/revisions` — list revisions
- [ ] `POST /api/agents/:agent/prompts/:promptId/rollback` — rollback

## 5) Admin UI (Next.js App Router)
- [ ] `/admin` route with protected layout
- [ ] `Agents` page
  - [ ] List agents and prompt keys
  - [ ] Agent detail view: `PromptEditor` + `PromptHistoryDiff`
- [ ] Components
  - [ ] `PromptEditor` (monospace, lint; render placeholder warnings)
  - [ ] `PromptHistoryDiff`

## 6) Chain Integration (Optional in Phase 1)
- [ ] Update one chain (e.g., `chat`) to use `resolveAgentPrompt` when `ADMIN_PROMPTS_ENABLED=true`
- [ ] Verify fallback works when DB has no published prompt

## 7) Security & QA
- [ ] Gate `/admin` and `/api/agents/*`
- [ ] CSRF for writes
- [ ] `pnpm lint` / `pnpm build` / `pnpm test` green

## Definition of Done (Phase 1)
- [ ] Admin UI lists agents and allows prompt draft/edit/publish/rollback
- [ ] Prompts are versioned in DB; code fallback works
- [ ] Optional: one chain can resolve from DB behind the feature flag
