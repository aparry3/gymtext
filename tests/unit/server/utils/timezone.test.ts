import { describe, it, expect } from 'vitest';
import {
  isValidIANATimezone,
  getLocalHourForTimezone,
  convertPreferredHourToUTC,
  getAllUTCHoursForLocalHour,
} from '@/server/utils/timezone';
import { DateTime } from 'luxon';

describe('Timezone Utilities', () => {
  describe('isValidIANATimezone', () => {
    it('should validate common timezone strings', () => {
      const validTimezones = [
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney',
        'UTC',
        'America/Chicago',
        'Europe/Paris',
        'Asia/Shanghai',
        'Africa/Cairo',
      ];

      validTimezones.forEach((tz) => {
        expect(isValidIANATimezone(tz)).toBe(true);
      });
    });

    it('should reject invalid timezone strings', () => {
      const invalidTimezones = [
        'Invalid/Timezone',
        'New York',
        'Los Angeles',
        'not-a-timezone',
        '',
        '   ',
      ];

      invalidTimezones.forEach((tz) => {
        expect(isValidIANATimezone(tz)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isValidIANATimezone(null as any)).toBe(false);
      expect(isValidIANATimezone(undefined as any)).toBe(false);
      expect(isValidIANATimezone('')).toBe(false);
      expect(isValidIANATimezone(' America/New_York ')).toBe(false); // with spaces
    });

    it('should validate half-hour offset timezones', () => {
      expect(isValidIANATimezone('Asia/Kolkata')).toBe(true); // UTC+5:30
      expect(isValidIANATimezone('America/St_Johns')).toBe(true); // UTC-3:30
      expect(isValidIANATimezone('Asia/Kathmandu')).toBe(true); // UTC+5:45
    });

    it('should validate extreme UTC offset timezones', () => {
      expect(isValidIANATimezone('Pacific/Kiritimati')).toBe(true); // UTC+14
      expect(isValidIANATimezone('Pacific/Midway')).toBe(true); // UTC-11
      expect(isValidIANATimezone('Etc/GMT+12')).toBe(true); // UTC-12
    });
  });

  describe('getLocalHourForTimezone', () => {
    it('should convert all 24 UTC hours correctly', () => {
      const timezone = 'America/New_York';
      const testDate = new Date('2025-01-15T00:00:00Z'); // January, EST (UTC-5)
      
      for (let utcHour = 0; utcHour < 24; utcHour++) {
        const date = new Date(testDate);
        date.setUTCHours(utcHour);
        
        const localHour = getLocalHourForTimezone(date, timezone);
        const expectedLocalHour = (utcHour - 5 + 24) % 24; // EST is UTC-5
        
        expect(localHour).toBe(expectedLocalHour);
      }
    });

    it('should handle multiple timezone scenarios', () => {
      const testCases = [
        { date: '2025-01-15T00:00:00Z', timezone: 'America/New_York', expected: 19 }, // 0 UTC = 7 PM EST (previous day)
        { date: '2025-01-15T12:00:00Z', timezone: 'America/New_York', expected: 7 }, // 12 UTC = 7 AM EST
        { date: '2025-01-15T00:00:00Z', timezone: 'America/Los_Angeles', expected: 16 }, // 0 UTC = 4 PM PST (previous day)
        { date: '2025-01-15T12:00:00Z', timezone: 'America/Los_Angeles', expected: 4 }, // 12 UTC = 4 AM PST
        { date: '2025-01-15T00:00:00Z', timezone: 'Europe/London', expected: 0 }, // 0 UTC = 0 AM GMT
        { date: '2025-01-15T12:00:00Z', timezone: 'Europe/London', expected: 12 }, // 12 UTC = 12 PM GMT
        { date: '2025-01-15T00:00:00Z', timezone: 'Asia/Tokyo', expected: 9 }, // 0 UTC = 9 AM JST
        { date: '2025-01-15T12:00:00Z', timezone: 'Asia/Tokyo', expected: 21 }, // 12 UTC = 9 PM JST
      ];
      
      testCases.forEach(({ date, timezone, expected }) => {
        const localHour = getLocalHourForTimezone(new Date(date), timezone);
        expect(localHour).toBe(expected);
      });
    });

    it('should handle date boundary correctly', () => {
      // When it's 11 PM UTC, it's the next day in Tokyo
      const utcDate = new Date('2025-01-15T23:00:00Z');
      const tokyoHour = getLocalHourForTimezone(utcDate, 'Asia/Tokyo');
      expect(tokyoHour).toBe(8); // 23 UTC = 8 AM JST (next day)
      
      // When it's 3 AM UTC, it's still the previous day in LA
      const laDate = new Date('2025-01-15T03:00:00Z');
      const laHour = getLocalHourForTimezone(laDate, 'America/Los_Angeles');
      expect(laHour).toBe(19); // 3 UTC = 7 PM PST (previous day)
    });

    it('should handle DST transition cases', () => {
      // During EDT (summer), New York is UTC-4
      const summerDate = new Date('2025-07-15T12:00:00Z');
      const summerNyHour = getLocalHourForTimezone(summerDate, 'America/New_York');
      expect(summerNyHour).toBe(8); // 12 UTC = 8 AM EDT
      
      // During EST (winter), New York is UTC-5
      const winterDate = new Date('2025-01-15T12:00:00Z');
      const winterNyHour = getLocalHourForTimezone(winterDate, 'America/New_York');
      expect(winterNyHour).toBe(7); // 12 UTC = 7 AM EST
    });

    it('should handle half-hour offset timezones', () => {
      const testDate = new Date('2025-01-15T00:00:00Z');
      
      // India (UTC+5:30)
      const indiaHour = getLocalHourForTimezone(testDate, 'Asia/Kolkata');
      expect(indiaHour).toBe(5); // 0 UTC = 5:30 AM IST, returns hour only
      
      // Newfoundland (UTC-3:30 in winter)
      const newfoundlandHour = getLocalHourForTimezone(testDate, 'America/St_Johns');
      expect(newfoundlandHour).toBe(20); // 0 UTC = 8:30 PM NST (previous day)
    });
  });

  describe('convertPreferredHourToUTC', () => {
    it('should convert standard timezone local hours to UTC', () => {
      // Note: The actual UTC hour will depend on when the test runs
      // We'll use the getAllUTCHoursForLocalHour function to verify
      
      // For New York in winter, 8 AM local is typically 1 PM UTC (UTC-5)
      const nyUtcHours = getAllUTCHoursForLocalHour(8, 'America/New_York');
      const nyUtc = convertPreferredHourToUTC(8, 'America/New_York');
      expect(nyUtcHours).toContain(nyUtc);
      
      // For LA in winter, 8 AM local is typically 4 PM UTC (UTC-8)
      const laUtcHours = getAllUTCHoursForLocalHour(8, 'America/Los_Angeles');
      const laUtc = convertPreferredHourToUTC(8, 'America/Los_Angeles');
      expect(laUtcHours).toContain(laUtc);
      
      // For London, 8 AM is typically 8 AM UTC (UTC+0) or 7 AM UTC (UTC+1 in summer)
      const londonUtcHours = getAllUTCHoursForLocalHour(8, 'Europe/London');
      const londonUtc = convertPreferredHourToUTC(8, 'Europe/London');
      expect(londonUtcHours).toContain(londonUtc);
      
      // For Tokyo, 8 AM JST is always 11 PM UTC previous day (UTC+9, no DST)
      expect(convertPreferredHourToUTC(8, 'Asia/Tokyo')).toBe(23);
    });

    it('should handle half-hour offset timezones', () => {
      // 8 AM IST = 2:30 AM UTC (UTC+5:30)
      const indiaUtc = convertPreferredHourToUTC(8, 'Asia/Kolkata');
      expect(indiaUtc).toBe(2); // Returns the hour part only
      
      // 8 AM NST can be 11:30 AM or 10:30 AM UTC depending on DST
      const newfoundlandUtcHours = getAllUTCHoursForLocalHour(8, 'America/St_Johns');
      const newfoundlandUtc = convertPreferredHourToUTC(8, 'America/St_Johns');
      expect(newfoundlandUtcHours).toContain(newfoundlandUtc);
    });

    it('should handle DST aware conversions', () => {
      // This test is tricky because convertPreferredHourToUTC uses the current date
      // We can only verify that the result is within expected range
      const nyUtcHours = getAllUTCHoursForLocalHour(8, 'America/New_York');
      const nyUtc = convertPreferredHourToUTC(8, 'America/New_York');
      
      // New York 8 AM can be either 12 UTC (summer) or 13 UTC (winter)
      expect(nyUtcHours).toContain(nyUtc);
      expect([12, 13]).toContain(nyUtc);
    });

    it('should handle midnight and late night hours', () => {
      // Midnight local time
      const nyMidnightUtcHours = getAllUTCHoursForLocalHour(0, 'America/New_York');
      const nyMidnightUtc = convertPreferredHourToUTC(0, 'America/New_York');
      expect(nyMidnightUtcHours).toContain(nyMidnightUtc);
      
      // Tokyo midnight is always 3 PM UTC previous day (no DST)
      expect(convertPreferredHourToUTC(0, 'Asia/Tokyo')).toBe(15);
      
      // 11 PM local time
      const ny11pmUtcHours = getAllUTCHoursForLocalHour(23, 'America/New_York');
      const ny11pmUtc = convertPreferredHourToUTC(23, 'America/New_York');
      expect(ny11pmUtcHours).toContain(ny11pmUtc);
      
      // Tokyo 11 PM is always 2 PM UTC (no DST)
      expect(convertPreferredHourToUTC(23, 'Asia/Tokyo')).toBe(14);
    });
  });

  describe('getAllUTCHoursForLocalHour', () => {
    it('should detect DST transition for affected timezones', () => {
      // For New York, 8 AM local can be either 12 UTC (summer) or 13 UTC (winter)
      const utcHours = getAllUTCHoursForLocalHour(8, 'America/New_York');
      expect(utcHours).toHaveLength(2);
      expect(utcHours).toContain(12); // EDT (UTC-4)
      expect(utcHours).toContain(13); // EST (UTC-5)
    });

    it('should return single hour for non-DST timezones', () => {
      // Tokyo doesn't observe DST
      const tokyoHours = getAllUTCHoursForLocalHour(8, 'Asia/Tokyo');
      expect(tokyoHours).toHaveLength(1);
      expect(tokyoHours[0]).toBe(23); // Always UTC+9
      
      // India doesn't observe DST
      const indiaHours = getAllUTCHoursForLocalHour(8, 'Asia/Kolkata');
      expect(indiaHours).toHaveLength(1);
      expect(indiaHours[0]).toBe(2); // Always UTC+5:30
    });

    it('should check consistency throughout the year', () => {
      // UTC timezone should always map 1:1
      const utcHours = getAllUTCHoursForLocalHour(12, 'UTC');
      expect(utcHours).toHaveLength(1);
      expect(utcHours[0]).toBe(12);
      
      // Check all hours for UTC
      for (let hour = 0; hour < 24; hour++) {
        const hours = getAllUTCHoursForLocalHour(hour, 'UTC');
        expect(hours).toHaveLength(1);
        expect(hours[0]).toBe(hour);
      }
    });

    it('should handle DST spring forward gap correctly', () => {
      // During spring forward, 2 AM doesn't exist (skips to 3 AM)
      // Most implementations will still return possible UTC hours
      const utcHours = getAllUTCHoursForLocalHour(2, 'America/New_York');
      expect(utcHours.length).toBeGreaterThanOrEqual(1);
      // Should include at least the standard mapping
      expect(utcHours).toContain(7); // 2 AM EST = 7 UTC
    });

    it('should handle DST fall back overlap correctly', () => {
      // During fall back, 1 AM occurs twice
      // The function should return both possible UTC hours
      const utcHours = getAllUTCHoursForLocalHour(1, 'America/New_York');
      expect(utcHours.length).toBeGreaterThanOrEqual(2);
      // Should include both EDT and EST mappings
      expect(utcHours).toContain(5); // 1 AM EDT = 5 UTC
      expect(utcHours).toContain(6); // 1 AM EST = 6 UTC
    });
  });
});