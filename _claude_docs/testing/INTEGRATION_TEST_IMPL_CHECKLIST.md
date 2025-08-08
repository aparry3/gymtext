# Integration Test Implementation Checklist for GymText

## Prerequisites & Setup

### Database Test Infrastructure
- [x] Set up test database management utilities
  - [x] Create `tests/utils/db.ts` with test database creation/cleanup functions
  - [x] Implement isolated test database per test suite
  - [x] Add automatic migration runner for test databases
  - [x] Configure connection pooling for test environments

### Test Environment Configuration
- [x] Create separate test environment configurations
  - [x] Set up `vitest.config.integration.ts` for integration tests
  - [x] Configure test-specific environment variables
  - [x] Implement hybrid approach: SQLite for unit tests, PostgreSQL for integration
  - [ ] Add test database connection strings to CI/CD environment

### Mock Infrastructure
- [x] Create comprehensive mock strategies
  - [x] Build predictable LLM mock (`tests/mocks/llm.ts`)
  - [x] Create Twilio SMS mock for testing messaging
  - [x] Implement Stripe mock for payment testing
  - [x] Add Pinecone mock for vector search testing

## Critical Bug Fixes (Must Complete First)

### Session Type Mapping
- [x] Implement session type mapping layer
  - [x] Create `SESSION_TYPE_MAP` constant mapping LLM types to DB types
  - [x] Update `WorkoutInstanceModel.fromLLM()` to use mapping
  - [x] Add validation to ensure only valid DB enum values are inserted
  - [x] Write unit tests for session type mapping

### Model-Database Alignment
- [x] Fix WorkoutInstanceModel schema mismatches
  - [x] Add missing `goal` field to model
  - [x] Remove non-existent `targets` field from model
  - [x] Make `details` field required (non-nullable) in model
  - [x] Regenerate types with `pnpm db:codegen`

### API Error Standardization
- [x] Ensure all API routes return JSON errors
  - [x] Update checkout API error handling
  - [x] Create standard error response format
  - [x] Add middleware for consistent error formatting
  - [x] Test all error paths return proper JSON

## Core Integration Test Suites

### User Onboarding Flow Tests
- [ ] Checkout → User Creation flow
  - [ ] Test successful user creation via checkout API
  - [ ] Test fitness profile creation with user
  - [ ] Test Stripe subscription creation
  - [ ] Test welcome SMS sending
  - [ ] Test transaction rollback on partial failure

### Fitness Plan Generation Tests
- [ ] Complete plan hierarchy creation
  - [ ] Test fitness plan creation from user profile
  - [ ] Test mesocycle generation (verify count and structure)
  - [ ] Test microcycle breakdown from mesocycles
  - [ ] Test workout instance creation with proper constraints
  - [ ] Verify all foreign key relationships

### Workout Instance Tests
- [ ] Session type handling
  - [ ] Test LLM output → DB enum mapping
  - [ ] Test unique constraint (client_id, date, session_type)
  - [ ] Test JSONB details field serialization/deserialization
  - [ ] Test goal field population

### Daily Message Generation Tests
- [ ] Message creation workflow
  - [ ] Test daily workout message generation
  - [ ] Test context building from conversation history
  - [ ] Test personalization based on user profile
  - [ ] Test SMS delivery integration

## Data Integrity Tests

### Transaction Management
- [ ] Implement transaction tests
  - [ ] Test atomic user + profile + plan creation
  - [ ] Test rollback on LLM failure
  - [ ] Test rollback on constraint violations
  - [ ] Test nested transaction handling

### Foreign Key Constraints
- [ ] Test referential integrity
  - [ ] Test cascade deletes work properly
  - [ ] Test orphaned record prevention
  - [ ] Test constraint violation error handling
  - [ ] Test unique constraint enforcement

### JSON Data Handling
- [ ] JSONB field tests
  - [ ] Test workout details serialization
  - [ ] Test complex nested JSON structures
  - [ ] Test JSON parsing error handling
  - [ ] Test null vs empty object handling

## API Integration Tests

### Authentication & Authorization
- [ ] Test API authentication flows
  - [ ] Test phone number verification
  - [ ] Test JWT token generation/validation
  - [ ] Test protected route access
  - [ ] Test rate limiting

### Webhook Handling
- [ ] External service webhooks
  - [ ] Test Stripe webhook processing
  - [ ] Test Twilio SMS webhook handling
  - [ ] Test webhook signature validation
  - [ ] Test idempotency handling

