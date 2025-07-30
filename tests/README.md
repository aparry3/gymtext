# GymText Test Suite

## Overview

This directory contains the test suite for GymText, including unit tests, integration tests, and test utilities.

## Test Environment Setup

### Using Docker (Recommended)

The easiest way to run tests is using the containerized environment:

```bash
# Run all tests in Docker
pnpm test:docker

# Run only unit tests
pnpm test:docker:unit

# Run only integration tests
pnpm test:docker:integration

# Run tests in watch mode (keeps container running)
pnpm test:docker:watch

# Run tests with coverage
pnpm test:docker:coverage
```

The Docker setup:
- Automatically starts a PostgreSQL container on port 5433
- Runs migrations before tests
- Cleans up after tests (unless using watch mode)
- Uses the same environment across all developers

### Manual Setup

If you prefer to run PostgreSQL locally:

1. Create test database:
   ```bash
   createdb gymtext_test
   ```

2. Update `.env.test` to use port 5432 (default PostgreSQL port)

3. Run migrations:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gymtext_test pnpm migrate:up
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

## Test Structure

```
tests/
├── fixtures/          # Test data builders and mock data
├── mocks/            # External service mocks (Twilio, Stripe, etc.)
├── unit/             # Unit tests
├── integration/      # Integration tests
├── utils/            # Test utilities
└── setup/            # Test environment setup
```

## Writing Tests

### Unit Tests
- Test individual functions/methods in isolation
- Mock all external dependencies
- Fast execution
- Located in `tests/unit/`

### Integration Tests
- Test complete workflows
- Use real database (test database)
- Mock external services (Twilio, Stripe, etc.)
- Located in `tests/integration/`

## Test Utilities

### Fixtures
Use builders for creating test data:
```typescript
import { UserBuilder } from '@/tests/fixtures/users';

const user = new UserBuilder()
  .withName('John Doe')
  .withTimezone('America/New_York')
  .withPreferredSendHour(9)
  .build();
```

### Mocks
External services are automatically mocked:
- Twilio: `tests/mocks/twilio.ts`
- Stripe: `tests/mocks/stripe.ts`
- OpenAI/LLM: `tests/mocks/llm.ts`

## Debugging Tests

1. Use Vitest UI for visual debugging:
   ```bash
   pnpm test:ui
   ```

2. Keep test container running for inspection:
   ```bash
   pnpm test:docker:watch
   # or
   KEEP_TEST_DB=true pnpm test:docker
   ```

3. Connect to test database:
   ```bash
   psql postgresql://postgres:postgres@localhost:5433/gymtext_test
   ```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Mocking**: Mock external services, not internal modules
4. **Naming**: Use descriptive test names that explain the scenario
5. **Assertions**: Test both success and failure cases
6. **Performance**: Keep tests fast (< 1s for unit, < 5s for integration)

## Troubleshooting

### Port conflicts
If port 5433 is in use, update `docker-compose.test.yml` to use a different port.

### Container issues
```bash
# View logs
docker-compose -f docker-compose.test.yml logs

# Clean up containers and volumes
docker-compose -f docker-compose.test.yml down -v
```

### Migration failures
Ensure all migrations are compatible with a fresh database.

## Daily Message Testing

For the daily message feature specifically, see:
- `_claude_docs/DAILY_MESSAGE_TESTING.md` - Testing plan
- `_claude_docs/DAILY_MESSAGE_TEST_CHECKLIST.md` - Implementation checklist