import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import {
  buildDayFormatContext,
  fetchDayFormat,
  type DayActivityType,
} from '@/server/services/context/builders';
import { today, getWeekday } from '@/shared/utils/date';

export function createDayFormatProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
}): ContextProvider {
  return {
    name: 'dayFormat',
    description: 'Day format rules for a given activity type (TRAINING, ACTIVE_RECOVERY, REST)',
    params: { required: ['user'], optional: ['date'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);

      let activityType: DayActivityType = 'TRAINING';
      if (microcycle?.structured?.days) {
        const dayIndex = getWeekday(targetDate, user.timezone) - 1;
        const structuredDay = microcycle.structured.days[dayIndex];
        if (structuredDay?.activityType) {
          activityType = structuredDay.activityType as DayActivityType;
        }
      }

      const formatTemplate = await fetchDayFormat(activityType);
      return buildDayFormatContext(formatTemplate, activityType);
    },
  };
}
