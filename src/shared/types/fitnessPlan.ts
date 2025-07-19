import { Macrocycle } from './cycles';
import { Insertable, Selectable, Updateable } from 'kysely';
import { FitnessPlans } from './generated';

// Extension types for database records
// Note: These use camelCase as Kysely's CamelCasePlugin handles the conversion
// from snake_case database columns to camelCase TypeScript properties

// Type for selecting fitness plans from database
export type FitnessPlanDB = Selectable<FitnessPlans> & {
  macrocycles: Macrocycle[]; // Parsed JSONB
};

// Type for inserting fitness plans into database
export type NewFitnessPlan = Omit<Insertable<FitnessPlans>, 'macrocycles'> & {
  macrocycles: Macrocycle[]; // Will be stringified for JSONB
};

// Type for updating fitness plans in database
export type FitnessPlanUpdate = Omit<Updateable<FitnessPlans>, 'macrocycles'> & {
  macrocycles?: Macrocycle[]; // Will be stringified for JSONB
};