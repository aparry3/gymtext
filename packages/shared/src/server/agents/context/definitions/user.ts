import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { buildUserContext } from '@/server/services/context/builders';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<User>\n{{content}}\n</User>';

export function createUserProvider(deps: {
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'user',
    description: 'Basic user information (name, gender, age)',
    params: { required: ['user'] },
    templateVariables: ['content'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const content = buildUserContext({
        name: user.name,
        gender: user.gender,
        age: user.age,
      });

      const template = await deps.contextTemplateService.getTemplate('user') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
