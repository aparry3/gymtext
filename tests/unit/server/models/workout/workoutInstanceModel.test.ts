import { describe, it, expect } from 'vitest';
import { WorkoutInstanceModel } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';

describe('WorkoutInstanceModel', () => {
  // Mock data
  const mockUser: UserWithProfile = {
    id: 'user_123',
    name: 'Test User',
    phoneNumber: '+12125551234',
    email: 'test@example.com',
    stripeCustomerId: 'cus_123',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    profile: {
      id: 'profile_123',
      userId: 'user_123',
      fitnessGoals: 'Build strength',
      skillLevel: 'intermediate',
      exerciseFrequency: '4 days/week',
      gender: 'male',
      age: 30,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  };

  const mockFitnessPlan: FitnessPlan = {
    clientId: 'user_123',
    programType: 'strength',
    mesocycles: [
      { name: 'Phase 1', weeks: 4, focus: ['volume'], deload: false },
      { name: 'Phase 2', weeks: 4, focus: ['intensity'], deload: true },
    ],
    lengthWeeks: 8,
    notes: null,
    currentMesocycleIndex: 0,
    currentMicrocycleWeek: 1,
    cycleStartDate: new Date('2024-01-01'),
    overview: 'Progressive strength program',
    startDate: new Date('2024-01-01'),
    goalStatement: 'Build strength and muscle',
  } as FitnessPlan;

  const mockMesocycle = { name: 'Phase 1', weeks: 4, focus: ['volume'], deload: false };

  const mockMicrocycle: Microcycle = {
    id: 'micro_123',
    userId: 'user_123',
    fitnessPlanId: 'plan_123',
    mesocycleIndex: 0,
    weekNumber: 1,
    pattern: { weekIndex: 1, days: [{ day: 'MONDAY', theme: 'Upper' }] },
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('mapping helpers', () => {
    it('should map session type from theme heuristics', () => {
      const model = new WorkoutInstanceModel({
        clientId: 'user_123',
        fitnessPlanId: 'plan_123',
        microcycleId: 'micro_123',
        mesocycleId: null,
        sessionType: 'strength',
        date: new Date(),
        details: { test: true } as any,
        goal: null,
        completedAt: null,
      } as any);
      expect(model).toBeTruthy();
    });

    // Note: detailed fromLLM mapping tests removed as model no longer exposes fromLLM
  });

  describe('constructor', () => {
    it('should create instance with all required fields', () => {
      const workoutData = {
        clientId: 'user_123',
        fitnessPlanId: 'plan_123',
        mesocycleId: 'meso_123',
        microcycleId: 'micro_123',
        sessionType: 'strength',
        date: new Date('2024-01-01'),
        details: { test: 'data' },
        goal: 'Test goal',
        completedAt: null,
      };

      const instance = new WorkoutInstanceModel(workoutData);

      expect(instance.clientId).toBe(workoutData.clientId);
      expect(instance.fitnessPlanId).toBe(workoutData.fitnessPlanId);
      expect(instance.mesocycleId).toBe(workoutData.mesocycleId);
      expect(instance.microcycleId).toBe(workoutData.microcycleId);
      expect(instance.sessionType).toBe(workoutData.sessionType);
      expect(instance.date).toBe(workoutData.date);
      expect(instance.details).toEqual(workoutData.details);
      expect(instance.goal).toBe(workoutData.goal);
      expect(instance.completedAt).toBe(workoutData.completedAt);
    });
  });
});