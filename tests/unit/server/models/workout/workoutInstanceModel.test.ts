import { describe, it, expect } from 'vitest';
import { WorkoutInstanceModel } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Mesocycle } from '@/server/models/mesocycle';
import type { Microcycle } from '@/server/models/microcycle';
import type { WorkoutInstanceBreakdown } from '@/server/models/workout';

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
    id: 'plan_123',
    clientId: 'user_123',
    programType: 'strength',
    goalStatement: 'Build strength and muscle',
    overview: 'Progressive strength program',
    macrocycles: [],
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMesocycle: Mesocycle = {
    id: 'meso_123',
    fitnessPlanId: 'plan_123',
    clientId: 'user_123',
    index: 0,
    phase: 'Strength',
    lengthWeeks: 4,
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMicrocycle: Microcycle = {
    id: 'micro_123',
    mesocycleId: 'meso_123',
    fitnessPlanId: 'plan_123',
    clientId: 'user_123',
    weekNumber: 1,
    focus: 'Heavy',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('fromLLM', () => {
    it('should correctly map lift session type to strength', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'lift',
        date: new Date('2024-01-01'),
        details: [
          {
            label: 'Warm-up',
            activities: ['5 min bike'],
          },
          {
            label: 'Main Work',
            activities: ['Squats 5x5', 'Bench Press 5x5'],
          },
        ],
        targets: [
          { key: 'volumeKg', value: 5000 },
          { key: 'reps', value: 50 },
        ],
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.sessionType).toBe('strength');
      expect(result.goal).toBe('volumeKg: 5000, reps: 50');
      expect(result.clientId).toBe('user_123');
      expect(result.fitnessPlanId).toBe('plan_123');
      expect(result.mesocycleId).toBe('meso_123');
      expect(result.microcycleId).toBe('micro_123');
      expect(result.completedAt).toBeNull();
      expect(result.details).toEqual(workoutBreakdown.details);
    });

    it('should correctly map run session type to cardio', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'run',
        date: new Date('2024-01-02'),
        details: [
          {
            label: 'Main',
            activities: ['6x800m intervals @ 5K pace'],
          },
        ],
        targets: [
          { key: 'distanceKm', value: 8 },
        ],
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.sessionType).toBe('cardio');
      expect(result.goal).toBe('distanceKm: 8');
    });

    it('should correctly map metcon session type to cardio', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'metcon',
        date: new Date('2024-01-03'),
        details: [
          {
            label: 'WOD',
            activities: ['21-15-9: Thrusters, Pull-ups'],
          },
        ],
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.sessionType).toBe('cardio');
      expect(result.goal).toBeNull();
    });

    it('should keep mobility session type unchanged', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'mobility',
        date: new Date('2024-01-04'),
        details: [
          {
            label: 'Stretching',
            activities: ['30 min yoga flow'],
          },
        ],
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.sessionType).toBe('mobility');
    });

    it('should map rest session type to recovery', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'rest',
        date: new Date('2024-01-05'),
        details: [
          {
            label: 'Recovery',
            activities: ['Active recovery: light walk, stretching'],
          },
        ],
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.sessionType).toBe('recovery');
    });

    it('should map other session type to recovery', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'other',
        date: new Date('2024-01-06'),
        details: [
          {
            label: 'Cross-training',
            activities: ['Swimming 30 min'],
          },
        ],
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.sessionType).toBe('recovery');
    });

    it('should handle workouts without targets', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'lift',
        date: new Date('2024-01-07'),
        details: [
          {
            label: 'Technique Work',
            activities: ['Snatch practice', 'Clean practice'],
          },
        ],
        // No targets
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.goal).toBeNull();
    });

    it('should handle empty targets array', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'lift',
        date: new Date('2024-01-08'),
        details: [
          {
            label: 'Main',
            activities: ['Deadlifts'],
          },
        ],
        targets: [], // Empty array
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.goal).toBeNull();
    });

    it('should concatenate multiple targets into goal string', () => {
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'lift',
        date: new Date('2024-01-09'),
        details: [
          {
            label: 'Main',
            activities: ['Complex workout'],
          },
        ],
        targets: [
          { key: 'volumeKg', value: 3000 },
          { key: 'reps', value: 100 },
          { key: 'sets', value: 20 },
        ],
      };

      const result = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      expect(result.goal).toBe('volumeKg: 3000, reps: 100, sets: 20');
    });
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