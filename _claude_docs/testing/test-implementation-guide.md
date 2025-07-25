# Test Implementation Guide

## Step-by-Step Setup Instructions

This guide provides detailed steps to implement the test suite for GymText.

## Phase 1: Enhanced Test Configuration (Week 1)

### Step 1: Update package.json with test scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --config vitest.config.unit.mts",
    "test:integration": "vitest run --config vitest.config.integration.mts",
    "test:watch": "vitest watch"
  }
}
```

### Step 2: Install additional testing dependencies

```bash
pnpm add -D @testing-library/react @testing-library/dom @testing-library/user-event \
  @faker-js/faker @vitest/coverage-v8 \
  node-mocks-http next-test-api-route-handler \
  better-sqlite3 @types/better-sqlite3
```

### Step 3: Create workspace configuration

Create `vitest.workspace.ts`:

```typescript
import { defineWorkspace } from 'vitest/config';
import { resolve } from 'path';

export default defineWorkspace([
  {
    extends: './vitest.config.mts',
    test: {
      name: 'unit',
      include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
      environment: 'node',
    },
  },
  {
    extends: './vitest.config.mts',
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
      environment: 'node',
      setupFiles: ['./tests/setup/integration-setup.ts'],
      testTimeout: 30000,
    },
  },
  {
    extends: './vitest.config.mts',
    test: {
      name: 'components',
      include: ['tests/unit/components/**/*.{test,spec}.{tsx,ts}'],
      environment: 'jsdom',
      setupFiles: ['./tests/setup/component-setup.ts'],
    },
  },
]);
```

### Step 4: Update main Vitest configuration

Update `vitest.config.mts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'src/server/models/_types/**', // Generated files
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
```

### Step 5: Create test directory structure

```bash
mkdir -p tests/{unit,integration,fixtures,mocks,setup}
mkdir -p tests/unit/{server/{repositories,services,agents,utils},components/{pages,ui},shared/utils}
mkdir -p tests/integration/{api,workflows,database,external}
```

## Phase 2: Test Utilities and Helpers (Week 1)

### Step 1: Create test database setup

Create `tests/setup/test-database.ts`:

```typescript
import { Kysely, SqliteDialect, Migrator, FileMigrationProvider } from 'kysely';
import SQLite from 'better-sqlite3';
import { Database } from '@/server/models/_types';
import * as path from 'path';
import * as fs from 'fs/promises';

export function createTestDatabase(): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(':memory:'),
    }),
  });
}

export async function migrateTestDatabase(db: Kysely<Database>) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../../migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();
  
  if (error) {
    throw error;
  }
  
  return results;
}

export async function seedTestDatabase(db: Kysely<Database>) {
  // Add default test data
  await db.insertInto('users').values({
    id: 'test-user-1',
    phone_number: '+1234567890',
    created_at: new Date(),
  }).execute();
}
```

### Step 2: Create mock factories

Create `tests/mocks/external-services.ts`:

```typescript
import { vi } from 'vitest';

export function createMockTwilioClient() {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        sid: 'SM_test_123',
        status: 'sent',
        to: '',
        from: '',
        body: '',
      }),
    },
  };
}

export function createMockStripeClient() {
  return {
    customers: {
      create: vi.fn().mockResolvedValue({
        id: 'cus_test_123',
      }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'sub_test_123',
        status: 'active',
      }),
    },
  };
}

export function createMockLLM(responses: string[] = []) {
  let callIndex = 0;
  return {
    invoke: vi.fn().mockImplementation(async () => ({
      content: responses[callIndex++] || 'Default test response',
    })),
    stream: vi.fn(),
  };
}
```

### Step 3: Create test data builders

Create `tests/fixtures/builders.ts`:

```typescript
import { v4 as uuidv4 } from 'uuid';

export class UserBuilder {
  private user = {
    id: uuidv4(),
    phone_number: '+1234567890',
    stripe_customer_id: null as string | null,
    created_at: new Date(),
  };

  withId(id: string) {
    this.user.id = id;
    return this;
  }

  withPhoneNumber(phone: string) {
    this.user.phone_number = phone;
    return this;
  }

