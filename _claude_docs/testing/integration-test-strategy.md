# Integration Test Strategy

## Overview

Integration tests verify that multiple components work correctly together. For GymText, this includes testing API routes, database interactions, service orchestration, and external API integrations.

## Test Environment Setup

### Database Configuration

Use an in-memory SQLite database for fast, isolated integration tests:

```typescript
// tests/setup/test-database.ts
import { Kysely, SqliteDialect } from 'kysely';
import SQLite from 'better-sqlite3';
import { Database } from '@/server/models/_types';

export function createTestDatabase(): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(':memory:'),
    }),
  });
}

export async function migrateTestDatabase(db: Kysely<Database>) {
  // Run migrations
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: require('fs'),
      path: require('path'),
      migrationFolder: path.join(__dirname, '../../migrations'),
    }),
  });
  
  await migrator.migrateToLatest();
}
```

### Test Utilities

```typescript
// tests/setup/integration-helpers.ts
import { createTestDatabase, migrateTestDatabase } from './test-database';
import { Kysely } from 'kysely';

export async function setupTestEnvironment() {
  const db = createTestDatabase();
  await migrateTestDatabase(db);
  
  return {
    db,
    cleanup: async () => {
      await db.destroy();
    },
  };
}

export function createTestContext(overrides = {}) {
  return {
    db: createTestDatabase(),
    twilioClient: createMockTwilioClient(),
    stripeClient: createMockStripeClient(),
    ...overrides,
  };
}
```

## API Route Testing

### 1. SMS Webhook Route (`tests/integration/api/sms.test.ts`)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/sms/route';
import { setupTestEnvironment } from '@tests/setup/integration-helpers';
import { UserBuilder, ConversationBuilder } from '@tests/fixtures/builders';

describe('POST /api/sms', () => {
  let testEnv: Awaited<ReturnType<typeof setupTestEnvironment>>;

  beforeEach(async () => {
    testEnv = await setupTestEnvironment();
    
    // Seed test user
    const user = new UserBuilder()
      .withPhoneNumber('+1234567890')
      .build();
    await testEnv.db.insertInto('users').values(user).execute();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  it('should handle incoming SMS and return TwiML response', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        From: '+1234567890',
        Body: 'What is my workout today?',
        MessageSid: 'SM123',
      },
    });

    const response = await POST(req);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/xml');
    expect(body).toContain('<Response>');
    expect(body).toContain('<Message>');
    
    // Verify conversation was saved
    const messages = await testEnv.db
      .selectFrom('messages')
      .selectAll()
      .execute();
    
    expect(messages).toHaveLength(2); // User message + AI response
  });

  it('should create new user for unknown phone number', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        From: '+9876543210',
        Body: 'Hello',
        MessageSid: 'SM456',
      },
    });

    const response = await POST(req);
    
    expect(response.status).toBe(200);
    
    // Verify user was created
    const user = await testEnv.db
      .selectFrom('users')
      .where('phone_number', '=', '+9876543210')
      .executeTakeFirst();
    
    expect(user).toBeDefined();
  });
});
```

### 2. Checkout Route (`tests/integration/api/checkout.test.ts`)

```typescript
import { next-test-api-route-handler } from 'next-test-api-route-handler';
import * as checkoutRoute from '@/app/api/checkout/route';

