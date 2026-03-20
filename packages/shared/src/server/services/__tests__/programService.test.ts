import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgramService } from '../domain/program/programService';
import type { ProgramServiceInstance } from '../domain/program/programService';

function makeProgram(overrides: Record<string, any> = {}) {
  return {
    id: 'prog-1',
    name: 'AI Personal Training',
    type: 'ai',
    ownerId: 'owner-1',
    isPublic: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    program: {
      create: vi.fn().mockResolvedValue(makeProgram()),
      findById: vi.fn().mockResolvedValue(makeProgram()),
      findByOwnerId: vi.fn().mockResolvedValue([makeProgram()]),
      findAiProgram: vi.fn().mockResolvedValue(makeProgram()),
      listPublic: vi.fn().mockResolvedValue([makeProgram()]),
      listActive: vi.fn().mockResolvedValue([makeProgram()]),
      listAll: vi.fn().mockResolvedValue([makeProgram(), makeProgram({ id: 'prog-2' })]),
      update: vi.fn().mockResolvedValue(makeProgram({ name: 'Updated' })),
    },
    programVersion: {
      create: vi.fn().mockResolvedValue({ id: 'pv-1', programId: 'prog-1', versionNumber: 1 }),
    },
  } as any;
}

describe('ProgramService', () => {
  let service: ProgramServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createProgramService(repos);
  });

  describe('create', () => {
    it('should create program and auto-create initial draft version', async () => {
      const result = await service.create({ name: 'Test', type: 'ai' } as any);

      expect(repos.program.create).toHaveBeenCalledWith({ name: 'Test', type: 'ai' });
      expect(repos.programVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: 'prog-1',
          versionNumber: 1,
          status: 'draft',
        })
      );
      expect(result.id).toBe('prog-1');
    });
  });

  describe('getById', () => {
    it('should return program when found', async () => {
      const result = await service.getById('prog-1');
      expect(result).toEqual(expect.objectContaining({ id: 'prog-1' }));
    });

    it('should return null when not found', async () => {
      repos.program.findById.mockResolvedValueOnce(null);
      const result = await service.getById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getByOwnerId', () => {
    it('should return programs for owner', async () => {
      const result = await service.getByOwnerId('owner-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getAiProgram', () => {
    it('should return AI program', async () => {
      const result = await service.getAiProgram();
      expect(result.id).toBe('prog-1');
    });

    it('should cache AI program on subsequent calls', async () => {
      await service.getAiProgram();
      await service.getAiProgram();
      expect(repos.program.findAiProgram).toHaveBeenCalledTimes(1);
    });

    it('should throw if AI program not found', async () => {
      repos.program.findAiProgram.mockResolvedValueOnce(null);
      await expect(service.getAiProgram()).rejects.toThrow('AI Personal Training program not found');
    });
  });

  describe('listPublic', () => {
    it('should return public programs', async () => {
      const result = await service.listPublic();
      expect(result).toHaveLength(1);
    });
  });

  describe('listActive', () => {
    it('should return active programs', async () => {
      const result = await service.listActive();
      expect(result).toHaveLength(1);
    });
  });

  describe('listAll', () => {
    it('should return all programs', async () => {
      const result = await service.listAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update program', async () => {
      const result = await service.update('prog-1', { name: 'Updated' } as any);
      expect(repos.program.update).toHaveBeenCalledWith('prog-1', { name: 'Updated' });
      expect(result!.name).toBe('Updated');
    });

    it('should invalidate AI program cache when updating cached program', async () => {
      // Cache the AI program first
      await service.getAiProgram();
      expect(repos.program.findAiProgram).toHaveBeenCalledTimes(1);

      // Update the cached program
      await service.update('prog-1', { name: 'New Name' } as any);

      // Next getAiProgram should re-fetch
      await service.getAiProgram();
      expect(repos.program.findAiProgram).toHaveBeenCalledTimes(2);
    });

    it('should not invalidate cache when updating different program', async () => {
      await service.getAiProgram();
      await service.update('prog-other', { name: 'X' } as any);
      await service.getAiProgram();
      // Cache still valid — only 1 call
      expect(repos.program.findAiProgram).toHaveBeenCalledTimes(1);
    });
  });
});