### Error Scenarios
- [ ] API error handling
  - [ ] Test 400 Bad Request scenarios
  - [ ] Test 401 Unauthorized access
  - [ ] Test 404 Not Found handling
  - [ ] Test 500 Internal Server Error recovery

## External Service Integration Tests

### LLM Integration
- [ ] Test LLM service interactions
  - [ ] Test fitness plan generation prompts
  - [ ] Test chat response generation
  - [ ] Test prompt injection protection
  - [ ] Test LLM timeout handling
  - [ ] Test fallback behavior on LLM failure

### SMS Integration
- [ ] Test Twilio SMS functionality
  - [ ] Test outbound message sending
  - [ ] Test inbound message processing
  - [ ] Test conversation threading
  - [ ] Test rate limiting compliance

### Payment Integration
- [ ] Test Stripe payment flows
  - [ ] Test checkout session creation
  - [ ] Test subscription lifecycle
  - [ ] Test payment failure handling
  - [ ] Test subscription cancellation

## Performance & Load Tests

### Concurrent Operations
- [ ] Test system under load
  - [ ] Test concurrent user registrations
  - [ ] Test parallel fitness plan generations
  - [ ] Test bulk message processing
  - [ ] Test database connection pool limits

### Resource Management
- [ ] Test resource cleanup
  - [ ] Test database connection cleanup
  - [ ] Test memory leak detection
  - [ ] Test file handle management
  - [ ] Test background job queue processing

## Test Data Management

### Fixture Enhancement
- [ ] Update fixture builders
  - [ ] Align WorkoutInstanceBuilder with DB constraints
  - [ ] Create UserBuilder with valid phone numbers
  - [ ] Create FitnessPlanBuilder with complete hierarchy
  - [ ] Add builders for all major entities

### Seed Data
- [ ] Create realistic test data
  - [ ] Generate diverse user profiles
  - [ ] Create various fitness plan templates
  - [ ] Build conversation history samples
  - [ ] Add edge case data sets

## CI/CD Integration

### Pipeline Configuration
- [ ] Set up automated testing
  - [ ] Configure GitHub Actions for integration tests
  - [ ] Set up test database provisioning in CI
  - [ ] Add test result reporting
  - [ ] Configure test parallelization

### Test Execution Strategy
- [x] Optimize test running
  - [x] Separate unit and integration test runs
  - [ ] Implement test sharding for speed
  - [ ] Add test retry logic for flaky tests
  - [ ] Set up nightly full test runs

## Monitoring & Debugging

### Test Observability
- [ ] Add test instrumentation
  - [ ] Log test database queries in debug mode
  - [ ] Add timing metrics for slow tests
  - [ ] Capture failed test artifacts
  - [ ] Enable database query plan analysis

### Debug Utilities
- [ ] Create debugging helpers
  - [ ] Add database state snapshot utility
  - [ ] Create test data inspector tools
  - [ ] Add LLM prompt/response logger
  - [ ] Implement test replay functionality

## Documentation

### Test Documentation
- [x] Document testing approach
  - [x] Write integration test guide
  - [x] Document test data setup procedures
  - [x] Create troubleshooting guide
  - [x] Add examples for common test patterns

### Coverage Reporting
- [ ] Set up coverage tracking
  - [ ] Configure coverage for integration tests
  - [ ] Set coverage thresholds (90% critical paths)
  - [ ] Generate coverage reports in CI
  - [ ] Track coverage trends over time

## Success Criteria

### Metrics to Achieve
- [ ] 100% of database operations type-checked
- [ ] Zero constraint violations in test suite
- [ ] All API routes return consistent JSON errors
- [ ] 90% test coverage for critical user paths
- [ ] Integration test suite runs in < 30 seconds
- [ ] Zero flaky tests in CI

### Sign-off Requirements
- [ ] All critical bug fixes implemented
- [ ] Core user journeys have integration tests
- [ ] External service mocks are comprehensive
- [ ] Test data management is automated
- [ ] CI/CD pipeline runs all tests on PR
- [ ] Documentation is complete and current

## Priority Order

1. **Week 1**: Critical bug fixes (session types, model alignment, JSON errors)
2. **Week 1-2**: Test infrastructure and environment setup
3. **Week 2-3**: Core integration tests (user flow, fitness plans, workouts)
4. **Week 3-4**: External service tests and error scenarios
5. **Week 4**: Performance tests and CI/CD integration
6. **Ongoing**: Documentation and coverage improvements

## Notes

- Start with fixing the blocking issues before writing tests
- Use real PostgreSQL for integration tests to catch constraint issues
- Ensure all tests are idempotent and can run in parallel
- Focus on user-facing functionality first
- Keep test execution time under control with proper test data management