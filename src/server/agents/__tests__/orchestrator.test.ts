import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutOrchestrator } from '../orchestrator';
import * as usersDb from '../../db/postgres/users';

// Mock the database module
vi.mock('../../db/postgres/users');

// Mock the AI agents
vi.mock('../program-designer', () => ({
  ProgramDesignerAgent: vi.fn().mockImplementation(() => ({
    designProgram: vi.fn().mockResolvedValue({
      name: 'Test Program',
      description: 'A test workout program',
      programType: 'strength',
      durationType: 'fixed',
      durationWeeks: 12,
      phases: [
        {
          phaseNumber: 1,
          name: 'Foundation',
          description: 'Build base strength',
          focus: 'strength',
          startWeek: 1,
          endWeek: 4,
          trainingVariables: {
            intensityRange: { min: 70, max: 85 },
            volumeMultiplier: 1,
            frequencyPerWeek: 3,
            restDays: 4
          }
        }
      ],
      goals: { primary: 'strength', secondary: ['muscle gain'] },
      equipmentRequired: ['barbell', 'dumbbells'],
      weeklyStructure: {
        daysPerWeek: 3,
        sessionTypes: []
      }
    }),
    adaptProgram: vi.fn().mockResolvedValue({
      // Adapted program structure
    })
  }))
}));

vi.mock('../session-builder', () => ({
  SessionBuilderAgent: vi.fn().mockImplementation(() => ({
    buildSession: vi.fn().mockResolvedValue({
      sessionType: 'strength',
      name: 'Upper Body Push',
      description: 'Chest, shoulders, and triceps workout',
      durationMinutes: 45,
      warmup: {
        exercises: [
          { name: 'Arm circles', duration: '30 seconds' },
          { name: 'Band pull-aparts', duration: '2 sets of 15' }
        ]
      },
      mainWorkout: {
        exercises: [
          {
            name: 'Bench Press',
            category: 'compound',
            muscleGroups: ['chest', 'shoulders', 'triceps'],
            sets: 3,
            reps: '8-10',
            rest: 180,
            notes: 'Control the descent'
          }
        ]
      },
      cooldown: {
        exercises: [
          { name: 'Chest stretch', duration: '30 seconds each side' }
        ]
      },
      totalVolume: { sets: 12, estimatedReps: 108 },
      equipmentNeeded: ['barbell', 'bench']
    })
  }))
}));

describe('WorkoutOrchestrator', () => {
  let orchestrator: WorkoutOrchestrator;
  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    phone_number: '+1234567890',
    created_at: new Date(),
    updated_at: new Date(),
    fitness_profile: {
      id: 'profile-id',
      user_id: 'test-user-id',
      goals: ['strength', 'muscle gain'],
      skill_level: 'intermediate' as const,
      equipment: ['barbell', 'dumbbells', 'pull-up bar'],
      days_per_week: 4,
      minutes_per_session: 45,
      age: 30,
      gender: 'male',
      fitness_goals: 'Get stronger',
      exercise_frequency: '4 times per week',
      injuries: null,
      created_at: new Date(),
      updated_at: new Date()
    }
  };

  beforeEach(() => {
    orchestrator = new WorkoutOrchestrator();
    vi.clearAllMocks();
  });

  describe('program generation', () => {
    it('should generate a program for a user with fitness profile', async () => {
      vi.mocked(usersDb.getUserWithProfile).mockResolvedValue(mockUser);

      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'program_generation'
      });

      expect(result.success).toBe(true);
      expect(result.data?.program).toBeDefined();
      expect(result.data?.program?.name).toBe('Test Program');
      expect(result.data?.program?.programType).toBe('strength');
    });

    it('should fail if user does not exist', async () => {
      vi.mocked(usersDb.getUserWithProfile).mockResolvedValue(null);

      const result = await orchestrator.orchestrate({
        userId: 'non-existent-user',
        mode: 'program_generation'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('User or fitness profile not found');
    });

    it('should fail if user has no fitness profile', async () => {
      vi.mocked(usersDb.getUserWithProfile).mockResolvedValue({
        ...mockUser,
        fitness_profile: null
      });

      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'program_generation'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('User or fitness profile not found');
    });
  });

  describe('session generation', () => {
    it('should generate a session with all required context', async () => {
      vi.mocked(usersDb.getUserWithProfile).mockResolvedValue(mockUser);

      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'session_generation',
        programId: 'program-123',
        weekNumber: 1,
        dayOfWeek: 1
      });

      expect(result.success).toBe(true);
      expect(result.data?.session).toBeDefined();
      expect(result.data?.session?.name).toBe('Upper Body Push');
      expect(result.data?.programId).toBe('program-123');
      expect(result.data?.weekNumber).toBe(1);
      expect(result.data?.dayOfWeek).toBe(1);
    });

    it('should fail if missing required context', async () => {
      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'session_generation',
        programId: 'program-123'
        // Missing weekNumber and dayOfWeek
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required context for session generation');
    });
  });

  describe('program adaptation', () => {
    it('should adapt a program with valid request', async () => {
      vi.mocked(usersDb.getUserWithProfile).mockResolvedValue(mockUser);

      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'adapt_program',
        programId: 'program-123',
        adaptationRequest: 'Need easier workouts',
        userFeedback: 'Current workouts are too hard'
      });

      expect(result.success).toBe(true);
      expect(result.data?.programId).toBe('program-123');
    });

    it('should fail if missing adaptation request', async () => {
      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'adapt_program',
        programId: 'program-123'
        // Missing adaptationRequest
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required context for program adaptation');
    });
  });

  describe('error handling', () => {
    it('should handle unknown orchestration mode', async () => {
      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'unknown_mode' as any
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown orchestration mode');
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(usersDb.getUserWithProfile).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await orchestrator.orchestrate({
        userId: 'test-user-id',
        mode: 'program_generation'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });
});