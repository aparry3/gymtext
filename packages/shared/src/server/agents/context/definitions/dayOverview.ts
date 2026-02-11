import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import { buildDayOverviewContext } from '@/server/services/context/builders';
import { today, getWeekday } from '@/shared/utils/date';

export function createDayOverviewProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
}): ContextProvider {
  return {
    name: 'dayOverview',
    description: 'Day instruction/overview from microcycle',
    params: { required: ['user'], optional: ['date'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);

      if (!microcycle) {
        return buildDayOverviewContext(undefined);
      }

      const dayIndex = getWeekday(targetDate, user.timezone) - 1;
      const dayOverview = microcycle.days?.[dayIndex];

      return buildDayOverviewContext(typeof dayOverview === 'string' ? dayOverview : undefined);
    },
  };
}
