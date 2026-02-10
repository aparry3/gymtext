import type { ContextProvider } from '../types';
import { buildTrainingMetaContext } from '@/server/services/context/builders';

export const trainingMetaProvider: ContextProvider = {
  name: 'trainingMeta',
  description: 'Training metadata (deload status, week numbers)',
  params: { optional: ['isDeload', 'absoluteWeek', 'currentWeek'] },
  resolve: async (params) => {
    return buildTrainingMetaContext({
      isDeload: params.isDeload as boolean | undefined,
      absoluteWeek: params.absoluteWeek as number | undefined,
      currentWeek: params.currentWeek as number | undefined,
    });
  },
};
