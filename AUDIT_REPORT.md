# GymText Codebase Audit Report

**Date:** February 2, 2026
**Scope:** Security vulnerabilities, deprecated code, database schema, error handling, robustness

---

## Executive Summary

This comprehensive audit identified **65+ issues** across the GymText codebase, categorized by severity:

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 **CRITICAL** | 8 | Immediate security risks requiring urgent attention |
| 🟠 **HIGH** | 15 | Significant vulnerabilities and bugs affecting security/reliability |
| 🟡 **MEDIUM** | 25+ | Code quality issues, technical debt, and potential bugs |
| 🟢 **LOW** | 15+ | Minor issues, documentation, and improvement opportunities |

---

## 🔴 CRITICAL Issues (Fix Immediately)

### 1. Hardcoded Dev Bypass Codes in Production

**Files:**
- `packages/shared/src/server/services/domain/auth/adminAuthService.ts:42`
- `packages/shared/src/server/services/domain/auth/userAuthService.ts:45`
- `packages/shared/src/server/services/domain/auth/programOwnerAuthService.ts:48`

**Issue:** Default fallback to `'000000'` if `DEV_BYPASS_CODE` is not configured:
```typescript
const devBypassCode = getAdminConfig().devBypassCode || '000000';
```

**Risk:** Any attacker can bypass SMS verification if `DEV_BYPASS_CODE` env var is not explicitly set in production.

**Fix:** Remove the `|| '000000'` fallback entirely. Make `DEV_BYPASS_CODE` required or fail if not set.

---

### 2. Hardcoded Session Encryption Keys

**Files:**
- `packages/shared/src/server/utils/sessionCrypto.ts:24`
- `packages/shared/src/server/utils/sessionCryptoEdge.ts:19,35`

**Issue:** Multiple hardcoded encryption weaknesses:
```typescript
crypto.scryptSync('gymtext-dev-key', 'salt', KEY_LENGTH);  // Hardcoded salt!
const keyString = process.env.SESSION_ENCRYPTION_KEY || 'gymtext-dev-key';  // Fallback key
```

**Risk:** Session tokens can be forged or decrypted if `SESSION_ENCRYPTION_KEY` is not set.

**Fix:**
1. Make `SESSION_ENCRYPTION_KEY` required in production (fail at startup if missing)
2. Use random salt for key derivation instead of hardcoded `'salt'`

---

### 3. Unprotected Short-Links API Endpoint

**File:** `apps/web/src/app/api/short-links/route.ts:24-135`

**Issue:** POST and GET endpoints marked as "for internal/admin use only" but have **NO authentication checks**:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, targetPath, code, expiresAt } = body;
  // ... directly creates short link without authorization
