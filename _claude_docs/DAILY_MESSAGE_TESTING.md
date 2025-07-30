# Daily Message Timing Testing Plan

## 1. Executive Summary

This document outlines a comprehensive testing strategy for the daily message timing feature. The tests will ensure that users receive their workout messages at their preferred local time, regardless of timezone, and that messages are NOT sent at incorrect times. This plan aligns with the existing Vitest testing infrastructure and follows established patterns in the codebase.

## 2. Existing Test Infrastructure

### 2.1 Current Setup
- **Test Runner**: Vitest with separate configs for unit and integration tests
- **Database**: Test database manager that creates isolated databases per test suite
- **Time Mocking**: `vi.useFakeTimers()` for controlling time in tests
- **Fixtures**: Builder pattern for creating test data (e.g., `UserBuilder`)
- **Environment**: Separate `.env.test` configuration

### 2.2 Key Test Utilities Available
```typescript
// Database utilities
withTestDatabase() // Creates isolated test database
seedTestData()     // Seeds test data respecting foreign keys
truncateAllTables() // Cleans up between tests

// Time utilities (from integration-test-environment.ts)
vi.useFakeTimers()
vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
```

## 3. Testing Objectives

### 3.1 Primary Goals
- Verify messages are sent at the correct local time for each user
- Ensure messages are NOT sent at incorrect times
- Validate timezone conversion accuracy
- Test edge cases including DST transitions
- Confirm system reliability across all 24 hours

### 3.2 Success Criteria
- 100% accuracy in message timing (±5 minutes)
- Zero messages sent at wrong times
- Proper handling of all timezone edge cases
- System stability under load

## 4. Test Categories

### 4.1 Unit Tests
- Timezone utility functions
- User query logic
- Time calculation functions
- Batch processing logic

### 4.2 Integration Tests
- End-to-end message delivery
- Database timezone queries
- Cron job execution
- API endpoint behavior

### 4.3 System Tests
- 24-hour simulation
- Multi-timezone scenarios
- DST transition handling
- Performance under load

## 5. Unit Test Plan

### 5.1 Test File Locations
Following the existing structure:
```
tests/
├── unit/
│   ├── server/
│   │   ├── utils/
│   │   │   └── timezone.test.ts
│   │   ├── repositories/
│   │   │   └── userRepository.test.ts (add new test cases)
│   │   └── services/
│   │       └── dailyMessageService.test.ts
│   └── shared/
│       └── utils/
│           └── timezone.test.ts (client-side utilities)
└── integration/
    ├── daily-messages/
    │   ├── timezone-scenarios.test.ts
    │   ├── dst-transitions.test.ts
    │   └── edge-cases.test.ts
    └── system/
        └── 24-hour-simulation.test.ts
```

### 5.2 Timezone Utilities (`tests/unit/server/utils/timezone.test.ts`)

#### Test Cases:
```typescript
describe('Timezone Utilities', () => {
  describe('isValidIANATimezone', () => {
    - ✓ Should return true for valid IANA timezones
    - ✓ Should return false for invalid timezones
    - ✓ Should handle null/undefined inputs
  });

  describe('getLocalHourForTimezone', () => {
    - ✓ Should convert UTC to correct local hour
    - ✓ Should handle all 24 UTC hours
    - ✓ Should work across date boundaries
    - ✓ Should handle DST transitions
  });

  describe('convertPreferredHourToUTC', () => {
    - ✓ Should convert local hour to UTC correctly
    - ✓ Should handle timezone offsets
    - ✓ Should account for DST
  });
});
```

### 5.3 UserRepository Tests (`tests/unit/server/repositories/userRepository.test.ts`)

#### Test Cases:
```typescript
describe('UserRepository - Daily Message Methods', () => {
  describe('findUsersForHour', () => {
    - ✓ Should find users whose local time matches UTC hour
    - ✓ Should NOT return users with different preferred hours
    - ✓ Should only return active subscriptions
    - ✓ Should handle multiple timezones in same query
    - ✓ Should handle empty results gracefully
  });

  describe('updatePreferences', () => {
    - ✓ Should update preferred send hour
    - ✓ Should update timezone
    - ✓ Should validate hour range (0-23)
    - ✓ Should reject invalid timezones
  });
});
```

