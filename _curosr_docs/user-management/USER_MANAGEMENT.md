### User Management & Analysis - Admin Dashboard

This document proposes the end-to-end plan to add robust user management and analysis capabilities to the Admin Dashboard of GymText. It focuses on goals, scope, UX, data model, APIs, background jobs, analytics, security, rollout, and success metrics.

---

## Goals
- **Visibility**: Easily search, filter, and browse users; view key account and fitness context at a glance.
- **Actionability**: Execute common admin actions against a user: create user, create fitness profile, generate fitness plan, send daily message, send outbound admin SMS, simulate inbound SMS (on behalf of user), pause/resume.
- **Safety**: Guardrails, confirmations, and role-based access; auditable actions.
- **Performance**: Responsive at 10–100k users with server-side pagination, indexing, and efficient queries.
- **Observability**: Track admin actions and outcomes (success/failure), and provide basic analytics.

### Design Principle: Reuse Primary Code Paths
- Admin actions must exercise the same underlying services/endpoints as normal production flows.
- Admin-specific APIs should be thin wrappers that add authentication, authorization, and audit logging only.
- Prefer invoking existing endpoints/services (e.g., `/api/sms`, `/api/cron/daily-messages`, Program creation service used by `/api/programs`) rather than creating parallel admin-only logic.

## Out of Scope (Initial Release)
- Arbitrary freeform message broadcasting to all users
- Complex BI dashboards beyond lightweight analytics
- Multi-tenant admin separation (assume single-tenant internal tooling)

---

## UX & Navigation

- **Route**: `src/app/admin/users` (list), `src/app/admin/users/[userId]` (detail)
- **List page**: Server-powered table with pagination, sorting, and filters
  - Primary actions: New User; optional bulk selection (defer unless needed)
  - Columns: Name, Phone, Email, Status, Last Active, Has Profile, Has Plan, Created At
  - Filters: Status (active/paused/deleted), Has profile/plan, Date ranges
  - Search: by name, email, phone
  - Toolbar: Send daily messages for a specific hour (default to current hour), with Dry Run and Force Generate toggles
  - Row actions (overflow menu):
    - View details
    - Create fitness profile
    - Generate fitness plan
    - Send daily message
    - Send outbound SMS (admin → user)
    - Simulate inbound SMS (user → system)
    - Pause / Resume user
- **Detail page**: Tabs for Overview, Profile, Plans, Conversations, Activity
  - Overview: key fields + quick actions
  - Profile: view/edit `fitness_profiles`
  - Plans: list of `fitness_plans` (with mesocycles), generate or regenerate
  - Conversations: latest messages, ability to send an admin message and simulate inbound
  - Activity: audit log of admin actions and significant user events

### UX Guardrails
- Modal confirmations for impactful actions
- Idempotency where applicable (avoid duplicate plan generation)
- Clear toasts for success/failure
- Disable actions in invalid states (e.g., no phone → cannot send SMS)

---

## Data Model & Indexing

Existing tables (from CLAUDE.md):
- `users` (accounts)
- `fitness_profiles`
- `conversations` & `messages`
- `fitness_plans`
- `microcycles`
- `workout_instances`
- `subscriptions` (present but not used in this phase)

Additions:
- **`admin_activity_logs`**: audit trail for admin actions
  - `id` (pk), `actor_user_id` (nullable, if SSO later), `target_user_id`, `action` (enum), `payload` (jsonb), `result` (enum: success|failure), `error_message` (nullable), `created_at`
  - Indexes: `idx_admin_activity_logs_target`, `idx_admin_activity_logs_created_at`

Indexes for performance:
- `users`: by `created_at`, `email`, `phone`, `status`
- `fitness_profiles`: by `user_id`
- `fitness_plans`: by `user_id`, `created_at`

---

## Service & Repository Additions

Follow repository/service pattern.

- **Repositories**
  - `UserRepository`: list with filters, read by id, create
  - `FitnessProfileRepository`: get/create/update by `user_id`
  - `FitnessPlanRepository`: list by `user_id`, create
  - `ConversationRepository`: recent messages by `user_id`
  - `AdminActivityLogRepository`: write/read activity events

- **Services**
  - `AdminUserService`: orchestration for admin actions
    - `createUser(input)`
    - `createFitnessProfile(userId, input)`
    - `generateFitnessPlan(userId, options)` — call the same service used by public program creation (`/api/programs`); no alternate admin logic
    - `sendDailyMessage(userId, date?)` — call the same function used by the cron daily messages route
    - `sendAdminSms(userId, message, { dryRun? })`
    - `simulateInboundSms(userId, message, { context? })` — post to `/api/sms` with Twilio-like payload (test mode)
    - `pauseUser(userId)` / `resumeUser(userId)`
  - Each method should:
    - Validate preconditions (e.g., can message?)
    - Call agent/service layers (e.g., `generateFitnessPlanAgent`)
    - Persist results
    - Log admin activity with success/failure
  - Explicitly avoid duplicating business logic. All admin methods must delegate to the same service modules used by the non-admin routes.

---

## API Routes (Next.js App Router)

All routes under `src/app/api/admin/users/*`, protected by admin middleware.

- `GET /api/admin/users`
  - Query: `page`, `pageSize`, `q`, `status`, `hasProfile`, `hasPlan`, `createdFrom`, `createdTo`, `sort`
  - Returns paginated list with lite aggregates
- `POST /api/admin/users`
  - Body: new user fields (see Create User below)
- `GET /api/admin/users/[userId]`
- `POST /api/admin/users/[userId]/profile`
 - `POST /api/admin/users/[userId]/plans` — delegates to the same service used by `/api/programs`
 - `POST /api/admin/users/[userId]/send-daily-message` — delegates to the same function used by `/api/cron/daily-messages`
