import type { FitnessPlans } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { type PlanStructure } from '@/shared/types/plan';
import { UserWithProfile } from './user';
export * from '@/shared/types/plan';
export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;
/**
 * Simplified FitnessPlan type
 *
 * Stores:
 * - description: Structured text plan (contains split, frequency, goals, deload rules, etc.)
 * - message: Brief summary for SMS (optional)
 * - structured: Parsed structured plan data for UI rendering
 *
 * Plans are ongoing by default - no fixed duration.
 * All versions are kept (query latest by created_at).
 */
export interface FitnessPlan {
    id?: string;
    clientId: string;
    description: string;
    message?: string | null;
    structured?: PlanStructure | null;
    startDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Overview returned by fitness plan agent
 */
export interface FitnessPlanOverview {
    description: string;
    message?: string;
    structure?: PlanStructure;
}
export declare class FitnessPlanModel implements FitnessPlan {
    id: string;
    clientId: string;
    description: string;
    message: string | null;
    structured: PlanStructure | null;
    startDate: Date;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: string, clientId: string, description: string, message: string | null, structured: PlanStructure | null, startDate: Date, createdAt: Date, updatedAt: Date);
    static fromDB(fitnessPlan: FitnessPlanDB): FitnessPlan;
    static fromFitnessPlanOverview(user: UserWithProfile, fitnessPlanOverview: FitnessPlanOverview): FitnessPlan;
    static schema: import("zod").ZodObject<{
        description: import("zod").ZodString;
        message: import("zod").ZodOptional<import("zod").ZodNullable<import("zod").ZodString>>;
    }, "strip", import("zod").ZodTypeAny, {
        description: string;
        message?: string | null | undefined;
    }, {
        description: string;
        message?: string | null | undefined;
    }>;
}
//# sourceMappingURL=fitnessPlan.d.ts.map