### 5.4 DailyMessageService Tests (`tests/unit/server/services/dailyMessageService.test.ts`)

#### Test Cases:
```typescript
describe('DailyMessageService', () => {
  describe('processHourlyBatch', () => {
    - ✓ Should process all eligible users
    - ✓ Should skip users without workouts
    - ✓ Should handle errors gracefully
    - ✓ Should respect batch size limits
    - ✓ Should return accurate metrics
  });

  describe('sendDailyMessage', () => {
    - ✓ Should send message for valid workout
    - ✓ Should skip if no workout found
    - ✓ Should use correct timezone for date calculation
    - ✓ Should handle message service errors
  });
});
```

## 6. Integration Test Plan

### 6.1 Test Fixtures Enhancement

First, we need to update the UserBuilder to support timezone fields:

```typescript
// tests/fixtures/users.ts - Add to existing UserBuilder
export class UserBuilder {
  // ... existing code ...
  
  withPreferredSendHour(hour: number): UserBuilder {
    this.user.preferredSendHour = hour;
    return this;
  }
  
  withTimezone(timezone: string): UserBuilder {
    this.user.timezone = timezone;
    return this;
  }
}

// Add timezone-specific mock users
export const timezoneUsers = {
  newYork: () => new UserBuilder()
    .withId('user-ny')
    .withName('New York User')
    .withPhoneNumber('+12125551234')
    .withPreferredSendHour(8)
    .withTimezone('America/New_York')
    .build(),
    
  losAngeles: () => new UserBuilder()
    .withId('user-la')
    .withName('LA User')
    .withPhoneNumber('+13105551234')
    .withPreferredSendHour(8)
    .withTimezone('America/Los_Angeles')
    .build(),
    
  london: () => new UserBuilder()
    .withId('user-london')
    .withName('London User')
    .withPhoneNumber('+442075551234')
    .withPreferredSendHour(8)
    .withTimezone('Europe/London')
    .build(),
};
```

### 6.2 Timezone Scenarios (`tests/integration/daily-messages/timezone-scenarios.test.ts`)

#### Test Setup Using Existing Infrastructure:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { withTestDatabase, seedTestData } from '../../utils/db';
import { timezoneUsers } from '../../fixtures/users';
import { DailyMessageService } from '@/server/services/dailyMessageService';

