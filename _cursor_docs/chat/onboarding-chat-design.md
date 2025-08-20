## GymText Onboarding Chat – Design & Requirements

### Goals
- **Purpose**: Replace the static bottom-of-landing-page form with an engaging onboarding chat that feels like ChatGPT/Claude while capturing user profile data.
- **Outcomes**:
  - Gather minimum info to start signup: **name**, **phone**, **email**, **fitness goal**.
  - Continue collecting richer fitness profile details: **experience**, **current goals**, **access to gyms/equipment**, **workout habits**, **injury constraints**, **weight**, **height**, **age**, **availability**, **training preferences**, **motivation**, etc.
  - Each user reply should produce a **patch** to the user’s `fitness_profile` using existing profile tooling.
  - Stream responses and support **tool calls** for profile updates, validation, and rich behavior.

### UX Overview
- **Entry point (Hero minimal chat)**
  - `/chat` page hero mimics ChatGPT/Claude: centered title, short value prop, minimalist textbox with placeholder: “What are your fitness goals?”
  - When the user starts typing or hits enter, expand into a **full-screen chat interface** (modal-like or route-level state change) with chat history pinned to the top.
  - If the user scrolls before engaging, `/chat` acts as a mini landing page with **benefits, testimonials, feature highlights**, and an **FAQ**.

- **Full-screen chat**
  - Left column: chat messages with **streaming assistant replies** (token-by-token or chunk streaming).
  - Right column (collapsible): **Profile Summary Panel** reflecting current `fitness_profile` state. Updates in real-time as patches apply.
  - Top bar: GymText logo, subtle step progress indicator ("Essentials", "Goals", "Experience", "Logistics"), and an option to "Continue signup" once minimum fields are present.
  - Bottom bar: input with tool/action affordances: mic (future), attach (optional), "Use my Apple/Google info" (optional), and a visible hint that the chat understands natural language.

- **Micro-interactions**
  - Typing indicators, message timestamps, and edit/copy actions on messages.
  - Subtle **guided prompts** (aka chips) to nudge progression: e.g., "Add phone number", "Share gym access", "Set weekly schedule".
  - Validation/in-line confirmation for phone and email (with tool-backed checks). If invalid, assistant clarifies and requests correction.

### Conversation Design
- **Opening**: Friendly, concise. Asks about goals immediately. Accepts long-form responses.
- **Progressive profiling**: The agent infers fields from free-text and asks clarifying questions when confidence is low.
- **Minimum viable signup unlock**: Once `name`, `phone`, `email`, and `fitness_goal` are captured and validated, show a persistent "Continue signup" CTA. Clicking proceeds to standard signup flow with pre-filled data.
- **Depth-first follow-ups**: After essentials, the agent explores: experience level, schedule, equipment, constraints, metrics, and preferences. Keeps a balanced pace; avoids overwhelming.
- **Confirmation loops**: Periodically summarizes the profile so far and asks for corrections.

### Technical Architecture
- **Leverage existing layers** (see CLAUDE.md and repo guidelines):
  - Routes: `src/app/api/chat/onboarding` (streaming endpoint, POST)
  - Services: `src/server/services/onboardingChatService.ts` orchestrates conversation, calls existing agents and repositories.
  - Agents: REUSE existing two-agent pattern:
    - `userProfileAgent` (`src/server/agents/profile/chain.ts`) for extraction + updates
    - `chatAgent` (`src/server/agents/chat/chain.ts`) for conversational replies
    - Add only an onboarding-specific prompt builder (no new tool): e.g., `buildOnboardingChatSystemPrompt` alongside existing chat prompts.
  - Repositories: use existing `UserRepository.patchProfile` via the `ProfilePatchService` that `profilePatchTool` already calls.
  - Models: pass `fitness_profile` context into the agents; profile updates occur via the tool bound to `userProfileAgent`.

- **Context & Tools**
  - Context input: `{ userId | tempSessionId, fitnessProfile, recentMessages, pendingRequiredFields }`.
  - Tools: REUSE `profilePatchTool` (`update_user_profile`) from `src/server/agents/tools/profilePatchTool.ts`.
    - This already routes updates through `ProfilePatchService` with Zod validation (`FitnessProfileSchema.partial()`).
    - Confidence gating and summary are built-in; no duplicate patch logic needed.
  - Validation: perform email/phone format and dedupe checks in the service layer (server-side) rather than new LLM tools.
  - Agent outputs should use the existing tool-call schema; the service executes and streams confirmations.

