import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import { buildTrainingMetaContext } from '@/server/services/context/builders';
import { today } from '@/shared/utils/date';

export function createTrainingMetaProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
}): ContextProvider {
  return {
    name: 'trainingMeta',
    description: 'Training metadata (deload status, week numbers)',
    params: { required: ['user'], optional: ['date'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);

      if (!microcycle) {
        return buildTrainingMetaContext({});
      }

      return buildTrainingMetaContext({
        isDeload: microcycle.isDeload,
        absoluteWeek: microcycle.absoluteWeek,
      });
    },
  };
}