describe('Daily Message Timezone Scenarios', () => {
  let testDb;
  let service: DailyMessageService;
  
  beforeEach(async () => {
    // Use the existing test database infrastructure
    testDb = await withTestDatabase(async (db) => {
      // Seed test users with different timezones
      await seedTestData(db, {
        users: [
          timezoneUsers.newYork(),
          timezoneUsers.losAngeles(),
          timezoneUsers.london(),
          // ... more users
        ],
        subscriptions: [
          // Active subscriptions for test users
        ],
        workoutInstances: [
          // Workouts for today for each user
        ]
      });
      
      return db;
    });
    
    service = new DailyMessageService();
  });
  
  afterEach(async () => {
    await testDb.cleanup();
  });
});
```

#### Test Scenarios:

##### Scenario 1: Same Local Time, Different UTC Hours
```typescript
it('should send messages at 8 AM local time for each timezone', async () => {
  // When UTC is 13:00 (1 PM)
  // - It's 8 AM in New York (UTC-5)
  // - It's 5 AM in LA (UTC-8) 
  // - It's 6 PM in London (UTC+0 with DST)
  // - It's 10 PM in Tokyo (UTC+9)
  
  const utcHour = 13;
  const results = await service.processHourlyBatch();
  
  expect(results.processed).toBe(1); // Only NY user
  expect(sentMessages).toContainUserId('user-ny');
  expect(sentMessages).not.toContainUserId('user-la');
});
```

##### Scenario 2: Multiple Users Same Hour
```typescript
it('should handle multiple users in different timezones at same UTC hour', async () => {
  // Set up users where their 8 AM coincides
  // Example: 8 AM in Mumbai (UTC+5:30) and 3:30 AM in London (UTC+0)
  // Both happen when UTC is 02:30
});
```

##### Scenario 3: No Users Should Receive
```typescript
it('should send zero messages when no users match current hour', async () => {
  // Test an hour where no user's preferred time matches
  const results = await service.processHourlyBatch();
  expect(results.processed).toBe(0);
});
```

### 6.3 DST Transition Tests (`tests/integration/daily-messages/dst-transitions.test.ts`)

#### Critical Test Cases:

##### Spring Forward (Lose an Hour)
```typescript
describe('DST Spring Forward', () => {
  it('should handle 2 AM gap when clocks spring forward', async () => {
    // On March 10, 2024, 2 AM becomes 3 AM in US Eastern
    // Users with 2 AM preference should receive at 3 AM local
  });

  it('should not double-send when UTC hour repeats after DST', async () => {
    // Ensure no duplicate messages
  });
});
```

##### Fall Back (Gain an Hour)
```typescript
describe('DST Fall Back', () => {
  it('should handle 2 AM occurring twice', async () => {
    // On November 3, 2024, 2 AM occurs twice
    // Should only send once
  });
});
```

### 6.4 Edge Case Tests (`tests/integration/daily-messages/edge-cases.test.ts`)

#### Test Cases:

##### Midnight Boundary
```typescript
it('should correctly handle midnight crossings', async () => {
  // User prefers 11 PM in timezone where it's next day in UTC
});
```

##### Half-Hour Timezones
```typescript
it('should support half-hour offset timezones', async () => {
  // Test India (UTC+5:30), Newfoundland (UTC-3:30)
});
```

##### International Date Line
```typescript
it('should handle date line crossings', async () => {
  // Test Kiribati (UTC+14) vs Baker Island (UTC-12)
});
```

## 7. System Test Plan

### 7.1 24-Hour Simulation Test (`tests/integration/system/24-hour-simulation.test.ts`)

```typescript
describe('24-Hour Full System Test', () => {
  it('should deliver messages correctly over 24-hour period', async () => {
    // Create test users for each hour (0-23) in different timezones
    const testUsers = createUsersForAllHours();
    
    // Simulate 24 hours
    for (let hour = 0; hour < 24; hour++) {
      mockCurrentUTCHour(hour);
      const results = await service.processHourlyBatch();
      
      // Verify only correct users received messages
      validateDeliveryForHour(hour, results);
    }
    
    // Ensure each user received exactly one message
    expect(getTotalMessagesPerUser()).toAllEqual(1);
  });
});
```

### 7.2 Performance Test

```typescript
describe('Performance Tests', () => {
  it('should handle 10,000 users within timeout', async () => {
    await createTestUsers(10000);
    const start = Date.now();
    const results = await service.processHourlyBatch();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(300000); // 5 minutes
    expect(results.failed).toBeLessThan(results.processed * 0.01); // <1% failure
  });
});
```

## 8. Test Data Requirements

### 8.1 Test User Matrix

| User ID | Timezone | Preferred Hour | Purpose |
|---------|----------|----------------|---------|
| test-utc-0 | UTC | 0 | Midnight UTC |
| test-ny-8 | America/New_York | 8 | Morning EST/EDT |
| test-la-8 | America/Los_Angeles | 8 | Morning PST/PDT |
| test-london-8 | Europe/London | 8 | Morning GMT/BST |
| test-tokyo-8 | Asia/Tokyo | 8 | Morning JST |
| test-mumbai-8 | Asia/Kolkata | 8 | Half-hour offset |
| test-kiribati-8 | Pacific/Kiritimati | 8 | UTC+14 edge |
| test-baker-8 | Etc/GMT+12 | 8 | UTC-12 edge |

### 8.2 Test Workout Data
- Each test user needs workout instances for test dates
- Workouts should be created with proper date boundaries

## 9. Test Execution Strategy

### 9.1 Local Testing
Using existing npm scripts:
```bash
# Run all unit tests
pnpm test

