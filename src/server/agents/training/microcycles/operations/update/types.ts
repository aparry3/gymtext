import type { Microcycle } from '@/server/models/microcycle';
import type { Mesocycle } from '@/server/models/fitnessPlan';

/**
 * Parameters for updating a microcycle
 */
export interface MicrocycleUpdateParams {
  targetDay: string; // The specific day being modified (e.g., "Monday", typically "today")
  changes: string[]; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 minutes", "Apply hotel gym constraints to remaining days"])
  reason: string; // Why the modification is needed (e.g., "Gym is too crowded", "Traveling for work")
  remainingDays?: string[]; // Days that are remaining in the week (today and future)
}

/**
 * Context required to update a microcycle
 */
export interface MicrocycleUpdateContext {
  currentMicrocycle: Microcycle;
  params: MicrocycleUpdateParams;
  mesocycle: Mesocycle;
  programType: string;
}

/**
 * Result of updating a microcycle with all day overviews and modifications applied
 */
export interface UpdatedMicrocycleDayOverviews {
  mondayOverview: string;
  tuesdayOverview: string;
  wednesdayOverview: string;
  thursdayOverview: string;
  fridayOverview: string;
  saturdayOverview: string;
  sundayOverview: string;
  modificationsApplied: string[]; // List of specific changes made to the weekly pattern
}
