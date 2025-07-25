# Unit Test Strategy

## Overview

This document outlines the unit testing approach for GymText, focusing on testing individual components in isolation with mocked dependencies.

## Test Structure Pattern

Each test file should follow this structure:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestSubject } from '@/path/to/subject';

// Mock external dependencies
vi.mock('@/server/connections', () => ({
  getDb: vi.fn(),
  twilioClient: vi.fn(),
}));

describe('TestSubject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle happy path scenario', async () => {
      // Arrange
      const input = { /* test data */ };
      const expected = { /* expected result */ };
      
      // Act
      const result = await testSubject.method(input);
      
      // Assert
      expect(result).toEqual(expected);
    });

    it('should handle error scenario', async () => {
      // Test error cases
    });
  });
});
```

## Component-Specific Testing Strategies

### 1. Repositories (`tests/unit/server/repositories/`)

**What to test:**
- Database query construction
- Data transformation (DB → Domain model)
- Error handling for database failures
- Query parameters and filtering

**Example: UserRepository**
```typescript
// tests/unit/server/repositories/userRepository.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '@/server/repositories/userRepository';
import { createMockDb } from '@tests/mocks/database';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    repository = new UserRepository(mockDb);
  });

  describe('findByPhoneNumber', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '123',
        phone_number: '+1234567890',
        created_at: new Date(),
      };
      
      mockDb.selectFrom.mockReturnValue({
        selectAll: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockResolvedValue(mockUser),
          }),
        }),
      });

      const result = await repository.findByPhoneNumber('+1234567890');
      expect(result).toEqual(mockUser);
    });
  });
});
```

### 2. Services (`tests/unit/server/services/`)

**What to test:**
- Business logic and rules
- Orchestration of multiple repositories
- External service integration points
- Error handling and validation

**Example: ConversationService**
```typescript
// tests/unit/server/services/conversationService.test.ts
describe('ConversationService', () => {
  let service: ConversationService;
  let mockChatService: MockedObject<ChatService>;
  let mockMessageService: MockedObject<MessageService>;

  beforeEach(() => {
    mockChatService = createMock<ChatService>();
    mockMessageService = createMock<MessageService>();
    service = new ConversationService(mockChatService, mockMessageService);
  });

  describe('handleIncomingMessage', () => {
    it('should process message and return response', async () => {
      const incomingMessage = {
        From: '+1234567890',
        Body: 'What\'s my workout today?',
      };

      mockChatService.generateResponse.mockResolvedValue({
        content: 'Today is leg day! Here\'s your workout...',
        tokens: 150,
      });

      const response = await service.handleIncomingMessage(incomingMessage);
      
      expect(response).toContain('leg day');
      expect(mockMessageService.save).toHaveBeenCalledTimes(2); // user + assistant
    });
  });
});
```

### 3. Agents (`tests/unit/server/agents/`)

**What to test:**
- Prompt construction
- Input validation
- Output parsing
- Chain composition

**Example: ChatAgent**
```typescript
// tests/unit/server/agents/chat/chain.test.ts
describe('ChatAgent', () => {
  let agent: ChatAgent;
  let mockLLM: MockedObject<BaseLLM>;

  beforeEach(() => {
    mockLLM = createMock<BaseLLM>();
    agent = new ChatAgent(mockLLM);
  });

  describe('invoke', () => {
    it('should generate contextual response', async () => {
      const context = {
        userProfile: { name: 'John', fitnessLevel: 'intermediate' },
        conversationHistory: [],
        currentWorkout: null,
      };

      mockLLM.invoke.mockResolvedValue({
        content: 'Hello John! Ready for your intermediate workout?',
      });

      const response = await agent.invoke({
        message: 'Hello',
        context,
      });

      expect(response.content).toContain('John');
      expect(mockLLM.invoke).toHaveBeenCalledWith(
        expect.stringContaining('fitness level: intermediate')
      );
    });
  });
});
```

### 4. React Components (`tests/unit/components/`)

**What to test:**
- Component rendering
- User interactions
- State changes
- Props validation

**Example: SignUp Component**
```typescript
// tests/unit/components/pages/SignUp/index.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignUp } from '@/components/pages/SignUp';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('SignUp Component', () => {
  it('should submit form with valid data', async () => {
    const mockOnSubmit = vi.fn();
    render(<SignUp onSubmit={mockOnSubmit} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        phoneNumber: '+1234567890',
        name: 'John Doe',
      });
    });
  });
});
```

### 5. Utilities (`tests/unit/shared/utils/`)

**What to test:**
- Pure functions
- Edge cases
- Input validation
- Type conversions

**Example: Date Utils**
```typescript
// tests/unit/shared/utils/dateUtils.test.ts
describe('dateUtils', () => {
  describe('formatWorkoutDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:00:00Z');
      expect(formatWorkoutDate(date)).toBe('Monday, January 15');
    });

    it('should handle invalid dates', () => {
      expect(formatWorkoutDate(null)).toBe('No date scheduled');
    });
  });
});
```

## Mock Utilities

### Database Mock Factory
```typescript
// tests/mocks/database.ts
export function createMockDb() {
  return {
    selectFrom: vi.fn().mockReturnThis(),
    insertInto: vi.fn().mockReturnThis(),
    updateTable: vi.fn().mockReturnThis(),
    deleteFrom: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    execute: vi.fn(),
    executeTakeFirst: vi.fn(),
    executeTakeFirstOrThrow: vi.fn(),
  };
}
```

### Test Data Builders
```typescript
// tests/fixtures/builders.ts
export class UserBuilder {
  private user = {
    id: 'test-id',
    phone_number: '+1234567890',
    stripe_customer_id: null,
    created_at: new Date(),
  };

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
```

## Testing Best Practices

### 1. Test Naming Convention
```typescript
// ✅ Good: Descriptive and specific
it('should return user profile when valid phone number is provided')

// ❌ Bad: Vague
it('should work')
```

### 2. AAA Pattern (Arrange, Act, Assert)
```typescript
it('should calculate correct workout volume', () => {
  // Arrange
  const sets = [
    { weight: 100, reps: 10 },
    { weight: 100, reps: 8 },
    { weight: 90, reps: 12 },
  ];

  // Act
  const volume = calculateVolume(sets);

  // Assert
  expect(volume).toBe(2880); // (100*10) + (100*8) + (90*12)
});
```

### 3. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 4. Async Testing
```typescript
// Use async/await for clarity
it('should fetch user data', async () => {
  const userData = await userService.getUser('123');
  expect(userData).toBeDefined();
});

// Handle promise rejections
it('should throw on invalid user', async () => {
  await expect(userService.getUser('invalid')).rejects.toThrow('User not found');
});
```

### 5. Snapshot Testing (for UI components)
```typescript
it('should match snapshot', () => {
  const { container } = render(<WorkoutCard workout={mockWorkout} />);
  expect(container).toMatchSnapshot();
});
```

## Coverage Goals

### Target Coverage by Component Type
- **Repositories**: 90%+ (critical data layer)
- **Services**: 85%+ (business logic)
- **Agents**: 80%+ (AI integration points)
- **Components**: 75%+ (UI logic)
- **Utilities**: 95%+ (pure functions)

### Coverage Exclusions
- Generated files (types from Kysely codegen)
- Configuration files
- Type definitions
- Migration files

## Common Testing Patterns

### 1. Testing Time-Dependent Code
```typescript
import { vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-15'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### 2. Testing Error Scenarios
```typescript
it('should handle database connection error', async () => {
  mockDb.execute.mockRejectedValue(new Error('Connection failed'));
  
  await expect(repository.save(data)).rejects.toThrow('Connection failed');
  expect(logger.error).toHaveBeenCalledWith(
    'Database error',
    expect.any(Error)
  );
});
```

### 3. Testing with Multiple Assertions
```typescript
it('should create complete fitness plan', async () => {
  const plan = await fitnessPlanService.generate(userProfile);
  
  // Use multiple expects for clarity
  expect(plan).toBeDefined();
  expect(plan.mesocycles).toHaveLength(3);
  expect(plan.totalWeeks).toBe(12);
  expect(plan.progressionModel).toBe('linear');
});
```

## Debugging Tests

### 1. Console Logging
```typescript
it('should process data correctly', async () => {
  const result = await processor.process(input);
  
  // Temporary debugging
  console.log('Result:', JSON.stringify(result, null, 2));
  
  expect(result).toMatchObject(expected);
});
```

### 2. Using Vitest UI
```bash
# Run with UI for visual debugging
pnpm test:ui
```

### 3. Focused Testing
```typescript
// Run only this test
it.only('should focus on this test', () => {
  // Test implementation
});

// Skip this test
it.skip('should skip this test', () => {
  // Test implementation
});
```