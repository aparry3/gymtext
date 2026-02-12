import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<User>\n{{#if user.name}}<Name>{{user.name}}</Name>\n{{/if}}{{#if user.gender}}<Gender>{{user.gender}}</Gender>\n{{/if}}{{#if user.age}}<Age>{{user.age}}</Age>\n{{/if}}</User>';

export function createUserProvider(deps: {
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'user',
    description: 'Basic user information (name, gender, age)',
    params: { required: ['user'] },
    templateVariables: ['user'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const template = await deps.contextTemplateService.getTemplate('user') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { user });
    },
  };
}