- `POST /api/admin/users/[userId]/messages/outbound`
 
- `POST /api/admin/users/[userId]/pause`
- `POST /api/admin/users/[userId]/resume`
- `GET /api/admin/users/[userId]/activity`

Idempotency: support `Idempotency-Key` header on mutating actions.
Batch daily messages: use the existing cron endpoint `GET /api/cron/daily-messages` with params (e.g., `testMode`, `testHour`, `testDate`, `dryRun`, `forceGenerate`) similar to the test script.
Inbound SMS simulation: use the same chat endpoint `POST /api/sms` with a Twilio-like payload and a test mode flag from the admin UI; do not create a separate simulate endpoint.

---

## GUI Parity with `scripts/`

Mirror the most-used developer scripts in a safe, admin-friendly UI. Each action should support DRY RUN where applicable and show clear results.

- **Create user** (parity with `scripts/test/user/create.ts`)
  - Fields: name, phoneNumber, email (optional), fitnessGoals, skillLevel, exerciseFrequency, gender, age, timezone, preferredSendHour
  - Options: generate test data, interactive-style helpers (optional)
  - Endpoint: `POST /api/admin/users`

- **Create fitness profile** (parity with `scripts/test/user/profile.ts`)
  - Create/update profile fields on `fitness_profiles`
  - Endpoint: `POST /api/admin/users/[userId]/profile`

- **Create program (fitness plan) for user** (parity with `scripts/test/fitness/create-plan.ts`)
  - Inputs: programType, lengthWeeks; force override existing plan (with confirmation)
  - Endpoint: `POST /api/admin/users/[userId]/plans`

 - **Send daily message** (parity with `scripts/test/messages/daily.ts`)
   - Modes: single user and batch for a specific hour
   - Options: `dryRun`, `forceGenerate`, specify date/hour
  - Endpoints: `POST /api/admin/users/[userId]/send-daily-message` (single; internally calls same function as cron) and `GET /api/cron/daily-messages` (batch)

- **Send outbound SMS (admin → user)**
  - Compose and send an immediate message to the user; record in `messages` with direction `outbound`
  - Endpoint: `POST /api/admin/users/[userId]/messages/outbound`

 - **Simulate inbound SMS (user → system)** (parity with `scripts/test/messages/sms.ts`)
   - Test pathway that posts to the same chat handler and shows returned TwiML/message
   - Options: show conversation context, specify conversationId
   - Endpoint: `POST /api/sms` (same endpoint; admin UI composes Twilio-like payload and marks test mode)

- **View user details / conversations** (parity with `scripts/test/user/get.ts`)
  - Show profile, current plan, recent messages, progress snapshot

---

## Integration Points

- **LLM Agents**
  - Use existing agents per CLAUDE.md: `generateFitnessPlanAgent`, `dailyMessageAgent`, possibly `microcyclePattern` when composing plans.
  - Avoid long-running blocking calls; use background jobs for heavy tasks.

- **SMS (Twilio)**
  - Validate phone; gracefully handle missing or invalid numbers.
  - Use existing SMS send utilities if present; otherwise add a thin service.
  - Provide a safe simulation pathway for inbound messages without hitting external webhooks in production.
  - Ensure outbound and inbound code paths are identical to production flows (admin only adds auth/audit context).

---

## Background Jobs & Queueing

Initial MVP: keep actions synchronous. Later, introduce a queue (e.g., `bullmq`/Redis or Cloud Tasks) for slow operations like plan generation and batch messaging. When enabled:

- Jobs:
  - `GenerateFitnessPlanJob { userId, options }`
  - `SendDailyMessageJob { userId, date }`

APIs would enqueue and return 202 Accepted; UI would show pending state via polling or SSE.

---

## Security & Access Control

- **Admin auth**: restrict `/admin` and `/api/admin/*` to a single `admin` role
- **Audit logging**: record action, actor, inputs, outcome
- **Rate limits**: per actor for sensitive operations
- **Input validation**: Zod schemas for request bodies/queries
- **Secrets**: never expose keys in UI or logs

---

## Analytics & Insights

- **On list page**: counts of Active users, Users with profile, Users with plan, Messages sent last 24h
- **On detail page**: sparkline of messages over last 14 days, plan adherence indicators (if available)
- **Admin actions dashboard**: successes vs failures (from `admin_activity_logs`)

---

## Testing Strategy

- Unit tests for repositories and services (Vitest)
- Integration tests for API routes (mock Twilio/Stripe/LLM)
- E2E smoke flows for critical admin actions
- Load test listing endpoint with pagination and filters

---

## Rollout Plan

1. Ship read-only list + detail (no actions) behind feature flag
2. Add actions incrementally: create user/profile → generate plan → send daily message
3. Add pause/resume
4. Introduce background jobs for heavy operations
5. Add analytics and activity log pages

---

## Decisions (from stakeholder input)

1. Single `admin` role only (no support/operator for now)
2. Keep actions synchronous initially
3. Create User form uses the same fields as the script
4. Daily messages: support both single-user and batch (for specific hour) in the UI
5. Inbound SMS simulation uses the same `/api/sms` endpoint
6. No CSV export needed in this phase
7. No other `scripts/` flows needed beyond those listed above

---

## Acceptance Criteria (Initial Milestone)

- Admin can navigate to `/admin/users`, view a paginated/sortable/filterable table, and open a user detail page.
- From detail page, admin can:
  - Create a new user (from list page primary action)
  - Create a fitness profile (if missing)
  - Generate a fitness plan
  - Send a daily message
  - Send an outbound SMS and simulate an inbound SMS
- All admin actions are audit logged with success/failure and payloads.
- Endpoints are protected by admin RBAC.
- Basic analytics shown on list and detail pages.
