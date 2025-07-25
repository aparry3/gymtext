# Integration Testing Guide for GymText

This guide explains how to use the integration testing infrastructure for GymText.

## Prerequisites

1. **PostgreSQL**: You need a running PostgreSQL instance for integration tests
2. **Environment Setup**: Copy `.env.test.example` to `.env.test` and configure your test database

```bash
cp .env.test.example .env.test
# Edit .env.test with your test database credentials
```

## Running Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run integration tests in watch mode
pnpm test:integration:watch

# Run both unit and integration tests
pnpm test:all

# Run a specific integration test file
pnpm test:integration tests/integration/user-onboarding.test.ts
```

## Test Infrastructure Overview

### Database Management (`tests/utils/db.ts`)

The test database utilities provide isolated database instances for each test:

```typescript
import { withTestDatabase, seedTestData } from '../utils/db';

// Use a test database for a single test
await withTestDatabase(async (db) => {
  // Your test code here
  const user = await db.insertInto('users').values({...}).execute();
});

// Seed test data
await seedTestData(db, {
  users: [...],
  fitnessProfiles: [...],
});
```

### Mock Services

#### LLM Mock (`tests/mocks/llm-integration.ts`)

Pre-configured scenarios for testing AI interactions:

```typescript
import { createIntegrationLLMMock } from '../mocks/llm-integration';

// Use a predefined scenario
const mockLLM = createIntegrationLLMMock('userOnboarding');

// Or create a custom predictable LLM
const customLLM = new PredictableLLM()
  .addResponse(mockResponse1)
  .addResponse(mockResponse2)
  .addError(new Error('LLM failure'));
```

Available scenarios:
- `userOnboarding`: Complete onboarding flow responses
- `dailyConversation`: Daily workout conversation
- `errorScenarios`: Various error conditions
- `sessionTypeMapping`: Tests session type conversions

#### Twilio SMS Mock (`tests/mocks/twilio.ts`)

Test SMS functionality without sending real messages:

```typescript
import { createMockTwilio } from '../mocks/twilio';

const mockTwilio = createMockTwilio();

// Send a message
const message = await mockTwilio.messages.create({
  to: '+12125551234',
  from: process.env.TWILIO_NUMBER,
  body: 'Test message',
});

// Check sent messages
const sent = mockTwilio.getSentMessages();

// Simulate incoming SMS
const incoming = mockTwilio.simulateIncomingSMS(
  '+12125551234',
  'User response'
);
```

#### Stripe Mock (`tests/mocks/stripe.ts`)

Test payment flows without real transactions:

```typescript
import { createMockStripe } from '../mocks/stripe';

const mockStripe = createMockStripe();

// Create customer and subscription
const customer = await mockStripe.customers.create({...});
const session = await mockStripe.checkout.sessions.create({...});

// Complete checkout
const completed = mockStripe.completeCheckoutSession(session.id);

// Simulate webhook events
const event = mockStripe.createWebhookEvent('checkout.session.completed', {...});
```

#### Pinecone Mock (`tests/mocks/pinecone.ts`)

Test vector search without a real Pinecone instance:

```typescript
import { createMockPinecone } from '../mocks/pinecone';

const mockPinecone = createMockPinecone();
const index = mockPinecone.Index('test-index');

// Upsert vectors
await index.upsert({
  vectors: [{ id: 'vec1', values: [...], metadata: {...} }],
});

// Query vectors
const results = await index.query({
  vector: [...],
  topK: 10,
  filter: { type: 'workout' },
});
```

## Writing Integration Tests

### Test Structure

```typescript
describe('Feature: User Onboarding', () => {
  let mockLLM, mockTwilio, mockStripe, mockPinecone;

  beforeEach(() => {
    // Set up mocks
    mockLLM = createIntegrationLLMMock('userOnboarding');
    mockTwilio = createMockTwilio();
    mockStripe = createMockStripe();
    mockPinecone = createMockPinecone();
  });

  afterEach(() => {
    // Clean up
    mockLLM.reset();
    mockTwilio.reset();
    mockStripe.reset();
    mockPinecone.reset();
  });

  it('should complete user onboarding flow', async () => {
    await withTestDatabase(async (db) => {
      // Your test implementation
    });
  });
});
```

### Best Practices

1. **Database Isolation**: Each test gets its own database that's automatically cleaned up
2. **Predictable Mocks**: Use scenario-based mocks for consistent testing
3. **Transaction Testing**: Test rollback scenarios using `withTransaction`
4. **Error Testing**: Always test error paths and edge cases
5. **Cleanup**: Tests automatically clean up databases, but reset mocks in `afterEach`

### Common Patterns

#### Testing API Endpoints

```typescript
import { POST } from '@/app/api/checkout/route';

it('should create user via checkout API', async () => {
  await withTestDatabase(async (db) => {
    const response = await POST(new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    }));
    
    const data = await response.json();
    expect(response.status).toBe(200);
  });
});
```

#### Testing Service Layer

```typescript
import { FitnessPlanService } from '@/server/services/fitnessPlanService';

it('should generate fitness plan', async () => {
  await withTestDatabase(async (db) => {
    const service = new FitnessPlanService(db, mockLLM.getMock());
    
    const plan = await service.generatePlan(userId);
    expect(plan).toHaveProperty('id');
  });
});
```

#### Testing Transactions

```typescript
it('should rollback on failure', async () => {
  await withTestDatabase(async (db) => {
    await expect(
      withTransaction(db, async (trx) => {
        await trx.insertInto('users').values({...}).execute();
        throw new Error('Rollback test');
      })
    ).rejects.toThrow('Rollback test');
    
    // Verify nothing was saved
    const count = await db.selectFrom('users').select(db.fn.count('id')).executeTakeFirst();
    expect(count.count).toBe('0');
  });
});
```

## Troubleshooting

### Database Connection Issues

If you get connection errors:
1. Ensure PostgreSQL is running
2. Check your `.env.test` configuration
3. Verify the test user has CREATE DATABASE permissions

### Migration Failures

If migrations fail during test setup:
1. Check that all migration files are valid
2. Ensure the migrations directory exists
3. Verify `pnpm migrate:up` works in development

### Mock Not Working

If mocks aren't being used:
1. Ensure you're importing from the mock files
2. Call the mock creation functions before importing the code under test
3. Check that vi.mock() calls are at the module level

## CI/CD Integration

For GitHub Actions, add these environment variables:

```yaml
env:
  TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/gymtext_test
  # Add other test environment variables
```

Example workflow step:

```yaml
- name: Run Integration Tests
  run: |
    pnpm install
    pnpm test:integration
  env:
    DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
```