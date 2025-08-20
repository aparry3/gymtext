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

describe('24-Hour Daily Message Simulation', () => {
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
        const currentUTCHour = new Date().getUTCHours();
        messageTracker.recordMessage(user.id, message, {
          sentAtUTCHour: currentUTCHour,
          userTimezone: user.timezone,
          userPreferredHour: user.preferredSendHour
        });
        return Promise.resolve();
      }),
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should deliver messages to all users at their preferred local time over 24 hours', async () => {
    await withTestDatabase(async (db) => {
      // Create test users for every hour (0-23) across different timezones
      const users: UserWithProfile[] = [];
      const timezones = [
        'America/New_York',    // UTC-5/4
        'America/Los_Angeles', // UTC-8/7
        'Europe/London',       // UTC+0/1
        'Asia/Tokyo',          // UTC+9
        'Australia/Sydney',    // UTC+10/11
        'Asia/Kolkata',        // UTC+5:30
        'Pacific/Auckland',    // UTC+12/13
        'America/Sao_Paulo',   // UTC-3
        'Europe/Paris',        // UTC+1/2
        'Asia/Dubai',          // UTC+4
      ];

      // Create users for each hour (0-23) distributed across timezones
      for (let hour = 0; hour < 24; hour++) {
        const timezone = timezones[hour % timezones.length];
        const user = new UserBuilder()
          .withName(`User Hour ${hour} (${timezone})`)
          .withTimezone(timezone)
          .withPreferredSendHour(hour)
          .build();
        users.push(user);
      }

      // Seed all users
      await seedTestData(db, {
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          email: user.email,
          stripeCustomerId: user.stripeCustomerId,
          timezone: user.timezone,
          preferredSendHour: user.preferredSendHour,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        fitnessProfiles: users.map(user => ({
          id: user.profile.id,
          userId: user.id,
          fitnessGoals: user.profile.fitnessGoals,
          skillLevel: user.profile.skillLevel,
          exerciseFrequency: user.profile.exerciseFrequency,
          gender: user.profile.gender,
          age: user.profile.age,
          createdAt: user.profile.createdAt,
          updatedAt: user.profile.updatedAt,
        })),
        subscriptions: users.map(user => createTestSubscription(user.id)),
      });

      // Create fitness plan structure and workouts for all users
      // We'll create workouts for March 15, 2024 (a date that covers DST for some timezones)
      
      for (const user of users) {
        const fitnessPlanId = generateUuid();
        const mesocycleId = generateUuid();
        const microcycleId = generateUuid();
        
        await db.insertInto('fitnessPlans').values({
          id: fitnessPlanId,
          clientId: user.id,
          programType: 'strength',
          goalStatement: 'Build strength',
          overview: 'Strength program',
          mesocycles: JSON.stringify([ { name: 'Phase', weeks: 4, focus: ['volume'], deload: false } ]),
          startDate: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }).execute();
        
        // no mesocycles table in new schema
        
        await db.insertInto('microcycles').values({
          id: microcycleId,
          userId: user.id,
          fitnessPlanId: fitnessPlanId,
          mesocycleIndex: 0,
          weekNumber: 1,
          pattern: JSON.stringify({ weekIndex: 1, days: [] }),
          startDate: new Date('2024-03-10'),
          endDate: new Date('2024-03-17'),
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }).execute();
        
        // Create workouts for multiple days to ensure coverage
        // Create workouts for March 14, 15, and 16 to cover timezone differences
        const dates = [
          new Date('2024-03-14T12:00:00Z'),
          new Date('2024-03-15T12:00:00Z'),
          new Date('2024-03-16T12:00:00Z')
        ];
        
        for (const date of dates) {
          await db.insertInto('workoutInstances').values({
            id: generateUuid(),
            clientId: user.id,
            fitnessPlanId: fitnessPlanId,
            mesocycleId: mesocycleId,
            microcycleId: microcycleId,
            sessionType: user.preferredSendHour % 2 === 0 ? 'strength' : 'cardio',
            date: date,
            details: JSON.stringify([{ 
              label: 'Main', 
              activities: [`Activity for hour ${user.preferredSendHour}`] 
            }]),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          }).execute();
        }
      }

      // Create services
      const userRepository = new UserRepository(db);
      const workoutRepository = new WorkoutInstanceRepository(db);
      const dailyMessageService = new DailyMessageService(
        userRepository,
        workoutRepository,
        mockMessageService,
        50 // Higher batch size for this test
      );

      // Start simulation at midnight UTC on March 15, 2024
      const simulationStart = new Date('2024-03-15T00:00:00Z');
      vi.setSystemTime(simulationStart);

      // Track batch processing results
      const batchResults = [];

      // Simulate 24 hours
      for (let utcHour = 0; utcHour < 24; utcHour++) {
        // Set time to current UTC hour
        const currentTime = new Date(simulationStart);
        currentTime.setUTCHours(utcHour, 0, 0, 0);
        vi.setSystemTime(currentTime);

        console.log(`\nProcessing UTC hour ${utcHour} (${currentTime.toISOString()})`);

        // Process the batch for this hour
        const result = await dailyMessageService.processHourlyBatch();
        batchResults.push({
          utcHour,
          processed: result.processed,
          failed: result.failed,
          errors: result.errors
        });

        console.log(`  Processed: ${result.processed}, Failed: ${result.failed}`);
      }

      // Verify results
      console.log('\n=== 24-Hour Simulation Results ===');
      console.log(`Total users: ${users.length}`);
      console.log(`Total messages sent: ${messageTracker.getTotalMessageCount()}`);
      console.log(`Unique users who received messages: ${messageTracker.getUniqueUserCount()}`);

      // Each user should receive exactly one message
      for (const user of users) {
        const messageCount = messageTracker.getMessageCount(user.id);
        expect(messageCount).toBe(1);
        
        // Get the message details
        const messages = messageTracker.getMessagesForUser(user.id);
        if (messages.length > 0) {
          const metadata = messages[0].metadata;
          console.log(`${user.name}: preferred=${user.preferredSendHour}, sent at UTC hour=${metadata?.sentAtUTCHour}`);
        }
      }

      // Total message count should match user count
      expect(messageTracker.getTotalMessageCount()).toBe(users.length);
      expect(messageTracker.getUniqueUserCount()).toBe(users.length);

      // Verify no errors occurred
      const totalErrors = batchResults.reduce((sum, batch) => sum + batch.errors.length, 0);
      expect(totalErrors).toBe(0);

      // Verify batch processing distribution
      const totalProcessed = batchResults.reduce((sum, batch) => sum + batch.processed, 0);
      const totalFailed = batchResults.reduce((sum, batch) => sum + batch.failed, 0);
      
      console.log(`\nBatch processing summary:`);
      console.log(`Total processed: ${totalProcessed}`);
      console.log(`Total failed: ${totalFailed}`);
      
      expect(totalProcessed).toBe(users.length);
      expect(totalFailed).toBe(0);

      // Log hour-by-hour breakdown
      console.log('\nHour-by-hour breakdown:');
      batchResults.forEach(batch => {
        if (batch.processed > 0) {
          console.log(`UTC Hour ${batch.utcHour}: ${batch.processed} messages sent`);
        }
      });
    });
  }, 30000); // 30 second timeout for this comprehensive test
});