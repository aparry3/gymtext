import type { WorkoutInstance, NewWorkoutInstance } from '@/server/models/workout';

export class WorkoutInstanceBuilder {
  private workoutInstance: WorkoutInstance;

  constructor(overrides: Partial<WorkoutInstance> = {}) {
    const now = new Date();
    this.workoutInstance = {
      id: this.generateUuid(),
      clientId: this.generateUuid(),
      fitnessPlanId: this.generateUuid(),
      mesocycleId: this.generateUuid(),
      microcycleId: this.generateUuid(),
      date: now,
      sessionType: 'strength',
      goal: 'Build strength and improve form',
      details: this.createDefaultDetails(),
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  withId(id: string): WorkoutInstanceBuilder {
    this.workoutInstance.id = id;
    return this;
  }

  withClientId(clientId: string): WorkoutInstanceBuilder {
    this.workoutInstance.clientId = clientId;
    return this;
  }

  withFitnessPlanId(fitnessPlanId: string): WorkoutInstanceBuilder {
    this.workoutInstance.fitnessPlanId = fitnessPlanId;
    return this;
  }

  withMesocycleId(mesocycleId: string): WorkoutInstanceBuilder {
    this.workoutInstance.mesocycleId = mesocycleId;
    return this;
  }

  withMicrocycleId(microcycleId: string): WorkoutInstanceBuilder {
    this.workoutInstance.microcycleId = microcycleId;
    return this;
  }

  withDate(date: Date): WorkoutInstanceBuilder {
    this.workoutInstance.date = date;
    return this;
  }

  withSessionType(sessionType: 'strength' | 'cardio' | 'mobility' | 'recovery' | 'assessment' | 'deload'): WorkoutInstanceBuilder {
    this.workoutInstance.sessionType = sessionType;
    return this;
  }

  withGoal(goal: string | null): WorkoutInstanceBuilder {
    this.workoutInstance.goal = goal;
    return this;
  }

  withDetails(details: any): WorkoutInstanceBuilder {
    this.workoutInstance.details = details;
    return this;
  }

  withCompletedAt(completedAt: Date | null): WorkoutInstanceBuilder {
    this.workoutInstance.completedAt = completedAt;
    return this;
  }

  markCompleted(completedAt: Date = new Date()): WorkoutInstanceBuilder {
    this.workoutInstance.completedAt = completedAt;
    return this;
  }

  withCreatedAt(createdAt: Date): WorkoutInstanceBuilder {
    this.workoutInstance.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): WorkoutInstanceBuilder {
    this.workoutInstance.updatedAt = updatedAt;
    return this;
  }

  asNewWorkoutInstance(): NewWorkoutInstance {
    const { id, createdAt, updatedAt, ...newWorkout } = this.workoutInstance;
    return newWorkout;
  }

  build(): WorkoutInstance {
    return { ...this.workoutInstance };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private createDefaultDetails() {
    return {
      sessionType: 'lift',
      details: [
        {
          label: 'Warm-up',
          activities: ['5 min bike', 'Dynamic stretching'],
        },
        {
          label: 'Main Set',
          activities: ['Squats 3x5 @ 80%', 'Bench Press 3x8 @ 75%'],
        },
        {
          label: 'Cool-down',
          activities: ['Static stretching', 'Foam rolling'],
        },
      ],
    };
  }
}

export const mockWorkoutInstances = {
  strengthWorkout: () => new WorkoutInstanceBuilder()
    .withId('workout-1')
    .withSessionType('strength')
    .withDetails({
      sessionType: 'lift',
      details: [
        {
          label: 'Warm-up',
          activities: ['5 min rowing', 'Shoulder mobility'],
        },
        {
          label: 'Main Set',
          activities: [
            'Deadlift 5x3 @ 85%',
            'Pull-ups 4x8',
            'Rows 3x12',
          ],
        },
        {
          label: 'Accessory',
          activities: ['Face pulls 3x15', 'Bicep curls 3x12'],
        },
      ],
      targets: [
        { key: 'volumeKg', value: 5000 },
        { key: 'rpe', value: 8 },
      ],
    })
    .build(),

  cardioWorkout: () => new WorkoutInstanceBuilder()
    .withId('workout-2')
    .withSessionType('cardio')
    .withGoal('Improve aerobic capacity')
    .withDetails({
      sessionType: 'run',
      details: [
        {
          label: 'Warm-up',
          activities: ['10 min easy jog', 'Dynamic stretching'],
        },
        {
          label: 'Main Set',
          activities: ['30 min tempo run @ 7:00/mi pace'],
        },
        {
          label: 'Cool-down',
          activities: ['10 min easy jog', 'Static stretching'],
        },
      ],
      targets: [
        { key: 'distanceKm', value: 8 },
        { key: 'avgHeartRate', value: 150 },
      ],
    })
    .build(),

  mobilityWorkout: () => new WorkoutInstanceBuilder()
    .withId('workout-3')
    .withSessionType('mobility')
    .withGoal('Improve flexibility and range of motion')
    .withDetails({
      sessionType: 'mobility',
      details: [
        {
          label: 'Full Body',
          activities: [
            'Cat-cow stretch 2x10',
            'Hip circles 2x10 each direction',
            'Shoulder rolls 2x10',
            'Ankle circles 2x10 each',
          ],
        },
        {
          label: 'Lower Body Focus',
          activities: [
            'Deep squat hold 3x30s',
            'Pigeon pose 2x60s each side',
            'Hamstring stretches 3x30s each',
          ],
        },
      ],
    })
    .build(),

  completedWorkout: () => new WorkoutInstanceBuilder()
    .withId('workout-4')
    .withSessionType('strength')
    .markCompleted(new Date('2024-01-15T10:30:00'))
    .build(),

  assessmentWorkout: () => new WorkoutInstanceBuilder()
    .withId('workout-5')
    .withSessionType('assessment')
    .withGoal('Test 1RM for major lifts')
    .withDetails({
      sessionType: 'other',
      details: [
        {
          label: 'Warm-up',
          activities: ['General warm-up', 'Movement prep'],
        },
        {
          label: 'Testing',
          activities: [
            'Squat: Work up to 1RM',
            'Bench: Work up to 1RM',
            'Deadlift: Work up to 1RM',
          ],
        },
      ],
      targets: [
        { key: 'squat1RM', value: 0 },
        { key: 'bench1RM', value: 0 },
        { key: 'deadlift1RM', value: 0 },
      ],
    })
    .build(),

  deloadWorkout: () => new WorkoutInstanceBuilder()
    .withId('workout-6')
    .withSessionType('deload')
    .withGoal('Active recovery and technique work')
    .withDetails({
      sessionType: 'lift',
      details: [
        {
          label: 'Light Movement',
          activities: [
            'Squats 3x10 @ 50%',
            'Bench Press 3x10 @ 50%',
            'Rows 3x10 @ light weight',
          ],
        },
      ],
    })
    .build(),
};

export const createWorkoutSequence = (
  microcycleId: string,
  fitnessPlanId: string,
  mesocycleId: string,
  clientId: string,
  startDate: Date = new Date('2024-01-01')
): WorkoutInstance[] => {
  const workouts: WorkoutInstance[] = [];
  const schedule = [
    { day: 0, type: 'strength' as const, goal: 'Upper body strength' },
    { day: 1, type: 'cardio' as const, goal: 'Aerobic development' },
    { day: 2, type: 'strength' as const, goal: 'Lower body strength' },
    { day: 3, type: 'recovery' as const, goal: 'Active recovery' },
    { day: 4, type: 'strength' as const, goal: 'Full body' },
    { day: 5, type: 'cardio' as const, goal: 'Long run' },
    { day: 6, type: 'mobility' as const, goal: 'Rest and recovery' },
  ];

  schedule.forEach((day, index) => {
    const workoutDate = new Date(startDate.getTime() + day.day * 24 * 60 * 60 * 1000);
    
    const workout = new WorkoutInstanceBuilder()
      .withId(`workout-seq-${index + 1}`)
      .withClientId(clientId)
      .withFitnessPlanId(fitnessPlanId)
      .withMesocycleId(mesocycleId)
      .withMicrocycleId(microcycleId)
      .withDate(workoutDate)
      .withSessionType(day.type)
      .withGoal(day.goal)
      .build();

    workouts.push(workout);
  });

  return workouts;
};

export const createMockWorkoutInstances = (
  count: number,
  microcycleId?: string,
  clientId?: string
): WorkoutInstance[] => {
  const sessionTypes: Array<'strength' | 'cardio' | 'mobility' | 'recovery' | 'assessment' | 'deload'> = 
    ['strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'];
  const startDate = new Date();

  return Array.from({ length: count }, (_, i) => {
    const workoutDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const isCompleted = i % 3 === 0;
    
    return new WorkoutInstanceBuilder()
      .withId(`workout-${i + 1}`)
      .withClientId(clientId || `user-${Math.ceil((i + 1) / 7)}`)
      .withMicrocycleId(microcycleId || `micro-${Math.ceil((i + 1) / 7)}`)
      .withDate(workoutDate)
      .withSessionType(sessionTypes[i % sessionTypes.length])
      .withCompletedAt(isCompleted ? new Date(workoutDate.getTime() + 2 * 60 * 60 * 1000) : null)
      .build();
  });
};

export const createInvalidWorkoutInstances = () => ({
  missingClientId: {
    fitnessPlanId: 'plan-1',
    mesocycleId: 'meso-1',
    microcycleId: 'micro-1',
    date: new Date(),
    sessionType: 'strength',
    details: {},
  },
  invalidSessionType: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    mesocycleId: 'meso-1',
    microcycleId: 'micro-1',
    date: new Date(),
    sessionType: 'invalid-type' as any,
    details: {},
  },
  missingDetails: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    mesocycleId: 'meso-1',
    microcycleId: 'micro-1',
    date: new Date(),
    sessionType: 'strength',
  },
  emptyDetails: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    mesocycleId: 'meso-1',
    microcycleId: 'micro-1',
    date: new Date(),
    sessionType: 'strength',
    details: {},
  },
});