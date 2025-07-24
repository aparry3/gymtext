# Test Examples Catalog

This document provides concrete test examples for key GymText components, organized by feature area.

## SMS Conversation Flow Tests

### 1. New User Onboarding Test

```typescript
// tests/integration/workflows/user-onboarding.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestEnvironment } from '@tests/setup/test-environment';
import { POST as smsHandler } from '@/app/api/sms/route';
import { createMocks } from 'node-mocks-http';

describe('User Onboarding Flow', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await setupTestEnvironment();
  });

  it('should onboard new user through SMS conversation', async () => {
    // Step 1: First message from unknown number
    const firstMessage = createMocks({
      method: 'POST',
      body: {
        From: '+1234567890',
        Body: 'Hello, I want to start training',
        MessageSid: 'SM001',
      },
    });

    const response1 = await smsHandler(firstMessage.req);
    const body1 = await response1.text();

    expect(response1.status).toBe(200);
    expect(body1).toContain('Welcome to GymText');
    
    // Verify user was created
    const user = await testEnv.db
      .selectFrom('users')
      .where('phone_number', '=', '+1234567890')
      .executeTakeFirst();
    
    expect(user).toBeDefined();

    // Step 2: User provides fitness information
    const secondMessage = createMocks({
      method: 'POST',
      body: {
        From: '+1234567890',
        Body: 'I\'m intermediate level, want to build muscle, can train 4 days a week',
        MessageSid: 'SM002',
      },
    });

    const response2 = await smsHandler(secondMessage.req);
    const body2 = await response2.text();

    expect(body2).toContain('muscle building program');
    
    // Verify fitness profile was created
    const profile = await testEnv.db
      .selectFrom('fitness_profiles')
      .where('user_id', '=', user!.id)
      .executeTakeFirst();
    
    expect(profile).toMatchObject({
      fitness_level: 'intermediate',
      primary_goal: 'muscle_building',
      available_days_per_week: 4,
    });
  });
});
```

### 2. Daily Workout Message Test

```typescript
// tests/unit/server/services/dailyMessageService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { WorkoutBuilder, UserBuilder } from '@tests/fixtures/builders';
import { createMockLLM } from '@tests/mocks/external-services';

describe('DailyMessageService', () => {
  let service: DailyMessageService;
  let mockDeps: any;

  beforeEach(() => {
    mockDeps = {
      workoutRepo: {
        getTodaysWorkout: vi.fn(),
      },
      userRepo: {
        findWithProfile: vi.fn(),
      },
      llm: createMockLLM([
        'Good morning Sarah! 💪 Ready to crush today\'s upper body workout?',
      ]),
    };
    
    service = new DailyMessageService(mockDeps);
  });

  it('should generate personalized daily workout message', async () => {
    // Arrange
    const user = new UserBuilder()
      .withId('user-123')
      .build();
    
    const workout = new WorkoutBuilder()
      .addExercise({ name: 'Bench Press', sets: 4, reps: 8, weight: 185 })
      .addExercise({ name: 'Pull-ups', sets: 3, reps: 10 })
      .addExercise({ name: 'Shoulder Press', sets: 3, reps: 12, weight: 65 })
      .build();

    mockDeps.userRepo.findWithProfile.mockResolvedValue({
      ...user,
      fitness_profile: {
        name: 'Sarah',
        fitness_level: 'intermediate',
        primary_goal: 'muscle_building',
      },
    });
    
    mockDeps.workoutRepo.getTodaysWorkout.mockResolvedValue(workout);

    // Act
    const message = await service.generateDailyMessage('user-123');

    // Assert
    expect(message).toContain('Sarah');
    expect(message).toContain('Bench Press: 4 sets x 8 reps @ 185 lbs');
    expect(message).toContain('Pull-ups: 3 sets x 10 reps');
    expect(message).toContain('Shoulder Press: 3 sets x 12 reps @ 65 lbs');
  });

  it('should handle rest day appropriately', async () => {
    mockDeps.workoutRepo.getTodaysWorkout.mockResolvedValue(null);
    mockDeps.llm = createMockLLM([
      'Enjoy your rest day! Remember to stay hydrated and get good sleep.',
    ]);

    const message = await service.generateDailyMessage('user-123');

    expect(message).toContain('rest day');
    expect(message).not.toContain('sets x');
  });
});
```

