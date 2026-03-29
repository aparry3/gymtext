import { DateTime } from 'luxon';
import type { RepositoryContainer } from '@/server/repositories/factory';
import type { Profile } from '@/server/repositories/profileRepository';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';

export type ContextType = 'profile' | 'plan' | 'week' | 'previousWeek';

export interface ContextOptions {
  date?: Date;
  timezone?: string;
  weekContentOverride?: string;
  profileContentOverride?: string;
}

export interface MarkdownServiceInstance {
  getProfile(userId: string): Promise<string | null>;
  updateProfile(userId: string, content: string): Promise<Profile>;
  getPlan(userId: string): Promise<FitnessPlan | null>;
  createPlan(userId: string, content: string, startDate: Date): Promise<FitnessPlan>;
  getWeek(userId: string): Promise<Microcycle | null>;
  getWeekForDate(userId: string, date: Date): Promise<Microcycle | null>;
  createWeek(userId: string, planId: string, content: string, startDate: Date, options?: { message?: string }): Promise<Microcycle>;
  getContext(userId: string, types: ContextType[], options?: ContextOptions): Promise<string[]>;
  getProgramContext(programVersionId: string): Promise<string | null>;
}

export function createMarkdownService(repos: RepositoryContainer): MarkdownServiceInstance {
  return {
    async getProfile(userId: string): Promise<string | null> {
      return repos.profile.getCurrentProfileText(userId);
    },

    async updateProfile(userId: string, content: string): Promise<Profile> {
      return repos.profile.createProfileForUser(userId, content);
    },

    async getPlan(userId: string): Promise<FitnessPlan | null> {
      return repos.fitnessPlan.getLatest(userId);
    },

    async createPlan(userId: string, content: string, startDate: Date): Promise<FitnessPlan> {
      return repos.fitnessPlan.create(userId, content, startDate);
    },

    async getWeek(userId: string): Promise<Microcycle | null> {
      return repos.microcycle.getLatest(userId);
    },

    async getWeekForDate(userId: string, date: Date): Promise<Microcycle | null> {
      return repos.microcycle.getByDate(userId, date);
    },

    async createWeek(userId: string, planId: string, content: string, startDate: Date, options?: { message?: string }): Promise<Microcycle> {
      return repos.microcycle.create(userId, planId, content, startDate, options);
    },

    async getContext(userId: string, types: ContextType[], options?: ContextOptions): Promise<string[]> {
      // Determine which data to fetch in parallel
      const needsProfile = types.includes('profile') && !options?.profileContentOverride;
      const needsPlan = types.includes('plan');
      const needsWeek = types.includes('week') && !options?.weekContentOverride;
      const needsPreviousWeek = types.includes('previousWeek');

      const [profileContent, plan, week] = await Promise.all([
        needsProfile ? repos.profile.getCurrentProfileText(userId) : Promise.resolve(null),
        needsPlan ? repos.fitnessPlan.getLatest(userId) : Promise.resolve(null),
        needsWeek || needsPreviousWeek
          ? (options?.date
              ? repos.microcycle.getByDate(userId, options.date)
              : repos.microcycle.getLatest(userId))
          : Promise.resolve(null),
      ]);

      // Fetch previous week if needed (depends on current week's startDate)
      let previousWeek: Microcycle | null = null;
      if (needsPreviousWeek && week?.startDate) {
        const tz = options?.timezone || 'America/New_York';
        const prevDate = DateTime.fromJSDate(week.startDate, { zone: tz }).minus({ weeks: 1 }).toJSDate();
        previousWeek = await repos.microcycle.getByDate(userId, prevDate);
      }

      // Build context array in the order types were requested
      const context: string[] = [];
      for (const type of types) {
        switch (type) {
          case 'profile': {
            const content = options?.profileContentOverride ?? profileContent;
            if (content) context.push(`## Profile\n${content}`);
            break;
          }
          case 'plan': {
            const planContent = plan?.content || plan?.description;
            if (planContent) context.push(`## Plan\n${planContent}`);
            break;
          }
          case 'previousWeek': {
            if (previousWeek?.content) context.push(`## Previous Week\n${previousWeek.content}`);
            break;
          }
          case 'week': {
            const weekContent = options?.weekContentOverride ?? week?.content;
            if (weekContent) context.push(`## Week\n${weekContent}`);
            break;
          }
        }
      }

      return context;
    },

    async getProgramContext(programVersionId: string): Promise<string | null> {
      const version = await repos.programVersion.findById(programVersionId);
      if (!version) return null;

      const sections: string[] = [];

      if (version.content) {
        sections.push(version.content);
      }

      const genCtx = version.generationConfig?.context;
      if (genCtx?.emphasis?.length) {
        sections.push(`### Emphasis Areas\n${genCtx.emphasis.map((e: string) => `- ${e}`).join('\n')}`);
      }
      if (genCtx?.constraints?.length) {
        sections.push(`### Program Constraints\n${genCtx.constraints.map((c: string) => `- ${c}`).join('\n')}`);
      }
      if (genCtx?.style) {
        sections.push(`### Style\n${genCtx.style}`);
      }

      const diff = version.difficultyMetadata;
      if (diff) {
        const meta: string[] = [];
        if (diff.minExperienceLevel) meta.push(`- Min experience: ${diff.minExperienceLevel}`);
        if (diff.intensityScore) meta.push(`- Intensity: ${diff.intensityScore}/10`);
        if (diff.requiredEquipment?.length) meta.push(`- Required equipment: ${diff.requiredEquipment.join(', ')}`);
        if (diff.weeklyHoursEstimate) meta.push(`- Weekly hours: ${diff.weeklyHoursEstimate}`);
        if (meta.length) sections.push(`### Difficulty & Requirements\n${meta.join('\n')}`);
      }

      if (version.defaultDurationWeeks) {
        sections.push(`### Duration\n${version.defaultDurationWeeks} weeks`);
      }

      if (sections.length === 0) return null;

      return `## Program Template\nThis user enrolled in a specific program. The plan MUST align with the program template below — use it as the primary guide for structure, emphasis, and constraints. Personalize to the user's profile within these boundaries.\n\n${sections.join('\n\n')}`;
    },
  };
}
