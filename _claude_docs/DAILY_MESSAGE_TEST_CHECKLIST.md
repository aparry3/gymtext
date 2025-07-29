# Daily Message Testing Implementation Checklist

This checklist tracks the implementation of tests for the daily message timing feature based on the testing plan.

## Pre-Implementation Setup

- [ ] Review DAILY_MESSAGE_TESTING.md plan
- [ ] Ensure test database access is configured
- [ ] Verify `.env.test` has required variables
- [ ] Install any additional test dependencies if needed

## Phase 1: Test Infrastructure Updates

### 1.1 Update Test Fixtures
- [x] Extend UserBuilder in `tests/fixtures/users.ts`
  - [x] Add `withPreferredSendHour(hour: number)` method
  - [x] Add `withTimezone(timezone: string)` method
- [x] Create timezone-specific mock users
  - [x] New York user (UTC-5/4)
  - [x] Los Angeles user (UTC-8/7)
  - [x] London user (UTC+0/1)
  - [x] Tokyo user (UTC+9)
  - [x] Sydney user (UTC+10/11)
  - [x] Mumbai user (UTC+5:30)
  - [x] Edge case users (UTC+14, UTC-12)

### 1.2 Create Test Utilities
- [x] Create `tests/utils/daily-message-helpers.ts`
  - [x] `mockCurrentTime(date: Date)` function
  - [x] `advanceTimeByHours(hours: number)` function
  - [x] `createTestUserGrid()` function
  - [x] `createMessageTracker()` mock helper
  - [x] `expectMessageSentForUser()` assertion helper
  - [x] `expectDeliveredAtHour()` assertion helper

### 1.3 Update Mocks
- [x] Create/update Twilio mock for message tracking
- [x] Ensure MessageService mock captures sent messages
- [x] Mock workout instance queries appropriately

## Phase 2: Unit Tests

### 2.1 Timezone Utilities Tests
- [x] Create `tests/unit/server/utils/timezone.test.ts`
  - [x] Test `isValidIANATimezone()`
    - [x] Valid timezone strings
    - [x] Invalid timezone strings
    - [x] Edge cases (null, undefined, empty)
  - [x] Test `getLocalHourForTimezone()`
    - [x] All 24 UTC hours conversion
    - [x] Multiple timezone scenarios
    - [x] Date boundary handling
    - [x] DST transition cases
  - [x] Test `convertPreferredHourToUTC()`
    - [x] Standard timezone conversions
    - [x] Half-hour offset timezones
    - [x] DST aware conversions
  - [x] Test `getAllUTCHoursForLocalHour()`
    - [x] DST transition detection
    - [x] Year-round consistency check

### 2.2 UserRepository Tests
- [x] Update `tests/unit/server/repositories/userRepository.test.ts`
  - [x] Test `findUsersForHour()`
    - [x] Returns correct users for given UTC hour
    - [x] Filters out users with different preferred hours
    - [x] Only includes active subscriptions
    - [x] Handles multiple timezones correctly
    - [x] Returns empty array when no matches
    - [x] Handles invalid timezone data gracefully
  - [x] Test `updatePreferences()`
    - [x] Updates preferred send hour
    - [x] Updates timezone
    - [x] Validates hour range (0-23)
    - [x] Handles partial updates
    - [x] Updates timestamp correctly

### 2.3 DailyMessageService Tests
- [x] Create `tests/unit/server/services/dailyMessageService.test.ts`
  - [x] Test `processHourlyBatch()`
    - [x] Processes all eligible users
    - [x] Respects batch size limits
    - [x] Returns correct metrics
    - [x] Handles errors gracefully
    - [x] Logs appropriate information
  - [x] Test `sendDailyMessage()` (private method via processHourlyBatch)
    - [x] Sends message when workout exists
    - [x] Skips when no workout found
    - [x] Uses correct timezone for date calculation
    - [x] Handles message service errors
    - [x] Returns correct success/failure status
  - [x] Test `getTodaysWorkout()` (private method)
    - [x] Finds workout for correct date
    - [x] Respects timezone boundaries
    - [x] Returns null when no workout

## Phase 3: Integration Tests

### 3.1 Create Test Directory Structure
- [ ] Create `tests/integration/daily-messages/` directory
- [ ] Create `tests/integration/system/` directory

### 3.2 Timezone Scenarios Tests
- [ ] Create `tests/integration/daily-messages/timezone-scenarios.test.ts`
  - [ ] Test "Same Local Time, Different UTC Hours"
    - [ ] 8 AM delivery for users in different timezones
    - [ ] Verify only correct users receive messages
    - [ ] Check no users receive messages at wrong time
  - [ ] Test "Multiple Users Same UTC Hour"
    - [ ] Users in different timezones with coinciding delivery times
    - [ ] All eligible users receive messages
    - [ ] Batch processing handles volume
  - [ ] Test "No Users Should Receive"
    - [ ] UTC hours where no deliveries scheduled
    - [ ] Verify zero messages sent
    - [ ] System handles empty results gracefully

### 3.3 DST Transition Tests
- [ ] Create `tests/integration/daily-messages/dst-transitions.test.ts`
  - [ ] Test Spring Forward (March)
    - [ ] 2 AM gap handling
    - [ ] Messages delivered at correct adjusted time
    - [ ] No duplicate messages
    - [ ] Users with 2 AM preference handled correctly
  - [ ] Test Fall Back (November)
    - [ ] 2 AM occurring twice handling
    - [ ] Only one message sent per user
    - [ ] Correct hour selection
    - [ ] No missed messages

