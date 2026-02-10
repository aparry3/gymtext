import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import { buildUserProfileContext } from '@/server/services/context/builders';

export const userProfileProvider: ContextProvider = {
  name: 'userProfile',
  description: 'User fitness profile (markdown)',
  params: { required: ['user'] },
  resolve: async (params) => {
    const user = params.user as UserWithProfile;
    return buildUserProfileContext(user.profile);
  },
};
