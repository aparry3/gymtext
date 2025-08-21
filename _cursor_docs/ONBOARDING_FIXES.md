## Onboarding Chat – Fix Plan

### Why this needs fixing
- **Over-confirmation**: The agent requests per-field confirmations (“to confirm your name is…”) which is awkward.
- **Stilted flow**: It asks one question at a time even when batching is natural.
- **No session draft**: We don’t persist a mutable onboarding draft (user + profile) across turns, especially for unauthenticated users.
- **Tools gap**: Only fitness profile gets patched; no tool exists to patch `User` fields (name, email, phone).

---

### Current state (what’s in the repo today)
- **Onboarding prompt forces single-question + confirmation**
```23:42:src/server/agents/onboardingChat/prompts.ts
return `You are GymText’s onboarding coach.

Goals:
- Collect and confirm the user's essentials (name, phone, email, primary goal) first.
- Ask one focused question at a time.
- Keep messages concise, friendly, and helpful.
- Periodically summarize what's known and ask for corrections when appropriate.
...
Instructions:
1) Prioritize filling missing essentials before deeper questions.
2) When a user provides an essential, briefly confirm it.
3) Avoid overwhelming the user: one clear question per message.
4) If essentials are complete, continue with experience, schedule, equipment, constraints, preferences.
5) Keep responses under ~120 words.
`;
```

- **Onboarding service**: Orchestrates extraction (profile) and chat, computes pending essentials, streams events. Note it passes empty conversation history and uses the onboarding prompt.
```117:129:src/server/services/onboardingChatService.ts
const pendingRequired = this.computePendingRequiredFields(currentProfile, user);
const systemPrompt = buildOnboardingChatSystemPrompt(currentProfile, pendingRequired);
const chatResult = await this.chatAgent({
  userName: user?.name ?? 'there',
  message,
  profile: currentProfile,
  wasProfileUpdated: false,
  conversationHistory: [],
  context: { onboarding: true, pendingRequiredFields: pendingRequired },
  systemPromptOverride: systemPrompt,
  config: { temperature: 0.7, verbose: process.env.NODE_ENV === 'development' },
});
```

- **Session utils exist but minimal**: Only pending profile patches; no `draft.user` fields, no summary helpers.
```10:21:src/server/utils/session/onboardingSession.ts
export interface OnboardingSessionState {
  pendingPatches: PendingProfilePatch[];
}
...
if (!state) {
  state = { pendingPatches: [] };
  sessionStore.set(tempSessionId, state);
}
```

- **Profile tool only**: Confidence-gated, writes via `ProfilePatchService`. No equivalent for `User` fields.
```14:26:src/server/agents/tools/profilePatchTool.ts
const CONFIDENCE_THRESHOLD = 0.5;
if (confidence < CONFIDENCE_THRESHOLD) {
  return { applied: false, reason: 'Low confidence', confidence, threshold: CONFIDENCE_THRESHOLD };
}
...
const updatedUser = await patchService.patchProfile(userId, updates, { source: 'chat', reason, path: 'profilePatchTool' });
```

- **User schema naming mismatch**: We use `users.phoneNumber` in the DB/repository, but `user/schemas.ts` defines `phone`. The onboarding service compensates by checking both.
```153:165:src/server/services/onboardingChatService.ts
const email: string | null | undefined = user ? (user as unknown as { email?: string | null })?.email : null;
const phone: string | null | undefined = user
  ? ((user as unknown as { phoneNumber?: string | null; phone?: string | null })?.phoneNumber
    ?? (user as unknown as { phone?: string | null })?.phone)
  : null;
```

---

### Target behavior
- **No per-field confirmations.** Ask naturally; once essentials are captured, provide a single polite summary and ask for corrections.
- **More human, batch sensible questions.** E.g., “What are your name and email, and what’s the best number to text you at?”
- **Maintain onboarding session state.** Keep a draft of `Partial<User>` and `Partial<FitnessProfile>` across turns (especially unauth), and a short conversation context.
- **Patch both sides.** Keep `profilePatchTool` for fitness profile; add a `userInfoPatchTool` for name/email/phone. Authed: apply to DB; unauth: update session draft only.

