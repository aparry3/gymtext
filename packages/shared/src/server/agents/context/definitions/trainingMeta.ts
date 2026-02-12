import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { buildTrainingMetaContext } from '@/server/services/context/builders';
import { today } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<TrainingMeta>{{content}}</TrainingMeta>';

export function createTrainingMetaProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'trainingMeta',
    description: 'Training metadata (deload status, week numbers)',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['content'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);

      const content = buildTrainingMetaContext(
        microcycle ? { isDeload: microcycle.isDeload, absoluteWeek: microcycle.absoluteWeek } : {}
      );

      const template = await deps.contextTemplateService.getTemplate('trainingMeta') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
