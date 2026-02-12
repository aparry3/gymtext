import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { today } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<TrainingMeta>{{#if microcycle.isDeload}}Is Deload Week: {{microcycle.isDeload}}{{/if}}{{#if microcycle.absoluteWeek}} | Absolute Week: {{microcycle.absoluteWeek}}{{/if}}</TrainingMeta>';

export function createTrainingMetaProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'trainingMeta',
    description: 'Training metadata (deload status, week numbers)',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['microcycle'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);

      if (!microcycle) return '';

      const template = await deps.contextTemplateService.getTemplate('trainingMeta') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { microcycle });
    },
  };
}