describe('POST /api/checkout', () => {
  it('should create Stripe checkout session', async () => {
    const mockStripe = {
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/cs_test_123',
          }),
        },
      },
    };

    await testApiHandler({
      appHandler: checkoutRoute,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'user-123',
            priceId: 'price_123',
          }),
        });

        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(data.url).toContain('checkout.stripe.com');
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
          customer: expect.any(String),
          line_items: expect.arrayContaining([]),
          mode: 'subscription',
        });
      },
    });
  });
});
```

## Service Integration Testing

### 1. Fitness Plan Generation Workflow

```typescript
// tests/integration/workflows/fitness-plan-generation.test.ts
describe('Fitness Plan Generation Workflow', () => {
  let testEnv: TestEnvironment;
  let fitnessPlanService: FitnessPlanService;
  let mesocycleService: MesocycleService;

  beforeEach(async () => {
    testEnv = await setupTestEnvironment();
    
    // Initialize services with test database
    const repos = {
      userRepo: new UserRepository(testEnv.db),
      fitnessPlanRepo: new FitnessPlanRepository(testEnv.db),
      mesocycleRepo: new MesocycleRepository(testEnv.db),
    };
    
    fitnessPlanService = new FitnessPlanService(repos);
    mesocycleService = new MesocycleService(repos);
  });

  it('should generate complete fitness plan with mesocycles', async () => {
    // Create test user with fitness profile
    const user = await createTestUser(testEnv.db, {
      fitnessProfile: {
        fitness_level: 'intermediate',
        primary_goal: 'muscle_building',
        available_days_per_week: 4,
        available_equipment: ['barbell', 'dumbbells', 'pull_up_bar'],
      },
    });

    // Generate fitness plan
    const plan = await fitnessPlanService.generatePlan(user.id);
    
    // Verify plan structure
    expect(plan).toMatchObject({
      user_id: user.id,
      name: expect.stringContaining('Muscle Building'),
      duration_weeks: 12,
      status: 'active',
    });

    // Verify mesocycles were created
    const mesocycles = await mesocycleService.getMesocyclesByPlanId(plan.id);
    expect(mesocycles).toHaveLength(3);
    expect(mesocycles[0]).toMatchObject({
      phase_type: 'hypertrophy',
      week_number: 1,
      duration_weeks: 4,
    });

    // Verify microcycles were created
    const microcycles = await testEnv.db
      .selectFrom('microcycles')
      .where('mesocycle_id', '=', mesocycles[0].id)
      .selectAll()
      .execute();
    
    expect(microcycles).toHaveLength(4); // 4 weeks
  });
});
```

### 2. Daily Message Generation Workflow

```typescript
// tests/integration/workflows/daily-message.test.ts
describe('Daily Message Generation Workflow', () => {
  it('should generate and format daily workout message', async () => {
    // Setup test data
    const { user, workout } = await setupTestWorkout(testEnv.db, {
      workoutDate: new Date('2024-01-15'),
      exercises: [
        { name: 'Squat', sets: 3, reps: 8, weight: 185 },
        { name: 'Leg Press', sets: 3, reps: 12, weight: 300 },
      ],
    });

    // Mock LLM response
    const mockAgent = {
      invoke: vi.fn().mockResolvedValue({
        content: 'Good morning! Ready to crush leg day? 💪',
      }),
    };

    const messageService = new DailyMessageService({
      db: testEnv.db,
      agent: mockAgent,
    });

    const message = await messageService.generateDailyMessage(user.id);
    
    expect(message).toContain('Good morning');
    expect(message).toContain('Squat: 3 sets x 8 reps @ 185 lbs');
    expect(mockAgent.invoke).toHaveBeenCalledWith({
      userProfile: expect.objectContaining({
        name: user.name,
      }),
      workout: expect.objectContaining({
        exercises: expect.arrayContaining([
          expect.objectContaining({ name: 'Squat' }),
        ]),
      }),
    });
  });
});
```

## Database Integration Testing

### 1. Migration Testing

```typescript
// tests/integration/database/migrations.test.ts
describe('Database Migrations', () => {
  it('should run all migrations successfully', async () => {
    const db = createTestDatabase();
    
    // Run migrations
    const { results, error } = await migrator.migrateToLatest();
    
    expect(error).toBeUndefined();
    expect(results).toBeDefined();
    
    // Verify schema
    const tables = await db.introspection.getTables();
    const tableNames = tables.map(t => t.name);
    
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('fitness_profiles');
    expect(tableNames).toContain('fitness_plans');
    expect(tableNames).toContain('conversations');
    
    await db.destroy();
  });

  it('should handle rollback correctly', async () => {
    const db = createTestDatabase();
    
    // Run migrations
    await migrator.migrateToLatest();
    
    // Rollback
    const { error } = await migrator.migrateDown();
    
    expect(error).toBeUndefined();
    
    await db.destroy();
  });
});
```

### 2. Repository Integration

```typescript
// tests/integration/database/repositories.test.ts
describe('Repository Integration', () => {
  describe('UserRepository with FitnessProfileRepository', () => {
    it('should handle cascading operations', async () => {
      const userRepo = new UserRepository(testEnv.db);
      const profileRepo = new FitnessProfileRepository(testEnv.db);
      
      // Create user
      const user = await userRepo.create({
        phone_number: '+1234567890',
      });
      
      // Create fitness profile
      const profile = await profileRepo.create({
        user_id: user.id,
        fitness_level: 'beginner',
        primary_goal: 'weight_loss',
      });
      
      // Fetch user with profile
      const userWithProfile = await userRepo.findWithProfile(user.id);
      
      expect(userWithProfile).toMatchObject({
        id: user.id,
        fitness_profile: {
          fitness_level: 'beginner',
          primary_goal: 'weight_loss',
        },
      });
    });
  });
});
```

## External Service Integration Testing

### 1. Twilio Integration (with mocks)

```typescript
// tests/integration/external/twilio.test.ts
describe('Twilio Service Integration', () => {
  it('should send SMS successfully', async () => {
    const mockTwilio = {
      messages: {
        create: vi.fn().mockResolvedValue({
          sid: 'SM123',
          status: 'sent',
          to: '+1234567890',
          from: '+0987654321',
          body: 'Test message',
        }),
      },
    };

    const twilioService = new TwilioService({
      client: mockTwilio as any,
      fromNumber: '+0987654321',
    });

    const result = await twilioService.sendMessage(
      '+1234567890',
      'Test message'
    );
    
    expect(result.status).toBe('sent');
    expect(mockTwilio.messages.create).toHaveBeenCalledWith({
      to: '+1234567890',
      from: '+0987654321',
      body: 'Test message',
    });
  });

  it('should handle Twilio errors gracefully', async () => {
    const mockTwilio = {
      messages: {
        create: vi.fn().mockRejectedValue(
          new Error('Invalid phone number')
        ),
      },
    };

    const twilioService = new TwilioService({
      client: mockTwilio as any,
      fromNumber: '+0987654321',
    });

    await expect(
      twilioService.sendMessage('invalid', 'Test')
    ).rejects.toThrow('Failed to send SMS');
  });
});
```

### 2. OpenAI/LLM Integration

```typescript
// tests/integration/external/llm.test.ts
describe('LLM Integration', () => {
  it('should handle chat completion with mocked responses', async () => {
    const mockLLM = new FakeLLM({
      responses: [
        'Here is your personalized workout plan...',
      ],
    });

    const chatAgent = new ChatAgent({ llm: mockLLM });
    
    const response = await chatAgent.invoke({
      message: 'Create a workout plan',
      context: {
        userProfile: { fitness_level: 'intermediate' },
      },
    });
    
    expect(response.content).toContain('workout plan');
    expect(mockLLM.getCallCount()).toBe(1);
  });
});
```

## Performance Testing

```typescript
// tests/integration/performance/load.test.ts
describe('Performance Tests', () => {
  it('should handle concurrent SMS requests', async () => {
    const requests = Array.from({ length: 10 }, (_, i) => ({
      From: `+123456789${i}`,
      Body: 'Test message',
      MessageSid: `SM${i}`,
    }));

    const startTime = Date.now();
    
    const responses = await Promise.all(
      requests.map(body =>
        POST(createMocks({ method: 'POST', body }).req)
      )
    );
    
    const duration = Date.now() - startTime;
    
    expect(responses).toHaveLength(10);
    expect(responses.every(r => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
  });
});
```

## Test Data Management

### Fixtures for Integration Tests

```typescript
// tests/fixtures/integration-data.ts
export async function createTestUser(
  db: Kysely<Database>,
  overrides: Partial<UserInput> = {}
): Promise<User> {
  const user = await db
    .insertInto('users')
    .values({
      phone_number: '+1234567890',
      created_at: new Date(),
      ...overrides,
    })
    .returningAll()
    .executeTakeFirst();

  if (overrides.fitnessProfile) {
    await db
      .insertInto('fitness_profiles')
      .values({
        user_id: user.id,
        ...overrides.fitnessProfile,
      })
      .execute();
  }

  return user;
}

export async function createTestConversation(
  db: Kysely<Database>,
  userId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Conversation> {
  const conversation = await db
    .insertInto('conversations')
    .values({
      user_id: userId,
      created_at: new Date(),
    })
    .returningAll()
    .executeTakeFirst();

  for (const message of messages) {
    await db
      .insertInto('messages')
      .values({
        conversation_id: conversation.id,
        role: message.role,
        content: message.content,
        created_at: new Date(),
      })
      .execute();
  }

  return conversation;
}
```

## Integration Test Configuration

### Vitest Workspace Configuration

```typescript
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: ['tests/unit/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.test.ts'],
      environment: 'node',
      setupFiles: ['./tests/setup/integration-setup.ts'],
      testTimeout: 30000, // 30 seconds for integration tests
      pool: 'forks', // Use separate processes for isolation
    },
  },
  {
    test: {
      name: 'components',
      include: ['tests/unit/components/**/*.test.tsx'],
      environment: 'jsdom',
      setupFiles: ['./tests/setup/component-setup.ts'],
    },
  },
]);
```

## Best Practices

### 1. Test Isolation
- Each test should create its own test data
- Clean up after each test
- Use transactions for rollback when possible

### 2. Realistic Test Data
- Use builders to create valid, realistic test data
- Test edge cases with appropriate fixtures
- Maintain referential integrity in test data

### 3. External Service Mocking
- Mock external services at the client level
- Use realistic mock responses
- Test both success and failure scenarios

### 4. Performance Considerations
- Keep integration tests focused
- Use in-memory databases when possible
- Parallelize independent tests
- Set appropriate timeouts

### 5. Debugging Integration Tests
```typescript
// Enable debug logging
DEBUG=gymtext:* pnpm test:integration

// Run specific test file
pnpm test:integration tests/integration/api/sms.test.ts

// Use test.only for focused debugging
it.only('debug this test', async () => {
  // Test implementation
});
```