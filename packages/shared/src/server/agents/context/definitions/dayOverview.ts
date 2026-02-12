import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { today, getWeekday } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<DayOverview>{{content}}</DayOverview>';

export function createDayOverviewProvider(deps: {
  microcycleService: MicrocycleServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'dayOverview',
    description: 'Day instruction/overview from microcycle',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['content'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const microcycle = await deps.microcycleService.getMicrocycleByDate(user.id, targetDate);

      let dayOverviewStr: string | undefined;
      if (microcycle) {
        const dayIndex = getWeekday(targetDate, user.timezone) - 1;
        const dayOverview = microcycle.days?.[dayIndex];
        dayOverviewStr = typeof dayOverview === 'string' ? dayOverview : undefined;
      }

      const content = dayOverviewStr?.trim() || 'No day instruction provided';
      const template = await deps.contextTemplateService.getTemplate('dayOverview') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
