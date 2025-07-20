import { Mesocycle, NewMesocycle, MesocycleUpdate } from './_types';

// Re-export Kysely generated types
export type { Mesocycle, NewMesocycle, MesocycleUpdate };

// Additional mesocycle types
export interface MesocycleWithMicrocycles extends Mesocycle {
  microcycles?: Microcycle[];
}

export interface Microcycle {
  id: string;
  mesocycleId: string;
  weekNumber: number;
  focus: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface MesocycleSummary {
  id: string;
  name: string;
  phase: string;
  totalWeeks: number;
  completedWeeks: number;
  progress: number;
}

// Business logic
export const calculateMesocycleProgress = (
  currentWeek: number,
  totalWeeks: number
): number => {
  return Math.round((currentWeek / totalWeeks) * 100);
};