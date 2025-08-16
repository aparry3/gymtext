# Cron Endpoint Testing Implementation Plan

## Overview
This document outlines the implementation plan for creating a comprehensive test script for the daily messages cron endpoint, including the ability to override test hours and dates for testing purposes.

## Current State Analysis

### Existing Implementation
- **Endpoint**: `/api/cron/daily-messages/route.ts`
- **Behavior**: 
  - Runs hourly via Vercel Cron
  - Uses current UTC hour to determine which users to process
  - Processes users whose local time matches their preferred send hour
  - Protected by `CRON_SECRET` in production

### Current Limitations for Testing
1. **Time Dependency**: Always uses `new Date()` for current time
2. **No Override Mechanism**: Cannot simulate different hours or dates
3. **Production Protection**: CRON_SECRET requirement makes local testing difficult
4. **No Isolated Test Mode**: Cannot test without affecting real users

## Proposed Solution

### 1. Refactoring Requirements

#### A. Add Test Parameters Support
Modify the cron endpoint to accept optional test parameters:
```typescript
interface TestParams {
  testMode?: boolean;
  testHour?: number;      // 0-23 (UTC)
  testDate?: string;      // ISO date string
  testUserIds?: string[]; // Specific users to test
  dryRun?: boolean;       // Simulate without sending messages
}
```

#### B. Environment-Based Configuration
```typescript
// Support test mode via environment or query params
const isTestMode = process.env.NODE_ENV !== 'production' || 
                   searchParams.get('testMode') === 'true';
```

#### C. Service Layer Refactoring
Modify `DailyMessageService.processHourlyBatch()` to accept optional parameters:
```typescript
interface ProcessOptions {
  currentUtcHour?: number;
  currentDate?: Date;
  userFilter?: string[];
  dryRun?: boolean;
}
```

### 2. Test Script Architecture

#### A. Core Test Script (`scripts/test-cron-daily-messages.ts`)
```typescript
class CronTestRunner {
  // Test scenarios
  async testSpecificHour(hour: number)
  async testSpecificDate(date: Date)
  async testUserTimezones()
  async testBatchProcessing()
  async testErrorHandling()
  async testDryRun()
  
  // Utilities
  async setupTestData()
  async cleanupTestData()
  async validateResults()
}
```

#### B. Test Data Management
```typescript
interface TestDataSetup {
  // Create test users with different timezones
  createTestUsers(): Promise<TestUser[]>
  
  // Create test fitness plans and workouts
  createTestPlans(): Promise<void>
  
  // Set up test conversations
  createTestConversations(): Promise<void>
}
```

### 3. Implementation Steps

#### Phase 1: Endpoint Refactoring
1. **Add query parameter parsing** to the cron endpoint
2. **Create test mode detection** logic
3. **Implement parameter passing** to service layer
4. **Add dry-run capability** to prevent actual SMS sending
5. **Create test response format** with detailed debugging info

#### Phase 2: Service Layer Updates
1. **Modify `processHourlyBatch`** to accept optional parameters
2. **Update `getUsersForHour`** to support test hour override
3. **Add user filtering** for testing specific users
4. **Implement dry-run mode** in message sending logic
5. **Add detailed logging** for test mode

#### Phase 3: Test Script Creation
1. **Create base test runner** class
2. **Implement test data generators**
3. **Add timezone testing** scenarios
4. **Create batch processing** tests
5. **Add error simulation** tests
6. **Implement result validation**

#### Phase 4: Test Utilities
1. **Create test database seeder**
2. **Add test cleanup utilities**
3. **Implement result analyzers**
4. **Create test report generator**

### 4. Test Scenarios

#### Scenario 1: Hour-Based Testing
```bash
pnpm test:cron --hour=8 --timezone="America/New_York"
# Tests users who should receive messages at 8 AM EST
```

#### Scenario 2: Date-Based Testing
```bash
pnpm test:cron --date="2024-01-15" --hour=10
# Tests as if it were a specific date and hour
```

#### Scenario 3: User-Specific Testing
```bash
pnpm test:cron --user-id="test-user-123" --dry-run
# Tests only for specific user without sending SMS
```

#### Scenario 4: Timezone Coverage Testing
```bash
pnpm test:cron --test-all-timezones
# Creates test users in all timezones and validates processing
```

#### Scenario 5: Error Handling Testing
```bash
pnpm test:cron --simulate-errors
# Tests error recovery and retry logic
```

### 5. Testing Interface

