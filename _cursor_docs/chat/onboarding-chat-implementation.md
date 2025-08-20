## Onboarding Chat – Implementation Breakdown

### Scope & Objectives
- Replace static form with a hero-to-fullscreen onboarding chat at `/chat`.
- Reuse existing agents/tooling to avoid duplication.
- Stream assistant replies; support tool calls that result in profile patches.
- Unlock “Continue signup” after capturing name, phone, email, and fitness goal.

### High-Level Architecture (Reuse First)
- Agents
  - Reuse `userProfileAgent` (`src/server/agents/profile/chain.ts`) for extracting updates and triggering profile patches via tool calls.
  - Reuse `chatAgent` (`src/server/agents/chat/chain.ts`) for conversational responses.
  - Add an onboarding-specific system prompt builder (no new agent): `buildOnboardingChatSystemPrompt` (co-locate with `src/server/agents/chat/prompts.ts` or in a small `onboardingChat/prompts.ts` module and export via `agents/index.ts`).
- Tooling
  - Reuse `profilePatchTool` (`src/server/agents/tools/profilePatchTool.ts`). It already validates (Zod), gates by confidence, and writes via `ProfilePatchService` → `UserRepository.patchProfile`.
  - No new LLM tools for email/phone validation; perform server-side checks.
- Services
  - Create `OnboardingChatService` mirroring `ChatService` orchestration but with onboarding milestones (essentials, CTA). Where possible, factor out shared orchestration helpers from `ChatService` to avoid duplication.
- API Route
  - New streaming endpoint `src/app/api/chat/onboarding/route.ts` using SSE or fetch streaming.
- Session Strategy (pre-signup)
  - Default: Intercept tool calls when no `userId` and store "pending profile patches" in a session bucket. Apply them once the user signs up.
  - Authenticated users: pass `userId` so `profilePatchTool` applies updates immediately.

### Data Flow
1. User types in hero input → client transitions to full-screen and sends first message to `/api/chat/onboarding`.
2. Server:
   - Builds context: `{ tempSessionId | userId, currentProfile, recentMessages, pendingRequiredFields }`.
   - Runs `userProfileAgent` for extraction/updates.
     - If `userId` present → tool executes `profilePatchTool` and returns updated profile.
     - If no `userId` → capture tool-call args (updates, reason, confidence) and store in session as "pending patches"; do not write DB yet.
   - Runs `chatAgent` with profile (updated or projected), onboarding prompt, and context.
   - Streams events back to client: tokens, profile_patch (applied or pending), milestones, errors.
3. Client renders streaming text; right panel shows live profile summary (including pending session patches). When essentials complete, show CTA.

### Streaming Protocol (SSE events)
- `token`: incremental assistant text chunks.
- `profile_patch`: `{ applied: boolean; updates; fieldsUpdated?; confidence; reason; }`.
- `milestone`: `essentials_complete | ask_next | summary`.
- `tool_call`/`tool_result`: optional debug/dev events.
- `error`: message.

### Backend Tasks
1. API Route: `src/app/api/chat/onboarding/route.ts`
   - Parse body: `{ message, conversationId?, tempSessionId? }`.
   - Establish SSE stream (or chunked fetch) response.
   - Resolve auth: `userId` if logged in; else ensure a `tempSessionId` cookie.
   - Load current profile: user → `UserRepository.findWithProfile`; session → compute from pending session patches.
   - Orchestration:
     - Invoke `userProfileAgent`. If `userId` missing, run in "interception mode" (see change below) and emit `profile_patch` (applied: false) + store patch to session.
     - Invoke `chatAgent` with onboarding system prompt; stream tokens.
   - Close stream.

2. Service Orchestration: `src/server/services/onboardingChatService.ts`
   - Share orchestration logic with `ChatService` where feasible (e.g., a utility method: runProfileThenChat(profileAgentConfig, chatConfig)).
   - Encapsulate essentials-complete detection and milestone emission.
   - Provide helpers to:
     - Merge session pending patches into a "projected profile" for the UI.
     - Compute `pendingRequiredFields` for prompt conditioning.

3. Agent Prompting
   - Implement `buildOnboardingChatSystemPrompt(profile, pendingRequiredFields)` that:
     - Encourages focused one-question-at-a-time onboarding.
     - Promotes collecting essentials first; then deeper profiling.
     - Acknowledges applied or pending updates succinctly.
   - Minimal edits to `userProfileAgent`:
     - Add optional `mode?: 'apply' | 'intercept'` (default 'apply').
     - If `mode === 'intercept'` or `!userId`, return the tool-call intents (updates, reason, confidence) without invoking `profilePatchTool`.
     - This preserves existing behavior for SMS while enabling session-first onboarding.

