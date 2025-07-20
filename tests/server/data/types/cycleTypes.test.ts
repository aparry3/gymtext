import { describe, it, expect } from 'vitest';
import { calculateMicrocycleDates } from '../cycleTypes';

describe('calculateMicrocycleDates', () => {
  describe('Transition Week (Week 0) Tests', () => {
    it('should create a transition week ending on Sunday when starting on Friday', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024 (month is 0-indexed)
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 0, true);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-19'); // Friday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-21'); // Sunday
      expect(weekEnd.getDay()).toBe(0); // Sunday is day 0
    });

    it('should create a transition week ending on Sunday when starting on Tuesday', () => {
      const startDate = new Date(2024, 6, 16); // Tuesday July 16, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 0, true);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-16'); // Tuesday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-21'); // Sunday
      expect(weekEnd.getDay()).toBe(0); // Sunday
    });

    it('should create a transition week ending on Sunday when starting on Saturday', () => {
      const startDate = new Date(2024, 6, 20); // Saturday July 20, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 0, true);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-20'); // Saturday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-21'); // Sunday
      expect(weekEnd.getDay()).toBe(0); // Sunday
    });

    it('should create a full week transition when starting on Sunday', () => {
      const startDate = new Date(2024, 6, 21); // Sunday July 21, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 0, true);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-21'); // Sunday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-27'); // Next Saturday
      expect(weekEnd.getDay()).toBe(6); // Saturday
    });

    it('should handle week 0 without explicit transition flag', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 0);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-19'); // Friday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-21'); // Sunday
    });
  });

  describe('Regular Week Tests (Week 1+)', () => {
    it('should start Week 1 on Monday after Friday transition week', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 1);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-22'); // Monday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-28'); // Sunday
      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekEnd.getDay()).toBe(0); // Sunday
    });

    it('should start Week 1 on Monday after Tuesday transition week', () => {
      const startDate = new Date(2024, 6, 16); // Tuesday July 16, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 1);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-22'); // Monday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-28'); // Sunday
    });

    it('should calculate Week 2 correctly after transition week', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 2);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-29'); // Monday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-08-04'); // Sunday
    });

    it('should calculate Week 3 correctly after transition week', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 3);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-08-05'); // Monday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-08-11'); // Sunday
    });
  });

  describe('Monday Start Date (No Transition Week)', () => {
    it('should not need transition week when starting on Monday', () => {
      const startDate = new Date(2024, 6, 22); // Monday July 22, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 1);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-22'); // Monday
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-07-28'); // Sunday
    });

    it('should calculate subsequent weeks correctly when starting on Monday', () => {
      const startDate = new Date(2024, 6, 22); // Monday July 22, 2024
      
      // Week 2
      const week2 = calculateMicrocycleDates(startDate, 2);
      expect(week2.startDate.toISOString().split('T')[0]).toBe('2024-07-29');
      expect(week2.endDate.toISOString().split('T')[0]).toBe('2024-08-04');
      
      // Week 3
      const week3 = calculateMicrocycleDates(startDate, 3);
      expect(week3.startDate.toISOString().split('T')[0]).toBe('2024-08-05');
      expect(week3.endDate.toISOString().split('T')[0]).toBe('2024-08-11');
    });
  });

  describe('Edge Cases', () => {
    it('should handle year boundary correctly', () => {
      const startDate = new Date(2024, 11, 30); // Monday Dec 30, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 1);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-12-30');
      expect(weekEnd.toISOString().split('T')[0]).toBe('2025-01-05');
    });

    it('should handle leap year correctly', () => {
      const startDate = new Date(2024, 1, 26); // Monday Feb 26, 2024 in leap year
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 1);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-02-26');
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-03-03');
    });

    it('should handle month boundaries in transition weeks', () => {
      const startDate = new Date(2024, 6, 30); // Tuesday July 30, 2024
      const { startDate: weekStart, endDate: weekEnd } = calculateMicrocycleDates(startDate, 0, true);
      
      expect(weekStart.toISOString().split('T')[0]).toBe('2024-07-30');
      expect(weekEnd.toISOString().split('T')[0]).toBe('2024-08-04'); // Sunday
    });
  });

  describe('Date Continuity Tests', () => {
    it('should ensure no gap between transition week and week 1', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024
      const transitionWeek = calculateMicrocycleDates(startDate, 0, true);
      const week1 = calculateMicrocycleDates(startDate, 1);
      
      const dayAfterTransition = new Date(transitionWeek.endDate);
      dayAfterTransition.setDate(dayAfterTransition.getDate() + 1);
      
      expect(dayAfterTransition.toISOString().split('T')[0]).toBe(week1.startDate.toISOString().split('T')[0]);
    });

    it('should ensure no overlap between weeks', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024
      
      const week0 = calculateMicrocycleDates(startDate, 0, true);
      const week1 = calculateMicrocycleDates(startDate, 1);
      const week2 = calculateMicrocycleDates(startDate, 2);
      
      // Check no overlap between week 0 and week 1
      expect(week0.endDate < week1.startDate).toBe(true);
      
      // Check no overlap between week 1 and week 2
      expect(week1.endDate < week2.startDate).toBe(true);
    });

    it('should maintain consistent 7-day weeks after transition', () => {
      const startDate = new Date(2024, 6, 19); // Friday July 19, 2024
      
      for (let weekNum = 1; weekNum <= 5; weekNum++) {
        const week = calculateMicrocycleDates(startDate, weekNum);
        const daysDiff = Math.floor((week.endDate.getTime() - week.startDate.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(6); // 7 days total (0-6)
      }
    });
  });

  describe('All Days of Week Start Tests', () => {
    const testCases = [
      { day: 'Monday', date: new Date(2024, 6, 22), dayNum: 1, transitionDays: 0 },
      { day: 'Tuesday', date: new Date(2024, 6, 23), dayNum: 2, transitionDays: 6 },
      { day: 'Wednesday', date: new Date(2024, 6, 24), dayNum: 3, transitionDays: 5 },
      { day: 'Thursday', date: new Date(2024, 6, 25), dayNum: 4, transitionDays: 4 },
      { day: 'Friday', date: new Date(2024, 6, 19), dayNum: 5, transitionDays: 3 },
      { day: 'Saturday', date: new Date(2024, 6, 20), dayNum: 6, transitionDays: 2 },
      { day: 'Sunday', date: new Date(2024, 6, 21), dayNum: 0, transitionDays: 7 }
    ];

    testCases.forEach(({ day, date, dayNum, transitionDays }) => {
      it(`should handle ${day} start date correctly`, () => {
        const startDate = date;
        expect(startDate.getDay()).toBe(dayNum);

        if (transitionDays > 0 && dayNum !== 1) {
          // Transition week should exist
          const transition = calculateMicrocycleDates(startDate, 0, true);
          const daysDiff = Math.floor((transition.endDate.getTime() - transition.startDate.getTime()) / (1000 * 60 * 60 * 24));
          expect(daysDiff + 1).toBe(transitionDays);
          
          // Week 1 should start on Monday
          const week1 = calculateMicrocycleDates(startDate, 1);
          expect(week1.startDate.getDay()).toBe(1); // Monday
        } else if (dayNum === 1) {
          // Monday start - no transition needed
          const week1 = calculateMicrocycleDates(startDate, 1);
          expect(week1.startDate.toISOString().split('T')[0]).toBe(date.toISOString().split('T')[0]);
        }
      });
    });
  });
});

