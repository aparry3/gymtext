import type { Microcycle, NewMicrocycle } from '@/server/models/microcycle';

export class MicrocycleBuilder {
  private microcycle: Microcycle;

  constructor(overrides: Partial<Microcycle> = {}) {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000); // 7 days later
    
    this.microcycle = {
      id: this.generateUuid(),
      clientId: this.generateUuid(),
      fitnessPlanId: this.generateUuid(),
      mesocycleId: this.generateUuid(),
      index: 0,
      startDate,
      endDate,
      targets: null,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  withId(id: string): MicrocycleBuilder {
    this.microcycle.id = id;
    return this;
  }

  withClientId(clientId: string): MicrocycleBuilder {
    this.microcycle.clientId = clientId;
    return this;
  }

  withFitnessPlanId(fitnessPlanId: string): MicrocycleBuilder {
    this.microcycle.fitnessPlanId = fitnessPlanId;
    return this;
  }

  withMesocycleId(mesocycleId: string): MicrocycleBuilder {
    this.microcycle.mesocycleId = mesocycleId;
    return this;
  }

  withIndex(index: number): MicrocycleBuilder {
    this.microcycle.index = index;
    return this;
  }

  withStartDate(startDate: Date): MicrocycleBuilder {
    this.microcycle.startDate = startDate;
    return this;
  }

  withEndDate(endDate: Date): MicrocycleBuilder {
    this.microcycle.endDate = endDate;
    return this;
  }

  withDates(startDate: Date, endDate: Date): MicrocycleBuilder {
    this.microcycle.startDate = startDate;
    this.microcycle.endDate = endDate;
    return this;
  }

  withWeekDuration(startDate: Date): MicrocycleBuilder {
    this.microcycle.startDate = startDate;
    this.microcycle.endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    return this;
  }

  withTargets(targets: any): MicrocycleBuilder {
    this.microcycle.targets = targets;
    return this;
  }

  withCreatedAt(createdAt: Date): MicrocycleBuilder {
    this.microcycle.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): MicrocycleBuilder {
    this.microcycle.updatedAt = updatedAt;
    return this;
  }

  asNewMicrocycle(): NewMicrocycle {
    const { id, createdAt, updatedAt, ...newMicrocycle } = this.microcycle;
    return newMicrocycle;
  }

  build(): Microcycle {
    return { ...this.microcycle };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const mockMicrocycles = {
  week1: () => new MicrocycleBuilder()
    .withId('micro-1')
    .withClientId('user-1')
    .withFitnessPlanId('plan-1')
    .withMesocycleId('meso-1')
    .withIndex(0)
    .withWeekDuration(new Date('2024-01-01'))
    .build(),

  week2: () => new MicrocycleBuilder()
    .withId('micro-2')
    .withClientId('user-1')
    .withFitnessPlanId('plan-1')
    .withMesocycleId('meso-1')
    .withIndex(1)
    .withWeekDuration(new Date('2024-01-08'))
    .build(),

  deloadWeek: () => new MicrocycleBuilder()
    .withId('micro-3')
    .withClientId('user-1')
    .withFitnessPlanId('plan-1')
    .withMesocycleId('meso-1')
    .withIndex(3)
    .withWeekDuration(new Date('2024-01-22'))
    .withTargets({ deload: true, volumeReduction: 0.5 })
    .build(),

  strengthWeek: () => new MicrocycleBuilder()
    .withId('micro-4')
    .withClientId('user-2')
    .withFitnessPlanId('plan-2')
    .withMesocycleId('meso-2')
    .withIndex(0)
    .withTargets({
      avgIntensityPct1RM: 85,
      totalSetsMainLifts: 20,
      split: 'Upper-Lower-Rest-Upper-Lower-Rest-Rest',
    })
    .build(),

  enduranceWeek: () => new MicrocycleBuilder()
    .withId('micro-5')
    .withClientId('user-3')
    .withFitnessPlanId('plan-3')
    .withMesocycleId('meso-3')
    .withIndex(0)
    .withTargets({
      totalMileage: 25,
      longRunMileage: 10,
      split: 'Easy-Tempo-Rest-Easy-Long-Recovery-Rest',
    })
    .build(),
};

export const createMicrocycleSequence = (
  mesocycleId: string, 
  fitnessPlanId: string, 
  clientId: string,
  startDate: Date = new Date('2024-01-01'),
  weekCount: number = 4
): Microcycle[] => {
  const microcycles: Microcycle[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < weekCount; i++) {
    const isDeload = i === weekCount - 1;
    const microcycle = new MicrocycleBuilder()
      .withId(`micro-seq-${i + 1}`)
      .withClientId(clientId)
      .withFitnessPlanId(fitnessPlanId)
      .withMesocycleId(mesocycleId)
      .withIndex(i)
      .withWeekDuration(new Date(currentDate))
      .withTargets(isDeload ? { deload: true, volumeReduction: 0.5 } : null)
      .build();

    microcycles.push(microcycle);
    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return microcycles;
};

export const createMockMicrocycles = (
  count: number, 
  mesocycleId?: string, 
  fitnessPlanId?: string, 
  clientId?: string
): Microcycle[] => {
  const startDate = new Date();
  const targetTemplates = [
    null,
    { deload: true, volumeReduction: 0.5 },
    { avgIntensityPct1RM: 75, totalSetsMainLifts: 18 },
    { avgIntensityPct1RM: 85, totalSetsMainLifts: 12 },
    { totalMileage: 20, longRunMileage: 8 },
    { split: 'Push-Pull-Legs-Rest-Push-Pull-Legs' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const weekStartDate = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    
    return new MicrocycleBuilder()
      .withId(`micro-${i + 1}`)
      .withClientId(clientId || `user-${Math.ceil((i + 1) / 12)}`)
      .withFitnessPlanId(fitnessPlanId || `plan-${Math.ceil((i + 1) / 8)}`)
      .withMesocycleId(mesocycleId || `meso-${Math.ceil((i + 1) / 4)}`)
      .withIndex(i % 4)
      .withWeekDuration(weekStartDate)
      .withTargets(targetTemplates[i % targetTemplates.length])
      .build();
  });
};

export const createInvalidMicrocycles = () => ({
  missingClientId: {
    fitnessPlanId: 'plan-1',
    mesocycleId: 'meso-1',
    index: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  missingFitnessPlanId: {
    clientId: 'user-1',
    mesocycleId: 'meso-1',
    index: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  missingMesocycleId: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    index: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  invalidDateRange: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    mesocycleId: 'meso-1',
    index: 0,
    startDate: new Date('2024-01-08'),
    endDate: new Date('2024-01-01'), // End before start
  },
  negativeIndex: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    mesocycleId: 'meso-1',
    index: -1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});