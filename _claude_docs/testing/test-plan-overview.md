# GymText Test Plan Overview

## Executive Summary

This document outlines a comprehensive testing strategy for the GymText application, a personalized fitness coaching platform that delivers workout plans via SMS. The test plan covers both unit and integration testing approaches, leveraging modern testing tools and best practices for Next.js 15 applications.

## Test Framework Selection

### Primary Framework: Vitest
- **Rationale**: Native Vite integration, excellent TypeScript support, faster execution than Jest
- **Environment**: Node for API/backend tests, jsdom for React components
- **Already installed**: Vitest is already a dev dependency with basic configuration

### Supporting Libraries
- **React Testing**: @testing-library/react, @testing-library/dom
- **API Testing**: next-test-api-route-handler, node-mocks-http
- **Mocking**: vitest built-in mocks, @faker-js/faker for test data
- **Database Testing**: kysely in-memory SQLite for unit tests

## Testing Philosophy

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Isolation**: Each test should be independent and not rely on external services
3. **Fast Feedback**: Unit tests should run in milliseconds, integration tests in seconds
4. **Meaningful Coverage**: Aim for 80%+ coverage on critical paths, not 100% everywhere
5. **Living Documentation**: Tests should serve as documentation for how the system works

## Test Types and Scope

### Unit Tests (70% of tests)
- Individual functions and methods
- React components in isolation
- Repository methods with mocked database
- Service layer business logic
- Utility functions and helpers

### Integration Tests (25% of tests)
- API route handlers
- Service + Repository interactions
- React components with context providers
- Agent chains with mocked LLMs
- Database migrations and schema

### E2E Tests (5% of tests) - Future Phase
- Critical user journeys (signup → subscription → workout delivery)
- SMS workflow testing
- Payment flows

## Directory Structure

```
gymtext/
├── tests/                      # Root test directory
│   ├── unit/                   # Unit tests mirroring src/ structure
│   │   ├── server/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── agents/
│   │   │   └── utils/
│   │   ├── components/
│   │   └── shared/
│   ├── integration/            # Integration tests
│   │   ├── api/               # API route tests
│   │   ├── workflows/         # Multi-component workflows
│   │   └── database/          # Database integration tests
│   ├── fixtures/              # Test data and fixtures
│   ├── mocks/                 # Shared mocks
│   └── setup/                 # Test setup and utilities
├── vitest.config.mts          # Vitest configuration
└── vitest.workspace.ts        # Workspace configuration for different test environments
```

## Critical Paths to Test

### 1. User Registration and Authentication
- Phone number validation and formatting
- User creation and profile setup
- Subscription management

### 2. SMS Conversation Flow
- Incoming message parsing
- Context building and memory
- AI response generation
- TwiML response formatting

### 3. Fitness Plan Generation
- User profile analysis
- Plan structure creation (mesocycle → microcycle → workouts)
- Progressive overload calculations

### 4. Daily Message Delivery
- Scheduled message generation
- Workout formatting
- Progress tracking

### 5. Payment Processing
- Stripe webhook handling
- Subscription status updates
- Access control

## Test Data Strategy

### Fixtures
- Predefined user profiles with various fitness levels
- Sample conversation histories
- Mock fitness plans with complete structure
- Test SMS messages covering edge cases

### Factories
- User factory with customizable attributes
- Conversation factory for different states
- Fitness plan factory with valid structures

### Seeds
- Database seeders for integration tests
- Consistent test data across environments

## Mocking Strategy

### External Services
- **Twilio**: Mock SMS sending/receiving
- **Stripe**: Mock payment events and webhooks
- **OpenAI/Gemini**: Mock LLM responses with predefined outputs
- **Pinecone**: Mock vector operations

### Internal Dependencies
- Repository mocks for service tests
- Service mocks for controller tests
- Time/Date mocking for scheduled operations

## CI/CD Integration

### Pre-commit Hooks
- Run affected unit tests
- Lint and type check

### Pull Request Pipeline
```yaml
- Install dependencies
- Run linting (pnpm lint)
- Run type checking (pnpm build)
- Run unit tests with coverage
- Run integration tests
- Generate coverage report
```

### Deployment Pipeline
- Full test suite execution
- Performance benchmarks
- Database migration tests

## Performance Considerations

### Test Execution Time Goals
- Unit tests: < 5 seconds total
- Integration tests: < 30 seconds total
- Single test file: < 100ms

### Optimization Strategies
- Parallel test execution
- Shared test database connections
- Minimal fixture data
- Selective test running based on changes

## Next Steps

1. Set up enhanced Vitest configuration
2. Create test utilities and helpers
3. Implement core unit tests for repositories
4. Add integration tests for critical API routes
5. Establish coverage reporting
6. Document testing conventions

## Success Metrics

- 80%+ code coverage on critical paths
- All tests passing in CI/CD
- < 1 minute total test execution time
- Zero flaky tests
- Clear test failure messages