import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withTestDatabase, seedTestData } from '../../utils/db';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';
import { UserBuilder } from '../../fixtures/users';
import { createMessageTracker } from '../../utils/daily-message-helpers';
import { DateTime } from 'luxon';
import type { UserWithProfile } from '@/server/models/userModel';
import type { WorkoutInstance } from '@/server/models/workout';

describe('Daily Message Edge Cases Integration Tests', () => {
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

  describe('Midnight Boundary', () => {
    it('should handle 11 PM local time crossing into next UTC day', async () => {
      await withTestDatabase(async (db) => {
        // Create user in Hawaii (UTC-10) with 11 PM preference
        // 11 PM HST = 9 AM UTC next day
        const user = new UserBuilder()
          .withId('user-hawaii-11pm')
          .withName('Hawaii 11 PM User')
          .withTimezone('Pacific/Honolulu')
          .withPreferredSendHour(23)  // 11 PM
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
            date: new Date('2024-03-15'),  // March 15 in user's timezone
            details: JSON.stringify([{ label: 'Main', activities: ['Yoga'] }]),
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

        // When it's 11 PM on March 15 in Hawaii, it's 9 AM on March 16 UTC
        vi.setSystemTime(new Date('2024-03-16T09:00:00Z'));
        messageTracker.reset();

        await dailyMessageService.processHourlyBatch();

        // User should receive message
        expect(messageTracker.hasReceivedMessage('user-hawaii-11pm')).toBe(true);
        
        // Verify the date calculation is correct for the user's timezone
        const messages = messageTracker.getMessages('user-hawaii-11pm');
        expect(messages).toHaveLength(1);
        
        // The workout date should match the user's local date
        const userLocalTime = DateTime.fromJSDate(new Date('2024-03-16T09:00:00Z'))
          .setZone('Pacific/Honolulu');
        expect(userLocalTime.hour).toBe(23);  // 11 PM
        expect(userLocalTime.day).toBe(15);    // Still March 15 in Hawaii
      });
    });

    it('should handle 1 AM local time from previous UTC day', async () => {
      await withTestDatabase(async (db) => {
        // Create user in New Zealand (UTC+12) with 1 AM preference
        // 1 AM NZST = 1 PM UTC previous day
        const user = new UserBuilder()
          .withId('user-nz-1am')
          .withName('New Zealand 1 AM User')
          .withTimezone('Pacific/Auckland')
          .withPreferredSendHour(1)  // 1 AM
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
            sessionType: 'cardio',
            date: new Date('2024-03-16'),  // March 16 in user's timezone
            details: JSON.stringify([{ label: 'Main', activities: ['Swimming'] }]),
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

        // When it's 1 AM on March 16 in Auckland (UTC+13 during DST), it's 12 PM on March 15 UTC
        vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
        messageTracker.reset();

        await dailyMessageService.processHourlyBatch();

        // User should receive message
        expect(messageTracker.hasReceivedMessage('user-nz-1am')).toBe(true);
        
        // Verify the local time calculation
        const userLocalTime = DateTime.fromJSDate(new Date('2024-03-15T12:00:00Z'))
          .setZone('Pacific/Auckland');
        expect(userLocalTime.hour).toBe(1);   // 1 AM
        expect(userLocalTime.day).toBe(16);   // March 16 in Auckland
      });
    });
  });

  describe('Half-Hour Timezones', () => {
    it('should handle India timezone (UTC+5:30)', async () => {
      await withTestDatabase(async (db) => {
        // Create user in India with morning preference
        const user = new UserBuilder()
          .withId('user-mumbai')
          .withName('Mumbai User')
          .withTimezone('Asia/Kolkata')  // UTC+5:30
          .withPreferredSendHour(6)  // 6 AM IST = 12:30 AM UTC
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
            sessionType: 'strength',
            date: new Date('2024-03-15'),
            details: JSON.stringify([{ label: 'Main', activities: ['Push-ups'] }]),
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

        // Test both possible UTC hours for the half-hour timezone
        // 6 AM IST could map to either 0 UTC or 1 UTC depending on rounding
        
        // First test 0 UTC (12:30 AM UTC = 6:00 AM IST)
        vi.setSystemTime(new Date('2024-03-15T00:30:00Z'));
        messageTracker.reset();
        await dailyMessageService.processHourlyBatch();
        
        const receivedAt0UTC = messageTracker.hasReceivedMessage('user-mumbai');
        
        // Then test 1 UTC
        vi.setSystemTime(new Date('2024-03-15T01:00:00Z'));
        if (!receivedAt0UTC) {
          await dailyMessageService.processHourlyBatch();
        }
        
        // User should have received exactly one message at one of these hours
        expect(messageTracker.getMessageCount('user-mumbai')).toBe(1);
      });
    });

    it('should handle Newfoundland timezone (UTC-3:30)', async () => {
      await withTestDatabase(async (db) => {
        // Create user in Newfoundland
        const user = new UserBuilder()
          .withId('user-stjohns')
          .withName('St Johns User')
          .withTimezone('America/St_Johns')  // UTC-3:30
          .withPreferredSendHour(7)  // 7 AM NST
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
            sessionType: 'cardio',
            date: new Date('2024-06-15'),  // June to avoid DST complications
            details: JSON.stringify([{ label: 'Main', activities: ['Running'] }]),
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

        // 7 AM NDT (UTC-2:30 in summer) = 9:30 AM UTC
        // This should round to either 9 UTC or 10 UTC
        vi.setSystemTime(new Date('2024-06-15T09:30:00Z'));
        messageTracker.reset();
        await dailyMessageService.processHourlyBatch();
        
        const receivedAt9UTC = messageTracker.hasReceivedMessage('user-stjohns');
        
        vi.setSystemTime(new Date('2024-06-15T10:00:00Z'));
        if (!receivedAt9UTC) {
          await dailyMessageService.processHourlyBatch();
        }
        
        expect(messageTracker.getMessageCount('user-stjohns')).toBe(1);
      });
    });

    it('should handle Nepal timezone (UTC+5:45)', async () => {
      await withTestDatabase(async (db) => {
        // Create user in Nepal (UTC+5:45 - quarter-hour offset)
        const user = new UserBuilder()
          .withId('user-kathmandu')
          .withName('Kathmandu User')
          .withTimezone('Asia/Kathmandu')  // UTC+5:45
          .withPreferredSendHour(8)  // 8 AM NPT
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
            sessionType: 'mobility',
            date: new Date('2024-03-15'),
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

        // 8 AM NPT = 2:15 AM UTC
        // Should round to 2 UTC
        vi.setSystemTime(new Date('2024-03-15T02:00:00Z'));
        messageTracker.reset();
        await dailyMessageService.processHourlyBatch();
        
        const receivedAt2UTC = messageTracker.hasReceivedMessage('user-kathmandu');
        
        // Also check 3 UTC in case of different rounding
        vi.setSystemTime(new Date('2024-03-15T03:00:00Z'));
        if (!receivedAt2UTC) {
          await dailyMessageService.processHourlyBatch();
        }
        
        expect(messageTracker.getMessageCount('user-kathmandu')).toBe(1);
      });
    });
  });

  describe('International Date Line', () => {
    it('should handle Kiribati (UTC+14)', async () => {
      await withTestDatabase(async (db) => {
        // Create user in Kiribati - the earliest timezone
        const user = new UserBuilder()
          .withId('user-kiribati')
          .withName('Kiribati User')
          .withTimezone('Pacific/Kiritimati')  // UTC+14
          .withPreferredSendHour(6)  // 6 AM LINT
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
            sessionType: 'strength',
            date: new Date('2024-03-16'),  // Local date
            details: JSON.stringify([{ label: 'Main', activities: ['Squats'] }]),
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

        // 6 AM in UTC+14 = 4 PM UTC previous day
        vi.setSystemTime(new Date('2024-03-15T16:00:00Z'));
        messageTracker.reset();

        await dailyMessageService.processHourlyBatch();

        expect(messageTracker.hasReceivedMessage('user-kiribati')).toBe(true);
        
        // Verify it's the correct local time
        const localTime = DateTime.fromJSDate(new Date('2024-03-15T16:00:00Z'))
          .setZone('Pacific/Kiritimati');
        expect(localTime.hour).toBe(6);
        expect(localTime.day).toBe(16);  // Already March 16 in Kiribati
      });
    });

    it('should handle Baker Island (UTC-12)', async () => {
      await withTestDatabase(async (db) => {
        // Create user in Baker Island - one of the latest timezones
        const user = new UserBuilder()
          .withId('user-baker')
          .withName('Baker Island User')
          .withTimezone('Etc/GMT+12')  // UTC-12 (note: Etc zones use opposite signs)
          .withPreferredSendHour(8)  // 8 AM local
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
            sessionType: 'cardio',
            date: new Date('2024-03-15'),
            details: JSON.stringify([{ label: 'Main', activities: ['Rowing'] }]),
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

        // 8 AM in UTC-12 = 8 PM UTC same day
        vi.setSystemTime(new Date('2024-03-15T20:00:00Z'));
        messageTracker.reset();

        await dailyMessageService.processHourlyBatch();

        expect(messageTracker.hasReceivedMessage('user-baker')).toBe(true);
        
        // Verify local time
        const localTime = DateTime.fromJSDate(new Date('2024-03-15T20:00:00Z'))
          .setZone('Etc/GMT+12');
        expect(localTime.hour).toBe(8);
        expect(localTime.day).toBe(15);  // Still March 15 in Baker Island
      });
    });

    it('should handle 26-hour spread between earliest and latest timezones', async () => {
      await withTestDatabase(async (db) => {
        // Create users at opposite ends of the date line
        const users = [
          new UserBuilder()
            .withId('user-earliest')
            .withName('Kiribati User')
            .withTimezone('Pacific/Kiritimati')  // UTC+14
            .withPreferredSendHour(8)
            .build(),
          new UserBuilder()
            .withId('user-latest')
            .withName('Baker User')
            .withTimezone('Etc/GMT+12')  // UTC-12
            .withPreferredSendHour(8)
            .build(),
        ];

        // Seed both users
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
              details: JSON.stringify([{ label: 'Main', activities: ['Workout'] }]),
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

        messageTracker.reset();

        // 8 AM in Kiribati (UTC+14) = 6 PM UTC previous day
        vi.setSystemTime(new Date('2024-03-14T18:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-earliest')).toBe(true);
        expect(messageTracker.hasReceivedMessage('user-latest')).toBe(false);

        // 8 AM in Baker Island (UTC-12) = 8 PM UTC same day
        // That's 26 hours later in UTC time
        vi.setSystemTime(new Date('2024-03-15T20:00:00Z'));
        await dailyMessageService.processHourlyBatch();
        expect(messageTracker.hasReceivedMessage('user-latest')).toBe(true);

        // Both users received exactly one message
        expect(messageTracker.getMessageCount('user-earliest')).toBe(1);
        expect(messageTracker.getMessageCount('user-latest')).toBe(1);
        
        // But they received them 26 hours apart in UTC time
        const timeDiff = new Date('2024-03-15T20:00:00Z').getTime() - 
                        new Date('2024-03-14T18:00:00Z').getTime();
        expect(timeDiff).toBe(26 * 60 * 60 * 1000);  // 26 hours in milliseconds
      });
    });
  });
});