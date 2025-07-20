import { describe, it, expect } from 'vitest';
import { calculateMicrocycleDates } from '../cycleTypes';

describe('Transition Week Bug Fix - User +13392223571', () => {
  it('should correctly handle workout plan starting Friday July 18', () => {
    // Bug scenario: Workout plan starts on Friday July 18, 2025
    const startDate = new Date(2025, 6, 18); // Friday July 18, 2025
    
    // Week 0 (Transition): Should be July 18-20 (Fri-Sun)
    const transitionWeek = calculateMicrocycleDates(startDate, 0);
    expect(transitionWeek.startDate.toISOString().split('T')[0]).toBe('2025-07-18');
    expect(transitionWeek.endDate.toISOString().split('T')[0]).toBe('2025-07-20');
    expect(transitionWeek.startDate.getDay()).toBe(5); // Friday
    expect(transitionWeek.endDate.getDay()).toBe(0); // Sunday
    
    // Week 1: Should be July 21-27 (Mon-Sun)
    const week1 = calculateMicrocycleDates(startDate, 1);
    expect(week1.startDate.toISOString().split('T')[0]).toBe('2025-07-21');
    expect(week1.endDate.toISOString().split('T')[0]).toBe('2025-07-27');
    expect(week1.startDate.getDay()).toBe(1); // Monday
    expect(week1.endDate.getDay()).toBe(0); // Sunday
    
    // Verify no overlap between weeks
    expect(transitionWeek.endDate < week1.startDate).toBe(true);
    
    // Verify continuous dates (no gap)
    const dayAfterTransition = new Date(transitionWeek.endDate);
    dayAfterTransition.setDate(dayAfterTransition.getDate() + 1);
    expect(dayAfterTransition.toISOString().split('T')[0]).toBe(week1.startDate.toISOString().split('T')[0]);
  });
  
  it('should generate correct microcycle schedule for 4-week mesocycle starting Friday', () => {
    const startDate = new Date(2025, 6, 18); // Friday July 18, 2025
    const schedule = [];
    
    // Generate full schedule
    schedule.push({ week: 0, ...calculateMicrocycleDates(startDate, 0) });
    for (let week = 1; week <= 4; week++) {
      schedule.push({ week, ...calculateMicrocycleDates(startDate, week) });
    }
    
    // Expected schedule:
    // Week 0: July 18-20 (3 days)
    // Week 1: July 21-27 (7 days)
    // Week 2: July 28 - August 3 (7 days)
    // Week 3: August 4-10 (7 days)
    // Week 4: August 11-17 (7 days)
    
    expect(schedule[0].startDate.toISOString().split('T')[0]).toBe('2025-07-18');
    expect(schedule[0].endDate.toISOString().split('T')[0]).toBe('2025-07-20');
    
    expect(schedule[1].startDate.toISOString().split('T')[0]).toBe('2025-07-21');
    expect(schedule[1].endDate.toISOString().split('T')[0]).toBe('2025-07-27');
    
    expect(schedule[2].startDate.toISOString().split('T')[0]).toBe('2025-07-28');
    expect(schedule[2].endDate.toISOString().split('T')[0]).toBe('2025-08-03');
    
    expect(schedule[3].startDate.toISOString().split('T')[0]).toBe('2025-08-04');
    expect(schedule[3].endDate.toISOString().split('T')[0]).toBe('2025-08-10');
    
    expect(schedule[4].startDate.toISOString().split('T')[0]).toBe('2025-08-11');
    expect(schedule[4].endDate.toISOString().split('T')[0]).toBe('2025-08-17');
    
    // Verify all regular weeks start on Monday
    for (let i = 1; i <= 4; i++) {
      expect(schedule[i].startDate.getDay()).toBe(1); // Monday
      expect(schedule[i].endDate.getDay()).toBe(0); // Sunday
    }
  });
});