```

**Risk:** Anyone can create short links with arbitrary user IDs and redirect URLs, or enumerate all short links.

**Fix:** Add `checkAuthorization()` or require admin session validation.

---

### 4. Unprotected Admin API Routes

**Files:**
- `apps/admin/src/app/api/messages/route.ts`
- `apps/admin/src/app/api/dashboard/route.ts`
- `apps/admin/src/app/api/exercises/rank/route.ts`
- `apps/admin/src/app/api/calendar/route.ts`

**Issue:** These routes don't validate the `gt_admin` cookie before processing requests.

**Risk:** Unauthenticated users can directly call admin API endpoints to access all user messages, dashboard metrics, and modify data.

**Fix:** Add explicit `checkAuthorization()` to all admin API routes, not just UI routes.

---

### 5. Verification Codes Logged to Console

**Files:**
- `packages/shared/src/server/services/domain/auth/adminAuthService.ts:92`
- `packages/shared/src/server/services/domain/auth/userAuthService.ts:86`
- `packages/shared/src/server/services/domain/auth/programOwnerAuthService.ts:99`

**Issue:**
```typescript
console.log(`[AdminAuth:Dev] 🔑 Verification code for ${phoneNumber}: ${code}`);
```

**Risk:** Verification codes appear in server logs, CI/CD logs, and error tracking systems (Sentry, Vercel logs).

**Fix:** Remove all verification code logging. Use hashed comparisons for debugging if needed.

---

### 6. LLM API Calls Without Error Handling

**Files:**
- `packages/shared/src/server/agents/models.ts:65,88,113`
- `packages/shared/src/server/agents/toolExecutor.ts:65`

**Issue:** Model invoke calls have no try-catch:
```typescript
const result = await model.invoke(conversationHistory);
// NO ERROR HANDLING - if model fails, entire operation fails
```

**Risk:** If Google Gemini or OpenAI API fails, entire request chain crashes with no graceful degradation.

**Fix:** Wrap all LLM calls in try-catch with appropriate fallback/retry logic.

---

### 7. Unprotected Cron Trigger Endpoint

**File:** `apps/admin/src/app/api/cron/trigger/route.ts:17-99`

**Issue:** No authentication validation before proxying requests to cron endpoints.

**Risk:** Any user can trigger daily/weekly messages for all users by calling:
```bash
POST /api/cron/trigger
{"type": "daily", "forceImmediate": true}
```

**Fix:** Add admin session validation before processing cron triggers.

---

### 8. No CSRF Protection

**Affected:** All POST/PATCH/DELETE API routes in apps/admin and apps/web

**Issue:** No CSRF tokens found in the entire codebase. No `X-CSRF-Token` headers, no CSRF middleware.

**Risk:** Attackers can craft malicious websites that make requests on behalf of authenticated admin users.

**Fix:** Implement CSRF token validation on all state-changing endpoints using Next.js middleware or custom validation.

---

## 🟠 HIGH Issues

### 9. Weak Header-Based Authentication

**File:** `apps/web/src/app/api/users/preferences/route.ts:10`

**Issue:**
```typescript
// TODO: Implement actual authentication
const userId = request.headers.get('x-user-id');  // UNSAFE: Easily spoofable
```

**Risk:** Any user can impersonate any other user by modifying the `x-user-id` header.

**Fix:** Replace with `checkAuthorization()` using session cookies.

---

### 10. Information Disclosure - Error Messages Leaked

**Files:** 59 files across web and admin apps

**Pattern:**
```typescript
message: error instanceof Error ? error.message : 'Internal server error'
```

**Risk:** Internal error messages reveal implementation details to attackers.

**Fix:** Always use generic error messages in responses. Log detailed errors server-side only.

---

### 11. IDOR Vulnerability in Short Links

**File:** `apps/web/src/app/api/short-links/route.ts:112-135`

**Issue:** No authorization check when listing short links - any user can retrieve links for any `clientId`.

**Fix:** Validate that requesting user matches the `clientId` or has admin privileges.

---

### 12. Checkout Session Authorization Bypass Risk

**File:** `apps/web/src/app/api/checkout/session/route.ts:42-53`

**Issue:** User ID from Stripe session metadata used without validation:
```typescript
const userId = session.metadata?.userId || session.client_reference_id;
// Not verified to match authenticated user
```

**Risk:** An authenticated user could complete another user's checkout session.

**Fix:** Validate that the authenticated user matches the session's userId.

---

### 13. Missing Database Indexes (Performance Critical)

**File:** `migrations/20260117000000_consolidated_schema.ts`

**Issue:** `messages` and `workout_instances` tables have NO indexes.

**Impact:** N+1 queries and slow scans as user base grows.

**Required Indexes:**
```sql
-- Messages
CREATE INDEX idx_messages_client_id_created_at ON messages (client_id, created_at DESC);
CREATE INDEX idx_messages_provider_message_id ON messages (provider_message_id);
CREATE INDEX idx_messages_delivery_status_created_at ON messages (delivery_status, created_at);

