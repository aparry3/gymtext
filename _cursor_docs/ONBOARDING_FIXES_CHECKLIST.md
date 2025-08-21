## Onboarding Fixes — Implementation Checklist

Reference: `ONBOARDING_FIXES.md`

### 1) Prompt rewrite (onboarding) ✅
- [x] Replace per-field confirmations with final single summary
- [x] Allow batching 2–3 essentials when natural (name, email, phone)
- [x] Keep tone human and concise (< ~120 words)
- [x] Include pending essentials + concise profile summary in system prompt
- [x] Add tests asserting: no "confirm your …" language; summary guidance present

### 2) Session state expansion (`src/server/utils/session/onboardingSession.ts`)
- [ ] Add `draft: { user: Partial<{ name; email; phoneNumber }>, profile: Partial<FitnessProfile> }`
- [ ] Add `messages: Array<{ role: 'user'|'assistant'; content: string; ts: number }>`
- [ ] Keep rolling history (e.g., last 5–10 messages) helper: `appendMessage`
- [ ] Extend `projectProfile` to merge `draft.profile` + `pendingPatches`
- [ ] Add `projectUser(baseUser, sessionId)` for unauth projections
- [ ] Helpers: `getOrInitSession`, `applyInterceptedUserDraft`, `clearPendingPatches`
- [ ] Unit tests for projection, rolling buffer, and merge precedence

### 3) User info patch tool (`src/server/agents/tools/userInfoPatchTool.ts`)
- [ ] Zod schema `{ updates: { name?, email?, phoneNumber? }, reason, confidence }`
- [ ] Confidence threshold = 0.5 (align with profile tool)
- [ ] Authed: `UserRepository.update(userId, { name, email, phoneNumber })`
- [ ] Unauth: write to session `draft.user`; do not hit DB
- [ ] Return shape consistent with `profilePatchTool` (applied, fieldsUpdated, reason, confidence)
- [ ] Unit tests for apply vs intercept; validation (email/phoneNumber)

### 4) Bind tools in `userProfileAgent`
- [ ] Bind both `profilePatchTool` and `userInfoPatchTool`
- [ ] Support `mode: 'apply' | 'intercept'` for both tools
- [ ] In intercept mode, return field lists for both user and profile updates
- [ ] Update result typing or surface a combined update summary
- [ ] Unit tests for multi-intent extraction (user + profile in one message)

### 5) Orchestration updates (`src/server/services/onboardingChatService.ts`)
- [ ] Load session via `gt_temp_session` for unauth flows
- [ ] Authed: run profile+user extraction in `apply` mode; update `currentProfile` and (optionally) reload user
- [ ] Unauth: run in `intercept` mode; write to `pendingPatches` (profile) and `draft.user`
- [ ] Compute pending essentials from projected (unauth) or DB (auth): `name`, `email`, `phoneNumber`, `primaryGoal`
- [ ] Use rewritten onboarding system prompt; pass pending essentials + brief profile summary
- [ ] Maintain short rolling `conversationHistory` from session `messages`
- [ ] Emit `milestone: 'essentials_complete'` when first satisfied
- [ ] Trigger a single-summary response once essentials complete; emit `milestone: 'summary'`
- [ ] Stream tokens as before
- [ ] Unit tests for essentials computation (auth/unauth), milestone transitions

### 6) Schema and naming alignment
- [ ] Standardize on `phoneNumber` in user schemas/types; keep `phone` as optional alias only where necessary
- [ ] Update `src/server/models/user/schemas.ts` to include `phoneNumber` (and/or adapter)
- [ ] Remove ad-hoc `phone` vs `phoneNumber` checks from service in favor of normalization helper
- [ ] Migration not required if DB already uses `phoneNumber` (verify)

### 7) Client integration (`src/components/pages/chat/ChatContainer.tsx`)
- [ ] Handle SSE `milestone: 'summary'` to style/anchor the final essentials summary
- [ ] Persist a lightweight copy of session draft to `localStorage` for resume (optional; server remains canonical)
- [ ] Ensure `gt_temp_session` cookie is preserved across requests
- [ ] Manual test: batched essentials, summary appears once

### 8) Telemetry and tagging
- [ ] Tag profile patches from onboarding with `source: 'onboarding-web'` via `ProfilePatchService`
- [ ] Tag user updates similarly (`path`/`source` metadata on tool results)
- [ ] Avoid logging raw PII (mask email/phone in logs)

### 9) Tests
- [ ] Unit: onboarding prompt builder expectations
- [ ] Unit: session utils (projection, buffering, merging)
- [ ] Unit: `userInfoPatchTool` (apply/intercept, gating)
- [ ] Unit: essentials validation and normalization (email/phoneNumber)
- [ ] Integration (unauth): multi-field answer captured, no DB writes, `summary` milestone emitted
- [ ] Integration (auth): user+profile updates applied; essentials complete; summary emitted once
- [ ] Integration: low-confidence inputs do not update; invalid email/phone → polite re-ask in next turn

### 10) Rollout
- [ ] Feature flag for onboarding chat behavior (toggle new prompt + session draft)
- [ ] Fallback: disable new flow to restore previous single-question behavior if needed
- [ ] Monitor logs/errors; capture sample transcripts (sanitized) for QA

### 11) Docs
- [ ] Update `CLAUDE.md` onboarding sections to reflect new session and tooling
- [ ] Add brief dev note on `userInfoPatchTool` and session draft handling

### Definition of Done
- [ ] New onboarding flow asks batched essentials naturally; no per-field confirmations
- [ ] Single friendly summary produced once essentials complete
- [ ] Unauth sessions persist draft user+profile; auth applies to DB
- [ ] Both `User` and `FitnessProfile` updates are supported via tools
- [ ] Tests passing: `pnpm test` (unit + integration)
- [ ] Lint/build clean: `pnpm lint`, `pnpm build`