4. Session & Storage
   - Add a session store (`tempSessionId` cookie):
     - `pendingPatches[]`: array of `{ updates, reason, confidence, timestamp }`.
     - `projectedProfile`: computed on read as reduce(pendingPatches) over base profile.
   - On signup:
     - Create user; apply pending patches via `ProfilePatchService.patchProfile` in a single merged update, source: 'onboarding-web'.
     - Link conversation history (optional).

5. Validation & Dedupe
   - Email: RFC-compliant regex + `UserRepository` check for existing email.
   - Phone: E.164 normalization (optionally via Twilio lib if already configured) + dedupe by phone.
   - Surface validation results as `profile_patch` events with `applied: false` and an inline message if invalid.

6. Milestones & CTA
   - Essentials detection: `name`, `email`, `phone`, `primaryGoal`/`fitnessGoal` present and valid (or present in pending patches).
   - Emit `milestone: 'essentials_complete'` → client shows sticky "Continue signup".
   - Keep conversation flowing for deeper fields.

### Frontend Tasks
1. Route & Layout
   - `src/app/chat/page.tsx`: hero section with centered input (placeholder: “What are your fitness goals?”). Scrolling reveals landing content (benefits, testimonials, FAQ).
   - Expand-to-fullscreen on first keystroke or submit.

2. Client Components (`src/components/pages/chat/`)
   - `ChatContainer` (client): opens SSE connection, manages messages, pending patches, and profile projection.
   - `MessageList`: renders messages with streaming tokens.
   - `Composer`: input, send, disabled state during tool operations.
   - `ProfileSummaryPanel`: right-side collapsible panel showing live `projectedProfile` and completeness status.
   - `SignupCTA`: visible once essentials are complete; routes to signup with prefilled fields.

3. State & Streaming
   - Maintain local message list and a `projectedProfile` derived from base + pending patches.
   - Handle SSE events for `token`, `profile_patch`, `milestone`, `error`.
   - Smooth scroll to latest message; typing indicators.

4. Prefill & Handoff
   - On CTA click: navigate to signup; pass essentials via secure query or server-side session prefill.
   - After signup confirmation, rehydrate chat with real `userId` and re-run any pending sync if necessary (should be none if applied at signup).

### Testing Plan (Vitest)
- Unit
  - `OnboardingChatService` orchestration: interception mode, essentials detection, merge patches.
  - Prompt builder: asserts presence of onboarding cues and guardrails.
  - Validation helpers: email/phone acceptance/rejection and dedupe checks.
- Integration
  - API streaming route: emits token + profile_patch + milestone events.
  - Session patch accumulation → signup → merged `ProfilePatchService.patchProfile` call.
  - Authenticated flow: direct patch application via `profilePatchTool`.
- UI
  - Component tests (happy path, invalid email/phone, essentials-complete state, CTA visibility).

### Instrumentation
- Funnel events: `chat_opened`, `message_sent`, `patch_detected`, `essentials_complete`, `cta_clicked`, `signup_started`, `signup_completed`.
- Log `fieldsUpdated` summaries (from tool or interception) without storing raw PII in logs.

### Rollout Plan
- Phase 1: Behind feature flag; non-auth sessions only; capture analytics.
- Phase 2: Enable for authenticated users; direct patching.
- Phase 3: Iterate prompts based on drop-off data; A/B test hero copy.

### File Map (proposed)
- API: `src/app/api/chat/onboarding/route.ts`
- Service: `src/server/services/onboardingChatService.ts`
- Prompt: `src/server/agents/onboardingChat/prompts.ts` (or extend `chat/prompts.ts`)
- Client: `src/components/pages/chat/{ChatContainer,MessageList,Composer,ProfileSummaryPanel,SignupCTA}.tsx`
- Page: `src/app/chat/page.tsx`
- Session utils: `src/server/utils/session/onboardingSession.ts`

### Minimal Code Changes to Existing Modules
- `userProfileAgent` (`profile/chain.ts`): add `mode?: 'apply' | 'intercept'` and return tool-call intents when intercepting or missing `userId`.
- `ProfilePatchService.patchProfile(...)`: accept `source: 'onboarding-web'` for observability (already supports `source`).
- No changes to `profilePatchTool` required.

### Acceptance Checklist
- Hero → fullscreen chat with streaming responses.
- Essentials captured; CTA appears; signup prefilled.
- For unauth sessions, patches are intercepted and stored; for authed, patches apply immediately via existing tool.
- Right panel shows live projected profile.
- No duplication of patching logic; reuse `profilePatchTool` and `userProfileAgent`.

### Open Questions
- Prefer SSE or WebSocket now? SSE likely sufficient and simpler.
- Where to store session patches (Redis vs encrypted cookie vs DB table)? If no Redis, use signed cookie limited to small payloads; otherwise a lightweight table.
- Should we create a minimal `prospect` user on first message to enable immediate tool usage? If DB schema allows, this simplifies flows.
