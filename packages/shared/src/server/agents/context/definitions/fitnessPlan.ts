import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { FitnessPlanServiceInstance } from '@/server/services/domain/training/fitnessPlanService';
import { buildFitnessPlanContext } from '@/server/services/context/builders';

export function createFitnessPlanProvider(deps: {
  fitnessPlanService: FitnessPlanServiceInstance;
}): ContextProvider {
  return {
    name: 'fitnessPlan',
    description: 'Current fitness plan description',
    params: { required: ['user'], optional: ['planText'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      let planText = params.planText as string | undefined;

      if (!planText) {
        const plan = await deps.fitnessPlanService.getCurrentPlan(user.id);
        planText = plan?.description ?? undefined;
      }

      return buildFitnessPlanContext(planText);
    },
  };
}
