import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import { buildDateContext } from '@/server/services/context/builders';
import { today } from '@/shared/utils/date';

export const dateContextProvider: ContextProvider = {
  name: 'dateContext',
  description: 'Current date and timezone context',
  params: { required: ['user'], optional: ['date'] },
  resolve: async (params) => {
    const user = params.user as UserWithProfile;
    const timezone = user.timezone || 'America/New_York';
    const date = (params.date as Date | undefined) || today(timezone);
    return buildDateContext(timezone, date);
  },
};
