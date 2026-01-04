import type { ModelConfig } from '@/server/agents';
import type { WorkoutStructure } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/user';
import type { WorkoutInstance } from '@/server/models/workout';
import type { ExperienceLevel } from '@/server/services/context';
export type { WorkoutStructure };
/**
 * Base input for all workout operations
 */
export interface BaseWorkoutChainInput {
    user: UserWithProfile;
    date: Date;
}
/**
 * Input for workout generation operation
 */
export interface WorkoutGenerateInput {
    user: UserWithProfile;
    date: Date;
    dayOverview: string;
    isDeload?: boolean;
    experienceLevel?: ExperienceLevel;
}
/**
 * Output from workout generation (flattened subAgent results)
 */
export interface WorkoutGenerateOutput {
    response: string;
    message: string;
    structure: WorkoutStructure;
}
/**
 * Dependencies for workout generate agent
 */
export interface WorkoutGenerateAgentDeps {
    config?: ModelConfig;
}
export type WorkoutGenerateResult = WorkoutGenerateOutput;
/**
 * Input for workout modification
 */
export interface ModifyWorkoutInput {
    user: UserWithProfile;
    date: Date;
    workout: WorkoutInstance;
    changeRequest: string;
}
/**
 * Output from workout modification (flattened subAgent results)
 */
export interface ModifyWorkoutOutput {
    response: {
        overview: string;
        wasModified: boolean;
        modifications: string;
    };
    message: string;
    structure: WorkoutStructure;
}
/**
 * Dependencies for workout modification agent
 */
export interface ModifyWorkoutAgentDeps {
    config?: ModelConfig;
}
export type WorkoutModifyResult = ModifyWorkoutOutput;
/**
 * Configuration for workout message agent
 */
export interface WorkoutMessageConfig {
    operationName?: string;
    agentConfig?: ModelConfig;
}
/**
 * Configuration for structured workout agent
 */
export interface StructuredWorkoutConfig {
    operationName?: string;
    agentConfig?: ModelConfig;
}
//# sourceMappingURL=workouts.d.ts.map