## Fitness Plan Generation Tests

### 3. Complete Fitness Plan Generation Test

```typescript
// tests/integration/workflows/fitness-plan-generation.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FitnessPlanService } from '@/server/services/fitnessPlanService';
import { setupTestEnvironment } from '@tests/setup/test-environment';
import { UserBuilder, FitnessProfileBuilder } from '@tests/fixtures/builders';

describe('Fitness Plan Generation', () => {
  let testEnv: TestEnvironment;
  let fitnessPlanService: FitnessPlanService;

  beforeEach(async () => {
    testEnv = await setupTestEnvironment();
    fitnessPlanService = new FitnessPlanService({
      db: testEnv.db,
      llm: createMockLLM([JSON.stringify(mockFitnessPlanResponse)]),
    });
  });

  it('should generate complete 12-week muscle building plan', async () => {
    // Create test user with profile
    const user = new UserBuilder().build();
    const profile = new FitnessProfileBuilder()
      .forUser(user.id)
      .withFitnessLevel('intermediate')
      .withGoal('muscle_building')
      .build();

    await testEnv.db.insertInto('users').values(user).execute();
    await testEnv.db.insertInto('fitness_profiles').values(profile).execute();

    // Generate plan
    const plan = await fitnessPlanService.generatePlan(user.id);

    // Verify plan structure
    expect(plan).toMatchObject({
      user_id: user.id,
      name: expect.stringContaining('Muscle Building'),
      duration_weeks: 12,
      status: 'active',
    });

    // Verify mesocycles
    const mesocycles = await testEnv.db
      .selectFrom('mesocycles')
      .where('fitness_plan_id', '=', plan.id)
      .selectAll()
      .execute();

    expect(mesocycles).toHaveLength(3);
    expect(mesocycles[0]).toMatchObject({
      phase_type: 'hypertrophy',
      week_number: 1,
      duration_weeks: 4,
    });
    expect(mesocycles[1]).toMatchObject({
      phase_type: 'strength',
      week_number: 5,
      duration_weeks: 4,
    });

    // Verify microcycles
    const microcycles = await testEnv.db
      .selectFrom('microcycles')
      .where('mesocycle_id', '=', mesocycles[0].id)
      .selectAll()
      .execute();

    expect(microcycles).toHaveLength(4); // 4 weeks in first mesocycle

    // Verify workouts
    const workouts = await testEnv.db
      .selectFrom('workouts')
      .where('microcycle_id', '=', microcycles[0].id)
      .selectAll()
      .execute();

    expect(workouts.length).toBeGreaterThanOrEqual(4); // At least 4 workouts per week
    expect(workouts[0].exercises).toBeDefined();
    expect(workouts[0].exercises.length).toBeGreaterThan(0);
  });
});

// Real fitness plan response from the agent
const mockFitnessPlanResponse = {
  macrocycles: [
    {
      description: "This macrocycle focuses on weight loss through a combination of strength training and cardio. We'll build intensity over two weeks, followed by a deload week to ensure optimal recovery and prevent overtraining.",
      durationWeeks: 6,
      mesocycles: [
        {
          microcycleOverviews: [
            {
              weekNumber: 0,
              split: "Upper-Lower-Cardio-Rest",
              totalSetsMainLifts: 12
            },
            {
              weekNumber: 1,
              split: "Upper-Lower-Cardio-Rest",
              totalSetsMainLifts: 15
            },
            {
              weekNumber: 2,
              split: "Upper-Lower-Cardio-Rest",
              totalSetsMainLifts: 10
            }
          ],
          phase: "Strength & Cardio Blend",
          weeks: 3
        },
        {
          microcycleOverviews: [
            {
              weekNumber: 0,
              split: "Cardio-Upper-Lower-Rest",
              totalMileage: 5
            },
            {
              weekNumber: 1,
              split: "Cardio-Upper-Lower-Rest",
              totalMileage: 7
            },
            {
              weekNumber: 2,
              split: "Cardio-Upper-Lower-Rest",
              totalMileage: 3,
              totalSetsMainLifts: 8
            }
          ],
          phase: "Increased Cardio Focus",
          weeks: 3
        }
      ],
      name: "Weight Loss Accelerator"
    }
  ],
  overview: "Aaron, get ready to shred! This 6-week program is designed to maximize weight loss by combining strength training with targeted cardio sessions. We'll follow a progressive overload approach, increasing intensity for two weeks, then deloading to allow your body to recover and adapt. Expect a mix of upper and lower body workouts, along with cardio to torch those calories. Let's achieve your weight loss goals together!",
  programType: "shred",
  startDate: "2024-01-01T00:00:00Z"
};
```

