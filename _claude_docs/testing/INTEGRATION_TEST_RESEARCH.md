# Integration Test Research for GymText

## Executive Summary

This document presents findings from research into integration testing needs for GymText, including analysis of current implementation issues, type mismatches, database constraints, JSON parsing errors, and a comprehensive plan for implementing integration tests.

## Current Implementation Issues

### 1. Workout Instance Session Type Mismatch

**Issue**: Critical database constraint violation preventing workout creation.

**Details**:
- Database CHECK constraint expects session_type to be one of: `['strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload']`
- LLM schema (_WorkoutInstanceSchema) defines: `["run", "lift", "metcon", "mobility", "rest", "other"]`
- This mismatch causes INSERT failures when creating workout instances

**Impact**: Complete failure of fitness plan generation and daily workout message functionality.

### 2. Missing Model Fields

**Issue**: WorkoutInstanceModel is missing required database fields.

**Details**:
- Database has `goal` field (text, nullable) but model doesn't include it
- Model has `targets` field that doesn't exist in database
- Model allows `details` to be undefined, but database requires it (JSONB NOT NULL)

### 3. JSON Parsing Errors

**Issue**: API endpoints returning non-JSON responses on errors.

**Details**:
- Checkout API returns "Internal Server Error" as plain text on 500 errors
- Test scripts expect JSON responses and fail with "Unexpected token I in JSON at position 0"
- Error handling inconsistent across API routes

### 4. Foreign Key Constraints

**Issue**: Complex foreign key relationships causing cascading failures.

**Details**:
- workout_instances requires valid references to: users, fitness_plans, mesocycles, microcycles
- Unique constraint on (client_id, date, session_type) can cause duplicate key violations
- No proper transaction rollback in service layer

## Integration Testing Strategy

### 1. Database Testing Approach

**Recommended**: Hybrid approach using real PostgreSQL for critical paths and SQLite for unit tests.

```typescript
// Test environment setup
export const testEnvs = {
  unit: {
    // SQLite in-memory for fast, isolated unit tests
    dialect: new SqliteDialect({
      database: new SQLite(':memory:')
    })
  },
  integration: {
    // Real PostgreSQL for integration tests
    dialect: new PostgresDialect({
      pool: new Pool({
        database: `gymtext_test_${Date.now()}`,
        host: process.env.TEST_DB_HOST || 'localhost'
      })
    })
  }
};
```

### 2. Test Data Management

**Fixture Enhancement**: Align fixtures with database constraints.

```typescript
// Enhanced WorkoutInstanceBuilder
export class WorkoutInstanceBuilder {
  private workoutInstance: WorkoutInstance;
  
  constructor(overrides: Partial<WorkoutInstance> = {}) {
    this.workoutInstance = {
      // ... existing fields
      sessionType: 'strength', // Use valid DB enum value
      goal: 'Build strength and improve form', // Include missing field
      details: this.createValidDetails(), // Ensure JSONB structure
      // Remove 'targets' field that doesn't exist in DB
    };
  }
  
  private createValidDetails() {
    return {
      sessionType: 'lift', // This can still be the LLM value
      details: [/* ... */]
    };
  }
}
```

### 3. Critical Integration Test Scenarios

#### A. User Onboarding Flow
```typescript
describe('User Onboarding Integration', () => {
  it('should create user, profile, and fitness plan atomically', async () => {
    await db.transaction().execute(async (trx) => {
      // 1. Create user via checkout API
      const checkoutResponse = await POST('/api/checkout', userData);
      
      // 2. Verify user and profile created
      const user = await trx.selectFrom('users')
        .where('phone_number', '=', userData.phoneNumber)
        .executeTakeFirst();
      
      // 3. Create fitness plan
      const programResponse = await POST('/api/programs', { userId: user.id });
      
      // 4. Verify complete hierarchy created
      const plan = await trx.selectFrom('fitness_plans')
        .where('client_id', '=', user.id)
        .executeTakeFirst();
        
      const mesocycles = await trx.selectFrom('mesocycles')
        .where('fitness_plan_id', '=', plan.id)
        .execute();
        
      expect(mesocycles).toHaveLength(3); // Or expected count
    });
  });
});
```

#### B. Workout Generation with Proper Types
```typescript
describe('Workout Generation', () => {
  it('should map LLM session types to DB constraints', async () => {
    // Mock LLM to return known session types
    const mockLLM = createMockLLM([{
      microcycles: [{
        workouts: [{
          sessionType: 'lift', // LLM type
          details: [/* ... */]
        }]
      }]
    }]);
    
    // Service should map 'lift' -> 'strength'
    const workoutService = new WorkoutService({ llm: mockLLM });
    const workout = await workoutService.createWorkout(userId);
    
    // Verify DB has correct type
    const dbWorkout = await db.selectFrom('workout_instances')
      .where('id', '=', workout.id)
      .executeTakeFirst();
      
    expect(dbWorkout.session_type).toBe('strength'); // DB enum
  });
});
```

