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
    params: { required: ['user'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const plan = await deps.fitnessPlanService.getCurrentPlan(user.id);
      return buildFitnessPlanContext(plan?.description ?? undefined);
    },
  };
}
