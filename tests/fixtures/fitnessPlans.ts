import type { FitnessPlan, NewFitnessPlan, FitnessPlanOverview, MacrocycleOverview, MesocycleOverview } from '@/server/models/fitnessPlan';

export class FitnessPlanBuilder {
  private fitnessPlan: FitnessPlan;

  constructor(overrides: Partial<FitnessPlan> = {}) {
    const now = new Date();
    this.fitnessPlan = {
      id: this.generateUuid(),
      clientId: this.generateUuid(),
      programType: 'strength',
      overview: 'A comprehensive strength training program designed to build muscle and increase overall strength.',
      goalStatement: 'Build muscle mass and increase strength in major compound lifts',
      macrocycles: this.createDefaultMacrocycles(),
      startDate: now,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  withId(id: string): FitnessPlanBuilder {
    this.fitnessPlan.id = id;
    return this;
  }

  withClientId(clientId: string): FitnessPlanBuilder {
    this.fitnessPlan.clientId = clientId;
    return this;
  }

  withProgramType(programType: string): FitnessPlanBuilder {
    this.fitnessPlan.programType = programType;
    return this;
  }

  withOverview(overview: string | null): FitnessPlanBuilder {
    this.fitnessPlan.overview = overview;
    return this;
  }

  withGoalStatement(goalStatement: string | null): FitnessPlanBuilder {
    this.fitnessPlan.goalStatement = goalStatement;
    return this;
  }

  withMacrocycles(macrocycles: MacrocycleOverview[]): FitnessPlanBuilder {
    this.fitnessPlan.macrocycles = macrocycles;
    return this;
  }

  withStartDate(startDate: Date): FitnessPlanBuilder {
    this.fitnessPlan.startDate = startDate;
    return this;
  }

  withCreatedAt(createdAt: Date): FitnessPlanBuilder {
    this.fitnessPlan.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): FitnessPlanBuilder {
    this.fitnessPlan.updatedAt = updatedAt;
    return this;
  }

  asNewFitnessPlan(): NewFitnessPlan {
    const { id, createdAt, updatedAt, ...newPlan } = this.fitnessPlan;
    return {
      ...newPlan,
      macrocycles: JSON.stringify(this.fitnessPlan.macrocycles) as any,
    };
  }

  build(): FitnessPlan {
    return { ...this.fitnessPlan };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private createDefaultMacrocycles(): MacrocycleOverview[] {
    return [
      {
        name: 'Foundation Phase',
        description: 'Build a solid foundation with proper form and technique',
        durationWeeks: 4,
        mesocycles: [
          {
            name: 'Adaptation',
            description: 'Get accustomed to regular training',
            durationWeeks: 2,
            phase: 'Foundation',
          },
          {
            name: 'Base Building',
            description: 'Build basic strength and endurance',
            durationWeeks: 2,
            phase: 'Foundation',
          },
        ],
      },
    ];
  }
}

export const createMesocycleOverview = (overrides: Partial<MesocycleOverview> = {}): MesocycleOverview => ({
  name: 'Strength Building',
  description: 'Focus on progressive overload and strength gains',
  durationWeeks: 4,
  phase: 'Strength',
  ...overrides,
});

export const createMacrocycleOverview = (overrides: Partial<MacrocycleOverview> = {}): MacrocycleOverview => ({
  name: 'Strength Development',
  description: 'Develop overall strength through progressive training',
  durationWeeks: 12,
  mesocycles: [
    createMesocycleOverview({ name: 'Adaptation', durationWeeks: 3 }),
    createMesocycleOverview({ name: 'Accumulation', durationWeeks: 4 }),
    createMesocycleOverview({ name: 'Intensification', durationWeeks: 3 }),
    createMesocycleOverview({ name: 'Deload', durationWeeks: 2 }),
  ],
  ...overrides,
});

export const mockFitnessPlans = {
  strengthPlan: () => new FitnessPlanBuilder()
    .withId('plan-1')
    .withClientId('user-1')
    .withProgramType('strength')
    .withGoalStatement('Increase squat, bench, and deadlift by 10%')
    .withMacrocycles([
      createMacrocycleOverview({
        name: 'Strength Foundation',
        durationWeeks: 8,
        mesocycles: [
          createMesocycleOverview({ name: 'Base Building', durationWeeks: 4 }),
          createMesocycleOverview({ name: 'Strength Focus', durationWeeks: 4 }),
        ],
      }),
    ])
    .build(),

  endurancePlan: () => new FitnessPlanBuilder()
    .withId('plan-2')
    .withClientId('user-2')
    .withProgramType('endurance')
    .withOverview('Build cardiovascular endurance and stamina')
    .withGoalStatement('Complete a 10K run')
    .withMacrocycles([
      createMacrocycleOverview({
        name: 'Endurance Building',
        durationWeeks: 12,
        description: 'Progressive running program',
      }),
    ])
    .build(),

  shredPlan: () => new FitnessPlanBuilder()
    .withId('plan-3')
    .withClientId('user-3')
    .withProgramType('shred')
    .withOverview('High-intensity program for fat loss and muscle definition')
    .withGoalStatement('Lose 10 pounds while maintaining muscle')
    .build(),

  hybridPlan: () => new FitnessPlanBuilder()
    .withId('plan-4')
    .withClientId('user-4')
    .withProgramType('hybrid')
    .withOverview('Balanced program combining strength and cardio')
    .build(),

  rehabPlan: () => new FitnessPlanBuilder()
    .withId('plan-5')
    .withClientId('user-5')
    .withProgramType('rehab')
    .withOverview('Recovery and rehabilitation program')
    .withGoalStatement('Recover from injury and rebuild strength safely')
    .withMacrocycles([
      {
        name: 'Recovery Phase',
        description: 'Gentle recovery exercises',
        durationWeeks: 6,
        mesocycles: [
          createMesocycleOverview({ 
            name: 'Initial Recovery', 
            phase: 'Recovery',
            durationWeeks: 3 
          }),
          createMesocycleOverview({ 
            name: 'Strength Rebuilding', 
            phase: 'Recovery',
            durationWeeks: 3 
          }),
        ],
      },
    ])
    .build(),

  complexPlan: () => new FitnessPlanBuilder()
    .withId('plan-6')
    .withClientId('user-6')
    .withProgramType('strength')
    .withMacrocycles([
      {
        name: 'Foundation',
        description: 'Build base strength and technique',
        durationWeeks: 4,
        mesocycles: [
          createMesocycleOverview({ name: 'Week 1-2', durationWeeks: 2 }),
          createMesocycleOverview({ name: 'Week 3-4', durationWeeks: 2 }),
        ],
      },
      {
        name: 'Development',
        description: 'Progressive overload phase',
        durationWeeks: 8,
        mesocycles: [
          createMesocycleOverview({ name: 'Volume Phase', durationWeeks: 4 }),
          createMesocycleOverview({ name: 'Intensity Phase', durationWeeks: 4 }),
        ],
      },
      {
        name: 'Peak',
        description: 'Peak performance and testing',
        durationWeeks: 4,
        mesocycles: [
          createMesocycleOverview({ name: 'Taper', durationWeeks: 2 }),
          createMesocycleOverview({ name: 'Test Week', durationWeeks: 2 }),
        ],
      },
    ])
    .build(),
};

export const createMockFitnessPlans = (count: number, clientId?: string): FitnessPlan[] => {
  const programTypes = ['strength', 'endurance', 'shred', 'hybrid', 'rehab', 'other'];
  
  return Array.from({ length: count }, (_, i) => 
    new FitnessPlanBuilder()
      .withId(`plan-${i + 1}`)
      .withClientId(clientId || `user-${i + 1}`)
      .withProgramType(programTypes[i % programTypes.length])
      .withStartDate(new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000))
      .build()
  );
};

export const createFitnessPlanOverview = (overrides: Partial<FitnessPlanOverview> = {}): FitnessPlanOverview => ({
  programType: 'strength',
  macrocycles: [createMacrocycleOverview()],
  overview: 'A comprehensive fitness program',
  ...overrides,
});

export const createInvalidFitnessPlans = () => ({
  missingClientId: {
    programType: 'strength',
    macrocycles: [],
    startDate: new Date(),
  },
  invalidProgramType: {
    clientId: 'user-1',
    programType: 'invalid-type',
    macrocycles: [],
    startDate: new Date(),
  },
  emptyMacrocycles: {
    clientId: 'user-1',
    programType: 'strength',
    macrocycles: [],
    startDate: new Date(),
  },
  invalidMacrocycles: {
    clientId: 'user-1',
    programType: 'strength',
    macrocycles: 'not-an-array' as any,
    startDate: new Date(),
  },
});