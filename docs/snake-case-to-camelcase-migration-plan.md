# Snake Case to CamelCase Migration Plan

## Executive Summary

This document outlines a comprehensive plan to migrate the GymText database schema and TypeScript code from snake_case property naming to camelCase conventions. The current codebase uses Kysely ORM with PostgreSQL and has extensive usage of snake_case column names that need to be converted to camelCase throughout the application layer.

## Current State Analysis

### Database Schema (Snake Case)
The PostgreSQL database currently uses snake_case column naming:

**Core Tables:**
- `users`: phone_number, created_at, updated_at, stripe_customer_id
- `fitness_profiles`: user_id, fitness_goals, skill_level, exercise_frequency, created_at, updated_at
- `subscriptions`: user_id, stripe_subscription_id, plan_type, current_period_start, current_period_end, created_at, updated_at, canceled_at
- `workouts`: user_id, workout_type, sent_at, created_at
- `workout_logs`: user_id, workout_id, completed_at, created_at
- `conversations`: user_id, started_at, last_message_at, message_count, created_at, updated_at
- `messages`: conversation_id, user_id, phone_from, phone_to, twilio_message_sid, created_at
- `conversation_topics`: conversation_id, created_at

### TypeScript Types (Mixed Case)
Current TypeScript interfaces use snake_case to match database columns:

**Database Interface Types** (`src/shared/types/database.ts`):
- All table interfaces use snake_case field names
- Kysely types (Selectable, Insertable, Updateable) preserve snake_case

**Domain Types** (`src/shared/types/user.ts`, etc.):
- User and other domain types also use snake_case to match database
- CreateUserData and similar DTOs use snake_case

### Code Impact Areas

**High Impact Files:**
1. **Database Types**: `src/shared/types/database.ts` - Core schema definitions
2. **Repositories**: All files in `src/server/data/repositories/` - Direct database interaction
3. **Domain Types**: `src/shared/types/user.ts`, `conversation.ts`, etc.
4. **Services**: AI and infrastructure services that work with domain objects
5. **API Routes**: All endpoints that serialize/deserialize domain objects

**Medium Impact Files:**
1. **AI Agents**: References to user profiles and domain objects
2. **Prompt Templates**: May reference field names in templates
3. **Migration Scripts**: Historical migrations use snake_case

## Migration Strategy

### Phase 1: Database Column Mapping Strategy (Recommended Approach)

Instead of renaming database columns (which would be disruptive), we'll use Kysely's column mapping capabilities to present camelCase properties while keeping snake_case in the database.

**Benefits:**
- Non-breaking to existing database
- No data migration required
- Backward compatible with existing SQL queries
- Preserves migration history

**Implementation:**
```typescript
// Transform database schema to camelCase in TypeScript
export interface Database {
  users: CamelCaseTable<UsersTableSnakeCase>;
  fitnessProfiles: CamelCaseTable<FitnessProfilesTableSnakeCase>;
  // ... other tables
}

// Helper type to convert snake_case to camelCase
type CamelCaseTable<T> = {
  [K in keyof T as CamelCase<K>]: T[K];
};
```

### Phase 2: Alternative - Full Database Rename (Higher Risk)

If complete database migration is preferred:

**Steps:**
1. Create new migration to rename all columns
2. Update all TypeScript types
3. Update all queries and repository methods
4. Extensive testing required

**Risks:**
- Requires downtime
- Complex rollback procedures
- Potential data loss if migration fails
- Breaks existing database tools/scripts

## Detailed Implementation Plan (Phase 1 - Recommended)

### Step 1: Create Column Mapping Utilities
**Files to Create:**
- `src/shared/utils/case-mapping.ts` - Type utilities for case conversion
- `src/server/core/database/column-mapping.ts` - Kysely column mapping configuration

### Step 2: Update Database Type Definitions
**Files to Modify:**
- `src/shared/types/database.ts` - Add camelCase interfaces alongside snake_case
- Create new camelCase table interfaces
- Maintain snake_case versions for backward compatibility