---

### Proposed design

#### 1) Prompt rewrite (onboarding)
Key changes:
- Remove per-field confirmations and “one question at a time” constraint.
- Encourage concise, friendly tone; allow batching 2–3 essentials.
- Require a single summary once essentials are complete.
- Accept additional profile info opportunistically; don’t interrupt flow with confirmations.

Example system prompt (excerpt) to replace current builder output:
```text
You are GymText’s onboarding coach. Be warm, clear, and efficient.

Goals
- Gather essentials first: name, email, phone, primary goal.
- Ask for 2–3 missing essentials together when natural. Keep it brief.
- Do not confirm each item. Once essentials are complete, send ONE friendly summary and ask for corrections.
- Then deepen with experience, schedule, equipment, constraints, preferences. Batch logically.

Style
- Conversational and human. Avoid robotic phrasing and redundant confirmations.
- Keep replies under ~120 words. Use one question or a small batch per turn.

Behavior
- If the user provides multiple details, accept them and continue without confirmation.
- If essentials are complete, provide a concise summary like:
  “Fantastic! I’ve got what I need, thanks {name}. Let me know if I missed anything.”
  Then list captured essentials and next steps.
```

Implementation notes:
- Keep `buildOnboardingChatSystemPrompt(profile, pending)` but change its content as above and include a concise, up-to-date profile summary and pending fields.
- Pass short rolling history (last 3–5 turns) to improve coherence.

#### 2) Session state model
Add a richer session draft, keyed by `gt_temp_session` for unauth flows; when authed, mirror the draft from DB:
```ts
export interface OnboardingSessionState {
  draft: {
    user: Partial<{ name: string; email: string; phoneNumber: string }>;
    profile: Partial<FitnessProfile>;
  };
  pendingPatches: Array<{
    updates: Partial<FitnessProfile>;
    reason: string;
    confidence: number;
    timestamp: number;
  }>;
  messages: Array<{ role: 'user' | 'assistant'; content: string; ts: number }>;
}
```
- **Source of truth**
  - Authed: DB user + profile; session holds a projection and recent messages.
  - Unauth: session `draft` is the source; DB writes are deferred until signup.
- **Projection**: `projectProfile(base, sessionId)` should merge `draft.profile` and `pendingPatches` into a view used by the chat.
- **Client persistence**: The client can also cache this JSON in localStorage to resume if needed; server remains canonical for unauth until signup.

#### 3) Tooling for user info
Add a `userInfoPatchTool` for name, email, phone:
- **Schema**: a zod object using `UpdateUserSchema.pick({ name, email, phone? | phoneNumber? })`.
- **Confidence gate**: same 0.5 threshold as profile.
- **Apply behavior**:
  - Authed: `UserRepository.update(userId, { name, email, phoneNumber })` (normalize to `phoneNumber`).
  - Unauth: update session `draft.user` only.
- **Binding**: Add to the existing `userProfileAgent` tool set (so a single extraction pass can set both profile and user fields). Alternatively, create a tiny `contactInfoAgent` using the same approach; preferred: expand `userProfileAgent` bindings for fewer round-trips.

#### 4) Orchestration changes (`OnboardingChatService`)
- **Extraction phase**
  - Authed: Run `userProfileAgent(mode: apply)`; both tools can apply directly.
  - Unauth: Run `userProfileAgent(mode: intercept)`; capture intents for profile and user fields into session `draft`/`pendingPatches`.
- **Conversation generation**
  - Compute pending essentials from: authed user+profile or unauth session draft.
  - Use rewritten onboarding system prompt.
  - Include short rolling history from session `messages` to improve tone and continuity.
- **Milestones**
  - When essentials go from incomplete → complete, emit `milestone: 'summary'` and the assistant should output the single consolidated summary.

#### 5) Essentials and validation
- **Essentials**: `name`, `email`, `phoneNumber`, `primaryGoal`.
- **Validation heuristics**
  - `email`: RFC-like regex (already available in `UserModel.isValidEmail`).
  - `phoneNumber`: E.164-ish, reuse `UserModel.isValidPhoneNumber`.
  - `name`: non-empty, ≥2 chars.
  - `primaryGoal`: one of the known goals; fallback accept free text and map later.
