import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { FitnessPlanServiceInstance } from '@/server/services/domain/training/fitnessPlanService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<FitnessPlan>{{content}}</FitnessPlan>';

export function createFitnessPlanProvider(deps: {
  fitnessPlanService: FitnessPlanServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'fitnessPlan',
    description: 'Current fitness plan description',
    params: { required: ['user'] },
    templateVariables: ['content'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const plan = await deps.fitnessPlanService.getCurrentPlan(user.id);
      const content = plan?.description?.trim() || 'No fitness plan available';

      const template = await deps.contextTemplateService.getTemplate('fitnessPlan') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
