import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgressService } from '../domain/training/progressService';
import type { ProgressServiceInstance } from '../domain/training/progressService';
import type { FitnessPlan } from '../../models/fitnessPlan';

// Mock date utils to control time
vi.mock('@/shared/utils/date', () => ({
  parseDate: vi.fn((d: string | Date | null) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }),
  now: vi.fn((tz: string) => ({
    toJSDate: () => new Date('2026-03-20T10:00:00Z'),
  })),
  startOfWeek: vi.fn((date: Date, _tz: string) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }),
  endOfWeek: vi.fn((date: Date, _tz: string) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (6 - day));
    d.setHours(23, 59, 59, 999);
    return d;
  }),
  diffInWeeks: vi.fn((a: Date, b: Date, _tz: string) => {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((a.getTime() - b.getTime()) / msPerWeek);
  }),
  getWeekday: vi.fn((date: Date, _tz: string) => date.getDay()),
}));

function makeMockMicrocycleService() {
  return {
    getMicrocycleByDate: vi.fn().mockResolvedValue({
      id: 'micro-1',
      clientId: 'user-1',
      weekNumber: 1,
      content: { focus: 'strength' },
    }),
  };
}

function makeMockRepos() {
  return {} as any;
}

function makePlan(overrides: Partial<FitnessPlan> = {}): FitnessPlan {
  return {
    id: 'plan-1',
    clientId: 'user-1',
    startDate: '2026-03-01',
    content: 'Test plan',
    ...overrides,
  } as FitnessPlan;
}

describe('ProgressService', () => {
  let service: ProgressServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;
  let microcycleService: ReturnType<typeof makeMockMicrocycleService>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    microcycleService = makeMockMicrocycleService();
    service = createProgressService(repos, { microcycle: microcycleService });
  });

  describe('getProgressForDate', () => {
    it('should return progress info for a valid plan and date', async () => {
      const plan = makePlan();
      const targetDate = new Date('2026-03-20T10:00:00Z');

      const result = await service.getProgressForDate(plan, targetDate);

      expect(result).not.toBeNull();
      expect(result!.fitnessPlan).toBe(plan);
      expect(result!.absoluteWeek).toBeGreaterThanOrEqual(1);
      expect(result!.microcycle).toEqual(expect.objectContaining({ id: 'micro-1' }));
      expect(microcycleService.getMicrocycleByDate).toHaveBeenCalledWith('user-1', targetDate);
    });

    it('should return null for null/undefined plan', async () => {
      const result = await service.getProgressForDate(null as any, new Date());
      expect(result).toBeNull();
    });

    it('should return null for plan without id', async () => {
      const plan = makePlan({ id: undefined as any });
      const result = await service.getProgressForDate(plan, new Date());
      expect(result).toBeNull();
    });

    it('should return null for plan with invalid startDate', async () => {
      const plan = makePlan({ startDate: 'not-a-date' });
      const result = await service.getProgressForDate(plan, new Date());
      expect(result).toBeNull();
    });

    it('should return null if target date is before plan start', async () => {
      // diffInWeeks mock will return negative for dates before plan start
      const { diffInWeeks } = await import('@/shared/utils/date');
      (diffInWeeks as any).mockReturnValueOnce(-2);

      const plan = makePlan({ startDate: '2026-04-01' });
      const result = await service.getProgressForDate(plan, new Date('2026-03-15'));
      expect(result).toBeNull();
    });

    it('should handle microcycle not found (null)', async () => {
      microcycleService.getMicrocycleByDate.mockResolvedValueOnce(null);
      const plan = makePlan();
      const result = await service.getProgressForDate(plan, new Date('2026-03-20'));

      expect(result).not.toBeNull();
      expect(result!.microcycle).toBeNull();
    });

    it('should use default timezone when none provided', async () => {
      const { startOfWeek } = await import('@/shared/utils/date');
      const plan = makePlan();
      await service.getProgressForDate(plan, new Date('2026-03-20'));

      expect(startOfWeek).toHaveBeenCalledWith(expect.any(Date), 'America/New_York');
    });

    it('should use custom timezone when provided', async () => {
      const { startOfWeek } = await import('@/shared/utils/date');
      const plan = makePlan();
      await service.getProgressForDate(plan, new Date('2026-03-20'), 'Europe/London');

      expect(startOfWeek).toHaveBeenCalledWith(expect.any(Date), 'Europe/London');
    });

    it('should calculate correct week number for first week', async () => {
      const { diffInWeeks } = await import('@/shared/utils/date');
      (diffInWeeks as any).mockReturnValueOnce(0); // same week

      const plan = makePlan({ startDate: '2026-03-18' });
      const result = await service.getProgressForDate(plan, new Date('2026-03-20'));

      expect(result).not.toBeNull();
      expect(result!.absoluteWeek).toBe(1); // 0 + 1 = week 1
    });

    it('should calculate correct week number for later weeks', async () => {
      const { diffInWeeks } = await import('@/shared/utils/date');
      (diffInWeeks as any).mockReturnValueOnce(3); // 4th week

      const plan = makePlan({ startDate: '2026-03-01' });
      const result = await service.getProgressForDate(plan, new Date('2026-03-25'));

      expect(result).not.toBeNull();
      expect(result!.absoluteWeek).toBe(4); // 3 + 1 = week 4
    });

    it('should include day of week in result', async () => {
      const { getWeekday } = await import('@/shared/utils/date');
      (getWeekday as any).mockReturnValueOnce(5); // Friday

      const plan = makePlan();
      const result = await service.getProgressForDate(plan, new Date('2026-03-20'));

      expect(result).not.toBeNull();
      expect(result!.dayOfWeek).toBe(5);
    });

    it('should include week start and end dates', async () => {
      const plan = makePlan();
      const result = await service.getProgressForDate(plan, new Date('2026-03-20'));

      expect(result).not.toBeNull();
      expect(result!.weekStartDate).toBeInstanceOf(Date);
      expect(result!.weekEndDate).toBeInstanceOf(Date);
      expect(result!.weekStartDate.getTime()).toBeLessThan(result!.weekEndDate.getTime());
    });
  });

  describe('getCurrentProgress', () => {
    it('should call getProgressForDate with current date', async () => {
      const plan = makePlan();
      const result = await service.getCurrentProgress(plan);

      expect(result).not.toBeNull();
      expect(microcycleService.getMicrocycleByDate).toHaveBeenCalled();
    });

    it('should use default timezone', async () => {
      const { now: nowFn } = await import('@/shared/utils/date');
      const plan = makePlan();
      await service.getCurrentProgress(plan);

      expect(nowFn).toHaveBeenCalledWith('America/New_York');
    });

    it('should use custom timezone', async () => {
      const { now: nowFn } = await import('@/shared/utils/date');
      const plan = makePlan();
      await service.getCurrentProgress(plan, 'US/Pacific');

      expect(nowFn).toHaveBeenCalledWith('US/Pacific');
    });

    it('should return null for invalid plan', async () => {
      const result = await service.getCurrentProgress(null as any);
      expect(result).toBeNull();
    });
  });
});
