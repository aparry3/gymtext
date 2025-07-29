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

describe('Daily Message DST Transition Integration Tests', () => {
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
        messageTracker.recordMessage(user.id, message, new Date());
        return Promise.resolve();
      }),
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Spring Forward (March)', () => {
    it('should handle 2 AM gap during spring DST transition', async () => {
      await withTestDatabase(async (db) => {
        // Create users with 2 AM preference in DST-observing timezone
        const users = [
          new UserBuilder()
            .withId('user-ny-2am')
            .withName('New York 2 AM User')
            .withTimezone('America/New_York')
            .withPreferredSendHour(2)  // This time doesn't exist on DST transition
            .build(),
          new UserBuilder()
            .withId('user-ny-3am')
            .withName('New York 3 AM User')
            .withTimezone('America/New_York')
            .withPreferredSendHour(3)  // This should work normally
            .build(),
        ];

        // Seed users with workouts
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
              date: new Date('2024-03-10'),  // DST transition day
              details: JSON.stringify([{ label: 'Main', activities: ['Deadlifts'] }]),
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

        // DST transition happens at 2 AM on March 10, 2024
        // When clock hits 2 AM, it jumps to 3 AM
        // So 2 AM EST doesn't exist on this day
        
        // Test hours around DST transition
        // 1 AM EST = 6 AM UTC (before transition)
        // 3 AM EDT = 7 AM UTC (after transition, skipped 2 AM)
        // 4 AM EDT = 8 AM UTC

        messageTracker.reset();
        
        // Run through the transition hours
        const testHours = [
          { time: new Date('2024-03-10T06:00:00Z'), expectedUsers: [] },  // 1 AM EST
          { time: new Date('2024-03-10T07:00:00Z'), expectedUsers: ['user-ny-3am'] },  // 3 AM EDT (2 AM skipped)
          { time: new Date('2024-03-10T08:00:00Z'), expectedUsers: [] },  // 4 AM EDT
        ];

        for (const { time, expectedUsers } of testHours) {
          vi.setSystemTime(time);
          messageTracker.reset();
          
          await dailyMessageService.processHourlyBatch();
          
          // Check expected users received messages
          for (const userId of expectedUsers) {
            expect(messageTracker.hasReceivedMessage(userId)).toBe(true);
          }
          
          // Check others didn't
          const allUserIds = users.map(u => u.id);
          const unexpectedUsers = allUserIds.filter(id => !expectedUsers.includes(id));
          for (const userId of unexpectedUsers) {
            expect(messageTracker.hasReceivedMessage(userId)).toBe(false);
          }
        }

        // The 2 AM user should not receive a message on DST transition day
        // They would typically get their message at 7 AM UTC (2 AM EST)
        // But on DST day, that hour doesn't exist in their local time
      });
    });

    it('should deliver messages correctly after spring DST transition', async () => {
      await withTestDatabase(async (db) => {
        // Create user with morning preference
        const user = new UserBuilder()
          .withId('user-ny-8am')
          .withName('New York 8 AM User')
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
          workoutInstances: [
            {
              id: `workout-${user.id}-1`,
              clientId: user.id,
              fitnessPlanId: 'plan-123',
              mesocycleId: 'meso-123',
              microcycleId: 'micro-123',
              sessionType: 'strength',
              date: new Date('2024-03-09'),  // Day before DST
              details: JSON.stringify([{ label: 'Main', activities: ['Squats'] }]),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: `workout-${user.id}-2`,
              clientId: user.id,
              fitnessPlanId: 'plan-123',
              mesocycleId: 'meso-123',
              microcycleId: 'micro-123',
              sessionType: 'cardio',
              date: new Date('2024-03-11'),  // Day after DST
              details: JSON.stringify([{ label: 'Main', activities: ['Running'] }]),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
          ],
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

        messageTracker.reset();

        // Before DST: 8 AM EST = 13:00 UTC
        vi.setSystemTime(new Date('2024-03-09T13:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-ny-8am')).toBe(true);
        expect(messageTracker.getMessageCount('user-ny-8am')).toBe(1);

        messageTracker.reset();

        // After DST: 8 AM EDT = 12:00 UTC (one hour earlier)
        vi.setSystemTime(new Date('2024-03-11T12:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-ny-8am')).toBe(true);
        expect(messageTracker.getMessageCount('user-ny-8am')).toBe(1);

        // Verify the UTC hour changed but local time stayed the same
        expect(messageTracker.getTotalMessageCount()).toBe(2);
      });
    });
  });

  describe('Fall Back (November)', () => {
    it('should handle 2 AM occurring twice during fall DST transition', async () => {
      await withTestDatabase(async (db) => {
        // Create users with 2 AM preference
        const user = new UserBuilder()
          .withId('user-ny-2am-fall')
          .withName('New York 2 AM Fall User')
          .withTimezone('America/New_York')
          .withPreferredSendHour(2)
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
            sessionType: 'recovery',
            date: new Date('2024-11-03'),  // DST transition day
            details: JSON.stringify([{ label: 'Main', activities: ['Stretching'] }]),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
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

        // DST ends at 2 AM on November 3, 2024
        // When clock hits 2 AM EDT, it falls back to 1 AM EST
        // So there are two 1 AM hours and two 2 AM hours
        
        // First 2 AM (EDT) = 6 AM UTC
        // Second 2 AM (EST) = 7 AM UTC
        
        messageTracker.reset();
        
        // Test the first 2 AM (EDT)
        vi.setSystemTime(new Date('2024-11-03T06:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-ny-2am-fall')).toBe(true);
        expect(messageTracker.getMessageCount('user-ny-2am-fall')).toBe(1);
        
        // Test the second 2 AM (EST) - should NOT send again
        vi.setSystemTime(new Date('2024-11-03T07:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        
        // User should still have only received one message
        expect(messageTracker.getMessageCount('user-ny-2am-fall')).toBe(1);
      });
    });

    it('should maintain consistent delivery after fall DST transition', async () => {
      await withTestDatabase(async (db) => {
        // Create user with consistent morning preference
        const user = new UserBuilder()
          .withId('user-chicago-7am')
          .withName('Chicago 7 AM User')
          .withTimezone('America/Chicago')
          .withPreferredSendHour(7)
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
            status: 'active',
            planType: 'premium',
            currentPeriodStart: new Date('2024-01-01'),
            currentPeriodEnd: new Date('2024-12-31'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          }],
          workoutInstances: [
            {
              id: `workout-${user.id}-1`,
              clientId: user.id,
              fitnessPlanId: 'plan-123',
              mesocycleId: 'meso-123',
              microcycleId: 'micro-123',
              sessionType: 'strength',
              date: new Date('2024-11-02'),  // Day before DST ends
              details: JSON.stringify([{ label: 'Main', activities: ['Bench Press'] }]),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: `workout-${user.id}-2`,
              clientId: user.id,
              fitnessPlanId: 'plan-123',
              mesocycleId: 'meso-123',
              microcycleId: 'micro-123',
              sessionType: 'cardio',
              date: new Date('2024-11-04'),  // Day after DST ends
              details: JSON.stringify([{ label: 'Main', activities: ['Cycling'] }]),
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
          ],
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

        messageTracker.reset();

        // Before DST ends: 7 AM CDT = 12:00 UTC
        vi.setSystemTime(new Date('2024-11-02T12:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-chicago-7am')).toBe(true);

        messageTracker.reset();

        // After DST ends: 7 AM CST = 13:00 UTC (one hour later)
        vi.setSystemTime(new Date('2024-11-04T13:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-chicago-7am')).toBe(true);

        // Both days should have exactly one message
        expect(messageTracker.getTotalMessageCount()).toBe(2);
      });
    });

    it('should handle users in non-DST observing timezones during transition periods', async () => {
      await withTestDatabase(async (db) => {
        // Create users in timezones that don't observe DST
        const users = [
          new UserBuilder()
            .withId('user-arizona')
            .withName('Arizona User')
            .withTimezone('America/Phoenix')  // Arizona doesn't observe DST
            .withPreferredSendHour(7)
            .build(),
          new UserBuilder()
            .withId('user-utc')
            .withName('UTC User')
            .withTimezone('UTC')  // UTC never changes
            .withPreferredSendHour(7)
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
            workoutInstances: [{
              id: `workout-${user.id}`,
              clientId: user.id,
              fitnessPlanId: 'plan-123',
              mesocycleId: 'meso-123',
              microcycleId: 'micro-123',
              sessionType: 'strength',
              date: new Date('2024-11-03'),
              details: JSON.stringify([{ label: 'Main', activities: ['Deadlifts'] }]),
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

        // These users should receive messages at consistent UTC times
        // regardless of DST transitions elsewhere
        
        // Arizona: 7 AM MST = 14:00 UTC (year-round)
        // UTC: 7 AM UTC = 07:00 UTC (obviously)
        
        messageTracker.reset();
        
        // Test on DST transition day
        vi.setSystemTime(new Date('2024-11-03T14:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-arizona')).toBe(true);
        
        messageTracker.reset();
        
        vi.setSystemTime(new Date('2024-11-03T07:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-utc')).toBe(true);
        
        // These should be consistent throughout the year
        expect(messageTracker.getTotalMessageCount()).toBe(2);
      });
    });
  });
});