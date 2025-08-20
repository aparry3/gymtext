import type { FitnessPlan, FitnessPlanOverview, MesocycleOverview } from '@/server/models/fitnessPlan';

// Helpers aligned with current FitnessPlan schema (direct mesocycles array)

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

export const createMesocycleOverview = (overrides: Partial<MesocycleOverview> = {}): MesocycleOverview => ({
  name: 'Accumulation',
  weeks: 4,
  focus: ['volume'],
  deload: false,
  ...overrides,
});

export const createMesocycles = (count: number): MesocycleOverview[] => (
  Array.from({ length: count }, (_, i) => createMesocycleOverview({
    name: `Phase ${i + 1}`,
    weeks: i === count - 1 ? 3 : 4,
    focus: i % 2 === 0 ? ['volume'] : ['intensity'],
    deload: i === count - 1,
  }))
);

export const mockFitnessPlans = {
  currentSchemaPlan: (overrides: Partial<FitnessPlan> = {}): FitnessPlan => {
    const now = new Date();
    const base: FitnessPlan = {
      clientId: uuid(),
      programType: 'strength',
      mesocycles: createMesocycles(2),
      lengthWeeks: 8,
      notes: null,
      currentMesocycleIndex: 0,
      currentMicrocycleWeek: 1,
      cycleStartDate: now,
      overview: 'Strength plan overview',
      startDate: now,
      goalStatement: 'Increase strength',
    } as FitnessPlan;
    return { ...base, ...overrides };
  },

  withMesocycles: (count: number): FitnessPlan => (
    mockFitnessPlans.currentSchemaPlan({
      mesocycles: createMesocycles(count),
      lengthWeeks: createMesocycles(count).reduce((sum, m) => sum + m.weeks, 0),
    })
  ),

  strengthPlan: (): FitnessPlan => mockFitnessPlans.currentSchemaPlan({ programType: 'strength' }),
  endurancePlan: (): FitnessPlan => mockFitnessPlans.currentSchemaPlan({ programType: 'endurance' }),
  shredPlan: (): FitnessPlan => mockFitnessPlans.currentSchemaPlan({ programType: 'shred' }),
  hybridPlan: (): FitnessPlan => mockFitnessPlans.currentSchemaPlan({ programType: 'hybrid' }),
  rehabPlan: (): FitnessPlan => mockFitnessPlans.currentSchemaPlan({ programType: 'rehab' }),
};

export const createMockFitnessPlans = (count: number, clientId?: string): FitnessPlan[] => {
  const programTypes = ['strength', 'endurance', 'shred', 'hybrid', 'rehab', 'other'];
  return Array.from({ length: count }, (_, i) =>
    mockFitnessPlans.currentSchemaPlan({
      clientId: clientId || `user-${i + 1}`,
      programType: programTypes[i % programTypes.length],
      startDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
    })
  );
};

export const createFitnessPlanOverview = (overrides: Partial<FitnessPlanOverview> = {}): FitnessPlanOverview => ({
  programType: 'strength',
  lengthWeeks: 8,
  mesocycles: createMesocycles(2),
  overview: 'A comprehensive fitness program',
  ...overrides,
});