## Mesocycle Breakdown Tests

### 4. Mesocycle to Microcycle Breakdown Test

```typescript
// tests/unit/server/agents/mesocycleBreakdown.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mesocycleAgent } from '@/server/agents/mesocycleBreakdown/chain';
import { createMockLLM } from '@tests/mocks/external-services';

describe('Mesocycle Breakdown Agent', () => {
  it('should break down mesocycle into detailed microcycles', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      phoneNumber: '+1234567890',
      fitnessProfile: {
        fitnessLevel: 'intermediate',
        primaryGoal: 'weight_loss',
        exerciseFrequency: '4 times per week',
        gender: 'male',
        age: 28,
      },
    };

    const mesocycleOverview = {
      phase: "Strength & Cardio Blend",
      weeks: 3,
      microcycleOverviews: [
        {
          split: "Upper-Lower-Cardio-Rest",
          weekNumber: 0,
          totalSetsMainLifts: 12
        },
        {
          split: "Upper-Lower-Cardio-Rest",
          weekNumber: 1,
          totalSetsMainLifts: 15
        },
        {
          split: "Upper-Lower-Cardio-Rest",
          weekNumber: 2,
          totalSetsMainLifts: 10
        }
      ]
    };

    const result = await mesocycleAgent.invoke({
      user: mockUser,
      context: {
        mesocycleOverview,
        fitnessPlan: {
          programType: 'shred',
          startDate: new Date().toISOString(),
        },
      },
    });

    // Verify the breakdown structure
    expect(result.value).toHaveLength(3); // 3 microcycles
    expect(result.value[0]).toMatchObject({
      index: expect.any(Number),
      workouts: expect.arrayContaining([
        expect.objectContaining({
          sessionType: expect.stringMatching(/lift|run|mobility|rest/),
          details: expect.arrayContaining([
            expect.objectContaining({
              label: expect.any(String),
              activities: expect.any(Array),
            }),
          ]),
        }),
      ]),
    });
  });
});

// Real mesocycle breakdown output from the agent
const mockMesocycleBreakdownResponse = [
  {
    index: 1,
    workouts: [
      {
        details: [
          {
            activities: ["5 min light cardio, dynamic stretching"],
            label: "Warm-up"
          },
          {
            activities: [
              "Bench Press 4x6",
              "Pull-ups 4xAMRAP",
              "Overhead Press 3x8",
              "Bent-Over Rows 3x8",
              "Dumbbell Lateral Raises 3x10",
              "Dumbbell Bicep Curls 3x10"
            ],
            label: "Main Work"
          },
          {
            activities: ["Stretching, foam rolling"],
            label: "Cool-down"
          }
        ],
        sessionType: "lift"
      },
      {
        details: [
          {
            activities: ["5 min light cardio, dynamic stretching"],
            label: "Warm-up"
          },
          {
            activities: [
              "Back Squats 4x6",
              "Deadlifts 1x5, 1x3, 1x1",
              "Lunges 3x10 per leg",
              "Leg Press 3x12",
              "Calf Raises 4x15"
            ],
            label: "Main Work"
          },
          {
            activities: ["Stretching, foam rolling"],
            label: "Cool-down"
          }
        ],
        sessionType: "lift"
      },
      {
        details: [
          {
            activities: ["5 min light cardio, dynamic stretching"],
            label: "Warm-up"
          },
          {
            activities: ["30 min moderate-intensity run"],
            label: "Main Work"
          },
          {
            activities: ["Stretching"],
            label: "Cool-down"
          }
        ],
        sessionType: "run"
      },
      // ... more workouts for the week
    ]
  },
  // ... more microcycles
];
```

