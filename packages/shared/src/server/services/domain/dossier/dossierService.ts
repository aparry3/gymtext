import type { RepositoryContainer } from '@/server/repositories/factory';
import type { Profile } from '@/server/repositories/profileRepository';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';

export interface DossierServiceInstance {
  getProfile(userId: string): Promise<string | null>;
  updateProfile(userId: string, content: string): Promise<Profile>;
  getPlan(userId: string): Promise<FitnessPlan | null>;
  createPlan(userId: string, content: string, startDate: Date): Promise<FitnessPlan>;
  getWeek(userId: string): Promise<Microcycle | null>;
  getWeekForDate(userId: string, date: Date): Promise<Microcycle | null>;
  createWeek(userId: string, planId: string, content: string, startDate: Date): Promise<Microcycle>;
}

export function createDossierService(repos: RepositoryContainer): DossierServiceInstance {
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

    async createWeek(userId: string, planId: string, content: string, startDate: Date): Promise<Microcycle> {
      return repos.microcycle.create(userId, planId, content, startDate);
    },
  };
}
