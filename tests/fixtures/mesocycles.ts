import type { Mesocycle, NewMesocycle } from '@/server/models/mesocycle';

export class MesocycleBuilder {
  private mesocycle: Mesocycle;

  constructor(overrides: Partial<Mesocycle> = {}) {
    const now = new Date();
    this.mesocycle = {
      id: this.generateUuid(),
      clientId: this.generateUuid(),
      fitnessPlanId: this.generateUuid(),
      startDate: now,
      index: 0,
      phase: 'Build',
      lengthWeeks: 4,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  withId(id: string): MesocycleBuilder {
    this.mesocycle.id = id;
    return this;
  }

  withClientId(clientId: string): MesocycleBuilder {
    this.mesocycle.clientId = clientId;
    return this;
  }

  withFitnessPlanId(fitnessPlanId: string): MesocycleBuilder {
    this.mesocycle.fitnessPlanId = fitnessPlanId;
    return this;
  }

  withStartDate(startDate: Date): MesocycleBuilder {
    this.mesocycle.startDate = startDate;
    return this;
  }

  withIndex(index: number): MesocycleBuilder {
    this.mesocycle.index = index;
    return this;
  }

  withPhase(phase: string): MesocycleBuilder {
    this.mesocycle.phase = phase;
    return this;
  }

  withLengthWeeks(lengthWeeks: number): MesocycleBuilder {
    this.mesocycle.lengthWeeks = lengthWeeks;
    return this;
  }

  withCreatedAt(createdAt: Date): MesocycleBuilder {
    this.mesocycle.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): MesocycleBuilder {
    this.mesocycle.updatedAt = updatedAt;
    return this;
  }

  asNewMesocycle(): NewMesocycle {
    const { id, createdAt, updatedAt, ...newMesocycle } = this.mesocycle;
    return newMesocycle;
  }

  build(): Mesocycle {
    return { ...this.mesocycle };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const mockMesocycles = {
  buildPhase: () => new MesocycleBuilder()
    .withId('meso-1')
    .withClientId('user-1')
    .withFitnessPlanId('plan-1')
    .withIndex(0)
    .withPhase('Build')
    .withLengthWeeks(4)
    .build(),

  basePhase: () => new MesocycleBuilder()
    .withId('meso-2')
    .withClientId('user-1')
    .withFitnessPlanId('plan-1')
    .withIndex(1)
    .withPhase('Base')
    .withLengthWeeks(3)
    .withStartDate(new Date('2024-02-01'))
    .build(),

  peakPhase: () => new MesocycleBuilder()
    .withId('meso-3')
    .withClientId('user-1')
    .withFitnessPlanId('plan-1')
    .withIndex(2)
    .withPhase('Peak')
    .withLengthWeeks(2)
    .withStartDate(new Date('2024-02-22'))
    .build(),

  deloadPhase: () => new MesocycleBuilder()
    .withId('meso-4')
    .withClientId('user-2')
    .withFitnessPlanId('plan-2')
    .withIndex(0)
    .withPhase('Deload')
    .withLengthWeeks(1)
    .build(),

  strengthPhase: () => new MesocycleBuilder()
    .withId('meso-5')
    .withClientId('user-3')
    .withFitnessPlanId('plan-3')
    .withIndex(0)
    .withPhase('Strength')
    .withLengthWeeks(6)
    .build(),

  hypertrophyPhase: () => new MesocycleBuilder()
    .withId('meso-6')
    .withClientId('user-3')
    .withFitnessPlanId('plan-3')
    .withIndex(1)
    .withPhase('Hypertrophy')
    .withLengthWeeks(8)
    .build(),
};

export const createMesocycleSequence = (fitnessPlanId: string, clientId: string): Mesocycle[] => {
  const startDate = new Date('2024-01-01');
  const phases = ['Base', 'Build', 'Peak', 'Deload'];
  const lengths = [4, 6, 3, 1];
  let currentDate = new Date(startDate);

  return phases.map((phase, index) => {
    const mesocycle = new MesocycleBuilder()
      .withId(`meso-seq-${index + 1}`)
      .withClientId(clientId)
      .withFitnessPlanId(fitnessPlanId)
      .withIndex(index)
      .withPhase(phase)
      .withLengthWeeks(lengths[index])
      .withStartDate(new Date(currentDate))
      .build();

    currentDate = new Date(currentDate.getTime() + lengths[index] * 7 * 24 * 60 * 60 * 1000);
    
    return mesocycle;
  });
};

export const createMockMesocycles = (count: number, fitnessPlanId?: string, clientId?: string): Mesocycle[] => {
  const phases = ['Foundation', 'Build', 'Strength', 'Peak', 'Deload', 'Hypertrophy', 'Power', 'Endurance'];
  const startDate = new Date();

  return Array.from({ length: count }, (_, i) => {
    const weeksOffset = i * 4;
    const mesocycleStartDate = new Date(startDate.getTime() + weeksOffset * 7 * 24 * 60 * 60 * 1000);
    
    return new MesocycleBuilder()
      .withId(`meso-${i + 1}`)
      .withClientId(clientId || `user-${Math.ceil((i + 1) / 3)}`)
      .withFitnessPlanId(fitnessPlanId || `plan-${Math.ceil((i + 1) / 4)}`)
      .withIndex(i)
      .withPhase(phases[i % phases.length])
      .withLengthWeeks((i % 4) + 2)
      .withStartDate(mesocycleStartDate)
      .build();
  });
};

export const createInvalidMesocycles = () => ({
  missingClientId: {
    fitnessPlanId: 'plan-1',
    startDate: new Date(),
    index: 0,
    phase: 'Build',
    lengthWeeks: 4,
  },
  missingFitnessPlanId: {
    clientId: 'user-1',
    startDate: new Date(),
    index: 0,
    phase: 'Build',
    lengthWeeks: 4,
  },
  zeroWeeks: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    startDate: new Date(),
    index: 0,
    phase: 'Build',
    lengthWeeks: 0,
  },
  negativeWeeks: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    startDate: new Date(),
    index: 0,
    phase: 'Build',
    lengthWeeks: -1,
  },
  negativeIndex: {
    clientId: 'user-1',
    fitnessPlanId: 'plan-1',
    startDate: new Date(),
    index: -1,
    phase: 'Build',
    lengthWeeks: 4,
  },
});