describe('Mesocycle and Microcycle Date Integration', () => {
  it('should correctly calculate all microcycle dates for a 4-week mesocycle starting Friday', () => {
    const mesocycleStart = new Date(2024, 6, 19); // Friday July 19, 2024
    const microcycles = [];

    // Transition week
    microcycles.push({
      weekNumber: 0,
      ...calculateMicrocycleDates(mesocycleStart, 0, true)
    });

    // Regular weeks
    for (let week = 1; week <= 4; week++) {
      microcycles.push({
        weekNumber: week,
        ...calculateMicrocycleDates(mesocycleStart, week)
      });
    }

    // Verify transition week
    expect(microcycles[0].startDate.toISOString().split('T')[0]).toBe('2024-07-19'); // Friday
    expect(microcycles[0].endDate.toISOString().split('T')[0]).toBe('2024-07-21'); // Sunday

    // Verify regular weeks
    expect(microcycles[1].startDate.toISOString().split('T')[0]).toBe('2024-07-22'); // Monday
    expect(microcycles[1].endDate.toISOString().split('T')[0]).toBe('2024-07-28'); // Sunday

    expect(microcycles[2].startDate.toISOString().split('T')[0]).toBe('2024-07-29'); // Monday
    expect(microcycles[2].endDate.toISOString().split('T')[0]).toBe('2024-08-04'); // Sunday

    expect(microcycles[3].startDate.toISOString().split('T')[0]).toBe('2024-08-05'); // Monday
    expect(microcycles[3].endDate.toISOString().split('T')[0]).toBe('2024-08-11'); // Sunday

    expect(microcycles[4].startDate.toISOString().split('T')[0]).toBe('2024-08-12'); // Monday
    expect(microcycles[4].endDate.toISOString().split('T')[0]).toBe('2024-08-18'); // Sunday
  });

  it('should ensure workout instance dates fall within their microcycle dates', () => {
    const mesocycleStart = new Date(2024, 6, 19); // Friday July 19, 2024
    const week1 = calculateMicrocycleDates(mesocycleStart, 1);
    
    // Simulate workout instances for week 1 (should be Mon-Sun)
    const workoutDates = [
      new Date(2024, 6, 22), // Monday July 22, 2024
      new Date(2024, 6, 24), // Wednesday July 24, 2024
      new Date(2024, 6, 26), // Friday July 26, 2024
      new Date(2024, 6, 28)  // Sunday July 28, 2024
    ];

    workoutDates.forEach(workoutDate => {
      expect(workoutDate >= week1.startDate).toBe(true);
      expect(workoutDate <= week1.endDate).toBe(true);
    });
  });
});