## Payment and Subscription Tests

### 5. Stripe Webhook Handler Test

```typescript
// tests/integration/api/checkout-callback.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST as webhookHandler } from '@/app/api/checkout/callback/route';
import { createMocks } from 'node-mocks-http';
import { setupTestEnvironment } from '@tests/setup/test-environment';
import { UserBuilder } from '@tests/fixtures/builders';
import Stripe from 'stripe';

describe('Stripe Webhook Handler', () => {
  let testEnv: TestEnvironment;
  const webhookSecret = 'whsec_test_secret';

  beforeEach(async () => {
    testEnv = await setupTestEnvironment();
    process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  });

  it('should activate subscription on successful payment', async () => {
    // Create test user
    const user = new UserBuilder()
      .withStripeCustomer('cus_test_123')
      .build();
    
    await testEnv.db.insertInto('users').values(user).execute();

    // Create webhook event
    const event: Stripe.Event = {
      id: 'evt_test_123',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          payment_status: 'paid',
        } as any,
      },
      created: Date.now(),
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: '2023-10-16',
    };

    // Mock Stripe signature verification
    const signature = 'test_signature';
    vi.spyOn(Stripe.webhooks, 'constructEvent').mockReturnValue(event);

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: event,
    });

    // Handle webhook
    const response = await webhookHandler(req);

    expect(response.status).toBe(200);

    // Verify subscription was created
    const subscription = await testEnv.db
      .selectFrom('subscriptions')
      .where('user_id', '=', user.id)
      .executeTakeFirst();

    expect(subscription).toMatchObject({
      stripe_subscription_id: 'sub_test_123',
      status: 'active',
    });
  });

  it('should handle subscription cancellation', async () => {
    // Test subscription.deleted event
    const event: Stripe.Event = {
      id: 'evt_test_456',
      object: 'event',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'canceled',
        } as any,
      },
      created: Date.now(),
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: '2023-10-16',
    };

    // ... rest of cancellation test
  });
});
```

## AI Agent Tests

### 6. Chat Agent Context Building Test

```typescript
// tests/unit/server/agents/chat/chain.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ChatAgent } from '@/server/agents/chat/chain';
import { createMockLLM } from '@tests/mocks/external-services';
import { ConversationBuilder, WorkoutBuilder } from '@tests/fixtures/builders';

describe('ChatAgent', () => {
  let agent: ChatAgent;
  let mockLLM: ReturnType<typeof createMockLLM>;

  beforeEach(() => {
    mockLLM = createMockLLM();
    agent = new ChatAgent({ llm: mockLLM });
  });

  it('should include user context in prompt', async () => {
    const context = {
      userProfile: {
        name: 'John',
        fitness_level: 'intermediate',
        primary_goal: 'muscle_building',
        available_equipment: ['barbell', 'dumbbells', 'cables'],
      },
      currentWorkout: new WorkoutBuilder()
        .addExercise({ name: 'Squats', sets: 4, reps: 8, weight: 225 })
        .build(),
      conversationHistory: [
        { role: 'user', content: 'My knee hurts a bit' },
        { role: 'assistant', content: 'Let\'s modify your workout...' },
      ],
    };

    await agent.invoke({
      message: 'Should I still do squats?',
      context,
    });

    // Verify the prompt includes context
    const promptCall = mockLLM.invoke.mock.calls[0][0];
    expect(promptCall).toContain('John');
    expect(promptCall).toContain('intermediate');
    expect(promptCall).toContain('muscle_building');
    expect(promptCall).toContain('knee hurts');
    expect(promptCall).toContain('Squats');
  });

  it('should handle exercise form questions', async () => {
    mockLLM = createMockLLM([
      'For proper squat form: Keep your chest up, core tight, and drive through your heels...',
    ]);
    agent = new ChatAgent({ llm: mockLLM });

    const response = await agent.invoke({
      message: 'How do I do squats correctly?',
      context: { userProfile: {}, conversationHistory: [] },
    });

    expect(response.content).toContain('chest up');
    expect(response.content).toContain('core tight');
    expect(response.content).toContain('heels');
  });
});
```

