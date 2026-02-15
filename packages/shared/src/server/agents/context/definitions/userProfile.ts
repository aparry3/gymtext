import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'Here is everything we know about this client:\n\n{{content}}';

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
      const content = user.profile?.trim() || 'No profile available';

      const template = await deps.contextTemplateService.getTemplate('userProfile') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