-- Workout Instances
CREATE INDEX idx_workout_instances_client_id_date ON workout_instances (client_id, date DESC);
CREATE INDEX idx_workout_instances_microcycle_id ON workout_instances (microcycle_id);
```

---

### 14. Missing Try-Catch Around Promise.all()

**File:** `packages/shared/src/server/services/context/contextService.ts:84-92`

**Issue:**
```typescript
const [fitnessPlan, workout, microcycle, ...] = await Promise.all([
  // 7 parallel calls - if ANY fails, entire context building fails
]);
```

**Fix:** Wrap in try-catch with partial success handling, or use `Promise.allSettled()`.

---

### 15. Stripe Webhook Missing Error Handling

**File:** `apps/web/src/app/api/stripe/webhook/route.ts:70-148`

**Issue:** Multiple database and Stripe API calls without try-catch blocks. If any operation fails, subscription state becomes inconsistent.

**Fix:** Wrap operations in try-catch, implement idempotency keys, and consider using database transactions.

---

### 16. Race Condition in Message Processing

**File:** `packages/shared/src/server/services/orchestration/messagingOrchestrator.ts:204-210`

**Issue:**
```typescript
const message = await messageService.storeOutboundMessage({...});
const queueEntry = await queueService.enqueue(user.id, message.id, queueName);
// If enqueue fails after message stored, orphaned message exists
```

**Fix:** Use database transactions to ensure atomicity.

---

### 17. Subscription State Inconsistency Risk

**File:** `packages/shared/src/server/services/domain/subscription/subscriptionService.ts:103-107`

**Issue:** Stripe update followed by repo update without transaction:
```typescript
const stripeSubscription = await stripe.subscriptions.update(...);
await repos.subscription.scheduleCancellation(...);
// If second call fails, Stripe and local DB out of sync
```

**Fix:** Implement saga pattern or compensating transactions.

---

### 18. Session Cookie Expiry Too Long

**Files:**
- `apps/admin/src/app/api/auth/verify-code/route.ts:87`
- `apps/web/src/app/api/auth/verify-code/route.ts:89`

**Issue:** Session cookies expire after 30 days.

**Risk:** Long-lived sessions increase session hijacking impact window.

**Fix:** Reduce to 7 days maximum for sensitive operations.

---

### 19. Missing Timeout Handling for External Services

**Files:**
- `packages/shared/src/server/agents/models.ts`
- `packages/shared/src/server/connections/twilio/factory.ts`
- Stripe service calls

**Issue:** No timeout configuration for LLM invocations, Twilio, or Stripe API calls.

**Risk:** Long-running requests can hang indefinitely, blocking Vercel function timeouts.

**Fix:** Configure explicit timeouts for all external API calls.

---

### 20. Missing Security Headers

**Files:** `apps/web/next.config.ts`, `apps/admin/next.config.ts`

**Missing Headers:**
- `Content-Security-Policy`
- `X-Frame-Options` (clickjacking vulnerability)
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`

**Fix:** Add security headers via `next.config.ts` `headers()` export.

---

### 21. Type Mismatch - MessageDeliveryStatus

**File:** `packages/shared/src/server/models/message.ts:9`

**Issue:** TypeScript type missing statuses that exist in database:
- TypeScript: `'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'`
- Database also allows: `'pending'`, `'cancelled'`

**Fix:** Update TypeScript type to match database constraint.

---

### 22. Twilio getMessageStatus Without Error Handling

**File:** `packages/shared/src/server/connections/twilio/factory.ts:83`

**Issue:**
```typescript
async getMessageStatus(messageSid: string): Promise<MessageInstance> {
  return await client.messages(messageSid).fetch();  // NO ERROR HANDLING
}
```

**Fix:** Add try-catch with appropriate error handling and logging.

---

### 23. Anonymous Access to SSE Stream (If Enabled)

**File:** `apps/web/src/app/api/messages/stream/route.ts:15-27`

**Issue:** No authentication requirement; filters only by optional query parameter.

**Risk:** If enabled in production, any user can subscribe to message events.

**Fix:** Add authentication guards or ensure this is disabled in production.

---

## 🟡 MEDIUM Issues

### 24. Legacy `legacyClientId` Still Referenced

**Files:**
- `packages/shared/src/server/models/fitnessPlan.ts:131-134`
- `packages/shared/src/server/repositories/fitnessPlanRepository.ts:29-31`
- `packages/shared/src/server/services/domain/training/planInstanceService.ts:138,157-158`

**Issue:** Migration `20260201000000_cleanup_legacy_fields.ts` removed `legacy_client_id` column, but code still references it.

**Fix:** Remove all `legacyClientId` references from models and repositories.

