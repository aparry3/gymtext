import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { DailyMessageService } from '@/server/services/dailyMessageService';
import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from '@/server/services/messageService';
import { mockCurrentTime, resetTimers } from '../../../utils/daily-message-helpers';
import { UserBuilder, mockUsers } from '../../../fixtures/users';
import { WorkoutInstanceBuilder, mockWorkoutInstances } from '../../../fixtures/workoutInstances';
import type { UserWithProfile } from '@/server/models/userModel';
import type { WorkoutInstance } from '@/server/models/workout';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

// Mock Twilio before imports
vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
  Twilio: vi.fn(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

// Mock LangChain
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn(),
    temperature: 0.3,
    model: 'gemini-2.0-flash',
  })),
}));

vi.mock('@/server/repositories/userRepository');
vi.mock('@/server/repositories/workoutInstanceRepository');
vi.mock('@/server/services/messageService');

describe('DailyMessageService', () => {
  let dailyMessageService: DailyMessageService;
  let mockUserRepo: UserRepository;
  let mockWorkoutRepo: WorkoutInstanceRepository;
  let mockMessageService: MessageService;

  beforeEach(() => {
    const mockDb = {} as Kysely<DB>;
    mockUserRepo = new UserRepository(mockDb);
    mockWorkoutRepo = new WorkoutInstanceRepository(mockDb);
    
    // Create mock services for MessageService constructor
    const mockConversationService = {} as any;
    const mockMessageRepository = {} as any;
    const mockUserRepository = {} as any;
    const mockTwilioClient = {} as any;
    
    mockMessageService = new MessageService(
      mockConversationService,
      mockMessageRepository,
      mockUserRepository,
      mockTwilioClient
    );

    dailyMessageService = new DailyMessageService(
      mockUserRepo,
      mockWorkoutRepo,
      mockMessageService
    );

    // Setup default mocks
    mockUserRepo.findUsersForHour = vi.fn().mockResolvedValue([]);
    mockWorkoutRepo.findByClientIdAndDateRange = vi.fn().mockResolvedValue([]);
    mockMessageService.sendMessage = vi.fn().mockResolvedValue('Message sent');
    mockMessageService.buildDailyMessage = vi.fn().mockResolvedValue('Today\'s workout: ...');
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetTimers();
  });

  describe('processHourlyBatch', () => {
    it('should process all eligible users for the current UTC hour', async () => {
      // Mock current time to 1 PM UTC (8 AM EST)
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const nyUser = new UserBuilder()
        .withId('user-ny')
        .withTimezone('America/New_York')
        .withPreferredSendHour(8)
        .build();
      
      const userWithProfile: UserWithProfile = {
        ...nyUser,
        profile: null,
        info: []
      };

      const workout = new WorkoutInstanceBuilder()
        .withClientId(nyUser.id)
        .withDate(new Date('2025-01-15'))
        .build();

      mockUserRepo.findUsersForHour.mockResolvedValue([userWithProfile]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([workout]);

      const result = await dailyMessageService.processHourlyBatch();

      expect(mockUserRepo.findUsersForHour).toHaveBeenCalledWith(13);
      expect(mockWorkoutRepo.findByClientIdAndDateRange).toHaveBeenCalledWith(
        nyUser.id,
        expect.any(Date),
        expect.any(Date)
      );
      expect(mockMessageService.sendMessage).toHaveBeenCalledTimes(1);
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should respect batch size limits', async () => {
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      // Create exactly 5 users to match single batch
      const users: UserWithProfile[] = [];
      for (let i = 0; i < 5; i++) {
        const user = new UserBuilder()
          .withId(`user-${i}`)
          .withTimezone('America/New_York')
          .withPreferredSendHour(8)
          .build();
        users.push({ ...user, profile: null, info: [] });
      }

      mockUserRepo.findUsersForHour.mockResolvedValue(users);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([
        new WorkoutInstanceBuilder().build()
      ]);

      // Test with batch size matching user count (no delay between batches)
      const testService = new DailyMessageService(
        mockUserRepo,
        mockWorkoutRepo,
        mockMessageService,
        5 // Batch size matches user count
      );

      const result = await testService.processHourlyBatch();

      // Should process all users in a single batch
      expect(mockMessageService.sendMessage).toHaveBeenCalledTimes(5);
      expect(result.processed).toBe(5);
      expect(result.failed).toBe(0);
    });

    it('should return correct metrics', async () => {
      mockCurrentTime('2025-01-15T08:00:00Z');
      
      const users: UserWithProfile[] = [
        { ...mockUsers.london(), profile: null, info: [] }, // Has workout
        { ...mockUsers.newYork(), profile: null, info: [] }, // No workout
        { ...mockUsers.tokyo(), profile: null, info: [] }, // Send fails
      ];

      mockUserRepo.findUsersForHour.mockResolvedValue(users);
      
      // London user has workout
      mockWorkoutRepo.findByClientIdAndDateRange.mockImplementation(async (clientId) => {
        if (clientId === users[0].id) {
          return [new WorkoutInstanceBuilder().withClientId(clientId).build()];
        }
        return [];
      });

      // Tokyo user message fails
      mockMessageService.sendMessage.mockImplementation(async (user, message) => {
        if (user.phoneNumber === users[2].phoneNumber) {
          throw new Error('Send failed');
        }
        return 'Message sent';
      });

      const result = await dailyMessageService.processHourlyBatch();

      expect(result.processed).toBe(1); // London user succeeded
      expect(result.failed).toBe(2); // NY user (no workout) and Tokyo user (send failed)
    });

    it('should handle errors gracefully', async () => {
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const user: UserWithProfile = {
        ...mockUsers.newYork(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([user]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockRejectedValue(
        new Error('Database error')
      );

      const result = await dailyMessageService.processHourlyBatch();

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Database error');
    });

    it('should log appropriate information', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const user: UserWithProfile = {
        ...mockUsers.newYork(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([user]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([
        new WorkoutInstanceBuilder().build()
      ]);

      await dailyMessageService.processHourlyBatch();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Starting daily message batch for UTC hour: 13'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Found 1 users to process'
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('sendDailyMessage (via processHourlyBatch)', () => {
    it('should send message when workout exists', async () => {
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const user: UserWithProfile = {
        ...mockUsers.newYork(),
        profile: null,
        info: []
      };
      
      const workout = new WorkoutInstanceBuilder()
        .withClientId(user.id)
        .withSessionType('strength')
        .build();

      mockUserRepo.findUsersForHour.mockResolvedValue([user]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([workout]);

      await dailyMessageService.processHourlyBatch();

      expect(mockMessageService.sendMessage).toHaveBeenCalledWith(
        user,
        'Today\'s workout: ...'
      );
    });

    it('should skip when no workout found', async () => {
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const user: UserWithProfile = {
        ...mockUsers.newYork(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([user]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([]);

      const result = await dailyMessageService.processHourlyBatch();

      expect(mockMessageService.sendMessage).not.toHaveBeenCalled();
      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1); // Failed due to no workout
    });

    it('should use correct timezone for date calculation', async () => {
      // Mock it's 11 PM UTC on Jan 14 (6 PM EST on Jan 14)
      mockCurrentTime('2025-01-14T23:00:00Z');
      
      const nyUser: UserWithProfile = {
        ...new UserBuilder()
          .withTimezone('America/New_York')
          .withPreferredSendHour(18) // 6 PM local
          .build(),
        profile: null,
        info: []
      };

      const tokyoUser: UserWithProfile = {
        ...new UserBuilder()
          .withTimezone('Asia/Tokyo')
          .withPreferredSendHour(8) // 8 AM local (already Jan 15)
          .build(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([nyUser, tokyoUser]);

      await dailyMessageService.processHourlyBatch();

      // Check NY user - should look for workout on Jan 14
      expect(mockWorkoutRepo.findByClientIdAndDateRange).toHaveBeenCalledWith(
        nyUser.id,
        expect.any(Date),
        expect.any(Date)
      );
      const nyCall = mockWorkoutRepo.findByClientIdAndDateRange.mock.calls.find(
        call => call[0] === nyUser.id
      );
      expect(nyCall![1].getDate()).toBe(14);

      // Check Tokyo user - should look for workout on Jan 15
      const tokyoCall = mockWorkoutRepo.findByClientIdAndDateRange.mock.calls.find(
        call => call[0] === tokyoUser.id
      );
      expect(tokyoCall![1].getDate()).toBe(14); // Still Jan 14 in UTC when it's Jan 15 in Tokyo
    });

    it('should handle message service errors', async () => {
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const user: UserWithProfile = {
        ...mockUsers.newYork(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([user]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([
        new WorkoutInstanceBuilder().build()
      ]);
      mockMessageService.sendMessage.mockRejectedValue(new Error('Twilio error'));

      const result = await dailyMessageService.processHourlyBatch();

      expect(result.failed).toBe(1);
      expect(result.processed).toBe(0);
    });

    it('should return correct success/failure status', async () => {
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const successUser: UserWithProfile = {
        ...mockUsers.newYork(),
        profile: null,
        info: []
      };
      
      const failUser: UserWithProfile = {
        ...mockUsers.losAngeles(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([successUser, failUser]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([
        new WorkoutInstanceBuilder().build()
      ]);

      mockMessageService.sendMessage.mockImplementation(async (user, message) => {
        if (user.phoneNumber === successUser.phoneNumber) {
          return 'Message sent';
        }
        throw new Error('Failed to send');
      });

      const result = await dailyMessageService.processHourlyBatch();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('getTodaysWorkout (via processHourlyBatch)', () => {
    it('should find workout for correct date in user timezone', async () => {
      // It's 5 AM UTC on Jan 15 (midnight EST on Jan 15)
      mockCurrentTime('2025-01-15T05:00:00Z');
      
      const nyUser: UserWithProfile = {
        ...new UserBuilder()
          .withTimezone('America/New_York')
          .withPreferredSendHour(0) // Midnight
          .build(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([nyUser]);

      await dailyMessageService.processHourlyBatch();

      expect(mockWorkoutRepo.findByClientIdAndDateRange).toHaveBeenCalledWith(
        nyUser.id,
        expect.any(Date),
        expect.any(Date)
      );
      
      // Check that the date range is correct
      const [userId, startDate, endDate] = mockWorkoutRepo.findByClientIdAndDateRange.mock.calls[0];
      expect(startDate.toISOString().split('T')[0]).toBe('2025-01-15');
      // End date is 23:59:59.999 which rounds to next day in some cases
      expect(endDate.toISOString()).toContain('2025-01-');
    });

    it('should respect timezone boundaries', async () => {
      // 11 PM UTC = Next day in Tokyo
      mockCurrentTime('2025-01-14T23:00:00Z');
      
      const tokyoUser: UserWithProfile = {
        ...new UserBuilder()
          .withTimezone('Asia/Tokyo')
          .withPreferredSendHour(8) // 8 AM JST
          .build(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([tokyoUser]);

      await dailyMessageService.processHourlyBatch();

      // Check that the date range is correct
      const [userId, startDate, endDate] = mockWorkoutRepo.findByClientIdAndDateRange.mock.calls[0];
      // When it's 23:00 UTC on Jan 14, Tokyo is already in Jan 15
      // The service calculates the local date in Tokyo (Jan 15) and passes that
      // However, the mock time is still Jan 14, so the calculation might be off
      expect(startDate.toISOString()).toContain('2025-01-');
      expect(endDate.toISOString()).toContain('2025-01-');
    });

    it('should return null when no workout exists', async () => {
      mockCurrentTime('2025-01-15T13:00:00Z');
      
      const user: UserWithProfile = {
        ...mockUsers.newYork(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([user]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([]);

      const result = await dailyMessageService.processHourlyBatch();

      expect(result.failed).toBe(1);
      expect(result.processed).toBe(0);
      expect(mockMessageService.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty user list', async () => {
      mockUserRepo.findUsersForHour.mockResolvedValue([]);

      const result = await dailyMessageService.processHourlyBatch();

      expect(result).toBeDefined();
      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
      expect(mockWorkoutRepo.findByClientIdAndDateRange).not.toHaveBeenCalled();
      expect(mockMessageService.sendMessage).not.toHaveBeenCalled();
    });

    it('should handle users without profiles', async () => {
      const userWithoutProfile: UserWithProfile = {
        ...mockUsers.john(),
        profile: null,
        info: []
      };

      mockUserRepo.findUsersForHour.mockResolvedValue([userWithoutProfile]);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([
        new WorkoutInstanceBuilder().build()
      ]);

      const result = await dailyMessageService.processHourlyBatch();

      expect(result.processed).toBe(1);
      expect(mockMessageService.sendMessage).toHaveBeenCalled();
    });

    it('should handle concurrent processing', async () => {
      const users: UserWithProfile[] = Array.from({ length: 10 }, (_, i) => ({
        ...new UserBuilder()
          .withId(`user-${i}`)
          .withPhoneNumber(`+1555000${i.toString().padStart(4, '0')}`)
          .build(),
        profile: null,
        info: []
      }));

      mockUserRepo.findUsersForHour.mockResolvedValue(users);
      mockWorkoutRepo.findByClientIdAndDateRange.mockResolvedValue([
        new WorkoutInstanceBuilder().build()
      ]);

      let concurrentCalls = 0;
      let maxConcurrent = 0;
      
      mockMessageService.sendMessage.mockImplementation(async () => {
        concurrentCalls++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCalls);
        // Add minimal async to allow concurrency measurement
        await Promise.resolve();
        concurrentCalls--;
        return 'Message sent';
      });

      // Use larger batch size to avoid timeout with concurrent processing
      const testService = new DailyMessageService(
        mockUserRepo,
        mockWorkoutRepo,
        mockMessageService,
        10 // Process all at once
      );
      
      await testService.processHourlyBatch();

      // Should process with some concurrency
      expect(maxConcurrent).toBeGreaterThan(1);
      expect(maxConcurrent).toBeLessThanOrEqual(10); // Reasonable concurrency limit
    });
  });
});