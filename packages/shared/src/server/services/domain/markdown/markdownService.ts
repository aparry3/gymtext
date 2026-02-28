import type { RepositoryContainer } from '@/server/repositories/factory';
import type { Profile } from '@/server/repositories/profileRepository';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';

export interface MarkdownServiceInstance {
  getProfile(userId: string): Promise<string | null>;
  updateProfile(userId: string, content: string, options?: { details?: Record<string, unknown> }): Promise<Profile>;
  updateProfileDetails(userId: string, details: Record<string, unknown>): Promise<void>;
  getPlan(userId: string): Promise<FitnessPlan | null>;
  createPlan(userId: string, content: string, startDate: Date, options?: { details?: Record<string, unknown> }): Promise<FitnessPlan>;
  getWeek(userId: string): Promise<Microcycle | null>;
  getWeekForDate(userId: string, date: Date): Promise<Microcycle | null>;
  createWeek(userId: string, planId: string, content: string, startDate: Date, options?: { message?: string; details?: Record<string, unknown> }): Promise<Microcycle>;
}

export function createMarkdownService(repos: RepositoryContainer): MarkdownServiceInstance {
  return {
    async getProfile(userId: string): Promise<string | null> {
      return repos.profile.getCurrentProfileText(userId);
    },

    async updateProfile(userId: string, content: string, options?: { details?: Record<string, unknown> }): Promise<Profile> {
      return repos.profile.createProfileForUser(userId, content, options);
    },

    async updateProfileDetails(userId: string, details: Record<string, unknown>): Promise<void> {
      return repos.profile.updateProfileDetails(userId, details);
    },

    async getPlan(userId: string): Promise<FitnessPlan | null> {
      return repos.fitnessPlan.getLatest(userId);
    },

    async createPlan(userId: string, content: string, startDate: Date, options?: { details?: Record<string, unknown> }): Promise<FitnessPlan> {
      return repos.fitnessPlan.create(userId, content, startDate, undefined, options);
    },

    async getWeek(userId: string): Promise<Microcycle | null> {
      return repos.microcycle.getLatest(userId);
    },

    async getWeekForDate(userId: string, date: Date): Promise<Microcycle | null> {
      return repos.microcycle.getByDate(userId, date);
    },

    async createWeek(userId: string, planId: string, content: string, startDate: Date, options?: { message?: string; details?: Record<string, unknown> }): Promise<Microcycle> {
      return repos.microcycle.create(userId, planId, content, startDate, options);
    },
  };
}
