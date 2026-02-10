import type { ContextProvider } from '../types';
import { buildDayOverviewContext } from '@/server/services/context/builders';

export const dayOverviewProvider: ContextProvider = {
  name: 'dayOverview',
  description: 'Day instruction/overview from microcycle',
  params: { required: ['dayOverview'] },
  resolve: async (params) => {
    const dayOverview = params.dayOverview as string;
    return buildDayOverviewContext(dayOverview);
  },
};
