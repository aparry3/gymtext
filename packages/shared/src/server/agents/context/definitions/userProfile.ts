import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { buildUserProfileContext } from '@/server/services/context/builders';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<UserProfile>{{content}}</UserProfile>';

export function createUserProfileProvider(deps: {
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'userProfile',
    description: 'User fitness profile (markdown)',
    params: { required: ['user'] },
    templateVariables: ['content'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const content = buildUserProfileContext(user.profile);

      const template = await deps.contextTemplateService.getTemplate('userProfile') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
