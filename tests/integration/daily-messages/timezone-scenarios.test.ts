import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withTestDatabase, seedTestData } from '../../utils/db';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';
import { UserBuilder } from '../../fixtures/users';
import { createMessageTracker } from '../../utils/daily-message-helpers';
import type { UserWithProfile } from '@/server/models/userModel';
import type { WorkoutInstance } from '@/server/models/workout';

describe('Daily Message Timezone Scenarios Integration Tests', () => {
  let messageTracker: ReturnType<typeof createMessageTracker>;
  let mockMessageService: MessageService;
  let dailyMessageService: DailyMessageService;

  beforeEach(() => {
    vi.clearAllMocks();
    messageTracker = createMessageTracker();
    
    // Create mock MessageService that tracks messages
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

  describe('Same Local Time, Different UTC Hours', () => {
    it('should deliver messages at 8 AM local time for users in different timezones', async () => {
      await withTestDatabase(async (db) => {
        // Create test users who all want messages at 8 AM their local time
        const users = [
          new UserBuilder()
            .withId('user-ny')
            .withName('New York User')
            .withTimezone('America/New_York')
            .withPreferredSendHour(8)
            .build(),
          new UserBuilder()
            .withId('user-la')
            .withName('Los Angeles User')
            .withTimezone('America/Los_Angeles')
            .withPreferredSendHour(8)
            .build(),
          new UserBuilder()
            .withId('user-london')
            .withName('London User')
            .withTimezone('Europe/London')
            .withPreferredSendHour(8)
            .build(),
          new UserBuilder()
            .withId('user-tokyo')
            .withName('Tokyo User')
            .withTimezone('Asia/Tokyo')
            .withPreferredSendHour(8)
            .build(),
        ];

        // Seed users and their workouts
        for (const user of users) {
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
            subscriptions: [{
              id: `sub-${user.id}`,
              userId: user.id,
              stripeSubscriptionId: `stripe-sub-${user.id}`,
              status: 'active',
              planType: 'premium',
              currentPeriodStart: new Date('2024-01-01'),
              currentPeriodEnd: new Date('2024-12-31'),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            }],
            workoutInstances: [{
              id: `workout-${user.id}`,
              clientId: user.id,
              fitnessPlanId: 'plan-123',
              mesocycleId: 'meso-123',
              microcycleId: 'micro-123',
              sessionType: 'strength',
              date: new Date('2024-03-15'),
              details: JSON.stringify([{ label: 'Main', activities: ['Squats'] }]),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            }],
          });
        }

        // Create services
        const userRepository = new UserRepository(db);
        const workoutRepository = new WorkoutInstanceRepository(db);
        dailyMessageService = new DailyMessageService(
          userRepository,
          workoutRepository,
          mockMessageService,
          10
        );

        // Mock March 15, 2024 to avoid DST complications
        const baseDate = new Date('2024-03-15T00:00:00Z');
        
        // Calculate UTC hours when it's 8 AM in each timezone
        // When it's 8 AM in Tokyo (UTC+9), it's 23:00 UTC previous day
        // When it's 8 AM in London (UTC+0), it's 08:00 UTC
        // When it's 8 AM in New York (UTC-4 in March), it's 12:00 UTC
        // When it's 8 AM in Los Angeles (UTC-7 in March), it's 15:00 UTC

        // Test each hour when users should receive messages
        const testHours = [
          { utcHour: 23, expectedUsers: ['user-tokyo'], date: new Date('2024-03-14T23:00:00Z') },
          { utcHour: 8, expectedUsers: ['user-london'], date: new Date('2024-03-15T08:00:00Z') },
          { utcHour: 12, expectedUsers: ['user-ny'], date: new Date('2024-03-15T12:00:00Z') },
          { utcHour: 15, expectedUsers: ['user-la'], date: new Date('2024-03-15T15:00:00Z') },
        ];

        for (const { utcHour, expectedUsers, date } of testHours) {
          vi.setSystemTime(date);
          messageTracker.reset();

          await dailyMessageService.processHourlyBatch();

          // Verify only the expected users received messages
          for (const userId of expectedUsers) {
            expect(messageTracker.hasReceivedMessage(userId)).toBe(true);
          }

          // Verify other users didn't receive messages
          const allUserIds = users.map(u => u.id);
          const unexpectedUsers = allUserIds.filter(id => !expectedUsers.includes(id));
          for (const userId of unexpectedUsers) {
            expect(messageTracker.hasReceivedMessage(userId)).toBe(false);
          }
        }

        // Verify total message count
        vi.setSystemTime(baseDate);
        messageTracker.reset();
        
        // Run through all 24 hours
        for (let hour = 0; hour < 24; hour++) {
          const testDate = new Date(baseDate);
          testDate.setUTCHours(hour);
          vi.setSystemTime(testDate);
          await dailyMessageService.processHourlyBatch();
        }

        // Each user should have received exactly one message
        expect(messageTracker.getMessageCount('user-ny')).toBe(1);
        expect(messageTracker.getMessageCount('user-la')).toBe(1);
        expect(messageTracker.getMessageCount('user-london')).toBe(1);
        expect(messageTracker.getMessageCount('user-tokyo')).toBe(1);
      });
    });
  });

  describe('Multiple Users Same UTC Hour', () => {
    it('should handle multiple users with coinciding delivery times', async () => {
      await withTestDatabase(async (db) => {
        // Create users whose preferred times result in the same UTC hour
        // Example: 9 AM in London (UTC+0) = 9 UTC
        //          5 AM in New York (UTC-4) = 9 UTC
        //          2 AM in Los Angeles (UTC-7) = 9 UTC
        const users = [
          new UserBuilder()
            .withId('user-london-9am')
            .withName('London 9 AM User')
            .withTimezone('Europe/London')
            .withPreferredSendHour(9)
            .build(),
          new UserBuilder()
            .withId('user-ny-5am')
            .withName('New York 5 AM User')
            .withTimezone('America/New_York')
            .withPreferredSendHour(5)
            .build(),
          new UserBuilder()
            .withId('user-la-2am')
            .withName('LA 2 AM User')
            .withTimezone('America/Los_Angeles')
            .withPreferredSendHour(2)
            .build(),
        ];

        // Seed all users
        for (const user of users) {
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
            subscriptions: [{
              id: `sub-${user.id}`,
              userId: user.id,
              stripeSubscriptionId: `stripe-sub-${user.id}`,
              status: 'active',
              planType: 'premium',
              currentPeriodStart: new Date('2024-01-01'),
              currentPeriodEnd: new Date('2024-12-31'),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            }],
            workoutInstances: [{
              id: `workout-${user.id}`,
              clientId: user.id,
              fitnessPlanId: 'plan-123',
              mesocycleId: 'meso-123',
              microcycleId: 'micro-123',
              sessionType: 'strength',
              date: new Date('2024-03-15'),
              details: JSON.stringify([{ label: 'Main', activities: ['Bench Press'] }]),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            }],
          });
        }

        // Create services
        const userRepository = new UserRepository(db);
        const workoutRepository = new WorkoutInstanceRepository(db);
        dailyMessageService = new DailyMessageService(
          userRepository,
          workoutRepository,
          mockMessageService,
          10
        );

        // Set time to March 15, 2024 9:00 UTC
        vi.setSystemTime(new Date('2024-03-15T09:00:00Z'));
        messageTracker.reset();

        // Process the batch
        const result = await dailyMessageService.processHourlyBatch();

        // All three users should receive messages
        expect(messageTracker.hasReceivedMessage('user-london-9am')).toBe(true);
        expect(messageTracker.hasReceivedMessage('user-ny-5am')).toBe(true);
        expect(messageTracker.hasReceivedMessage('user-la-2am')).toBe(true);

        // Verify batch metrics
        expect(result.processed).toBe(3);
        expect(result.failed).toBe(0);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('No Users Should Receive', () => {
    it('should handle UTC hours where no deliveries are scheduled', async () => {
      await withTestDatabase(async (db) => {
        // Create users but with preferences that don't match test hour
        const users = [
          new UserBuilder()
            .withId('user-1')
            .withTimezone('America/New_York')
            .withPreferredSendHour(8)  // 8 AM EST = 13 UTC (March)
            .build(),
          new UserBuilder()
            .withId('user-2')
            .withTimezone('Europe/London')
            .withPreferredSendHour(9)  // 9 AM GMT = 9 UTC
            .build(),
        ];

        // Seed users
        for (const user of users) {
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
            subscriptions: [{
              id: `sub-${user.id}`,
              userId: user.id,
              stripeSubscriptionId: `stripe-sub-${user.id}`,
              status: 'active',
              planType: 'premium',
              currentPeriodStart: new Date('2024-01-01'),
              currentPeriodEnd: new Date('2024-12-31'),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            }],
          });
        }

        // Create services
        const userRepository = new UserRepository(db);
        const workoutRepository = new WorkoutInstanceRepository(db);
        dailyMessageService = new DailyMessageService(
          userRepository,
          workoutRepository,
          mockMessageService,
          10
        );

        // Test at 3 AM UTC - no users should have this delivery time
        vi.setSystemTime(new Date('2024-03-15T03:00:00Z'));
        messageTracker.reset();

        const result = await dailyMessageService.processHourlyBatch();

        // No messages should be sent
        expect(messageTracker.hasReceivedMessage('user-1')).toBe(false);
        expect(messageTracker.hasReceivedMessage('user-2')).toBe(false);
        expect(messageTracker.getTotalMessageCount()).toBe(0);

        // Verify metrics
        expect(result.processed).toBe(0);
        expect(result.failed).toBe(0);
        expect(result.errors).toHaveLength(0);

        // Verify service handles empty results gracefully
        expect(result.duration).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle case when all users have inactive subscriptions', async () => {
      await withTestDatabase(async (db) => {
        // Create user with correct delivery time but inactive subscription
        const user = new UserBuilder()
          .withId('user-inactive')
          .withTimezone('Europe/London')
          .withPreferredSendHour(10)  // 10 AM GMT = 10 UTC
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
          subscriptions: [{
            id: `sub-${user.id}`,
            userId: user.id,
            stripeSubscriptionId: `stripe-sub-${user.id}`,
            status: 'canceled',  // Inactive subscription
            planType: 'premium',
            currentPeriodStart: new Date('2024-01-01'),
            currentPeriodEnd: new Date('2024-01-31'),
            canceledAt: new Date('2024-01-31'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-31'),
          }],
        });

        // Create services
        const userRepository = new UserRepository(db);
        const workoutRepository = new WorkoutInstanceRepository(db);
        dailyMessageService = new DailyMessageService(
          userRepository,
          workoutRepository,
          mockMessageService,
          10
        );

        // Set time to when user would normally receive message
        vi.setSystemTime(new Date('2024-03-15T10:00:00Z'));
        messageTracker.reset();

        const result = await dailyMessageService.processHourlyBatch();

        // No message should be sent due to inactive subscription
        expect(messageTracker.hasReceivedMessage('user-inactive')).toBe(false);
        expect(result.processed).toBe(0);
        expect(result.failed).toBe(0);
      });
    });
  });
});