  withStripeCustomer(id: string) {
    this.user.stripe_customer_id = id;
    return this;
  }

  build() {
    return { ...this.user };
  }
}

export class FitnessProfileBuilder {
  private profile = {
    id: uuidv4(),
    user_id: '',
    name: 'Test User',
    age: 30,
    fitness_level: 'intermediate' as const,
    primary_goal: 'muscle_building' as const,
    available_days_per_week: 4,
    available_equipment: ['barbell', 'dumbbells'],
    created_at: new Date(),
  };

  forUser(userId: string) {
    this.profile.user_id = userId;
    return this;
  }

  withFitnessLevel(level: 'beginner' | 'intermediate' | 'advanced') {
    this.profile.fitness_level = level;
    return this;
  }

  withGoal(goal: 'muscle_building' | 'weight_loss' | 'strength' | 'endurance') {
    this.profile.primary_goal = goal;
    return this;
  }

  build() {
    return { ...this.profile };
  }
}

export class WorkoutBuilder {
  private workout = {
    id: uuidv4(),
    microcycle_id: '',
    name: 'Test Workout',
    day_of_week: 1,
    exercises: [] as any[],
    created_at: new Date(),
  };

  addExercise(exercise: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }) {
    this.workout.exercises.push({
      id: uuidv4(),
      ...exercise,
      rest_seconds: 90,
      notes: '',
    });
    return this;
  }

  build() {
    return { ...this.workout };
  }
}
```

### Step 4: Create component test setup

Create `tests/setup/component-setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/test',
}));

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
```

### Step 5: Create integration test setup

Create `tests/setup/integration-setup.ts`:

```typescript
import { config } from 'dotenv';
import { beforeAll } from 'vitest';

beforeAll(() => {
  // Load test environment variables
  config({ path: '.env.test' });
  
  // Set test-specific environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = ':memory:';
});
```

## Phase 3: Initial Test Implementation (Week 2)

### Repository Tests

Create `tests/unit/server/repositories/userRepository.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository } from '@/server/repositories/userRepository';
import { createTestDatabase } from '@tests/setup/test-database';
import { UserBuilder } from '@tests/fixtures/builders';

describe('UserRepository', () => {
  let repository: UserRepository;
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(async () => {
    db = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new UserRepository(db);
  });

  describe('findByPhoneNumber', () => {
    it('should find user by phone number', async () => {
      // Arrange
      const testUser = new UserBuilder()
        .withPhoneNumber('+1234567890')
        .build();
      
      await db.insertInto('users').values(testUser).execute();

      // Act
      const foundUser = await repository.findByPhoneNumber('+1234567890');

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.phone_number).toBe('+1234567890');
    });

    it('should return null when user not found', async () => {
      const foundUser = await repository.findByPhoneNumber('+9999999999');
      expect(foundUser).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const newUser = await repository.create({
        phone_number: '+1234567890',
      });

      expect(newUser).toBeDefined();
      expect(newUser.id).toBeDefined();
      expect(newUser.phone_number).toBe('+1234567890');
    });
  });
});
```

### Service Tests

Create `tests/unit/server/services/conversationService.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationService } from '@/server/services/conversationService';
import { createMock } from '@tests/mocks/utils';

describe('ConversationService', () => {
  let service: ConversationService;
  let mockDeps: any;

  beforeEach(() => {
    mockDeps = {
      chatService: createMock(['generateResponse']),
      messageService: createMock(['saveUserMessage', 'saveAssistantMessage']),
      conversationRepo: createMock(['findOrCreate']),
    };
    
    service = new ConversationService(mockDeps);
  });

  describe('handleIncomingMessage', () => {
    it('should process message and return response', async () => {
      // Arrange
      mockDeps.conversationRepo.findOrCreate.mockResolvedValue({
        id: 'conv-123',
        user_id: 'user-123',
      });
      
      mockDeps.chatService.generateResponse.mockResolvedValue({
        content: 'Here is your workout for today...',
        tokens: 150,
      });

      // Act
      const response = await service.handleIncomingMessage({
        userId: 'user-123',
        message: 'What is my workout?',
      });

      // Assert
      expect(response.content).toContain('workout');
      expect(mockDeps.messageService.saveUserMessage).toHaveBeenCalled();
      expect(mockDeps.messageService.saveAssistantMessage).toHaveBeenCalled();
    });
  });
});
```

### API Route Tests

Create `tests/integration/api/sms.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import * as smsRoute from '@/app/api/sms/route';
import { setupTestEnvironment } from '@tests/setup/test-environment';

