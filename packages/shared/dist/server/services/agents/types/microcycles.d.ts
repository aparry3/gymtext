import type { ModelConfig } from '@/server/agents';
import type { MicrocycleStructure } from '@/server/models/microcycle';
import type { Microcycle } from '@/server/models/microcycle';
import type { UserWithProfile } from '@/server/models/user';
import type { DayOfWeek } from '@/shared/utils/date';
import type { ExperienceLevel } from '@/server/services/context';
export type { MicrocycleStructure };
/**
 * Input for microcycle generation agent
 *
 * Uses the fitness plan text and user profile to generate a weekly pattern
 */
export interface MicrocycleGenerateInput {
    planText: string;
    userProfile: string;
    absoluteWeek: number;
    isDeload: boolean;
    experienceLevel?: ExperienceLevel;
}
/**
 * Output from microcycle generation (flattened subAgent results)
 */
export interface MicrocycleGenerateOutput {
    response: {
        overview: string;
        days: string[];
        isDeload: boolean;
    };
    message: string;
    structure: MicrocycleStructure;
}
/**
 * Dependencies for microcycle generate agent
 */
export interface MicrocycleGenerateAgentDeps {
    config?: ModelConfig;
}
export type MicrocycleGenerationInput = MicrocycleGenerateInput;
export type MicrocycleAgentDeps = MicrocycleGenerateAgentDeps;
/**
 * Input for microcycle modification
 */
export interface ModifyMicrocycleInput {
    user: UserWithProfile;
    currentMicrocycle: Microcycle;
    changeRequest: string;
    currentDayOfWeek: DayOfWeek;
    weekNumber: number;
}
/**
 * Output from microcycle modification (flattened subAgent results)
 */
export interface ModifyMicrocycleOutput {
    response: {
        overview: string;
        days: string[];
        isDeload: boolean;
        wasModified: boolean;
        modifications: string;
    };
    message: string;
    structure: MicrocycleStructure;
}
/**
 * Dependencies for microcycle modify agent
 */
export interface ModifyMicrocycleAgentDeps {
    config?: ModelConfig;
}
/**
 * @deprecated Use MicrocycleGenerateOutput instead
 * Legacy output format maintained for service layer compatibility
 */
export interface BaseMicrocycleAgentOutput {
    days: string[];
    description: string;
    isDeload: boolean;
    wasModified?: boolean;
    modifications?: string;
}
/**
 * @deprecated Use MicrocycleGenerateOutput instead
 */
export interface MicrocycleAgentOutput extends BaseMicrocycleAgentOutput {
    message: string;
    structure?: MicrocycleStructure;
}
//# sourceMappingURL=microcycles.d.ts.map