import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { today } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'This week\'s training plan (Week {{microcycle.absoluteWeek}}):\n\n{{#if microcycle.description}}{{microcycle.description}}\n\n{{/if}}Monday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\nWednesday: {{microcycle.days.2}}\nThursday: {{microcycle.days.3}}\nFriday: {{microcycle.days.4}}\nSaturday: {{microcycle.days.5}}\nSunday: {{microcycle.days.6}}';

export function createCurrentMicrocycleProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'currentMicrocycle',
    description: 'Current microcycle (weekly training pattern)',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['microcycle'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);

      if (!microcycle) return 'No microcycle available';

      const template = await deps.contextTemplateService.getTemplate('currentMicrocycle') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { microcycle });
    },
  };
}