#### Command Line Interface
```bash
# Basic test
pnpm test:cron

# With specific hour (UTC)
pnpm test:cron --hour=14

# With specific date
pnpm test:cron --date="2024-01-15"

# Dry run mode
pnpm test:cron --dry-run

# Test specific users
pnpm test:cron --users="user1,user2,user3"

# Full test suite
pnpm test:cron --suite=full
```

#### Web Testing Interface (Optional)
Create a simple test dashboard at `/api/cron/daily-messages/test` (dev only):
- Hour selector
- Date picker
- User selector
- Dry run toggle
- Results viewer

### 6. Validation & Reporting

#### Test Results Structure
```typescript
interface TestResults {
  scenario: string;
  timestamp: Date;
  parameters: TestParams;
  results: {
    processed: number;
    failed: number;
    skipped: number;
    errors: TestError[];
  };
  validation: {
    expectedUsers: string[];
    actualUsers: string[];
    missingUsers: string[];
    unexpectedUsers: string[];
  };
  performance: {
    totalDuration: number;
    avgUserProcessTime: number;
    batchingEfficiency: number;
  };
}
```

#### Report Generation
- Console output with color coding
- JSON report file
- HTML report (optional)
- Slack/Discord notification (optional)

### 7. Safety Measures

#### Production Safeguards
1. **Test mode MUST be disabled in production**
2. **Test parameters only accepted in development**
3. **Test users should have special prefix** (e.g., "test_")
4. **Dry run by default** for test mode
5. **Rate limiting** for test requests

#### Data Isolation
1. **Use test-specific phone numbers** (Twilio test numbers)
2. **Mark test messages** in database
3. **Automatic cleanup** after tests
4. **Separate test conversation threads**

### 8. Configuration

#### Environment Variables
```env
# Test Mode Configuration
CRON_TEST_MODE=true
CRON_TEST_PHONE_NUMBERS=+1234567890,+0987654321
CRON_TEST_USER_PREFIX=test_
CRON_TEST_AUTO_CLEANUP=true
CRON_TEST_MAX_USERS=50
```

#### Test Configuration File
```typescript
// config/test.cron.ts
export const cronTestConfig = {
  testUsers: {
    count: 10,
    timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
    preferredHours: [6, 8, 10, 12, 18, 20]
  },
  scenarios: {
    hourly: true,
    daily: true,
    weekly: true,
    errorHandling: true
  },
  validation: {
    strict: true,
    allowPartialSuccess: false
  }
};
```

### 9. Development Workflow

1. **Run tests before deployment**
   ```bash
   pnpm test:cron --suite=pre-deploy
   ```

2. **Test after schema changes**
   ```bash
   pnpm db:migrate:up
   pnpm test:cron --validate-schema
   ```

3. **Performance testing**
   ```bash
   pnpm test:cron --perf --users=1000
   ```

4. **Integration testing**
   ```bash
   pnpm test:cron --integration --with-twilio
   ```

### 10. Implementation Priority

#### High Priority (Week 1)
1. ✅ Add test mode detection to endpoint
2. ✅ Implement hour override capability
3. ✅ Create basic test script
4. ✅ Add dry-run mode
5. ✅ Implement user filtering

#### Medium Priority (Week 2)
1. ⏳ Add date override capability
2. ⏳ Create test data generators
3. ⏳ Implement timezone testing
4. ⏳ Add validation logic
5. ⏳ Create test reports

#### Low Priority (Week 3+)
1. ⏳ Web testing interface
2. ⏳ Performance testing suite
3. ⏳ Advanced error simulation
4. ⏳ Integration with CI/CD
5. ⏳ Test result analytics

## Success Criteria

1. **Functional Requirements**
   - ✅ Can test any hour without waiting
   - ✅ Can test any date without changing system time
   - ✅ Can test specific users in isolation
   - ✅ Can run without sending actual SMS
   - ✅ Provides detailed test results

2. **Non-Functional Requirements**
   - ✅ Tests run in under 30 seconds
   - ✅ No impact on production data
   - ✅ Clear error messages
   - ✅ Reproducible results
   - ✅ Easy to use CLI interface

3. **Documentation Requirements**
   - ✅ Clear usage examples
   - ✅ Troubleshooting guide
   - ✅ Architecture documentation
   - ✅ Test scenario descriptions

## Next Steps

1. **Review and approve** this implementation plan
2. **Create feature branch** for cron testing
3. **Implement Phase 1** (endpoint refactoring)
4. **Create basic test script**
5. **Test and iterate**
6. **Document usage**
7. **Merge to main branch**

## Notes

- Consider using Jest or Vitest for test framework integration
- May want to add GitHub Actions workflow for automated testing
- Could integrate with monitoring tools (Datadog, Sentry)
- Consider adding test coverage metrics
- May need to update Twilio configuration for test numbers