- **Normalization**: Always map inbound `phone|phoneNumber` → `phoneNumber` internally.

#### 6) Naming alignment
- Standardize on `phoneNumber` for user records end-to-end.
- Update zod `UserSchema` and related schemas to prefer `phoneNumber` (keep `phone` as optional alias for inbound LLM/tool calls if helpful). This avoids scattered adapter code like in `computePendingRequiredFields`.

---

### Implementation plan (no code in this doc)
1) **Rewrite the onboarding prompt** in `src/server/agents/onboardingChat/prompts.ts` to remove per-field confirmations and allow multi-field questions + final summary.
2) **Expand session state** in `src/server/utils/session/onboardingSession.ts` to include `draft.user`, `draft.profile`, and `messages`. Add helpers:
   - `getOrInitSession(tempSessionId)`, `projectProfile(base, id)`, `projectUser(base, id)`, `applyInterceptedUserDraft(id, draft)`, `appendMessage(id, role, content)`.
3) **Add `userInfoPatchTool`** alongside `profilePatchTool`:
   - Zod schema for `{ name?, email?, phoneNumber? }` with confidence + reason.
   - Apply or intercept based on `configurable.userId` and `mode`.
4) **Bind both tools** in `userProfileAgent` so a single extraction can write both sides.
5) **Adjust `OnboardingChatService`**:
   - Use session projection for unauth.
   - Maintain short rolling `messages`.
   - Compute essentials from projected user/profile (unauth) or DB (auth).
   - Emit `milestone: 'summary'` when essentials complete and ensure summary-style reply.
6) **Schema naming alignment**: Prefer `phoneNumber` in schemas and prompts; keep `phone` as an accepted alias in tooling.
7) **Client** (`ChatContainer.tsx`): keep using `/api/chat/onboarding`; ensure it handles new SSE `milestone: 'summary'` and stores session snapshot locally for resilience.
8) **Telemetry**: Tag profile changes with `source: 'onboarding-web'` in `ProfilePatchService` usages; tag user updates similarly.

---

### Example phrasing (behavioral guardrails)
- **Batch essentials ask**: “Awesome—before we get rolling, what’s your name and email, and what’s the best number to text you at?”
- **No per-field confirmations**: Accept answers as-is; move forward.
- **Final summary**: “Fantastic! I think I’ve got what I need, thanks {name}. Let me know if I missed anything.” Then list essentials and any key profile bits.

---

### Testing plan
- Unit tests
  - Prompt builder: asserts removal of per-field confirmation language and presence of summary instruction.
  - Session utils: projection, message rolling buffer, intercepted drafts merge.
  - Tools: `userInfoPatchTool` gating and application; intercept mode writes to session.
- Integration tests
  - Unauth onboarding happy path: multi-field response captured; milestone `summary` emitted; session draft reflects values; no DB writes.
  - Auth onboarding: tool applies both user and profile updates; essentials summary emitted once.
  - Edge cases: low-confidence statements do not update; mixed multi-intent messages; phone/email validation failures lead to polite re-ask.

---

### Risks and mitigations
- **In-memory session store**: Not durable or horizontally scalable. Mitigate with Redis in a follow-up.
- **LLM over-asking**: Guard in prompt; cap batch size; include pending essentials list in context.
- **PII in session**: Keep lifetime short (7-day cookie), encrypt-at-rest when moving to Redis, avoid logging raw PII.
- **Naming mismatch (`phone` vs `phoneNumber`)**: Resolve as part of this work; keep backward-compatible alias handling in tools.

---

### Deliverables checklist
- [ ] Updated onboarding prompt content and builder
- [ ] Session state expansion + helpers
- [ ] `userInfoPatchTool` implemented and bound
- [ ] Onboarding service orchestration updates (projection, messages, summary milestone)
- [ ] Schema/typing alignment for `phoneNumber`
- [ ] Tests (unit + integration) updated/added
- [ ] Minimal client handling for `summary` milestone and local session cache
