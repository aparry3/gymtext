import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { formatForAI } from '@/shared/utils/date';
import { today } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'Today is {{formattedDate}} ({{timezone}}).';

export function createDateContextProvider(deps: {
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'dateContext',
    description: 'Current date and timezone context',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['formattedDate', 'timezone'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const timezone = user.timezone || 'America/New_York';
      const date = (params.date as Date | undefined) || today(timezone);
      const formattedDate = formatForAI(date, timezone);

      const template = await deps.contextTemplateService.getTemplate('dateContext') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { formattedDate, timezone });
    },
  };
}
