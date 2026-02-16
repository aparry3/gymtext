# Technical Debt Audit Report

**Date:** January 26, 2026
**Branch:** `claude/cleanup-technical-debt-HnBRz`

This document catalogs all technical debt, architecture violations, deprecated code, and cleanup opportunities identified in the GymText codebase.

---

## Table of Contents

1. [Critical Issues (Fix Immediately)](#1-critical-issues-fix-immediately)
2. [High Priority Issues](#2-high-priority-issues)
3. [Medium Priority Issues](#3-medium-priority-issues)
4. [Low Priority Issues](#4-low-priority-issues)
5. [Code Quality Issues](#5-code-quality-issues)
6. [Recommended Cleanup Order](#6-recommended-cleanup-order)

---

## 1. Critical Issues (Fix Immediately)

### 1.1 Security: Mock Authentication in Production Route

**File:** `apps/web/src/app/api/users/preferences/route.ts:6-12`

```typescript
async function getUserIdFromRequest(request: Request): Promise<string | null> {
  // TODO: Implement actual authentication
  const userId = request.headers.get('x-user-id');
  return userId;
}
```

**Problem:** Route accepts any user ID from headers without validation. Anyone can impersonate any user.

**Fix:** Implement proper session validation using `checkAuthorization` middleware.

---

### 1.2 Security: Unprotected Admin Route

**File:** `apps/web/src/app/api/short-links/route.ts:21-22`

```typescript
/**
 * NOTE: This endpoint is for internal/admin use only
 * In production, it should be protected by authentication
 */
```

**Problem:** Comment acknowledges lack of protection but endpoint is live.

**Fix:** Add authentication check or move to admin app.

---

### 1.3 Security: Debug Logging with User Data

**File:** `packages/shared/src/shared/utils/cookies.ts:25`

```typescript
console.log('setting user cookie', userData);
```

**Problem:** Logs potentially sensitive user data to console.

**Fix:** Remove this debug log statement.

---

### 1.4 Architecture: SubscriptionService Bypasses Environment Context

**File:** `packages/shared/src/server/services/domain/subscription/subscriptionService.ts:6-9`

```typescript
const { secretKey } = getStripeSecrets();
const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16',
});
```

**Problem:** Direct module-level Stripe instantiation prevents environment switching (sandbox/production) in admin app.

**Fix:** Refactor to receive `stripeClient` as dependency like `ReferralService` does.

---

### 1.5 Type Mismatch: Duplicate MessageDeliveryStatus

**Files:**
- `packages/shared/src/server/models/message.ts:9`
- `packages/shared/src/shared/types/admin.ts:117-123`

**Problem:** Two definitions with different values:
- Model: `'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'`
- Admin: Includes `'pending'` status

**Fix:** Consolidate to single source of truth.

---

## 2. High Priority Issues

### 2.1 Architecture: Factory Uses Dynamic `require()` Statements

**File:** `packages/shared/src/server/services/factory.ts:232-284`

```typescript
const { getStripeSecrets } = require('../config');
const Stripe = require('stripe').default;
const { twilioClient } = require('../connections/twilio/twilio');
```

**Problem:** Breaks static type checking, hides dependencies, indicates circular dependency issues.

**Fix:** Resolve circular dependencies architecturally; use proper imports.

---

### 2.2 Architecture: FitnessProfileService Instantiates Agents Directly

**File:** `packages/shared/src/server/services/domain/user/fitnessProfileService.ts:111-143`

```typescript
const agent = await createAgent(
  { name: PROMPT_IDS.PROFILE_FITNESS, schema: ProfileUpdateOutputSchema },
  { model: 'gpt-5.1' }
);
```

**Problem:** Violates architecture - services should use agent services, not instantiate LLMs directly.

**Fix:** Delegate to `ProfileService` agent service.

---

### 2.3 Deprecated: Legacy ProfileService Class Still in Use

**File:** `packages/shared/src/server/services/agents/profile/index.ts:259-283`

```typescript
// TODO: Remove after all consumers migrate to createProfileService
export class ProfileService {
  // @deprecated
  static async updateProfile(...)
}
```

**Problem:** Deprecated pattern still used by `chatService.ts`.

**Fix:** Migrate all consumers to `createProfileService()` factory function.

---

### 2.4 Performance: In-Memory Filtering Instead of Database

**Files:**
- `apps/admin/src/app/api/programs/route.ts:48-134`
- `apps/admin/src/app/api/program-owners/route.ts:40-122`

```typescript
let programs = await services.program.listAll(); // Load ALL
programs = programs.filter(...); // Filter in JS
const paginatedPrograms = programsWithStats.slice(...); // Paginate in JS
```

**Problem:** Loads entire dataset into memory, then filters/paginates in JavaScript.

**Fix:** Implement database-level filtering and pagination in repositories.

---

### 2.5 Performance: N+1 Query Problems

**Files:**
- `apps/admin/src/app/api/programs/[id]/route.ts:39-49`
- `apps/admin/src/app/api/program-owners/route.ts:60-77`

```typescript
const enrichedEnrollments = await Promise.all(
  enrollments.map(async (enrollment) => {
    const client = await services.user.getUserById(enrollment.clientId); // N queries
  })
);
```

**Fix:** Use batch loading or database JOINs.

---

### 2.6 Performance: Inefficient Queue Status Query

**File:** `packages/shared/src/server/repositories/messageQueueRepository.ts:334-355`

```typescript
const entries = await this.db.selectFrom('messageQueues').select(['status']).execute();
return {
  pending: entries.filter((e) => e.status === 'pending').length,
  // ...
};
```

**Problem:** Loads all entries to count statuses instead of using SQL aggregation.

**Fix:** Use `COUNT(CASE WHEN status = 'pending' THEN 1 END)` SQL aggregation.

---

### 2.7 Massive Code Duplication: Training Agent Services

**Files:**
- `packages/shared/src/server/services/agents/training/fitnessPlanAgentService.ts`
- `packages/shared/src/server/services/agents/training/workoutAgentService.ts`
- `packages/shared/src/server/services/agents/training/microcycleAgentService.ts`

**Problem:** ~660 lines of nearly identical code across three services.

**Fix:** Extract `BaseAgentService` class with common lazy initialization and sub-agent patterns.

---

### 2.8 Component Duplication: 50+ Identical Components

**Locations:**
- `apps/web/src/components/pages/shared/*`
- `apps/admin/src/components/pages/shared/*`

**Problem:** 50+ components are 100% identical between web and admin apps.

**Fix:** Extract to `packages/shared/src/components/` or create a shared UI package.

---

## 3. Medium Priority Issues

### 3.1 Architecture: Business Logic in Repositories

**Files:**
- `packages/shared/src/server/repositories/userRepository.ts:239-268` - Timezone calculations
- `packages/shared/src/server/repositories/userRepository.ts:328-410` - Referral code generation
- `packages/shared/src/server/repositories/shortLinkRepository.ts:14-21` - Code generation
- `packages/shared/src/server/repositories/dayConfigRepository.ts:96-150` - Config merging

**Problem:** Domain/business logic belongs in services, not repositories.

**Fix:** Move logic to appropriate service layer.

---

### 3.2 Architecture: Direct Database/Repository Access in Routes

**Files:**
- `apps/admin/src/app/api/messages/route.ts:2,13-14`
- `apps/admin/src/app/api/prompts/route.ts:2`
- `apps/web/src/app/api/track/route.ts:37`

**Problem:** Routes directly instantiate repositories instead of using services.

**Fix:** Use `getAdminContext().services` or `getServices()`.

---

### 3.3 Architecture: Direct Stripe Instantiation in Routes

**Files:**
- `apps/web/src/app/api/users/signup/route.ts:10-13`
- `apps/web/src/app/api/stripe/webhook/route.ts:6-9`
- `apps/web/src/app/api/checkout/session/route.ts:6-9`

**Problem:** Duplicates Stripe initialization, breaks environment context system.

**Fix:** Use `createEnvContext()` to get configured Stripe client.

---

### 3.4 Architecture: Complex Business Logic in Routes

**File:** `apps/web/src/app/api/users/signup/route.ts:67-340`

Contains 5 helper functions that should be in a service:
- `handleNewUserSignup()`
- `handleUnsubscribedUserSignup()`
- `handleSubscribedUserReOnboard()`
- `completeSignupFlow()`
- `extractSignupData()`

**Fix:** Extract to `SignupService` or `SignupOrchestrator`.

---

### 3.5 Inconsistent: MicrocycleRepository Doesn't Extend BaseRepository

**File:** `packages/shared/src/server/repositories/microcycleRepository.ts:14-15`

```typescript
export class MicrocycleRepository {
  constructor(private db: Kysely<DB>) {}
```

**Problem:** Only repository not extending `BaseRepository`, has 8+ `@ts-expect-error` comments.

**Fix:** Extend `BaseRepository` and fix type issues.

---

### 3.6 Inconsistent: MessagingAgentService Uses Hardcoded Prompts

**File:** `packages/shared/src/server/services/agents/messaging/messagingAgentService.ts`

**Problem:** Uses `initializeModel()` directly with 5 hardcoded system prompts instead of `createAgent()` with database-backed prompts.

**Fix:** Migrate to database-backed prompts for consistency.

---

### 3.7 Inconsistent: Error Response Formats Vary

**Examples:**
- Some routes: `{ error: 'User not found' }`
- Other routes: `{ success: false, message: 'User not found' }`

**Fix:** Standardize on single error response format.

---

### 3.8 Duplicated Filter Logic in Repositories

**Files:**
- `packages/shared/src/server/repositories/userRepository.ts:34-108`
- `packages/shared/src/server/repositories/messageRepository.ts:148-243`

**Problem:** Identical filter conditions applied twice (data query + count query).

**Fix:** Extract filter building to helper function.

---

### 3.9 Type Safety: Excessive `any` Casts in MicrocycleModel

**File:** `packages/shared/src/server/models/microcycle.ts:52-73`

```typescript
absoluteWeek: microcycle.absoluteWeek as any,
days: microcycle.days as any,
// ... every field cast to any
```

**Fix:** Fix underlying type definitions instead of casting.

---

### 3.10 Missing Export: ProgramOwnerModel

**File:** `packages/shared/src/server/models/index.ts`

**Problem:** `ProgramOwnerModel` exists but isn't exported from index.

**Fix:** Add to exports for consistency.

---

## 4. Low Priority Issues

### 4.1 Unused Exports

| Export | Location | Status |
|--------|----------|--------|
| `CONTEXT_IDS` | `agents/promptIds.ts` | Exported but never used |
| `PROMPT_ROLES` | `agents/promptIds.ts` | Exported but never used |
| `TokenManager` | `utils/token-manager.ts` | Exported but never used |
| `gpt-4o` model | `agents/types.ts` | Defined but never used |
| `sessionCryptoEdge` | `utils/sessionCryptoEdge.ts` | Defined but never used |
| `pathNormalizer` | `utils/pathNormalizer.ts` | Redefined in web app |
| Formatters | `utils/formatters/` | Not exported or used |

---

### 4.2 Unused Repository/Service Methods

| Method | Location |
|--------|----------|
| `getProfileHistory()` | `fitnessProfileService.ts:172-174` |
| `saveProfile()` | `fitnessProfileService.ts:69-77` (only in migration script) |
| `MicrocycleModel.toDB()` | `microcycle.ts:52-73` |
| `FitnessPlanModel.schema` | `fitnessPlan.ts:180` |
| `deleteOldWorkouts()` | `workoutInstanceRepository.ts:190-200` |

---

### 4.3 TODO/FIXME Comments (Incomplete Implementations)

| Location | TODO |
|----------|------|
| `userService.ts:71` | `activeToday = 0; // TODO: Implement active user tracking` |
| `checkout/session/route.ts:80` | `planType: 'monthly', // TODO: Get from subscription price` |
| `stripe/webhook/route.ts:79` | `planType: 'monthly', // TODO: Get from subscription price` |
| `preferences/route.ts:8` | `// TODO: Implement actual authentication` |

---

### 4.4 Deprecated Pattern: Legacy `clientId` Field

**File:** `packages/shared/src/server/models/fitnessPlan.ts:58-77`

```typescript
clientId?: string | null;  // Explicit user reference
legacyClientId: string;    // Backward compatibility
```

**Problem:** Both fields exist for backward compatibility indefinitely.

---

### 4.5 Stub Component

**Files:**
- `apps/web/src/components/pages/chat/ChatContainer.tsx`
- `apps/admin/src/components/pages/chat/ChatContainer.tsx`

```typescript
export default function ChatContainer() {
  return <p>Chat interface is coming soon. Please use SMS for now.</p>
}
```

---

### 4.6 Inngest Function Not Exported

**File:** `packages/shared/src/server/inngest/functions/index.ts`

**Problem:** `retryMessageFunction` defined but not exported from index.

---

## 5. Code Quality Issues

### 5.1 Excessive Console Logging

Found 100+ `console.log/warn/error` statements throughout the shared package. Many are development/debug logs that should be:
- Removed entirely
- Converted to structured logging
- Gated behind a debug flag

**Particularly problematic:**
- `cookies.ts:25` - Logs user data
- Agent execution logs - Very verbose

---

### 5.2 ESLint Disable Comments

| File | Count | Type |
|------|-------|------|
| `microcycle.ts` | 9 | `@typescript-eslint/no-explicit-any` |
| `microcycleRepository.ts` | 8 | `@typescript-eslint/no-explicit-any` |
| `geminiSchema.ts` | 2 | `@typescript-eslint/no-explicit-any` |
| `user.ts` | 1 | `@typescript-eslint/no-explicit-any` |
| `userRepository.ts` | 1 | `@ts-expect-error` |
| `createAgent.ts` | 1 | `@typescript-eslint/no-explicit-any` |
| `subAgentExecutor.ts` | 1 | `@typescript-eslint/no-unused-vars` |
| `types.ts` | 2 | `@typescript-eslint/no-explicit-any` |
| `toolExecutor.ts` | 2 | `@typescript-eslint/no-explicit-any` |

---

### 5.3 Model Inconsistencies

- Different date handling: `Date | string | undefined` vs `Date | null`
- Different null handling patterns across repositories
- Inconsistent export patterns in models/index.ts

---

### 5.4 Temperature Hardcoding Anomaly

**File:** `packages/shared/src/server/agents/models.ts:73-76`

```typescript
temperature: model !== 'gpt-5-nano' ? temperature : 1,
```

**Problem:** Forces temperature to 1 (max randomness) only for `gpt-5-nano` with no documentation.

---

### 5.5 Outdated Token Manager Model Reference

**File:** `packages/shared/src/server/utils/token-manager.ts`

```typescript
constructor(modelName: TiktokenModel = 'gpt-3.5-turbo')
```

**Problem:** Uses very old model for token counting proxy.

---

## 6. Recommended Cleanup Order

### Phase 1: Security & Critical (Do First)

1. Fix mock authentication in `users/preferences/route.ts`
2. Add auth to `short-links/route.ts`
3. Remove user data logging in `cookies.ts`
4. Fix `MessageDeliveryStatus` type duplication

### Phase 2: Architecture Violations

5. Refactor `SubscriptionService` to receive Stripe client as dependency
6. Remove `require()` statements from `factory.ts`
7. Move agent instantiation from `FitnessProfileService` to agent service
8. Migrate deprecated `ProfileService` class consumers

### Phase 3: Performance

9. Implement database-level filtering/pagination in admin routes
10. Fix N+1 queries in admin routes
11. Use SQL aggregation in `messageQueueRepository.getQueueStatus()`
12. Consolidate multiple queries in `messageRepository.getStats()`

### Phase 4: Code Organization

13. Extract shared components to shared package
14. Extract `BaseAgentService` for training agents
15. Move business logic from repositories to services
16. Standardize error response format

### Phase 5: Cleanup

17. Remove unused exports and methods
18. Complete or remove TODO items
19. Fix type safety issues (remove `any` casts)
20. Clean up console logging
21. Fix `MicrocycleRepository` to extend `BaseRepository`

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Critical Issues | 5 |
| High Priority Issues | 8 |
| Medium Priority Issues | 10 |
| Low Priority Issues | 6 |
| Code Quality Issues | 5 |
| Unused Exports | 7 |
| ESLint Disables | 27 |
| TODO Comments | 4 |
| Console Logs | 100+ |
| Duplicated Components | 50+ |

---

*This audit was generated automatically. Please review each item before making changes.*