describe('POST /api/sms', () => {
  let testEnv: any;

  beforeEach(async () => {
    testEnv = await setupTestEnvironment();
  });

  it('should handle incoming SMS', async () => {
    await testApiHandler({
      appHandler: smsRoute,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: '+1234567890',
            Body: 'Hello',
            MessageSid: 'SM123',
          }),
        });

        const text = await response.text();
        
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/xml');
        expect(text).toContain('<Response>');
        expect(text).toContain('<Message>');
      },
    });
  });
});
```

## Phase 4: Continuous Integration (Week 2)

### GitHub Actions Configuration

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: gymtext_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run linting
        run: pnpm lint
        
      - name: Run type checking
        run: pnpm build
        
      - name: Run unit tests
        run: pnpm test:unit
        env:
          NODE_ENV: test
          
      - name: Run integration tests
        run: pnpm test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/gymtext_test
          
      - name: Generate coverage report
        run: pnpm test:coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Phase 5: Testing Best Practices Documentation

### Create test writing guidelines

Create `tests/TESTING_GUIDELINES.md`:

```markdown
# Testing Guidelines for GymText

## Writing Good Tests

### 1. Test Structure
- Use descriptive test names that explain the scenario
- Follow AAA pattern: Arrange, Act, Assert
- One assertion focus per test (multiple expects are OK if testing one concept)

### 2. Test Data
- Use builders for creating test data
- Keep test data minimal but realistic
- Don't use production data

### 3. Mocking
- Mock at the boundary (external services)
- Don't mock what you're testing
- Keep mocks simple and focused

### 4. Async Testing
- Always use async/await for clarity
- Handle both success and failure cases
- Test loading states when applicable

### 5. Coverage
- Aim for behavior coverage, not line coverage
- Test edge cases and error paths
- Don't test implementation details

## Running Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run specific file
pnpm test user.repository.test.ts

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Debugging Tests

1. Use `it.only` to focus on a single test
2. Add console.logs temporarily
3. Use the Vitest UI for visual debugging
4. Check test output for detailed error messages

## Common Patterns

### Testing with Time
```typescript
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01'));
// ... test code
vi.useRealTimers();
```

### Testing Errors
```typescript
await expect(someAsyncFunction()).rejects.toThrow('Expected error');
```

### Testing Events
```typescript
const handleClick = vi.fn();
render(<Button onClick={handleClick} />);
fireEvent.click(screen.getByRole('button'));
expect(handleClick).toHaveBeenCalledOnce();
```
```

## Troubleshooting Common Issues

### 1. Module Resolution Errors
If you get module resolution errors, ensure:
- The `@` alias is configured in both `tsconfig.json` and `vitest.config.mts`
- The `@tests` alias points to the test directory
- You're using the correct import paths

### 2. Database Connection Issues
For database-related tests:
- Ensure migrations are up to date
- Check that test database is properly isolated
- Verify connection strings in test environment

### 3. Async Test Timeouts
If tests are timing out:
- Increase timeout for integration tests (30s default)
- Check for unresolved promises
- Ensure all async operations are awaited

### 4. Mock Not Working
If mocks aren't being applied:
- Check that vi.mock() is at the top level
- Ensure the module path is correct
- Clear mocks between tests with vi.clearAllMocks()

## Next Steps

After implementing this test suite:

1. **Run initial tests**: `pnpm test:run`
2. **Check coverage**: `pnpm test:coverage`
3. **Set up pre-commit hooks**: Use husky to run tests before commits
4. **Monitor CI/CD**: Ensure all tests pass in GitHub Actions
5. **Iterate**: Add tests as you add features

Remember: Good tests are an investment in code quality and developer confidence. They should make refactoring easier, not harder.