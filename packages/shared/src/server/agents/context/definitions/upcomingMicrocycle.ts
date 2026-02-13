import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { today, getNextWeekStart } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'Next week\'s training plan (Week {{microcycle.absoluteWeek}}):\n\n{{#if microcycle.description}}{{microcycle.description}}\n\n{{/if}}Monday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\nWednesday: {{microcycle.days.2}}\nThursday: {{microcycle.days.3}}\nFriday: {{microcycle.days.4}}\nSaturday: {{microcycle.days.5}}\nSunday: {{microcycle.days.6}}';

export function createUpcomingMicrocycleProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'upcomingMicrocycle',
    description: 'Upcoming microcycle (next week\'s training pattern)',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['microcycle'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const todayDate = today(user.timezone);
      const nextWeekStart = getNextWeekStart(todayDate, user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, nextWeekStart);

      if (!microcycle) return 'No upcoming week plan available yet.';

      const template = await deps.contextTemplateService.getTemplate('upcomingMicrocycle') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { microcycle });
    },
  };
}
