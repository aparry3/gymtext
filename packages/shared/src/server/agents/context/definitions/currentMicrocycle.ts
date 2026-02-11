import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import { buildMicrocycleContext } from '@/server/services/context/builders';
import { today } from '@/shared/utils/date';

export function createCurrentMicrocycleProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
}): ContextProvider {
  return {
    name: 'currentMicrocycle',
    description: 'Current microcycle (weekly training pattern)',
    params: { required: ['user'], optional: ['date'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);
      return buildMicrocycleContext(microcycle);
    },
  };
}