---

### 25. N+1 Query Pattern - Timezone Filtering

**File:** `packages/shared/src/server/repositories/userRepository.ts:243-272`

**Issue:** `findUsersForHour()` fetches ALL users with subscriptions, then filters in JavaScript.

**Fix:** Use database-level timezone calculation with `EXTRACT(HOUR FROM ...)`.

---

### 26. Inefficient Message Counter Increment

**File:** `packages/shared/src/server/repositories/messageRepository.ts:103-118`

**Issue:** Two database round-trips for incrementing counter:
```typescript
const message = await this.findById(messageId);  // Query 1
await this.db.updateTable('messages').set({
  deliveryAttempts: (message.deliveryAttempts || 1) + 1,
}).execute(); // Query 2
```

**Fix:** Use atomic update: `SET deliveryAttempts = deliveryAttempts + 1`

---

### 27. Legacy Format Mappings in Agent Services

**Files:**
- `packages/shared/src/server/services/agents/training/fitnessPlanAgentService.ts:144,200`
- `packages/shared/src/server/services/agents/training/microcycleAgentService.ts:183,306`

**Issue:** Multiple comments indicate "Map to legacy format expected by [Service]".

**Fix:** Refactor services to use modern format directly, remove legacy mapping layers.

---

### 28. Old Landing Page Components Still Active

**Directory:** `apps/web/src/components/pages/landing-old/`

**Issue:** Complete set of legacy landing page components still imported in `apps/web/src/app/page.tsx`.

**Fix:** Remove if no longer needed, or clearly mark as archived.

---

### 29. Legacy Workout Schema Support

**Files:**
- `apps/admin/src/components/pages/shared/WorkoutDetailView.tsx:20-85`
- `apps/web/src/components/pages/shared/WorkoutDetailView.tsx`

**Issue:** Helper functions support both old (`items[]`) and new (`work[]`) workout formats.

**Fix:** Migrate all data to new format, remove legacy handling.

---

### 30. Query Parameter Validation Missing

**Files:**
- `apps/web/src/app/api/users/[id]/workouts/route.ts:42-47`
- `apps/admin/src/app/api/programs/route.ts:33-34`
- `apps/admin/src/app/api/messages/route.ts:21-42`

**Issue:** No bounds checking on `pageSize` or `limit` parameters.

**Fix:** Add validation: `const pageSize = Math.min(parseInt(param || '50'), 100);`

---

### 31. User Cookie Stores Sensitive Data

**File:** `packages/shared/src/shared/utils/cookies.ts:25-34`

**Issue:** `gymtext_user` cookie stores user data as plain JSON (id, name, isCustomer, etc.).

**Fix:** Store only encrypted session token, not user data.

---

### 32. Legacy Subscription Handling

**File:** `packages/shared/src/server/services/domain/subscription/subscriptionService.ts:139-143`

**Issue:** Code still handles `free_legacy_` subscriptions with comment "Legacy subscriptions are not in Stripe".

**Fix:** Remove after all legacy subscriptions expire.

---

### 33. TODO Comments Indicating Incomplete Features

**Files:**
- `apps/web/src/app/api/users/preferences/route.ts:8` - "TODO: Implement actual authentication"
- `apps/web/src/app/api/checkout/session/route.ts:80` - "TODO: Get from subscription price"
- `apps/web/src/app/api/users/[id]/profile/route.ts:128` - "TODO: Implement profile section updates"
- `packages/shared/src/server/services/domain/user/userService.ts:71` - `const activeToday = 0; // TODO`

**Fix:** Complete or remove incomplete features.

---

### 34. Inconsistent Cookie Security Flags

**Issue:** Cookie security configuration differs between routes:
- Admin/Web use `isProductionEnvironment()`
- Programs app uses direct `process.env.NODE_ENV === 'production'`

**Fix:** Standardize cookie security configuration across all apps.

---

### 35. Missing Error Boundaries in React Components

**Files:** All React components in `apps/admin/src/components` and `apps/web/src/components`

**Issue:** No Error Boundaries found wrapping major component trees.

**Fix:** Add error boundaries to isolate component failures.

