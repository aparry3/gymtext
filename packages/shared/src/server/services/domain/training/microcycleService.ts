import { Microcycle } from '@/server/models/microcycle';
import type { RepositoryContainer } from '../../../repositories/factory';

/**
 * MicrocycleServiceInstance interface
 *
 * Simplified CRUD and query operations for microcycles (dossier-based).
 */
export interface MicrocycleServiceInstance {
  getLatestMicrocycle(clientId: string): Promise<Microcycle | null>;
  getMicrocycleByDate(clientId: string, targetDate: Date): Promise<Microcycle | null>;
  getMicrocycleById(microcycleId: string): Promise<Microcycle | null>;
  getMicrocycleHistory(clientId: string, limit?: number): Promise<Microcycle[]>;
  createMicrocycle(clientId: string, planId: string, content: string, startDate: Date): Promise<Microcycle>;
}

/**
 * Create a MicrocycleService instance
 */
export function createMicrocycleService(
  repos: RepositoryContainer
): MicrocycleServiceInstance {
  return {
    async getLatestMicrocycle(clientId: string) {
      return await repos.microcycle.getLatest(clientId);
    },

    async getMicrocycleByDate(clientId: string, targetDate: Date): Promise<Microcycle | null> {
      return await repos.microcycle.getByDate(clientId, targetDate);
    },

    async getMicrocycleById(microcycleId: string): Promise<Microcycle | null> {
      return await repos.microcycle.getById(microcycleId);
    },

    async getMicrocycleHistory(clientId: string, limit: number = 10): Promise<Microcycle[]> {
      return await repos.microcycle.getHistory(clientId, limit);
    },

    async createMicrocycle(clientId: string, planId: string, content: string, startDate: Date): Promise<Microcycle> {
      return await repos.microcycle.create(clientId, planId, content, startDate);
    },
  };
}