### 3.4 Edge Case Tests
- [ ] Create `tests/integration/daily-messages/edge-cases.test.ts`
  - [ ] Test Midnight Boundary
    - [ ] 11 PM local = next day UTC
    - [ ] 1 AM local = previous day UTC
    - [ ] Correct date assignment
  - [ ] Test Half-Hour Timezones
    - [ ] India (UTC+5:30)
    - [ ] Newfoundland (UTC-3:30)
    - [ ] Nepal (UTC+5:45)
    - [ ] Correct hour calculations
  - [ ] Test International Date Line
    - [ ] Kiribati (UTC+14)
    - [ ] Baker Island (UTC-12)
    - [ ] 26-hour spread handling

## Phase 4: System Tests

### 4.1 24-Hour Simulation
- [ ] Create `tests/integration/system/24-hour-simulation.test.ts`
  - [ ] Setup test users for all hours (0-23)
  - [ ] Create users across multiple timezones
  - [ ] Add active subscriptions for all users
  - [ ] Create workouts for all users
  - [ ] Simulate 24-hour period
    - [ ] Loop through each UTC hour
    - [ ] Run `processHourlyBatch()`
    - [ ] Track all sent messages
    - [ ] Verify correct delivery patterns
  - [ ] Assertions
    - [ ] Each user receives exactly one message
    - [ ] Messages sent at correct local time
    - [ ] No messages sent at wrong times
    - [ ] Total message count matches user count

### 4.2 Performance Tests
- [ ] Create performance test suite
  - [ ] Test with 1,000 users
  - [ ] Test with 10,000 users
  - [ ] Measure execution time
  - [ ] Check memory usage
  - [ ] Verify batch processing efficiency
  - [ ] Ensure < 5 minute execution time

## Phase 5: API Endpoint Tests

### 5.1 Cron Endpoint Tests
- [ ] Create `tests/integration/api/cron-daily-messages.test.ts`
  - [ ] Test authentication
    - [ ] Accepts valid CRON_SECRET
    - [ ] Rejects invalid secret
    - [ ] Rejects missing authorization
  - [ ] Test successful execution
    - [ ] Returns success response
    - [ ] Includes metrics in response
    - [ ] Processes messages correctly
  - [ ] Test error handling
    - [ ] Service errors handled gracefully
    - [ ] Returns 500 on fatal errors
    - [ ] Logs errors appropriately

### 5.2 User Preferences Endpoint Tests
- [ ] Create `tests/integration/api/user-preferences.test.ts`
  - [ ] Test GET endpoint
    - [ ] Returns current preferences
    - [ ] Calculates next delivery time
    - [ ] Handles missing user
    - [ ] Requires authentication
  - [ ] Test PUT endpoint
    - [ ] Updates preferred hour
    - [ ] Updates timezone
    - [ ] Validates timezone input
    - [ ] Validates hour range
    - [ ] Returns updated preferences
    - [ ] Handles invalid input

## Phase 6: Test Execution & Validation

### 6.1 Run Test Suites
- [ ] Run unit tests: `pnpm test`
  - [ ] All tests pass
  - [ ] No console errors
  - [ ] Coverage > 90%
- [ ] Run integration tests: `pnpm test:integration`
  - [ ] All tests pass
  - [ ] Database cleanup successful
  - [ ] No hanging connections
- [ ] Run specific test files during development
  - [ ] `pnpm test timezone.test.ts`
  - [ ] `pnpm test:integration timezone-scenarios.test.ts`

### 6.2 Coverage Analysis
- [ ] Generate coverage report: `pnpm test:coverage`
- [ ] Review uncovered code paths
- [ ] Add tests for missing coverage
- [ ] Document any intentionally uncovered code

### 6.3 Edge Case Validation
- [ ] Manually test with real timezone data
- [ ] Verify DST dates for current year
- [ ] Test with various Vercel regions
- [ ] Confirm production environment variables

## Phase 7: Documentation & Cleanup

### 7.1 Update Documentation
- [ ] Document any test-specific environment variables
- [ ] Add testing section to README
- [ ] Create troubleshooting guide for common test failures
- [ ] Document how to add new timezone test cases

### 7.2 Code Cleanup
- [ ] Remove any `console.log` statements
- [ ] Ensure all tests properly cleanup
- [ ] Verify no test pollution between runs
- [ ] Check for proper error messages in assertions

### 7.3 CI/CD Integration
- [ ] Add test commands to CI pipeline
- [ ] Configure test database for CI
- [ ] Set up coverage reporting
- [ ] Add test status badges to README

## Success Criteria

- [ ] All unit tests passing with >90% coverage
- [ ] All integration tests passing
- [ ] 24-hour simulation completes successfully
- [ ] Performance tests meet < 5 minute requirement
- [ ] No flaky tests (run 10x successfully)
- [ ] Test database properly isolated
- [ ] Mocks properly reset between tests

## Notes

- Always run `pnpm db:codegen` if database schema changes
- Use `pnpm test:ui` for debugging failing tests
- Integration tests require database access
- Mock external services (Twilio, Stripe) in all tests
- Use `vi.useFakeTimers()` for consistent time testing

---

**Checklist Version**: 1.0  
**Based on**: DAILY_MESSAGE_TESTING.md v1.0  
**Last Updated**: 2025-07-28  
**Status**: Ready to Begin Implementation