### Step 3: Update Repository Layer
**Files to Modify:**
- `src/server/data/repositories/userRepository.ts`
- `src/server/data/repositories/conversationRepository.ts` 
- `src/server/data/repositories/messageRepository.ts`
- `src/server/data/repositories/baseRepository.ts`

**Changes:**
- Update method signatures to use camelCase types
- Add column mapping in Kysely queries
- Transform results to camelCase before returning

### Step 4: Update Domain Types
**Files to Modify:**
- `src/shared/types/user.ts` - Convert to camelCase (phoneNumber, createdAt, etc.)
- `src/shared/types/conversation.ts` - Update field names
- `src/shared/types/workout.ts` - Convert snake_case fields

### Step 5: Update Service Layer
**Files to Modify:**
- `src/server/services/ai/contextService.ts`
- `src/server/services/infrastructure/conversationStorageService.ts`
- All AI agent files in `src/server/agents/`

### Step 6: Update API Layer
**Files to Modify:**
- `src/app/api/auth/session/route.ts`
- `src/app/api/webhook/route.ts`
- `src/app/api/create-checkout-session/route.ts`
- `src/app/api/sms/route.ts`

### Step 7: Update Frontend Components
**Files to Modify:**
- `src/components/SignUpForm.tsx`
- `src/app/success/WorkoutSetupClient.tsx`
- Any other components using domain types

## Implementation Order & Dependencies

### Critical Path:
1. **Database utilities** → **Type definitions** → **Repository layer** → **Service layer** → **API layer** → **Frontend**

### Parallel Tracks:
- Domain types can be updated alongside repository layer
- AI agents and prompt templates can be updated after service layer
- Frontend components depend on API layer changes

## Testing Strategy

### Unit Tests:
- Repository method tests with new camelCase interfaces
- Service layer tests with updated domain objects
- Type conversion utility tests

### Integration Tests:
- End-to-end API tests with camelCase payloads
- Database interaction tests
- SMS integration tests with new domain objects

### Migration Tests:
- Verify backward compatibility during transition
- Test column mapping functionality
- Validate data integrity

## Risk Assessment

### Low Risk:
- Type definition updates
- Frontend component updates
- Adding new utility functions

### Medium Risk:
- Repository layer changes (affects all data access)
- Service layer updates (affects business logic)
- API endpoint modifications

### High Risk:
- Database column mapping configuration
- Kysely query transformations
- Breaking changes to external integrations

## Rollback Plan

### Phase 1 Rollback (Column Mapping):
1. Revert TypeScript types to snake_case
2. Remove column mapping utilities
3. Restore original repository methods
4. No database changes required

### Database State:
- Database remains unchanged (snake_case columns)
- No data migration required
- Existing SQL queries continue to work

## Timeline Estimate

### Phase 1 (Column Mapping):
- **Planning & Setup**: 1 day
- **Type Definitions & Utilities**: 2 days  
- **Repository Layer**: 2 days
- **Service Layer**: 2 days
- **API Layer**: 1 day
- **Frontend**: 1 day
- **Testing & QA**: 2 days
- **Total**: ~11 days

### Phase 2 (Full DB Migration):
- **Additional 5-7 days** for database migration planning and execution

## Success Criteria

### Phase 1 Completion:
- [ ] All TypeScript interfaces use camelCase
- [ ] All repository methods return camelCase objects
- [ ] All API endpoints use camelCase JSON
- [ ] Frontend components use camelCase properties
- [ ] Database continues using snake_case columns
- [ ] All existing functionality preserved
- [ ] All tests passing

### Quality Gates:
- [ ] Type safety maintained throughout codebase
- [ ] No runtime errors in development/staging
- [ ] API documentation updated
- [ ] Performance benchmarks maintained

## Recommendations

1. **Choose Phase 1 (Column Mapping)** - Lower risk, maintains database compatibility
2. **Implement incrementally** - Update one layer at a time with thorough testing
3. **Maintain backward compatibility** - Keep snake_case types available during transition
4. **Comprehensive testing** - Focus on repository and service layer integration tests
5. **Update documentation** - Ensure API docs reflect new camelCase conventions

This migration will modernize the codebase to follow JavaScript/TypeScript conventions while minimizing risk to the existing database and deployed systems.