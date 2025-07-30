import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withTestDatabase, seedTestData } from '../../utils/db';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';
import { UserBuilder } from '../../fixtures/users';
import { createMessageTracker } from '../../utils/daily-message-helpers';
import { createTestSubscription } from '../../utils/test-data-helpers';
import { generateUuid } from '../../utils/uuid';
import type { UserWithProfile } from '@/server/models/userModel';
import type { WorkoutInstance } from '@/server/models/workout';

describe('Daily Message Timezone Scenarios Integration Tests', () => {
  let messageTracker: ReturnType<typeof createMessageTracker>;
  let mockMessageService: MessageService;

  beforeEach(() => {
    vi.clearAllMocks();
    messageTracker = createMessageTracker();
    
    mockMessageService = {
      buildDailyMessage: vi.fn().mockImplementation(async (user: UserWithProfile, workout: WorkoutInstance) => {
        return `Your workout for today: ${workout.sessionType}`;
      }),
      sendMessage: vi.fn().mockImplementation(async (user: UserWithProfile, message: string) => {
        messageTracker.recordMessage(user.id, message);
        return Promise.resolve();
      }),
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully send a daily message to a user', async () => {
    await withTestDatabase(async (db) => {
      // Create a user who wants messages at 8 AM in their timezone
      const user = new UserBuilder()
        .withName('Test User')
        .withTimezone('America/New_York')
        .withPreferredSendHour(8)
        .build();

      await seedTestData(db, {
        users: [{
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          email: user.email,
          stripeCustomerId: user.stripeCustomerId,
          timezone: user.timezone,
          preferredSendHour: user.preferredSendHour,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }],
        fitnessProfiles: [{
          id: user.profile.id,
          userId: user.id,
          fitnessGoals: user.profile.fitnessGoals,
          skillLevel: user.profile.skillLevel,
          exerciseFrequency: user.profile.exerciseFrequency,
          gender: user.profile.gender,
          age: user.profile.age,
          createdAt: user.profile.createdAt,
          updatedAt: user.profile.updatedAt,
        }],
        subscriptions: [createTestSubscription(user.id)],
      });

      // Create fitness plan structure
      const fitnessPlanId = generateUuid();
      const mesocycleId = generateUuid();
      const microcycleId = generateUuid();
      
      await db.insertInto('fitnessPlans').values({
        id: fitnessPlanId,
        clientId: user.id,
        programType: 'strength',
        goalStatement: 'Build strength',
        overview: 'Strength program',
        macrocycles: JSON.stringify([]),
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }).execute();
      
      await db.insertInto('mesocycles').values({
        id: mesocycleId,
        fitnessPlanId: fitnessPlanId,
        clientId: user.id,
        index: 0,
        phase: 'Strength',
        lengthWeeks: 4,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }).execute();
      
      await db.insertInto('microcycles').values({
        id: microcycleId,
        mesocycleId: mesocycleId,
        fitnessPlanId: fitnessPlanId,
        clientId: user.id,
        index: 0,
        targets: null,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-22'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }).execute();
      
      // Create workout for March 15, 2024
      // When it's 8 AM ET on March 15, that's 13:00 UTC (EDT is UTC-4 in March)
      // So we create the workout for any time on March 15 in ET
      await db.insertInto('workoutInstances').values({
        id: generateUuid(),
        clientId: user.id,
        fitnessPlanId: fitnessPlanId,
        mesocycleId: mesocycleId,
        microcycleId: microcycleId,
        sessionType: 'strength',
        date: new Date('2024-03-15T15:00:00Z'), // 11 AM ET on March 15
        details: JSON.stringify([{ label: 'Main', activities: ['Squats', 'Bench Press'] }]),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }).execute();

      // Create services
      const userRepository = new UserRepository(db);
      const workoutRepository = new WorkoutInstanceRepository(db);
      const dailyMessageService = new DailyMessageService(
        userRepository,
        workoutRepository,
        mockMessageService,
        10
      );

      // Set time to March 15, 2024 at 8 AM ET = 12:00 UTC (EDT is UTC-4)
      vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));

      // Process the batch
      const result = await dailyMessageService.processHourlyBatch();

      // Verify the user received a message
      expect(messageTracker.hasReceivedMessage(user.id)).toBe(true);
      expect(messageTracker.getMessageCount(user.id)).toBe(1);
      
      // Verify batch metrics
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});