#### C. JSON Handling
```typescript
describe('JSON Data Integrity', () => {
  it('should properly serialize/deserialize workout details', async () => {
    const details = {
      sessionType: 'lift',
      details: [
        { label: 'Warm-up', activities: ['5 min bike'] }
      ]
    };
    
    // Create workout with JSON details
    const workout = await db.insertInto('workout_instances')
      .values({
        // ... other fields
        details: JSON.stringify(details) // Kysely handles this
      })
      .returningAll()
      .executeTakeFirst();
    
    // Verify retrieval
    expect(workout.details).toEqual(details);
  });
});
```

### 4. Error Handling Tests

```typescript
describe('API Error Responses', () => {
  it('should return consistent JSON errors', async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ /* invalid data */ })
    });
    
    expect(response.headers.get('content-type')).toContain('application/json');
    
    const error = await response.json();
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('error');
  });
});
```

### 5. Transaction Management

```typescript
describe('Transaction Rollback', () => {
  it('should rollback on partial failure', async () => {
    const userCount = await getUserCount();
    
    try {
      await db.transaction().execute(async (trx) => {
        // Create user
        const user = await createUser(trx);
        
        // Force failure in fitness plan creation
        mockLLM.mockRejectedValue(new Error('LLM failure'));
        
        await createFitnessPlan(trx, user.id);
      });
    } catch (error) {
      // Transaction should rollback
    }
    
    // Verify no data was persisted
    expect(await getUserCount()).toBe(userCount);
  });
});
```

## Implementation Plan

### Phase 1: Fix Critical Issues (Week 1)
1. Create session type mapping layer:
   ```typescript
   const SESSION_TYPE_MAP = {
     'lift': 'strength',
     'run': 'cardio',
     'metcon': 'cardio',
     'mobility': 'mobility',
     'rest': 'recovery',
     'other': 'recovery'
   };
   ```

2. Update WorkoutInstanceModel to match database schema
3. Standardize API error responses to always return JSON

### Phase 2: Test Infrastructure (Week 1-2)
1. Set up test database management utilities
2. Create enhanced fixture builders with proper constraints
3. Implement transaction-based test isolation
4. Add database migration tests

### Phase 3: Core Integration Tests (Week 2-3)
1. User onboarding flow (checkout → profile → subscription)
2. Fitness plan generation (plan → mesocycles → microcycles → workouts)
3. Daily message generation with proper workout data
4. SMS conversation flow with context building

### Phase 4: Error & Edge Cases (Week 3-4)
1. Constraint violation handling
2. LLM failure scenarios
3. Concurrent request handling
4. Rate limiting tests

### Phase 5: Performance & Load Tests (Week 4)
1. Concurrent user creation
2. Bulk workout generation
3. Message queue processing
4. Database connection pooling

## Recommended Tools & Configuration

### 1. Testing Stack
- **Vitest**: Already configured, fast and TypeScript-native
- **next-test-api-route-handler**: For testing Next.js API routes
- **pg-mem**: In-memory PostgreSQL for unit tests
- **Docker/TestContainers**: Real PostgreSQL for integration tests

### 2. Database Test Utilities
```typescript
// tests/utils/db.ts
export async function createTestDatabase() {
  const dbName = `test_${Date.now()}`;
  
  // Create database
  await adminDb.raw(`CREATE DATABASE ${dbName}`);
  
  // Run migrations
  const testDb = new Kysely({ /* config */ });
  await runMigrations(testDb);
  
  return {
    db: testDb,
    cleanup: async () => {
      await testDb.destroy();
      await adminDb.raw(`DROP DATABASE ${dbName}`);
    }
  };
}
```

### 3. Mock Strategies
```typescript
// tests/mocks/llm.ts
export function createPredictableLLM() {
  return {
    invoke: vi.fn()
      .mockResolvedValueOnce(mockFitnessPlanResponse)
      .mockResolvedValueOnce(mockMesocycleResponse)
      .mockResolvedValueOnce(mockDailyMessageResponse)
  };
}
```

## Success Metrics

1. **Type Safety**: 100% of database operations type-checked
2. **Constraint Compliance**: Zero constraint violations in tests
3. **Error Handling**: All API routes return consistent JSON errors
4. **Test Coverage**: 
   - 90% for critical paths (user creation, plan generation)
   - 80% for service layer
   - 70% for API routes
5. **Performance**: Integration tests complete in < 30 seconds
6. **Reliability**: Zero flaky tests

## Next Steps

1. Fix the session type mismatch immediately (blocking issue)
2. Update model definitions to match database schema
3. Implement session type mapping in WorkoutInstanceModel.fromLLM
4. Add integration tests for the fixed functionality
5. Set up CI/CD pipeline with test database provisioning

## Conclusion

The current implementation has several critical issues that prevent proper functionality, particularly around workout instance creation. By implementing the recommended fixes and following the integration testing strategy outlined above, GymText can achieve reliable, type-safe database operations with comprehensive test coverage.

The key insight is that the mismatch between LLM output schemas and database constraints requires a mapping layer, and all JSON data handling needs proper validation and error handling to prevent parsing failures.