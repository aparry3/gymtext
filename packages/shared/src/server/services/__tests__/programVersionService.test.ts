import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgramVersionService } from '../domain/program/programVersionService';
import type { ProgramVersionServiceInstance } from '../domain/program/programVersionService';

const AI_VERSION_ID = '00000000-0000-0000-0000-000000000003';

function makeVersion(overrides: Record<string, any> = {}) {
  return {
    id: 'ver-1',
    programId: 'prog-1',
    versionNumber: 1,
    status: 'draft',
    templateMarkdown: null,
    templateStructured: null,
    generationConfig: null,
    defaultDurationWeeks: null,
    difficultyMetadata: null,
    questions: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    programVersion: {
      getNextVersionNumber: vi.fn().mockResolvedValue(2),
      create: vi.fn().mockResolvedValue(makeVersion({ versionNumber: 2 })),
      findById: vi.fn().mockResolvedValue(makeVersion()),
      findByProgramId: vi.fn().mockResolvedValue([makeVersion()]),
      findLatestPublished: vi.fn().mockResolvedValue(makeVersion({ status: 'published' })),
      findDraft: vi.fn().mockResolvedValue(makeVersion({ status: 'draft' })),
      update: vi.fn().mockResolvedValue(makeVersion()),
      publishVersion: vi.fn().mockResolvedValue(makeVersion({ status: 'published' })),
      updateStatus: vi.fn().mockResolvedValue(makeVersion({ status: 'archived' })),
      deleteDraft: vi.fn().mockResolvedValue(true),
      countByProgramId: vi.fn().mockResolvedValue(3),
    },
    program: {
      update: vi.fn().mockResolvedValue({}),
    },
  } as any;
}

