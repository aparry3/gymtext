import type { ModelConfig } from '@/server/agents';
import type { PlanStructure } from '@/server/models/fitnessPlan';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { UserWithProfile } from '@/server/models/user';
export type { PlanStructure };
/**
 * Input for fitness plan generation
 */
export interface FitnessPlanGenerateInput {
    user: UserWithProfile;
}
/**
 * Output from fitness plan generation (flattened subAgent results)
 */
export interface FitnessPlanGenerateOutput {
    response: string;
    message: string;
    structure: PlanStructure;
}
/**
 * Dependencies for fitness plan generate agent
 */
export interface FitnessPlanGenerateAgentDeps {
    config?: ModelConfig;
}
/**
 * Input for fitness plan modification
 */
export interface ModifyFitnessPlanInput {
    user: UserWithProfile;
    currentPlan: FitnessPlan;
    changeRequest: string;
}
/**
 * Output from fitness plan modification (flattened subAgent results)
 */
export interface ModifyFitnessPlanOutput {
    response: {
        description: string;
        wasModified: boolean;
        modifications: string;
    };
    structure: PlanStructure;
}
/**
 * Dependencies for fitness plan modify agent
 */
export interface ModifyFitnessPlanAgentDeps {
    config?: ModelConfig;
}
/**
 * @deprecated Use FitnessPlanGenerateOutput instead
 */
export interface FitnessPlanChainContext {
    user: UserWithProfile;
    fitnessPlan: string;
}
/**
 * @deprecated Use FitnessPlanGenerateAgentDeps instead
 */
export interface FitnessProfileContextService {
    config?: ModelConfig;
}
//# sourceMappingURL=plans.d.ts.map