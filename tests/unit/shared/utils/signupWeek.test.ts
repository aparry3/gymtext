import { describe, it, expect } from 'vitest';
import { buildSignupWeekContext, isUserInFirstWeek, isUserInSecondWeek } from '../../../../packages/shared/src/shared/utils/signupWeek';

const TZ = 'America/New_York';

// Helper: create a Date for a specific day
function makeDate(iso: string): Date {
  return new Date(iso + 'T12:00:00Z');
}

describe('buildSignupWeekContext', () => {
  it('returns null when user created in a previous week', () => {
    // Created Mon Mar 16, generating for Mon Mar 23
    const result = buildSignupWeekContext(
      makeDate('2026-03-16'),
      makeDate('2026-03-23'),
      TZ
    );
    expect(result).toBeNull();
  });

  it('returns null when createdAt is null', () => {
    expect(buildSignupWeekContext(null, makeDate('2026-03-23'), TZ)).toBeNull();
  });

  it('returns "full" strategy for Monday signup', () => {
    // Mon Mar 23, 2026
    const result = buildSignupWeekContext(
      makeDate('2026-03-23'),
      makeDate('2026-03-23'),
      TZ
    );
    expect(result).not.toBeNull();
    expect(result!.strategy).toBe('full');
    expect(result!.signupWeekday).toBe(1); // Monday
    expect(result!.remainingDays).toBe(7);
    expect(result!.isRestDaySignup).toBe(false);
  });

  it('returns "full" strategy for Tuesday signup', () => {
    // Tue Mar 24, 2026
    const result = buildSignupWeekContext(
      makeDate('2026-03-24'),
      makeDate('2026-03-24'),
      TZ
    );
    expect(result!.strategy).toBe('full');
    expect(result!.signupWeekday).toBe(2);
    expect(result!.remainingDays).toBe(6);
  });

  it('returns "full" strategy for Wednesday signup', () => {
    // Wed Mar 25, 2026
    const result = buildSignupWeekContext(
      makeDate('2026-03-25'),
      makeDate('2026-03-25'),
      TZ
    );
    expect(result!.strategy).toBe('full');
    expect(result!.signupWeekday).toBe(3);
    expect(result!.remainingDays).toBe(5);
  });

  it('returns "intro" strategy for Thursday signup', () => {
    // Thu Mar 26, 2026
    const result = buildSignupWeekContext(
      makeDate('2026-03-26'),
      makeDate('2026-03-26'),
      TZ
    );
    expect(result!.strategy).toBe('intro');
    expect(result!.signupWeekday).toBe(4);
    expect(result!.remainingDays).toBe(4);
    expect(result!.remainingDayNames).toEqual(['Thursday', 'Friday', 'Saturday', 'Sunday']);
  });

  it('returns "intro" strategy for Friday signup', () => {
    // Fri Mar 27, 2026
    const result = buildSignupWeekContext(
      makeDate('2026-03-27'),
      makeDate('2026-03-27'),
      TZ
    );
    expect(result!.strategy).toBe('intro');
    expect(result!.remainingDays).toBe(3);
  });

  it('returns "intro" strategy for Saturday signup with isRestDaySignup', () => {
    // Sat Mar 28, 2026
    const result = buildSignupWeekContext(
      makeDate('2026-03-28'),
      makeDate('2026-03-28'),
      TZ
    );
    expect(result!.strategy).toBe('intro');
    expect(result!.signupWeekday).toBe(6);
    expect(result!.remainingDays).toBe(2);
    expect(result!.isRestDaySignup).toBe(true);
    expect(result!.remainingDayNames).toEqual(['Saturday', 'Sunday']);
  });

  it('returns "intro" strategy for Sunday signup with isRestDaySignup', () => {
    // Sun Mar 29, 2026
    const result = buildSignupWeekContext(
      makeDate('2026-03-29'),
      makeDate('2026-03-29'),
      TZ
    );
    expect(result!.strategy).toBe('intro');
    expect(result!.signupWeekday).toBe(7);
    expect(result!.remainingDays).toBe(1);
    expect(result!.isRestDaySignup).toBe(true);
    expect(result!.remainingDayNames).toEqual(['Sunday']);
  });
});

describe('isUserInFirstWeek', () => {
  it('returns true when user was created this week', () => {
    expect(isUserInFirstWeek(
      makeDate('2026-03-23'), // Monday
      makeDate('2026-03-25'), // Wednesday same week
      TZ
    )).toBe(true);
  });

  it('returns true on signup day itself', () => {
    expect(isUserInFirstWeek(
      makeDate('2026-03-29'), // Sunday
      makeDate('2026-03-29'), // Same day
      TZ
    )).toBe(true);
  });

  it('returns false when user was created last week', () => {
    expect(isUserInFirstWeek(
      makeDate('2026-03-16'), // Previous Monday
      makeDate('2026-03-23'), // This Monday
      TZ
    )).toBe(false);
  });

  it('returns false for null createdAt', () => {
    expect(isUserInFirstWeek(null, makeDate('2026-03-23'), TZ)).toBe(false);
  });
});

describe('isUserInSecondWeek', () => {
  it('returns true when current week is one week after creation', () => {
    expect(isUserInSecondWeek(
      makeDate('2026-03-23'), // Created Monday
      makeDate('2026-03-30'), // Next Monday
      TZ
    )).toBe(true);
  });

  it('returns false for same week', () => {
    expect(isUserInSecondWeek(
      makeDate('2026-03-23'),
      makeDate('2026-03-25'),
      TZ
    )).toBe(false);
  });

  it('returns false for two weeks later', () => {
    expect(isUserInSecondWeek(
      makeDate('2026-03-16'),
      makeDate('2026-03-30'),
      TZ
    )).toBe(false);
  });
});
