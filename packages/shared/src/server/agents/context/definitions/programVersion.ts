import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { EnrollmentServiceInstance } from '@/server/services/domain/program/enrollmentService';
import { buildProgramVersionContext } from '@/server/services/context/builders';

export function createProgramVersionProvider(deps: {
  enrollmentService: EnrollmentServiceInstance;
}): ContextProvider {
  return {
    name: 'programVersion',
    description: 'Program version template content for enrolled users',
    params: { required: ['user'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const enrollmentWithVersion = await deps.enrollmentService.getEnrollmentWithProgramVersion(user.id);
      return buildProgramVersionContext(enrollmentWithVersion?.programVersion ?? null);
    },
  };
}