## React Component Tests

### 7. Sign Up Form Component Test

```typescript
// tests/unit/components/pages/SignUp/index.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUp } from '@/components/pages/SignUp';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('SignUp Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should validate phone number format', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    const phoneInput = screen.getByLabelText(/phone number/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    // Try invalid phone number
    await user.type(phoneInput, '123');
    await user.click(submitButton);

    expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checkoutUrl: 'https://checkout.stripe.com/test' }),
    });

    render(<SignUp />);

    // Fill out form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
    await user.type(screen.getByLabelText(/age/i), '30');
    await user.selectOptions(screen.getByLabelText(/fitness level/i), 'intermediate');
    await user.selectOptions(screen.getByLabelText(/primary goal/i), 'muscle_building');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          phoneNumber: '+1234567890',
          age: 30,
          fitnessLevel: 'intermediate',
          primaryGoal: 'muscle_building',
        }),
      });
    });

    expect(mockPush).toHaveBeenCalledWith('https://checkout.stripe.com/test');
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock slow fetch
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<SignUp />);

    // Fill minimum required fields
    await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Check loading state
    expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled();
  });
});
```

## Error Handling Tests

### 8. Circuit Breaker Test

```typescript
// tests/unit/server/utils/circuitBreaker.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;
  let mockFunction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFunction = vi.fn();
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
      monitoringPeriod: 5000,
    });
  });

  it('should open circuit after threshold failures', async () => {
    // Mock function that always fails
    mockFunction.mockRejectedValue(new Error('Service unavailable'));

    // Fail 3 times to open circuit
    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.execute('test-operation', mockFunction)
      ).rejects.toThrow('Service unavailable');
    }

    // Circuit should now be open
    await expect(
      breaker.execute('test-operation', mockFunction)
    ).rejects.toThrow('Circuit breaker is OPEN');

    // Function should not be called when circuit is open
    expect(mockFunction).toHaveBeenCalledTimes(3);
  });

  it('should reset after timeout', async () => {
    vi.useFakeTimers();

    // Open the circuit
    mockFunction.mockRejectedValue(new Error('Fail'));
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute('test', mockFunction)).rejects.toThrow();
    }

    // Now mock success
    mockFunction.mockResolvedValue('Success');

    // Fast forward past reset timeout
    vi.advanceTimersByTime(1500);

    // Circuit should be half-open, next call should succeed
    const result = await breaker.execute('test', mockFunction);
    expect(result).toBe('Success');

    vi.useRealTimers();
  });
});
```

## Database Repository Tests

### 9. Complex Query Test

```typescript
// tests/unit/server/repositories/workoutRepository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkoutRepository } from '@/server/repositories/workoutRepository';
import { createTestDatabase, migrateTestDatabase } from '@tests/setup/test-database';
import { buildCompleteTestPlan } from '@tests/fixtures/fitness-plan-fixtures';

describe('WorkoutRepository', () => {
  let repository: WorkoutRepository;
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(async () => {
    db = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new WorkoutRepository(db);
  });

  it('should fetch user workouts for date range', async () => {
    // Setup: Create complete plan with workouts
    const { user, plan, workouts } = await buildCompleteTestPlan(db);

    // Act: Fetch workouts for next 7 days
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-01-21');
    
    const userWorkouts = await repository.getUserWorkoutsForDateRange(
      user.id,
      startDate,
      endDate
    );

    // Assert
    expect(userWorkouts).toHaveLength(4); // 4 workouts in the week
    expect(userWorkouts[0]).toMatchObject({
      user_id: user.id,
      workout_date: expect.any(Date),
      workout: expect.objectContaining({
        name: expect.any(String),
        exercises: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            sets: expect.any(Number),
            reps: expect.any(Number),
          }),
        ]),
      }),
    });
  });

  it('should track workout completion', async () => {
    const { user, workouts } = await buildCompleteTestPlan(db);
    const workout = workouts[0];

    // Complete workout
    await repository.markWorkoutComplete(user.id, workout.id, {
      completed_at: new Date(),
      notes: 'Felt strong today!',
      exercise_logs: [
        {
          exercise_id: workout.exercises[0].id,
          sets_completed: [
            { reps: 8, weight: 185 },
            { reps: 8, weight: 185 },
            { reps: 7, weight: 185 },
            { reps: 6, weight: 185 },
          ],
        },
      ],
    });

    // Verify completion
    const completed = await repository.getCompletedWorkout(user.id, workout.id);
    
    expect(completed).toMatchObject({
      completed_at: expect.any(Date),
      notes: 'Felt strong today!',
    });
    expect(completed.exercise_logs).toHaveLength(1);
    expect(completed.exercise_logs[0].sets_completed).toHaveLength(4);
  });
});
```

