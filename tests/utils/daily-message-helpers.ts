import { vi } from 'vitest';
import type { User } from '@/server/models/userModel';
import { UserBuilder, mockUsers } from '../fixtures/users';
import { MockTwilioClient } from '../mocks/twilio';
import { DateTime } from 'luxon';

/**
 * Mock the current time to a specific date/time
 */
export function mockCurrentTime(date: Date | string): void {
  const mockDate = typeof date === 'string' ? new Date(date) : date;
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
}

/**
 * Advance time by a specified number of hours
 */
export function advanceTimeByHours(hours: number): void {
  const currentTime = new Date();
  const newTime = new Date(currentTime.getTime() + hours * 60 * 60 * 1000);
  vi.setSystemTime(newTime);
}

/**
 * Reset timers to real time
 */
export function resetTimers(): void {
  vi.useRealTimers();
}

/**
 * Create a grid of test users across different timezones for comprehensive testing
 */
export function createTestUserGrid(): User[] {
  const hours = [0, 6, 8, 12, 17, 23]; // Different preferred hours
  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Asia/Kolkata', // UTC+5:30
    'Pacific/Kiritimati', // UTC+14
    'Pacific/Midway', // UTC-11
  ];

  const users: User[] = [];
  let userIndex = 0;

  timezones.forEach((timezone) => {
    hours.forEach((hour) => {
      users.push(
        new UserBuilder()
          .withId(`user-grid-${userIndex++}`)
          .withName(`User ${timezone} ${hour}h`)
          .withPhoneNumber(`+1555${userIndex.toString().padStart(7, '0')}`)
          .withEmail(`user-${userIndex}@test.com`)
          .withTimezone(timezone)
          .withPreferredSendHour(hour)
          .build()
      );
    });
  });

  return users;
}

/**
 * Message tracking interface
 */
export interface MessageTracker {
  sentMessages: Array<{
    userId: string;
    phoneNumber: string;
    message: string;
    sentAt: Date;
    localHour: number;
  }>;
  addMessage(userId: string, phoneNumber: string, message: string): void;
  getMessagesForUser(userId: string): typeof MessageTracker.prototype.sentMessages;
  getMessagesAtHour(utcHour: number): typeof MessageTracker.prototype.sentMessages;
  reset(): void;
}

/**
 * Create a message tracker for testing
 */
export function createMessageTracker() {
  const messages: Map<string, { message: string; metadata?: any }[]> = new Map();

  return {
    recordMessage(userId: string, message: string, metadata?: any) {
      if (!messages.has(userId)) {
        messages.set(userId, []);
      }
      messages.get(userId)!.push({ message, metadata });
    },

    hasReceivedMessage(userId: string): boolean {
      return messages.has(userId) && messages.get(userId)!.length > 0;
    },

    getMessageCount(userId: string): number {
      return messages.get(userId)?.length || 0;
    },

    getMessagesForUser(userId: string): { message: string; metadata?: any }[] {
      return messages.get(userId) || [];
    },

    getTotalMessageCount(): number {
      let total = 0;
      messages.forEach(userMessages => {
        total += userMessages.length;
      });
      return total;
    },

    getUniqueUserCount(): number {
      return messages.size;
    },

    reset() {
      messages.clear();
    }
  };
}

/**
 * Helper to check if a message was sent to a user
 */
export function expectMessageSentForUser(
  mockTwilio: MockTwilioClient,
  user: User,
  expectedContent?: string | RegExp
): void {
  const messages = mockTwilio.getMessagesTo(user.phoneNumber);
  
  if (messages.length === 0) {
    throw new Error(`No messages sent to user ${user.id} (${user.phoneNumber})`);
  }
  
  if (expectedContent) {
    const hasMatch = messages.some((msg) => {
      if (typeof expectedContent === 'string') {
        return msg.body.includes(expectedContent);
      } else {
        return expectedContent.test(msg.body);
      }
    });
    
    if (!hasMatch) {
      throw new Error(
        `No message matching pattern sent to user ${user.id}. Messages: ${messages
          .map((m) => m.body)
          .join(', ')}`
      );
    }
  }
}

/**
 * Helper to check that a message was delivered at the expected local hour
 */
export function expectDeliveredAtHour(
  user: User,
  sentAt: Date,
  expectedLocalHour: number
): void {
  const localTime = DateTime.fromJSDate(sentAt, { zone: user.timezone });
  const actualLocalHour = localTime.hour;
  
  if (actualLocalHour !== expectedLocalHour) {
    throw new Error(
      `Message delivered at wrong local hour. Expected: ${expectedLocalHour}, Actual: ${actualLocalHour} (${user.timezone})`
    );
  }
}

/**
 * Helper to check that NO message was sent to a user
 */
export function expectNoMessageForUser(
  mockTwilio: MockTwilioClient,
  user: User
): void {
  const messages = mockTwilio.getMessagesTo(user.phoneNumber);
  
  if (messages.length > 0) {
    throw new Error(
      `Expected no messages for user ${user.id}, but found ${messages.length}: ${messages
        .map((m) => m.body)
        .join(', ')}`
    );
  }
}

/**
 * Get the current UTC hour for a given date
 */
export function getCurrentUtcHour(date: Date = new Date()): number {
  return date.getUTCHours();
}

/**
 * Calculate what UTC hour corresponds to a local hour in a timezone
 */
export function getUtcHourForLocalTime(
  localHour: number,
  timezone: string,
  date: Date = new Date()
): number {
  const dt = DateTime.fromJSDate(date, { zone: timezone }).set({ hour: localHour, minute: 0, second: 0, millisecond: 0 });
  return dt.toUTC().hour;
}

/**
 * Create a test scenario for DST transitions
 */
export interface DstTestScenario {
  timezone: string;
  springForwardDate: Date;
  fallBackDate: Date;
  affectedHour: number; // Usually 2 AM
}

export function createDstTestScenarios(): DstTestScenario[] {
  return [
    {
      timezone: 'America/New_York',
      springForwardDate: new Date('2025-03-09T07:00:00Z'), // 2 AM EST -> 3 AM EDT
      fallBackDate: new Date('2025-11-02T06:00:00Z'), // 2 AM EDT -> 1 AM EST
      affectedHour: 2,
    },
    {
      timezone: 'America/Los_Angeles',
      springForwardDate: new Date('2025-03-09T10:00:00Z'), // 2 AM PST -> 3 AM PDT
      fallBackDate: new Date('2025-11-02T09:00:00Z'), // 2 AM PDT -> 1 AM PST
      affectedHour: 2,
    },
    {
      timezone: 'Europe/London',
      springForwardDate: new Date('2025-03-30T01:00:00Z'), // 1 AM GMT -> 2 AM BST
      fallBackDate: new Date('2025-10-26T01:00:00Z'), // 2 AM BST -> 1 AM GMT
      affectedHour: 1,
    },
  ];
}

// Re-export UserBuilder for convenience
export { UserBuilder } from '../fixtures/users';