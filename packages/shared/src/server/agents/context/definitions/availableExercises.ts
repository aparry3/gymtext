import type { ContextProvider } from '../types';
import type { ExerciseRepository } from '@/server/repositories/exerciseRepository';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { buildExercisesContext } from '@/server/services/context/builders';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<AvailableExercises>\n{{content}}\n</AvailableExercises>';

export function createAvailableExercisesProvider(deps: {
  exerciseRepo: ExerciseRepository;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'availableExercises',
    description: 'List of available exercises from the database',
    params: {},
    templateVariables: ['content'],
    resolve: async () => {
      const exercises = await deps.exerciseRepo.listActiveNames();
      const content = buildExercisesContext(exercises);

      if (!content) return '';

      const template = await deps.contextTemplateService.getTemplate('availableExercises') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
