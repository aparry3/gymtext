## Onboarding Chat – Implementation Plan & Checklist

This checklist tracks delivery of the hero-to-fullscreen onboarding chat at `/chat`, reusing `userProfileAgent`, `chatAgent`, and `profilePatchTool`, with a draft profile session and merge-on-signup.

### Phase 0 – Planning & Reuse Confirmation
- [x] Confirm reuse of `userProfileAgent` (`src/server/agents/profile/chain.ts`) and `profilePatchTool` (`src/server/agents/tools/profilePatchTool.ts`) for patching
  - Decision: Reuse as-is; no new patch logic. `ProfilePatchService` remains the single writer.
- [x] Confirm reuse of `chatAgent` (`src/server/agents/chat/chain.ts`) for responses
  - Decision: Reuse with an onboarding-specific system prompt added in a later phase.
- [x] Decide streaming transport for web (`SSE` vs `WebSocket`) → target: SSE
  - Decision: Use Server-Sent Events (SSE) for simplicity and broad support.
- [x] Decide draft profile storage (Redis, DB table, or encrypted cookie) and retention policy
  - Decision: Start with a temporary signed cookie `gt_temp_session` storing a UUID, with server-side session data to come in Phase 4. Retention: 7 days. No Redis required initially.

### Phase 1 – API Route (Streaming)
- [x] Create `src/app/api/chat/onboarding/route.ts` (POST)
  - [x] Accept `{ message, conversationId?, tempSessionId? }`
  - [x] Establish SSE stream (or fetch streaming) response
  - [x] Resolve auth (`userId`) or ensure `tempSessionId` cookie exists
  - [x] Load base profile (user or session-projected)
    - Note: Phase 1 returns a placeholder projected profile (null). Real projection added in Phase 2/4.
  - [x] Stream events: `token`, `profile_patch`, `milestone`, `error`

### Phase 2 – Service Orchestration
- [x] Create `src/server/services/onboardingChatService.ts`
  - [x] Orchestrate: run profile extraction first (authed only in Phase 2), then chat reply
  - [x] Essentials milestone detection (name, email, phone, primaryGoal/fitnessGoal)
  - [x] Build context: `{ tempSessionId | userId, currentProfile, pendingRequiredFields }`
  - [x] Emit structured events for streaming
  - [x] Share helpers when possible; full interception lands in Phase 4

### Phase 3 – Agent Prompting
- [x] Add onboarding system prompt builder (minimal new code)
  - [x] `src/server/agents/onboardingChat/prompts.ts`
  - [x] Emphasize one-question-at-a-time onboarding and essentials-first
  - [x] Nudge confirmations for name/phone/email and summaries

### Phase 4 – Interception Mode (Unauth Draft Profile)
- [x] Update `userProfileAgent` to accept `mode?: 'apply' | 'intercept'` (default `apply`)
  - [x] When `mode === 'intercept'` or `!userId`, return tool-call intents (no DB writes)
  - [x] Preserve current SMS behavior (apply mode)
- [x] Add session projection utilities: `src/server/utils/session/onboardingSession.ts`
  - [x] Store `pendingPatches[]` per `tempSessionId`
  - [x] Compute `projectedProfile` = reduce(pendingPatches) over base
  - [ ] Merge and clear on signup (Phase 7)

### Phase 5 – Validation & Dedupe (Server-side)
- [ ] Email validation (RFC-compliant)
- [ ] Phone normalization (E.164) and verification step (optional)
- [ ] Dedupe checks via `UserRepository` for email/phone
- [ ] Surface validation outcomes as `profile_patch` events with `applied: false` when invalid

### Phase 6 – Frontend (Hero → Fullscreen Chat)
- [ ] Page: `src/app/chat/page.tsx` with hero input (placeholder: "What are your fitness goals?")
  - [ ] Expand-to-fullscreen on type/submit, maintain scrollable landing content below
  - [ ] Client components in `src/components/pages/chat/`
  - [ ] `ChatContainer`: SSE connection, message state, pending patches, profile projection
  - [ ] `MessageList`: streaming tokens, timestamps, typing indicator
  - [ ] `Composer`: input, send, disabled state
  - [ ] `ProfileSummaryPanel`: live `projectedProfile`, completeness
  - [ ] `SignupCTA`: visible on essentials complete; prefill handoff
  - [ ] Minimal placeholder to land the route (pending)

### Phase 7 – Signup Handoff & Merge-on-Signup
- [ ] Prefill essentials to signup via server session or secure query
- [ ] On signup completion, merge all pending patches via `ProfilePatchService.patchProfile` (source: `onboarding-web`)
- [ ] Set `name`/`email`/`phoneNumber` on user; clear session patches
- [ ] Rehydrate chat with real `userId`

### Phase 8 – Telemetry & Analytics
- [ ] Instrument funnel: `chat_opened`, `message_sent`, `patch_detected`, `essentials_complete`, `cta_clicked`, `signup_started`, `signup_completed`
- [ ] Log `fieldsUpdated` summary (no raw PII)
- [ ] Dashboards/alerts for error rates and drop-offs

### Phase 9 – Testing (Vitest)
- [ ] Unit tests
  - [ ] `OnboardingChatService` orchestration and milestones
  - [ ] Interception mode in `userProfileAgent`
  - [ ] Session projection & merge utilities
  - [ ] Validation helpers (email/phone)
- [ ] Integration tests
  - [ ] Streaming API emits `token`, `profile_patch`, and `milestone`
  - [ ] Session patches → signup → merged patch applied
  - [ ] Authenticated flow applies immediately via `profilePatchTool`
- [ ] UI tests
  - [ ] Hero→fullscreen, streaming render, CTA visibility, error states

### Phase 10 – Rollout
- [ ] Feature flag gating for `/chat` onboarding
- [ ] Internal testing (dogfooding) with staff accounts
- [ ] Gradual ramp-up; monitor metrics
- [ ] Remove flag once stable

### Non-Goals / Defer
- [ ] Voice input and attachments
- [ ] WebSocket transport (unless SSE is insufficient)
- [ ] Advanced goal inference tools beyond current agent

### Risk & Mitigations
- **Session growth**: cap patches and compress/merge periodically; prefer server store over cookies if size grows
- **Validation UX**: keep assistant guidance friendly; inline corrections
- **Duplication**: reuse existing agents/tools/services; avoid new patch logic

### Acceptance Criteria (cross-check)
- [ ] Hero at `/chat` with minimal textbox and fullscreen expansion
- [ ] Streaming chat with live profile summary and `profilePatchTool` reuse
- [ ] Essentials captured unlocks CTA; signup prefilled
- [ ] Draft profile maintained for unauth; merged on signup; authed applies immediately
- [ ] Tests pass; build/lint clean; analytics in place
