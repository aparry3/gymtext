# Testing Guide

This guide explains how to run tests for the GymText application.

## Quick Start

For most development work, you can run tests directly with vitest:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with UI
pnpm test:ui

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Generate coverage report
pnpm test:coverage
```

## Test Database Setup

### Automatic Setup

Tests automatically handle database setup and cleanup:
- **Unit tests**: No database required
- **Integration tests**: Create isolated test databases per test file
- Each test gets a clean database that's automatically removed after

### Configuration (Optional)

Create `.env.test.local` to override default test database settings:
```env
# Default: postgresql://postgres:postgres@localhost:5432/gymtext_test
DATABASE_URL=postgresql://your-user:your-pass@localhost:5432/your_test_db
```

### Option 2: Docker (Good for CI/CD)

Use Docker when you want complete isolation:

```bash
# Run all tests with Docker
pnpm test:docker

# Run specific test suites
pnpm test:docker:unit
pnpm test:docker:integration

# Keep containers running for debugging
pnpm test:docker:watch
```

## Test Structure

```
tests/
├── unit/              # Unit tests (no database required)
├── integration/       # Integration tests (requires database)
├── fixtures/          # Test data builders
├── mocks/            # Service mocks
├── utils/            # Test utilities
└── setup/            # Test environment setup
```

## Writing Tests

### Unit Tests
Unit tests don't require a database and test individual functions/classes:

```typescript
// tests/unit/server/utils/timezone.test.ts
import { describe, it, expect } from 'vitest';
import { isValidIANATimezone } from '@/server/utils/timezone';

describe('isValidIANATimezone', () => {
  it('should validate correct timezones', () => {
    expect(isValidIANATimezone('America/New_York')).toBe(true);
  });
});
```

### Integration Tests
Integration tests require a database and test multiple components:

```typescript
// tests/integration/daily-messages/timezone-scenarios.test.ts
import { withTestDatabase } from '@/tests/utils/db';

describe('Daily Message Scenarios', () => {
  it('should send messages at correct times', async () => {
    await withTestDatabase(async (db) => {
      // Test implementation
    });
  });
});
```

## Environment Variables

Tests use environment variables from these sources (in order of priority):
1. `.env.test.local` (create this for local overrides)
2. `.env.test` (default test configuration)
3. Hardcoded defaults in `tests/setup/test-environment.ts`

## Troubleshooting

### Database Connection Errors
If you see `ECONNREFUSED` errors:
1. Ensure PostgreSQL is running
2. Check your database credentials in `.env.test.local`
3. Run `pnpm test:setup` to create the test database

### Slow Tests
- Use `pnpm test:unit` to run only unit tests (faster)
- Use `.only` to run specific tests during development
- Consider using Docker only for CI/CD

### Test Isolation Issues
- Tests should clean up after themselves
- Use `withTestDatabase` for integration tests
- Each test gets a fresh database transaction

## Best Practices

1. **Use the right test type:**
   - Unit tests for pure functions and business logic
   - Integration tests for database operations and API endpoints

2. **Mock external services:**
   - All external services (Twilio, Stripe, etc.) are mocked
   - See `tests/mocks/` for mock implementations

3. **Use test fixtures:**
   - Use builders in `tests/fixtures/` for test data
   - Don't hardcode test data in tests

4. **Keep tests fast:**
   - Prefer unit tests over integration tests
   - Use database transactions for cleanup
   - Mock time-intensive operations

5. **Database isolation:**
   - Each integration test file gets its own database
   - Databases are automatically created and destroyed
   - No manual cleanup required
   - Tests run in parallel safely

## CI/CD

For CI/CD pipelines, use the Docker approach:

```yaml
# Example GitHub Actions
- name: Run tests
  run: pnpm test:docker
```

This ensures consistent test environments across different CI runners.