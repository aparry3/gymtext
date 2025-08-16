### User Management – Implementation Checklist (Admin Dashboard)

This is a step-by-step, trackable checklist to implement the User Management & Analysis features per `USER_MANAGEMENT.md`. It reflects our current decisions: single admin role, synchronous actions, same create-user form as scripts, both single and batch daily messages, inbound simulation via `/api/sms`, no exports, no additional scripts for now.

Key principle: Admin must reuse the same production services/endpoints. Admin routes are thin wrappers that add auth and audit logging only.

---

## 0) Pre-flight & Environment
- [ ] Verify `.env.local` includes required envs (see `CLAUDE.md`)
- [ ] Ensure `ADMIN_SECRET`/admin gate is configured for `/admin` and `/api/admin/*`
- [ ] Confirm Twilio envs for SMS are present for live sends in non-dry runs
- [ ] `pnpm build` green
- [ ] `pnpm lint` green
- [ ] `pnpm test` green

---

## 1) Database & Types
- [x] Migration: create `admin_activity_logs`
  - [ ] Columns: `id`, `actor_user_id` (nullable), `target_user_id`, `action` (enum), `payload` (jsonb), `result` (enum: success|failure), `error_message` (nullable), `created_at`
  - [ ] Indexes: `idx_admin_activity_logs_target`, `idx_admin_activity_logs_created_at`
- [ ] Indexes (if missing):
  - [ ] `users` by (`created_at`, `email`, `phone`, `status`)
  - [ ] `fitness_profiles` by (`user_id`)
  - [ ] `fitness_plans` by (`user_id`, `created_at`)
- [ ] Run migrations: `pnpm migrate:up`
- [ ] Regenerate DB types: `pnpm db:codegen`

---

## 2) Repository Layer
- [ ] `UserRepository`
  - [x] `listUsers({ q, status, hasProfile, hasPlan, createdFrom, createdTo, page, pageSize, sort })`
  - [ ] `getUserById(userId)`
  - [ ] `createUser(input)`
- [ ] `FitnessProfileRepository`
  - [ ] `getByUserId(userId)`
  - [ ] `createOrUpdate(userId, input)`
- [ ] `FitnessPlanRepository`
  - [ ] `listByUserId(userId)`
  - [ ] `create(userId, options)`
- [ ] `ConversationRepository`
  - [ ] `getRecentMessages(userId, limit)`
  - [ ] (optional) `getLatestConversation(userId)`
- [ ] `AdminActivityLogRepository`
  - [ ] `log({ actorUserId, targetUserId, action, payload, result, errorMessage? })`
  - [ ] `listForUser(targetUserId, { page, pageSize })`

---

## 3) Service Layer
- [ ] `AdminUserService`
  - [ ] `createUser(input)` – validate input; create; log activity
  - [ ] `createFitnessProfile(userId, input)` – upsert; log activity
  - [ ] `generateFitnessPlan(userId, options)` – call the same service used by public program creation; persist; log activity
  - [ ] `sendDailyMessage(userId, date?)` – call the same function used by cron daily messages; log activity
  - [ ] `sendAdminSms(userId, message, { dryRun? })` – send via Twilio utility; log activity
  - [ ] `simulateInboundSms(userId, message, { context? })` – call `/api/sms` with Twilio-like payload (test mode); log activity
  - [ ] `pauseUser(userId)` / `resumeUser(userId)` – update user status; log activity
- [ ] Synchronous execution for all above in MVP
- [ ] Input validation (Zod) for service inputs
- [ ] Centralized error handling that also logs failures to `admin_activity_logs`
 - [ ] Verify no duplicated business logic: all admin methods delegate to existing service modules

---

## 4) API Endpoints (App Router)
- [x] Admin middleware/gate for `/api/admin/*`
- [x] `GET /api/admin/users` – filters, pagination, sorting
- [ ] `POST /api/admin/users` – create user (script-parity fields)
- [x] `GET /api/admin/users/[userId]` – details (profile, plan summary, recent messages)
- [ ] `POST /api/admin/users/[userId]/profile` – create/update profile
- [ ] `POST /api/admin/users/[userId]/plans` – generate plan; `force` option; delegates to the same service used by `/api/programs`
- [ ] `POST /api/admin/users/[userId]/send-daily-message` – single-user daily message; calls the same function used by `/api/cron/daily-messages`
- [ ] `POST /api/admin/users/[userId]/messages/outbound` – send admin → user SMS
- [ ] (No separate simulation route) Use `POST /api/sms` for inbound simulation from the UI
- [ ] `POST /api/admin/users/[userId]/pause` – pause user
- [ ] `POST /api/admin/users/[userId]/resume` – resume user
- [ ] `GET /api/admin/users/[userId]/activity` – list admin activity entries
- [ ] Idempotency: accept `Idempotency-Key` for mutating routes
- [ ] Batch daily messages: UI integrates with `GET /api/cron/daily-messages` (`testMode`, `testHour`, `testDate`, `dryRun`, `forceGenerate`)
 - [ ] Ensure admin endpoints are thin wrappers (auth + audit) around production code paths

