import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { today, subtractDays, formatForAI } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '<RecentWorkouts>\n{{#if workouts}}Recent workout history (most recent first):\n\n{{#each workouts separator="\n\n"}}{{date}}{{#if title}} — {{title}}{{/if}}{{#if focus}} ({{focus}}){{/if}}\n{{message}}{{/each}}{{else}}No recent workout history.{{/if}}\n</RecentWorkouts>';

export function createRecentWorkoutsProvider(deps: {
  workoutInstanceService: WorkoutInstanceServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'recentWorkouts',
    description: 'Recent workout history (last 7 days)',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['workouts'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const timezone = user.timezone || 'America/New_York';
      const targetDate = (params.date as Date | undefined) || today(timezone);
      const startDate = subtractDays(targetDate, 7, timezone);

      const workouts = await deps.workoutInstanceService.getWorkoutsByDateRange(
        user.id,
        startDate,
        targetDate
      );

      // Sort descending (most recent first) and map to template-friendly format
      const sortedWorkouts = workouts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((w) => ({
          date: formatForAI(w.date, timezone),
          title: w.description || '',
          focus: w.sessionType || '',
          message: w.message || '',
        }));

      const template = await deps.contextTemplateService.getTemplate('recentWorkouts') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { workouts: sortedWorkouts });
    },
  };
}