- **Session & Identification**
  - Before signup, use a **temporary session ID** (cookie) mapped to an anonymous record. On signup, link the temp session to `users` and migrate the accumulated `fitness_profile`.
  - If a user is authenticated, attach `userId` and write directly to their `fitness_profile`.
  - Draft profile strategy: maintain a server-side onboarding session as a draft profile store keyed by `tempSessionId`. Accumulate patches and contact fields until signup. On signup completion, create/link the user, apply the merged patches via `ProfilePatchService.patchProfile` once, and set `name`/`email`/`phoneNumber` on the user. Rationale: avoids provisional users who may never convert, reduces pre-consent PII in DB, and keeps patch logic centralized via existing services/tools. Alternative: create provisional users at chat start; if adopted later, add retention/cleanup and dedupe/merge logic.

- **Streaming**
  - Use existing streaming infra (if available) or implement chunked/Server-Sent Events (SSE) via the route. The agent response should stream text tokens and interleave tool results (e.g., show "Validated email" system chip when validation tool returns).

### Agent & Prompt
- **Reuse agents, add onboarding prompt**: Keep `userProfileAgent` for extraction/patching (it already binds `profilePatchTool`) and use `chatAgent` for replies with an onboarding-oriented system prompt.
- **Prompt characteristics**:
  - System: You are GymText’s onboarding coach. Your job is to collect and validate user profile info to personalize workout plans. Be concise, friendly, and proactive.
  - Tools: Explicitly documented tool schemas; prefer tool calls to direct claims when updating data.
  - Behavior:
    - Infer and patch fields from free-text.
    - Ask one focused question at a time; use confirmations for critical details (name, phone, email).
    - When essentials are complete, surface the signup CTA but continue discovery naturally.
    - Periodically summarize the profile and ask: "Anything to correct or add?"

### Data Model & Patching
- **Fitness Profile core** (align with repo schema):
  - `name`, `email`, `phone`
  - `fitnessGoal` (string or enum)
  - `experienceLevel` (beginner/intermediate/advanced)
  - `equipmentAccess` (home, commercial gym, none, list of equipment)
  - `schedule` (days per week, time windows)
  - `metrics` (height, weight, age, body fat – optional)
  - `constraints` (injuries/limitations), `preferences` (sports, styles)
  - `habits` (current workouts per week, duration)
  - `location` / `timezone`
- **Patch strategy**:
  - Every user message → extract candidate fields → emit a tool call with a partial patch only for detected fields.
  - Service validates and writes; returns the updated profile to the right panel and as context for the next prompt.

### Frontend Implementation Notes (no coding now)
- **Route**: `src/app/chat/page.tsx` (hero + scrollable landing), `src/app/chat/experience.tsx` (optional split), and a client component `ChatContainer` in `src/components/pages/chat/ChatContainer.tsx`.
- **UI**: Tailwind v4; mimic spacing/type scale from ChatGPT/Claude. Use a **sticky bottom input**, streaming message renderer, and a side panel for profile.
- **State**: React server components for data fetch; client component handles streaming via SSE/websocket.
- **Accessibility**: Focus traps when expanding to full-screen, ARIA live regions for streaming, keyboard shortcuts.

### Validation & Security
- Email and phone validation with clear error states. Throttle repeated invalid attempts.
- Sanitize user input, escape output, and guard against prompt injection by strictly scoping tools.
- Respect privacy: explain what’s being stored and why.

### Telemetry & Analytics
- Track funnel: hero → engaged → essentials complete → signup click → account created.
- Log which questions/steps cause drop-off to iterate on prompts and UI.

### Acceptance Criteria
- Hero section at `/chat` with minimal textbox placeholder: “What are your fitness goals?”
- Typing in the hero expands to full-screen chat, with streaming responses.
- Agent reuses `profilePatchTool` to update the profile; each user message can result in a stored patch.
- Right-side profile summary panel updates live.
- When `name`, `email`, `phone`, and `fitnessGoal` are present and validated, show "Continue signup" CTA that pre-fills signup.
- Page scroll reveals additional landing content (testimonials, FAQ).
- Uses existing agents (`userProfileAgent`, `chatAgent`), `profilePatchTool`, services, and repositories; passes `fitness_profile` as context.

### Reuse Map (minimize duplication)
- `profilePatchTool` → keep as-is for profile writes (confidence gating + Zod validation via `ProfilePatchService`).
- `userProfileAgent` → reuse for extraction + invoking `profilePatchTool`.
- `chatAgent` → reuse for responses; add onboarding-specific prompt only.
- New code limited to: routing for `/api/chat/onboarding` (streaming), onboarding prompt builder, thin orchestration service that mirrors `ChatService` but with onboarding milestones/CTA logic.

### Open Questions
- Do we want to support login continuation via SMS link after collecting phone?
- Should we ask for minimal DOB/age for better plan personalization? Any compliance considerations?
- How do we dedupe if a phone/email already exists? Offer sign-in instead?
- Preferred streaming transport: SSE vs WebSocket? Is there an existing abstraction we should reuse?
- Should we add a lightweight profile completeness score and surface it in the UI?
