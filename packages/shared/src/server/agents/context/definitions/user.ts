import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'Client: {{#if user.name}}{{user.name}}{{else}}Unknown{{/if}}{{#if user.gender}} ({{user.gender}}){{/if}}{{#if user.age}}, age {{user.age}}{{/if}}';

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
