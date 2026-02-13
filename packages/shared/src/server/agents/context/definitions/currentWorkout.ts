import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { today } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'Today\'s scheduled workout:\n\n{{#if workout.description}}{{workout.description}}{{else}}{{#if workout.sessionType}}{{workout.sessionType}}{{else}}No workout details available{{/if}}{{/if}}';

export function createCurrentWorkoutProvider(deps: {
  workoutInstanceService: WorkoutInstanceServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'currentWorkout',
    description: 'Current workout instance for today',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['workout'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const workout = await deps.workoutInstanceService.getWorkoutByUserIdAndDate(user.id, targetDate);

      if (!workout) return 'No workout scheduled';

      const template = await deps.contextTemplateService.getTemplate('currentWorkout') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { workout });
    },
  };
}
