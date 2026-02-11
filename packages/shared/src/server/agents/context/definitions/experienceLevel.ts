import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { FitnessProfileServiceInstance } from '@/server/services/domain/user/fitnessProfileService';
import {
  buildExperienceLevelContext,
  fetchExperienceLevelSnippet,
  SnippetType,
  type ExperienceLevel,
} from '@/server/services/context/builders';

export function createExperienceLevelProvider(deps: {
  fitnessProfileService: FitnessProfileServiceInstance;
}): ContextProvider {
  return {
    name: 'experienceLevel',
    description: 'Experience level context with coaching guidance snippet',
    params: { required: ['user'], optional: ['snippetType'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const snippetType = (params.snippetType as SnippetType) || SnippetType.WORKOUT;

      const structuredProfile = await deps.fitnessProfileService.getCurrentStructuredProfile(user.id);
      const experienceLevel = structuredProfile?.experienceLevel as ExperienceLevel | undefined;

      if (!experienceLevel) {
        return null;
      }

      const snippet = await fetchExperienceLevelSnippet(experienceLevel, snippetType);
      return buildExperienceLevelContext(snippet, experienceLevel, snippetType);
    },
  };
}
