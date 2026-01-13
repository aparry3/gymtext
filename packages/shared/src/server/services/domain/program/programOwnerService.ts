import type { RepositoryContainer } from '../../../repositories/factory';
import type { ProgramOwner, NewProgramOwner, ProgramOwnerUpdate } from '../../../models/programOwner';

/**
 * Program Owner Service Instance Interface
 */
export interface ProgramOwnerServiceInstance {
  create(data: NewProgramOwner): Promise<ProgramOwner>;
  getById(id: string): Promise<ProgramOwner | null>;
  getByUserId(userId: string): Promise<ProgramOwner | null>;
  getAiOwner(): Promise<ProgramOwner>;
  listActive(): Promise<ProgramOwner[]>;
  listAll(): Promise<ProgramOwner[]>;
  update(id: string, data: ProgramOwnerUpdate): Promise<ProgramOwner | null>;
}

/**
 * Create a ProgramOwnerService instance
 */
export function createProgramOwnerService(
  repos: RepositoryContainer
): ProgramOwnerServiceInstance {
  // Cache the AI owner to avoid repeated lookups
  let cachedAiOwner: ProgramOwner | null = null;

  return {
    async create(data: NewProgramOwner): Promise<ProgramOwner> {
      return repos.programOwner.create(data);
    },

    async getById(id: string): Promise<ProgramOwner | null> {
      return repos.programOwner.findById(id);
    },

    async getByUserId(userId: string): Promise<ProgramOwner | null> {
      return repos.programOwner.findByUserId(userId);
    },

    async getAiOwner(): Promise<ProgramOwner> {
      if (cachedAiOwner) {
        return cachedAiOwner;
      }

      const owner = await repos.programOwner.findAiOwner();
      if (!owner) {
        throw new Error('GymText AI owner not found - run migrations');
      }

      cachedAiOwner = owner;
      return owner;
    },

    async listActive(): Promise<ProgramOwner[]> {
      return repos.programOwner.listActive();
    },

    async listAll(): Promise<ProgramOwner[]> {
      return repos.programOwner.listAll();
    },

    async update(id: string, data: ProgramOwnerUpdate): Promise<ProgramOwner | null> {
      // Invalidate cache if updating AI owner
      if (cachedAiOwner && cachedAiOwner.id === id) {
        cachedAiOwner = null;
      }
      return repos.programOwner.update(id, data);
    },
  };
}
