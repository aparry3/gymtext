import type { ContextProvider } from '../types';
import {
  buildDayFormatContext,
  fetchDayFormat,
  type DayActivityType,
} from '@/server/services/context/builders';

export const dayFormatProvider: ContextProvider = {
  name: 'dayFormat',
  description: 'Day format rules for a given activity type (TRAINING, ACTIVE_RECOVERY, REST)',
  params: { required: ['activityType'] },
  resolve: async (params) => {
    const activityType = params.activityType as DayActivityType;
    const formatTemplate = await fetchDayFormat(activityType);
    return buildDayFormatContext(formatTemplate, activityType);
  },
};