# Run specific unit test file
pnpm test timezone.test.ts

# Run integration tests
pnpm test:integration

# Run with UI (useful for debugging)
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

### 9.2 CI/CD Pipeline
- Run all unit tests on every commit
- Run integration tests on PR creation
- Run system tests nightly
- Generate coverage reports

### 9.3 Test Database Management
The test infrastructure automatically:
- Creates isolated test databases per test suite
- Runs migrations on test databases
- Cleans up after test completion
- No manual database setup required!

## 10. Expected Outcomes

### 10.1 Coverage Targets
- Unit Tests: >90% code coverage
- Integration Tests: All critical paths covered
- Edge Cases: 100% of identified scenarios

### 10.2 Bug Categories to Catch
1. **Timing Bugs**
   - Messages sent at wrong hour
   - Messages not sent at correct hour
   - Duplicate messages

2. **Timezone Bugs**
   - Incorrect timezone conversions
   - DST handling errors
   - Invalid timezone handling

3. **Data Bugs**
   - Missing workout associations
   - Incorrect user filtering
   - Subscription status errors

## 11. Test Maintenance

### 11.1 Ongoing Requirements
- Update test data for DST rule changes
- Add new timezone tests as users expand globally
- Performance baseline updates
- Regular test cleanup

### 11.2 Monitoring Production
- Track actual delivery times vs expected
- Monitor timezone distribution
- Alert on delivery anomalies

## 12. Appendix: Test Utilities

### 12.1 Time Mocking Utilities
Using Vitest's built-in time mocking:
```typescript
import { vi } from 'vitest';

// Mock current time for tests
export function mockCurrentTime(date: Date) {
  vi.useFakeTimers();
  vi.setSystemTime(date);
}

// Advance time by hours
export function advanceTimeByHours(hours: number) {
  const currentTime = new Date();
  currentTime.setHours(currentTime.getHours() + hours);
  vi.setSystemTime(currentTime);
}

// Helper to create test users across timezones
export function createTestUserGrid(hoursCount: number = 24) {
  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];
  
  return timezones.flatMap(timezone => 
    Array.from({ length: hoursCount }, (_, hour) => 
      new UserBuilder()
        .withTimezone(timezone)
        .withPreferredSendHour(hour)
        .build()
    )
  );
}
```

### 12.2 Assertion Helpers
```typescript
// Custom Vitest matchers
import { expect } from 'vitest';

// Helper to check if message was sent
export function expectMessageSentForUser(sentMessages: any[], userId: string) {
  const messageSent = sentMessages.some(msg => msg.userId === userId);
  expect(messageSent).toBe(true);
}

// Helper to check timing accuracy
export function expectDeliveredAtHour(deliveryTime: Date, expectedLocalHour: number, timezone: string) {
  const localTime = DateTime.fromJSDate(deliveryTime).setZone(timezone);
  expect(localTime.hour).toBe(expectedLocalHour);
}

// Mock message tracking
export function createMessageTracker() {
  const sentMessages: Array<{ userId: string; time: Date; message: string }> = [];
  
  vi.mock('@/server/services/messageService', () => ({
    MessageService: class {
      async sendMessage(user: any, message: string) {
        sentMessages.push({
          userId: user.id,
          time: new Date(),
          message
        });
        return message;
      }
    }
  }));
  
  return {
    getSentMessages: () => sentMessages,
    clear: () => sentMessages.length = 0
  };
}
```

---

**Document Version**: 1.0  
**Created**: 2025-07-28  
**Status**: Ready for Implementation  
**Next Steps**: Begin implementing test suites starting with unit tests