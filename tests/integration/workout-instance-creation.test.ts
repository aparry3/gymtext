import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { withTestDatabase, seedTestData } from '../utils/db';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { WorkoutInstanceModel } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Mesocycle } from '@/server/models/mesocycle';
import type { Microcycle } from '@/server/models/microcycle';
import type { WorkoutInstanceBreakdown } from '@/server/models/workout';

describe('Workout Instance Creation Integration Tests', () => {
  const mockUser: UserWithProfile = {
    id: 'user_test_123',
    name: 'Test User',
    phoneNumber: '+15555551234',
    email: 'test@example.com',
    stripeCustomerId: 'cus_test',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    profile: {
      id: 'profile_test_123',
      userId: 'user_test_123',
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
    id: 'plan_test_123',
    clientId: 'user_test_123',
    programType: 'strength',
    goalStatement: 'Build strength and muscle',
    overview: 'Progressive strength program',
    macrocycles: [],
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMesocycle: Mesocycle = {
    id: 'meso_test_123',
    fitnessPlanId: 'plan_test_123',
    clientId: 'user_test_123',
    index: 0,
    phase: 'Strength',
    lengthWeeks: 4,
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMicrocycle: Microcycle = {
    id: 'micro_test_123',
    mesocycleId: 'meso_test_123',
    fitnessPlanId: 'plan_test_123',
    clientId: 'user_test_123',
    weekNumber: 1,
    focus: 'Heavy',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('should create workout instance with properly serialized JSON details', async () => {
    await withTestDatabase(async (db) => {
      // Seed required data
      await seedTestData(db, {
        users: [{
          id: mockUser.id,
          name: mockUser.name,
          phoneNumber: mockUser.phoneNumber,
          email: mockUser.email,
          stripeCustomerId: mockUser.stripeCustomerId,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        }],
        fitnessProfiles: [{
          id: mockUser.profile.id,
          userId: mockUser.id,
          fitnessGoals: mockUser.profile.fitnessGoals,
          skillLevel: mockUser.profile.skillLevel,
          exerciseFrequency: mockUser.profile.exerciseFrequency,
          gender: mockUser.profile.gender,
          age: mockUser.profile.age,
          createdAt: mockUser.profile.createdAt,
          updatedAt: mockUser.profile.updatedAt,
        }],
        fitnessPlans: [{
          id: mockFitnessPlan.id!,
          clientId: mockFitnessPlan.clientId,
          programType: mockFitnessPlan.programType,
          goalStatement: mockFitnessPlan.goalStatement,
          overview: mockFitnessPlan.overview,
          macrocycles: JSON.stringify(mockFitnessPlan.macrocycles),
          startDate: mockFitnessPlan.startDate,
          createdAt: mockFitnessPlan.createdAt,
          updatedAt: mockFitnessPlan.updatedAt,
        }],
        mesocycles: [{
          id: mockMesocycle.id,
          fitnessPlanId: mockMesocycle.fitnessPlanId,
          clientId: mockMesocycle.clientId,
          index: mockMesocycle.index,
          phase: mockMesocycle.phase,
          lengthWeeks: mockMesocycle.lengthWeeks,
          startDate: mockMesocycle.startDate,
          createdAt: mockMesocycle.createdAt,
          updatedAt: mockMesocycle.updatedAt,
        }],
        microcycles: [{
          id: mockMicrocycle.id,
          mesocycleId: mockMicrocycle.mesocycleId,
          fitnessPlanId: mockMicrocycle.fitnessPlanId,
          clientId: mockMicrocycle.clientId,
          weekNumber: mockMicrocycle.weekNumber,
          focus: mockMicrocycle.focus,
          startDate: mockMicrocycle.startDate,
          endDate: mockMicrocycle.endDate,
          targets: null,
          createdAt: mockMicrocycle.createdAt,
          updatedAt: mockMicrocycle.updatedAt,
        }],
      });

      // Create workout instance from LLM output
      const workoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'lift', // LLM type that should map to 'strength'
        date: new Date('2024-01-02'),
        details: [
          {
            label: 'Warm-up',
            activities: ['5 min bike', 'Dynamic stretching'],
          },
          {
            label: 'Main Work',
            activities: ['Squats 5x5 @ 80%', 'Bench Press 5x5 @ 75%'],
          },
        ],
        targets: [
          { key: 'volumeKg', value: 5000 },
          { key: 'reps', value: 50 },
        ],
      };

      // Use the model to transform LLM output
      const newWorkout = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        workoutBreakdown
      );

      // Create repository and insert
      const repo = new WorkoutInstanceRepository(db);
      const createdWorkout = await repo.create(newWorkout);

      // Verify the workout was created successfully
      expect(createdWorkout).toBeDefined();
      expect(createdWorkout.id).toBeDefined();
      expect(createdWorkout.sessionType).toBe('strength'); // Mapped from 'lift'
      expect(createdWorkout.goal).toBe('volumeKg: 5000, reps: 50');
      expect(createdWorkout.clientId).toBe(mockUser.id);
      expect(createdWorkout.fitnessPlanId).toBe(mockFitnessPlan.id);
      expect(createdWorkout.mesocycleId).toBe(mockMesocycle.id);
      expect(createdWorkout.microcycleId).toBe(mockMicrocycle.id);

      // Verify details were stored correctly as JSONB
      expect(createdWorkout.details).toBeDefined();
      const details = typeof createdWorkout.details === 'string' 
        ? JSON.parse(createdWorkout.details) 
        : createdWorkout.details;
      expect(details).toEqual(workoutBreakdown.details);

      // Query the database directly to ensure data integrity
      const dbWorkout = await db
        .selectFrom('workoutInstances')
        .where('id', '=', createdWorkout.id)
        .selectAll()
        .executeTakeFirst();

      expect(dbWorkout).toBeDefined();
      expect(dbWorkout!.sessionType).toBe('strength');
      expect(dbWorkout!.goal).toBe('volumeKg: 5000, reps: 50');
    });
  });

  it('should handle complex nested JSON structures in details field', async () => {
    await withTestDatabase(async (db) => {
      // Seed required data (same as above test)
      await seedTestData(db, {
        users: [{ id: mockUser.id, name: mockUser.name, phoneNumber: mockUser.phoneNumber, email: mockUser.email, stripeCustomerId: mockUser.stripeCustomerId, createdAt: mockUser.createdAt, updatedAt: mockUser.updatedAt }],
        fitnessProfiles: [{ id: mockUser.profile.id, userId: mockUser.id, fitnessGoals: mockUser.profile.fitnessGoals, skillLevel: mockUser.profile.skillLevel, exerciseFrequency: mockUser.profile.exerciseFrequency, gender: mockUser.profile.gender, age: mockUser.profile.age, createdAt: mockUser.profile.createdAt, updatedAt: mockUser.profile.updatedAt }],
        fitnessPlans: [{ id: mockFitnessPlan.id!, clientId: mockFitnessPlan.clientId, programType: mockFitnessPlan.programType, goalStatement: mockFitnessPlan.goalStatement, overview: mockFitnessPlan.overview, macrocycles: JSON.stringify(mockFitnessPlan.macrocycles), startDate: mockFitnessPlan.startDate, createdAt: mockFitnessPlan.createdAt, updatedAt: mockFitnessPlan.updatedAt }],
        mesocycles: [{ id: mockMesocycle.id, fitnessPlanId: mockMesocycle.fitnessPlanId, clientId: mockMesocycle.clientId, index: mockMesocycle.index, phase: mockMesocycle.phase, lengthWeeks: mockMesocycle.lengthWeeks, startDate: mockMesocycle.startDate, createdAt: mockMesocycle.createdAt, updatedAt: mockMesocycle.updatedAt }],
        microcycles: [{ id: mockMicrocycle.id, mesocycleId: mockMicrocycle.mesocycleId, fitnessPlanId: mockMicrocycle.fitnessPlanId, clientId: mockMicrocycle.clientId, weekNumber: mockMicrocycle.weekNumber, focus: mockMicrocycle.focus, startDate: mockMicrocycle.startDate, endDate: mockMicrocycle.endDate, targets: null, createdAt: mockMicrocycle.createdAt, updatedAt: mockMicrocycle.updatedAt }],
      });

      // Complex nested structure that could cause JSON serialization issues
      const complexWorkoutBreakdown: WorkoutInstanceBreakdown = {
        sessionType: 'metcon',
        date: new Date('2024-01-03'),
        details: [
          {
            label: 'AMRAP 20 min',
            activities: [
              '10 Thrusters @ 95/65',
              '10 Pull-ups',
              '10 Box Jumps 24"/20"',
            ],
          },
          {
            label: 'Cash Out',
            activities: [
              '3 rounds:',
              '20 V-ups',
              '20 Russian Twists',
              '1 min Plank',
            ],
          },
        ],
      };

      const newWorkout = WorkoutInstanceModel.fromLLM(
        mockUser,
        mockFitnessPlan,
        mockMesocycle,
        mockMicrocycle,
        complexWorkoutBreakdown
      );

      const repo = new WorkoutInstanceRepository(db);
      const createdWorkout = await repo.create(newWorkout);

      expect(createdWorkout).toBeDefined();
      expect(createdWorkout.sessionType).toBe('cardio'); // 'metcon' maps to 'cardio'
      expect(createdWorkout.goal).toBeNull(); // No targets provided
    });
  });

  it('should handle all LLM session types correctly', async () => {
    await withTestDatabase(async (db) => {
      // Seed base data once
      await seedTestData(db, {
        users: [{ id: mockUser.id, name: mockUser.name, phoneNumber: mockUser.phoneNumber, email: mockUser.email, stripeCustomerId: mockUser.stripeCustomerId, createdAt: mockUser.createdAt, updatedAt: mockUser.updatedAt }],
        fitnessProfiles: [{ id: mockUser.profile.id, userId: mockUser.id, fitnessGoals: mockUser.profile.fitnessGoals, skillLevel: mockUser.profile.skillLevel, exerciseFrequency: mockUser.profile.exerciseFrequency, gender: mockUser.profile.gender, age: mockUser.profile.age, createdAt: mockUser.profile.createdAt, updatedAt: mockUser.profile.updatedAt }],
        fitnessPlans: [{ id: mockFitnessPlan.id!, clientId: mockFitnessPlan.clientId, programType: mockFitnessPlan.programType, goalStatement: mockFitnessPlan.goalStatement, overview: mockFitnessPlan.overview, macrocycles: JSON.stringify(mockFitnessPlan.macrocycles), startDate: mockFitnessPlan.startDate, createdAt: mockFitnessPlan.createdAt, updatedAt: mockFitnessPlan.updatedAt }],
        mesocycles: [{ id: mockMesocycle.id, fitnessPlanId: mockMesocycle.fitnessPlanId, clientId: mockMesocycle.clientId, index: mockMesocycle.index, phase: mockMesocycle.phase, lengthWeeks: mockMesocycle.lengthWeeks, startDate: mockMesocycle.startDate, createdAt: mockMesocycle.createdAt, updatedAt: mockMesocycle.updatedAt }],
        microcycles: [{ id: mockMicrocycle.id, mesocycleId: mockMicrocycle.mesocycleId, fitnessPlanId: mockMicrocycle.fitnessPlanId, clientId: mockMicrocycle.clientId, weekNumber: mockMicrocycle.weekNumber, focus: mockMicrocycle.focus, startDate: mockMicrocycle.startDate, endDate: mockMicrocycle.endDate, targets: null, createdAt: mockMicrocycle.createdAt, updatedAt: mockMicrocycle.updatedAt }],
      });

      const repo = new WorkoutInstanceRepository(db);

      // Test all session type mappings
      const sessionTypeMappings = [
        { llm: 'lift', db: 'strength' },
        { llm: 'run', db: 'cardio' },
        { llm: 'metcon', db: 'cardio' },
        { llm: 'mobility', db: 'mobility' },
        { llm: 'rest', db: 'recovery' },
        { llm: 'other', db: 'recovery' },
      ];

      for (const [index, mapping] of sessionTypeMappings.entries()) {
        const workoutBreakdown: WorkoutInstanceBreakdown = {
          sessionType: mapping.llm as any,
          date: new Date(`2024-01-0${index + 2}`),
          details: [
            {
              label: `${mapping.llm} workout`,
              activities: [`Test activity for ${mapping.llm}`],
            },
          ],
        };

        const newWorkout = WorkoutInstanceModel.fromLLM(
          mockUser,
          mockFitnessPlan,
          mockMesocycle,
          mockMicrocycle,
          workoutBreakdown
        );

        const createdWorkout = await repo.create(newWorkout);
        
        expect(createdWorkout.sessionType).toBe(mapping.db);
      }
    });
  });
});