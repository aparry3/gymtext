import type { ContextProvider } from '../types';
import type { UserWithProfile, WorkoutInstance } from '@/server/models';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import type { RepositoryContainer } from '@/server/repositories/factory';
import { today, formatForAI } from '@/shared/utils/date';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = '{{#if sessions}}<PreviousSessions>\nPrevious {{splitType}} sessions for reference:\n\n{{#each sessions separator="\n\n"}}{{date}} — {{title}}\n{{message}}{{/each}}\n</PreviousSessions>{{/if}}';

export function createPreviousSessionsByTypeProvider(deps: {
  workoutInstanceService: WorkoutInstanceServiceInstance;
  repos: RepositoryContainer;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'previousSessionsByType',
    description: 'Previous workout sessions with overlapping split tags',
    params: { required: ['user'], optional: ['date'] },
    templateVariables: ['sessions', 'splitType'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const timezone = user.timezone || 'America/New_York';
      const targetDate = (params.date as Date | undefined) || today(timezone);

      // Get today's workout to determine its tags
      const todayWorkout = await deps.workoutInstanceService.getWorkoutByUserIdAndDate(
        user.id,
        targetDate
      );

      if (!todayWorkout) return '';

      // Extract tags from today's workout (tags column added by migration)
      const workoutRecord = todayWorkout as Record<string, unknown>;
      const rawTags = workoutRecord.tags;
      const tags = Array.isArray(rawTags) ? rawTags as string[] : [];
      if (tags.length === 0) return '';

      const splitType = tags.join(' / ');

      // Query for previous sessions with overlapping tags (method added by tags migration)
      const repo = deps.repos.workoutInstance as RepositoryContainer['workoutInstance'] & {
        getRecentWorkoutsByTags(userId: string, tags: string[], limit?: number, excludeDate?: Date): Promise<WorkoutInstance[]>;
      };
      if (typeof repo.getRecentWorkoutsByTags !== 'function') return '';

      const previousWorkouts = await repo.getRecentWorkoutsByTags(
        user.id,
        tags,
        3,
        targetDate
      );

      if (!previousWorkouts || previousWorkouts.length === 0) return '';

      const sessions = previousWorkouts.map((w) => ({
        date: formatForAI(w.date, timezone),
        title: w.description || w.sessionType || '',
        message: w.message || '',
      }));

      const template = await deps.contextTemplateService.getTemplate('previousSessionsByType') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { sessions, splitType });
    },
  };
}
