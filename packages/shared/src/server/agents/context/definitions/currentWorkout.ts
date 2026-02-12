import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { buildWorkoutContext } from '@/server/services/context/builders';
import { today } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<CurrentWorkout>{{content}}</CurrentWorkout>';

export function createCurrentWorkoutProvider(deps: {
  workoutInstanceService: WorkoutInstanceServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'currentWorkout',
    description: 'Current workout instance for today',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['content'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const targetDate = (params.date as Date | undefined) || today(user.timezone);
      const workout = await deps.workoutInstanceService.getWorkoutByUserIdAndDate(user.id, targetDate);
      const content = buildWorkoutContext(workout);

      const template = await deps.contextTemplateService.getTemplate('currentWorkout') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
