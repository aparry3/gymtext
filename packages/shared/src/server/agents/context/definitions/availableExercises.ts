import type { ContextProvider } from '../types';
import type { ExerciseRepository } from '@/server/repositories/exerciseRepository';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'Available exercises:\n{{#each exercises separator="\\n"}}- {{name}}{{/each}}';

export function createAvailableExercisesProvider(deps: {
  exerciseRepo: ExerciseRepository;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'availableExercises',
    description: 'List of available exercises from the database',
    params: {},
    templateVariables: ['exercises'],
    resolve: async () => {
      const exercises = await deps.exerciseRepo.listActiveNames();

      if (!exercises || exercises.length === 0) return '';

      const template = await deps.contextTemplateService.getTemplate('availableExercises') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { exercises });
    },
  };
}
