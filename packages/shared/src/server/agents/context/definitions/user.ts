import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import { buildUserContext } from '@/server/services/context/builders';

export const userProvider: ContextProvider = {
  name: 'user',
  description: 'Basic user information (name, gender, age)',
  params: { required: ['user'] },
  resolve: async (params) => {
    const user = params.user as UserWithProfile;
    return buildUserContext({
      name: user.name,
      gender: user.gender,
      age: user.age,
    });
  },
};