---

### 36-45. Additional Chat/Agent Error Handling Issues

**Files:**
- `packages/shared/src/server/services/agents/chat/chatAgentService.ts:62-83`
- `packages/shared/src/server/services/orchestration/chatService.ts:98-99,179`

**Issues:** Missing null checks, unhandled errors in context service, agent invoke without try-catch.

---

## 🟢 LOW Issues

### 46. Console.log Statements in Server Code

**Files:** Multiple files in `packages/shared/src/server/agents/`

**Issue:** Heavy use of console logging that should use structured logging for production.

**Fix:** Replace with proper logging library (winston, pino).

---

### 47. Commented-Out Code and Exports

**Files:**
- `apps/web/src/components/pages/index.ts:2`
- `apps/web/src/components/pages/landing-old/OldLandingPage.tsx:198-211`

**Issue:** Commented-out exports and signup forms left in codebase.

**Fix:** Remove commented-out code or clearly document why it's preserved.

---

### 48. Orphaned Index Migration File

**File:** `migrations/index_migration.txt`

**Issue:** References deprecated tables and columns that no longer exist.

**Fix:** Update or remove to reflect current schema.

---

### 49. Type Aliases for Backward Compatibility

**File:** `packages/shared/src/server/services/agents/types/microcycles.ts:48-50`

**Issue:**
```typescript
// Legacy type aliases for backward compatibility
export type MicrocycleGenerationInput = MicrocycleGenerateInput;
```

**Fix:** Update consumers to use new types, remove aliases.

---

### 50. Draft/Experimental Routes Directory

**Directory:** `apps/web/src/app/draft/`

**Issue:** Appears to be experimental routes that should not be deployed.

**Fix:** Remove or move to separate branch if not ready for production.

---

### 51. Old Page Route Placeholder

**File:** `apps/web/src/app/_old/page.tsx`

**Issue:** Placeholder page with commented-out form.

**Fix:** Remove if not needed.

---

### 52. ESLint Disables for Unused Variables

**File:** `packages/shared/src/server/agents/subAgentExecutor.ts`

**Issue:** `// eslint-disable-next-line @typescript-eslint/no-unused-vars`

**Fix:** Remove unused variables or refactor code.

---

### 53-60. Minor Logging and Documentation Issues

Various files with insufficient error context in logs, missing JSDoc comments, etc.

---

## Recommendations by Priority

### Immediate (This Week)
1. Remove hardcoded bypass codes (`'000000'`)
2. Make `SESSION_ENCRYPTION_KEY` required in production
3. Add authentication to unprotected API routes (short-links, admin APIs)
4. Remove verification code logging
5. Implement CSRF protection

### Short-term (Next 2 Weeks)
1. Add missing database indexes
2. Fix error handling in LLM calls and external API integrations
3. Add security headers to Next.js config
4. Fix type mismatches (MessageDeliveryStatus)
5. Implement timeouts for external services

### Medium-term (Next Month)
1. Remove all legacy code (legacyClientId, old landing page, legacy workout formats)
2. Refactor N+1 queries
3. Complete TODO items or remove incomplete features
4. Add error boundaries to React components
5. Standardize logging with structured logging library

### Long-term (Ongoing)
1. Add comprehensive test coverage for security-critical paths
2. Implement proper monitoring and alerting
3. Regular security audits
4. Documentation updates

---

## Files Requiring Most Attention

| File | Issues | Severity |
|------|--------|----------|
| `packages/shared/src/server/services/domain/auth/adminAuthService.ts` | 4 | CRITICAL |
| `apps/web/src/app/api/short-links/route.ts` | 3 | CRITICAL |
| `packages/shared/src/server/utils/sessionCrypto.ts` | 2 | CRITICAL |
| `apps/web/src/app/api/stripe/webhook/route.ts` | 3 | HIGH |
| `packages/shared/src/server/agents/models.ts` | 3 | HIGH |
| `packages/shared/src/server/services/context/contextService.ts` | 2 | HIGH |
| `migrations/20260117000000_consolidated_schema.ts` | 2 | HIGH |

---

*Generated by Claude Code audit on 2026-02-02*