describe('ProgramVersionService', () => {
  let service: ProgramVersionServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createProgramVersionService(repos);
  });

  describe('createDraft', () => {
    it('should create a draft with next version number', async () => {
      const result = await service.createDraft('prog-1');

      expect(repos.programVersion.getNextVersionNumber).toHaveBeenCalledWith('prog-1');
      expect(repos.programVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          programId: 'prog-1',
          versionNumber: 2,
          status: 'draft',
        })
      );
      expect(result.versionNumber).toBe(2);
    });

    it('should accept optional data fields', async () => {
      await service.createDraft('prog-1', {
        templateMarkdown: '# Workout Plan',
        defaultDurationWeeks: 12,
      });

      expect(repos.programVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          templateMarkdown: '# Workout Plan',
          defaultDurationWeeks: 12,
        })
      );
    });

    it('should default optional fields to null', async () => {
      await service.createDraft('prog-1');

      expect(repos.programVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          templateMarkdown: null,
          templateStructured: null,
          generationConfig: null,
          defaultDurationWeeks: null,
          difficultyMetadata: null,
          questions: null,
        })
      );
    });
  });

  describe('getById', () => {
    it('should return version when found', async () => {
      const result = await service.getById('ver-1');
      expect(result).toEqual(expect.objectContaining({ id: 'ver-1' }));
    });

    it('should return null when not found', async () => {
      repos.programVersion.findById.mockResolvedValueOnce(null);
      const result = await service.getById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getByProgramId', () => {
    it('should return versions for program', async () => {
      const result = await service.getByProgramId('prog-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getLatestPublished', () => {
    it('should return latest published version', async () => {
      const result = await service.getLatestPublished('prog-1');
      expect(result).toEqual(expect.objectContaining({ status: 'published' }));
    });

    it('should return null when no published version', async () => {
      repos.programVersion.findLatestPublished.mockResolvedValueOnce(null);
      expect(await service.getLatestPublished('prog-1')).toBeNull();
    });
  });

  describe('getDraft', () => {
    it('should return draft version', async () => {
      const result = await service.getDraft('prog-1');
      expect(result).toEqual(expect.objectContaining({ status: 'draft' }));
    });
  });

  describe('getAiVersion', () => {
    it('should return AI version', async () => {
      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      const result = await service.getAiVersion();
      expect(result).toEqual(expect.objectContaining({ id: AI_VERSION_ID }));
    });

    it('should cache AI version on subsequent calls', async () => {
      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      await service.getAiVersion();
      await service.getAiVersion();
      // Only called once due to caching
      expect(repos.programVersion.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw if AI version not found', async () => {
      repos.programVersion.findById.mockResolvedValueOnce(null);
      await expect(service.getAiVersion()).rejects.toThrow('AI program version not found');
    });
  });

  describe('update', () => {
    it('should delegate to repository', async () => {
      await service.update('ver-1', { templateMarkdown: 'updated' });
      expect(repos.programVersion.update).toHaveBeenCalledWith('ver-1', { templateMarkdown: 'updated' });
    });

    it('should invalidate cache when updating AI version', async () => {
      // Prime the cache
      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      await service.getAiVersion();
      expect(repos.programVersion.findById).toHaveBeenCalledTimes(1);

      // Update AI version — should invalidate cache
      await service.update(AI_VERSION_ID, { templateMarkdown: 'new' });

      // Next getAiVersion should re-fetch (cache was invalidated)
      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      await service.getAiVersion();
      expect(repos.programVersion.findById).toHaveBeenCalledTimes(2); // initial + re-fetch
    });
  });

  describe('updateTemplate', () => {
    it('should update template markdown', async () => {
      await service.updateTemplate('ver-1', { templateMarkdown: '# Plan' });
      expect(repos.programVersion.update).toHaveBeenCalledWith('ver-1', expect.objectContaining({ templateMarkdown: '# Plan' }));
    });

    it('should update template structured', async () => {
      const structure = { weeks: 4, days: ['Mon', 'Wed', 'Fri'] };
      await service.updateTemplate('ver-1', { templateStructured: structure as any });
      expect(repos.programVersion.update).toHaveBeenCalledWith('ver-1', expect.objectContaining({ templateStructured: structure }));
    });

    it('should not include undefined fields', async () => {
      await service.updateTemplate('ver-1', { templateMarkdown: 'test' });
      const call = repos.programVersion.update.mock.calls[0][1];
      expect(call).not.toHaveProperty('templateStructured');
    });
  });

  describe('updateGenerationConfig', () => {
    it('should update generation config via update', async () => {
      const config = { model: 'gpt-4', temperature: 0.7 };
      await service.updateGenerationConfig('ver-1', config as any);
      expect(repos.programVersion.update).toHaveBeenCalledWith('ver-1', { generationConfig: config });
    });
  });

  describe('publish', () => {
    it('should publish version and update program', async () => {
      const published = makeVersion({ id: 'ver-1', programId: 'prog-1', status: 'published' });
      repos.programVersion.publishVersion.mockResolvedValueOnce(published);

      const result = await service.publish('ver-1');

      expect(repos.programVersion.publishVersion).toHaveBeenCalledWith('ver-1');
      expect(repos.program.update).toHaveBeenCalledWith('prog-1', { publishedVersionId: 'ver-1' });
      expect(result!.status).toBe('published');
    });

    it('should return null if publish fails', async () => {
      repos.programVersion.publishVersion.mockResolvedValueOnce(null);
      const result = await service.publish('ver-1');
      expect(result).toBeNull();
      expect(repos.program.update).not.toHaveBeenCalled();
    });

    it('should invalidate cache when publishing AI version', async () => {
      const published = makeVersion({ id: AI_VERSION_ID, programId: 'prog-1', status: 'published' });
      repos.programVersion.publishVersion.mockResolvedValueOnce(published);

      // Prime cache
      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      await service.getAiVersion();
      expect(repos.programVersion.findById).toHaveBeenCalledTimes(1);

      await service.publish(AI_VERSION_ID);

      // Cache should be cleared — next call re-fetches
      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      await service.getAiVersion();
      expect(repos.programVersion.findById).toHaveBeenCalledTimes(2);
    });
  });

  describe('archive', () => {
    it('should archive version', async () => {
      const result = await service.archive('ver-1');
      expect(repos.programVersion.updateStatus).toHaveBeenCalledWith('ver-1', 'archived');
      expect(result).toEqual(expect.objectContaining({ status: 'archived' }));
    });

    it('should invalidate cache when archiving AI version', async () => {
      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      await service.getAiVersion();
      expect(repos.programVersion.findById).toHaveBeenCalledTimes(1);

      await service.archive(AI_VERSION_ID);

      repos.programVersion.findById.mockResolvedValueOnce(makeVersion({ id: AI_VERSION_ID }));
      await service.getAiVersion();
      expect(repos.programVersion.findById).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteDraft', () => {
    it('should delete draft and return true', async () => {
      const result = await service.deleteDraft('ver-1');
      expect(result).toBe(true);
    });

    it('should return false if draft not found', async () => {
      repos.programVersion.deleteDraft.mockResolvedValueOnce(false);
      const result = await service.deleteDraft('unknown');
      expect(result).toBe(false);
    });
  });

  describe('countByProgramId', () => {
    it('should return count', async () => {
      const count = await service.countByProgramId('prog-1');
      expect(count).toBe(3);
    });
  });
});
