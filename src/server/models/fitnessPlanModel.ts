import { FitnessPlan, NewFitnessPlan, FitnessPlanUpdate } from './_types';

// Re-export Kysely generated types
export type { FitnessPlan, NewFitnessPlan, FitnessPlanUpdate };

// Additional fitness plan types
export interface FitnessPlanWithMesocycles extends FitnessPlan {
  mesocycles?: Mesocycle[];
}

export interface FitnessPlanSummary {
  id: string;
  userId: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused';
  totalWeeks: number;
  completedWeeks: number;
}

export interface Mesocycle {
  id: string;
  fitnessPlanId: string;
  name: string;
  phase: string;
  weekCount: number;
  startWeek: number;
  endWeek: number;
}

// Business logic helpers
export const calculatePlanDuration = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
};

export const isPlanActive = (plan: FitnessPlan): boolean => {
  const now = new Date();
  return plan.startDate <= now && plan.endDate >= now;
};