## Performance Tests

### 10. Load Testing Example

```typescript
// tests/integration/performance/concurrent-messages.test.ts
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';
import { setupTestEnvironment } from '@tests/setup/test-environment';
import { ConversationService } from '@/server/services/conversationService';

describe('Performance Tests', () => {
  it('should handle 50 concurrent messages efficiently', async () => {
    const testEnv = await setupTestEnvironment();
    const service = new ConversationService({
      db: testEnv.db,
      llm: createMockLLM(Array(50).fill('Test response')),
    });

    // Create 50 different users
    const users = await Promise.all(
      Array.from({ length: 50 }, (_, i) => 
        testEnv.db.insertInto('users')
          .values({ phone_number: `+123456${i.toString().padStart(4, '0')}` })
          .returningAll()
          .executeTakeFirst()
      )
    );

    const startTime = performance.now();

    // Send concurrent messages
    const responses = await Promise.all(
      users.map(user =>
        service.handleIncomingMessage({
          userId: user.id,
          message: 'What is my workout?',
        })
      )
    );

    const duration = performance.now() - startTime;

    // Assertions
    expect(responses).toHaveLength(50);
    expect(responses.every(r => r.content === 'Test response')).toBe(true);
    expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds

    // Verify all conversations were saved
    const messageCount = await testEnv.db
      .selectFrom('messages')
      .select(({ fn }) => fn.count('id').as('count'))
      .executeTakeFirst();

    expect(Number(messageCount?.count)).toBe(100); // 50 user + 50 assistant messages
  });
});
```

## Test Utilities and Helpers

### 11. Custom Test Matchers

```typescript
// tests/setup/custom-matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidPhoneNumber(received: string) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const pass = phoneRegex.test(received);
    
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid phone number`
          : `expected ${received} to be a valid phone number`,
    };
  },

  toContainWorkoutExercise(received: any, exerciseName: string) {
    const exercises = received?.exercises || [];
    const pass = exercises.some((ex: any) => ex.name === exerciseName);
    
    return {
      pass,
      message: () =>
        pass
          ? `expected workout not to contain exercise "${exerciseName}"`
          : `expected workout to contain exercise "${exerciseName}"`,
    };
  },
});

// Usage in tests:
expect('+1234567890').toBeValidPhoneNumber();
expect(workout).toContainWorkoutExercise('Squats');
```

## Running Specific Test Suites

```bash
# Run all SMS-related tests
pnpm test sms

# Run all fitness plan tests
pnpm test fitness-plan

# Run all integration tests
pnpm test:integration

# Run tests in watch mode for TDD
pnpm test:watch services/conversationService

# Run tests with specific reporter
pnpm test --reporter=verbose

# Debug a specific test
pnpm test --inspect-brk user-onboarding.test.ts
```

## Test Coverage Reports

After running tests with coverage, you can view detailed reports:

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML coverage report
open coverage/index.html

# Check coverage thresholds
pnpm test:coverage --coverage.thresholds.lines=80
```

The coverage report will show:
- Line coverage
- Branch coverage  
- Function coverage
- Statement coverage

Focus on testing critical paths and business logic rather than achieving 100% coverage everywhere.