---

## 5) UI – Admin Pages (Next.js App Router)
- [x] Admin layout gate `/admin` with single `admin` role (middleware + login)
- [x] `src/app/admin/users` – Users List
  - [x] Table with columns: Name, Phone, Email, Has Profile, Created At (read-only MVP)
  - [x] Search (name/email/phone)
  - [ ] Toolbar: New User button
  - [ ] Toolbar: Batch send daily messages (hour picker default=now, Dry Run, Force Generate)
  - [ ] Row actions: View, Create Profile, Generate Plan, Send Daily Message, Send Outbound SMS, Simulate Inbound SMS, Pause/Resume
  - [ ] Confirmations for destructive/impactful actions (e.g., force plan overwrite, live SMS)
  - [ ] Toasts for success/failure
- [x] `src/app/admin/users/[userId]` – User Detail
  - [ ] Tabs: Overview, Profile, Plans, Conversations, Activity
  - [x] Overview: key fields
  - [ ] Profile Tab: form to create/edit `fitness_profiles`
  - [ ] Plans Tab: show current/previous plans; generate/regenerate (with force)
  - [ ] Conversations Tab: recent messages; send admin outbound; simulate inbound (compose Twilio-like payload)
  - [ ] Activity Tab: admin action audit log
- [ ] Components
  - [ ] `NewUserForm` (fields match `scripts/test/user/create.ts`)
  - [ ] `ProfileForm`
  - [ ] `PlanGeneratorForm` (program type, weeks, force)
  - [ ] `DailyMessageForm` (single-user)
  - [ ] `BatchDailyMessageToolbar` (hour, date, dry run, force)
  - [ ] `OutboundSmsForm`
  - [ ] `InboundSimulationForm` (build payload for `/api/sms`)

---

## 6) Integrations & Utilities
- [ ] LLM agents wired: `generateFitnessPlanAgent`, `dailyMessageAgent` (as applicable)
- [ ] SMS send utility for outbound (Twilio), with Dry Run mode in UI
- [ ] Inbound simulation: UI constructs Twilio-like payload and posts to `/api/sms` (same handler as production)
- [ ] Guardrails: disable actions when preconditions fail (e.g., missing phone → cannot send SMS)

---

## 7) Analytics & Insights (Lightweight)
- [ ] Users List: counters for Active users, Users with profile, Users with plan, Messages sent last 24h
- [ ] User Detail: 14-day messages sparkline (if feasible), plan adherence indicator (if available)

---

## 8) Security, Validation, Observability
- [x] Single `admin` role enforcement for `/admin` and `/api/admin/*`
- [ ] Zod validation for all request bodies/query params
- [ ] Rate limits on sensitive actions (e.g., outbound SMS)
- [ ] Admin activity logging across all actions (success/failure, payload)

---

## 9) Testing
- [ ] Unit tests for repositories and services (Vitest)
- [ ] Integration tests for API routes (mock Twilio/LLM)
- [ ] E2E smoke tests covering: create user → create profile → generate plan → send daily message → outbound SMS → inbound simulation
- [ ] Load test `GET /api/admin/users` paging/filtering
- [ ] `pnpm build`, `pnpm lint`, `pnpm test` green

---

## 10) Rollout & Ops
- [ ] Feature-flag `/admin/users` initial read-only list and detail
- [ ] Enable actions incrementally: create user/profile → generate plan → send daily message → pause/resume → SMS tools
- [ ] Final QA in staging with safe numbers (dry run vs live toggles)
- [ ] Production enablement

---

## Definition of Done (MVP)
- [x] `/admin/users` shows paginated/sortable/filterable list and navigates to user detail
- [ ] Admin can create new user (list primary action)
- [ ] Admin can create profile, generate plan, send single daily message
- [ ] Admin can batch send daily messages for current/specified hour (toolbar)
- [ ] Admin can send outbound SMS and simulate inbound via `/api/sms`
- [ ] All actions are audit logged; gates enforce single admin role
- [ ] Build/tests green; [x] lint green

---

## Post-MVP (Backlog)
- [ ] Queueing for heavy operations (BullMQ/Redis or Cloud Tasks)
- [ ] Bulk row actions on Users list
- [ ] Additional analytics and charts
- [ ] CSV export for filtered lists (if needed later)
- [ ] Subscription-related views/actions (when required)
