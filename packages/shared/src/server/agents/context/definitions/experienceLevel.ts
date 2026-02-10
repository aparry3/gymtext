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
    params: { required: ['user'], optional: ['experienceLevel', 'snippetType'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      let experienceLevel = params.experienceLevel as ExperienceLevel | undefined;
      const snippetType = (params.snippetType as SnippetType) || SnippetType.WORKOUT;

      if (!experienceLevel) {
        const structuredProfile = await deps.fitnessProfileService.getCurrentStructuredProfile(user.id);
        experienceLevel = structuredProfile?.experienceLevel ?? undefined;
      }

      if (!experienceLevel) {
        return null;
      }

      const snippet = await fetchExperienceLevelSnippet(experienceLevel, snippetType);
      return buildExperienceLevelContext(snippet, experienceLevel, snippetType);
    },
  };
}
