import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgramOwnerService } from '../domain/program/programOwnerService';
import type { ProgramOwnerServiceInstance } from '../domain/program/programOwnerService';

function makeOwner(overrides: Record<string, any> = {}) {
  return {
    id: 'owner-1',
    userId: 'user-1',
    displayName: 'Test Owner',
    slug: 'test-owner',
    isActive: true,
    isAi: false,
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    programOwner: {
      create: vi.fn().mockResolvedValue(makeOwner()),
      findById: vi.fn().mockResolvedValue(makeOwner()),
      findByUserId: vi.fn().mockResolvedValue(makeOwner()),
      findBySlug: vi.fn().mockResolvedValue(makeOwner()),
      findAiOwner: vi.fn().mockResolvedValue(makeOwner({ id: 'ai-owner', isAi: true, displayName: 'GymText AI' })),
      listActive: vi.fn().mockResolvedValue([makeOwner()]),
      listAll: vi.fn().mockResolvedValue([makeOwner(), makeOwner({ id: 'owner-2', isActive: false })]),
      update: vi.fn().mockResolvedValue(makeOwner({ displayName: 'Updated' })),
    },
  } as any;
}

describe('ProgramOwnerService', () => {
  let service: ProgramOwnerServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createProgramOwnerService(repos);
  });

  describe('create', () => {
    it('should create a program owner', async () => {
      const data = { userId: 'user-1', displayName: 'New Owner', slug: 'new-owner' };
      const result = await service.create(data as any);
      expect(repos.programOwner.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(expect.objectContaining({ id: 'owner-1' }));
    });
  });

  describe('getById', () => {
    it('should return owner when found', async () => {
      const result = await service.getById('owner-1');
      expect(result).toEqual(expect.objectContaining({ id: 'owner-1' }));
    });

    it('should return null when not found', async () => {
      repos.programOwner.findById.mockResolvedValueOnce(null);
      const result = await service.getById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('should return owner for user', async () => {
      const result = await service.getByUserId('user-1');
      expect(repos.programOwner.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).not.toBeNull();
    });
  });

  describe('getBySlug', () => {
    it('should return owner by slug', async () => {
      const result = await service.getBySlug('test-owner');
      expect(repos.programOwner.findBySlug).toHaveBeenCalledWith('test-owner');
      expect(result).not.toBeNull();
    });
  });

  describe('getAiOwner', () => {
    it('should return AI owner', async () => {
      const result = await service.getAiOwner();
      expect(result).toEqual(expect.objectContaining({ isAi: true }));
    });

    it('should cache AI owner on subsequent calls', async () => {
      await service.getAiOwner();
      await service.getAiOwner();
      expect(repos.programOwner.findAiOwner).toHaveBeenCalledTimes(1);
    });

    it('should throw if AI owner not found', async () => {
      repos.programOwner.findAiOwner.mockResolvedValueOnce(null);
      await expect(service.getAiOwner()).rejects.toThrow('GymText AI owner not found');
    });
  });

  describe('listActive', () => {
    it('should return active owners', async () => {
      const result = await service.listActive();
      expect(result).toHaveLength(1);
    });
  });

  describe('listAll', () => {
    it('should return all owners', async () => {
      const result = await service.listAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update owner', async () => {
      const result = await service.update('owner-1', { displayName: 'Updated' } as any);
      expect(repos.programOwner.update).toHaveBeenCalledWith('owner-1', { displayName: 'Updated' });
      expect(result).toEqual(expect.objectContaining({ displayName: 'Updated' }));
    });

    it('should invalidate AI owner cache when updating cached AI owner', async () => {
      // First cache the AI owner
      const aiOwner = await service.getAiOwner();
      expect(repos.programOwner.findAiOwner).toHaveBeenCalledTimes(1);

      // Update the AI owner (same id)
      await service.update(aiOwner.id, { displayName: 'New AI Name' } as any);

      // Next getAiOwner should hit DB again
      await service.getAiOwner();
      expect(repos.programOwner.findAiOwner).toHaveBeenCalledTimes(2);
    });

    it('should not invalidate cache when updating non-AI owner', async () => {
      // Cache AI owner
      await service.getAiOwner();
      expect(repos.programOwner.findAiOwner).toHaveBeenCalledTimes(1);

      // Update a different owner
      await service.update('other-owner', { displayName: 'Other' } as any);

      // Cache should still be valid
      await service.getAiOwner();
      expect(repos.programOwner.findAiOwner).toHaveBeenCalledTimes(1);
    });
  });
});
