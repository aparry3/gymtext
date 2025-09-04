import { describe, it, expect } from 'vitest';
import { ActivityDataSchema } from '@/server/models/user/schemas';

describe('ActivityDataSchema Array Validation', () => {
  it('should accept empty array', () => {
    const result = ActivityDataSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it('should accept undefined (optional)', () => {
    const result = ActivityDataSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('should accept single running activity', () => {
    const data = [{
      type: 'running',
      experienceLevel: 'intermediate',
      keyMetrics: { 
        weeklyMileage: 25, 
        longestRun: 13.1 
      },
      goals: ['first marathon'],
      lastUpdated: new Date()
    }];
    
    const result = ActivityDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept multiple different activities', () => {
    const data = [
      {
        type: 'running',
        experienceLevel: 'intermediate',
        keyMetrics: { weeklyMileage: 25 },
        goals: ['marathon'],
        lastUpdated: new Date()
      },
      {
        type: 'strength',
        experienceLevel: 'beginner',
        keyMetrics: { 
          trainingDays: 3,
          benchPress: 135 
        },
        goals: ['build muscle'],
        lastUpdated: new Date()
      }
    ];
    
    const result = ActivityDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept hiking activity with specific metrics', () => {
    const data = [{
      type: 'hiking',
      experienceLevel: 'advanced',
      keyMetrics: {
        longestHike: 20,
        elevationComfort: '3000+ feet',
        weeklyHikes: 2
      },
      equipment: ['hiking boots', 'backpack'],
      goals: ['Grand Canyon rim-to-rim'],
      lastUpdated: new Date()
    }];
    
    const result = ActivityDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept general/other activity', () => {
    const data = [{
      type: 'other',
      activityName: 'rock climbing',
      experienceLevel: 'beginner',
      keyMetrics: { 
        sessionsPerWeek: 2,
        maxGrade: '5.8' 
      },
      goals: ['indoor climbing proficiency'],
      lastUpdated: new Date()
    }];
    
    const result = ActivityDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid activity type', () => {
    const data = [{
      type: 'invalid-type', // This should fail
      experienceLevel: 'beginner'
    }];
    
    const result = ActivityDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject non-array data', () => {
    const data = {
      type: 'running',
      experienceLevel: 'beginner'
    };
    
    const result = ActivityDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should handle mixed activity types in array', () => {
    const data = [
      {
        type: 'running',
        goals: ['marathon']
      },
      {
        type: 'cycling', 
        keyMetrics: { weeklyHours: 5 }
      },
      {
        type: 'skiing',
        experienceLevel: 'advanced'
      }
    ];
    
    const result = ActivityDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});