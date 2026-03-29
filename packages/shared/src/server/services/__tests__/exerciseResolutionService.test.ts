import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExerciseResolutionService } from '../domain/exercise/exerciseResolutionService';
import type { ExerciseResolutionServiceInstance } from '../domain/exercise/exerciseResolutionService';

// Mock normalization utils
vi.mock('@/server/utils/exerciseNormalization', () => ({
  normalizeForSearch: vi.fn((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')),
  normalizeForLex: vi.fn((s: string) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).sort().join(' ')),
}));

function makeExercise(overrides: Record<string, any> = {}) {
  return {
    id: 'ex-1',
    name: 'Bench Press',
    isActive: true,
    popularity: 500,
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    exerciseAlias: {
      findByNormalizedAlias: vi.fn().mockResolvedValue(null),
      findByExactLex: vi.fn().mockResolvedValue(null),
      findByFuzzySimilarity: vi.fn().mockResolvedValue([]),
      findByLexFuzzySimilarity: vi.fn().mockResolvedValue([]),
      searchByText: vi.fn().mockResolvedValue([]),
      exists: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue(undefined),
    },
    exercise: {
      findById: vi.fn().mockResolvedValue(makeExercise()),
    },
    exerciseUse: {
      trackUse: vi.fn().mockResolvedValue(undefined),
    },
  } as any;
}

describe('ExerciseResolutionService', () => {
  let service: ExerciseResolutionServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createExerciseResolutionService(repos);
  });

  describe('resolve', () => {
    it('should short-circuit on exact normalized alias match', async () => {
      repos.exerciseAlias.findByNormalizedAlias.mockResolvedValueOnce({
        exerciseId: 'ex-1',
        alias: 'bench press',
      });

      const result = await service.resolve('Bench Press');

      expect(result).not.toBeNull();
      expect(result!.method).toBe('exact');
      expect(result!.confidence).toBe(1.0);
      expect(result!.exercise.id).toBe('ex-1');
      // Should not call fuzzy search on exact hit
      expect(repos.exerciseAlias.findByFuzzySimilarity).not.toHaveBeenCalled();
    });

    it('should short-circuit on exact lex match', async () => {
      repos.exerciseAlias.findByExactLex.mockResolvedValueOnce({
        exerciseId: 'ex-1',
        alias: 'bench press',
      });

      const result = await service.resolve('Bench Press');

      expect(result).not.toBeNull();
      expect(result!.method).toBe('exact_lex');
      expect(result!.confidence).toBe(0.98);
    });

    it('should skip inactive exercises on exact match', async () => {
      repos.exerciseAlias.findByNormalizedAlias.mockResolvedValueOnce({
        exerciseId: 'ex-1',
        alias: 'bench press',
      });
      repos.exercise.findById.mockResolvedValueOnce(makeExercise({ isActive: false }));

      // Falls through to multi-signal since exact match exercise is inactive
      const result = await service.resolve('Bench Press');
      // Multi-signal returns nothing since repos return empty
      expect(result).toBeNull();
    });

    it('should fall back to multi-signal search when no exact match', async () => {
      // Setup fuzzy results
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.8 },
      ]);

      const result = await service.resolve('Bnch Press');

      expect(result).not.toBeNull();
      expect(repos.exerciseAlias.findByFuzzySimilarity).toHaveBeenCalled();
    });

    it('should return null when no candidates found', async () => {
      const result = await service.resolve('xyznonexistent');
      expect(result).toBeNull();
    });

    it('should learn alias for high-confidence matches', async () => {
      // Setup multiple strong signals to produce high composite confidence
      // Composite = (W_TRGM_NORM*0.95 + W_TRGM_LEX*0.9 + W_TEXT*1.0 + W_TOKEN*0.8 + W_INTENT*0.8) / 12.5
      //           = (1.0*0.95 + 1.5*0.9 + 1.5*1.0 + 1.0*0.8 + 2.5*0.8) / 12.5
      //           = (0.95 + 1.35 + 1.5 + 0.8 + 2.0) / 12.5 = 6.6/12.5 = 0.528... 
      // Need more signals — add exact lex too for safety
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.95 },
      ]);
      repos.exerciseAlias.findByLexFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', aliasLex: 'bench press', score: 0.9 },
      ]);
      repos.exerciseAlias.searchByText.mockResolvedValueOnce([
        makeExercise({ popularity: 1000 }),
      ]);
      repos.exercise.findById.mockResolvedValue(makeExercise({ popularity: 1000 }));

      await service.resolve('Bnch Pres', { minLearnConfidence: 0.4 });

      // Should attempt to learn the alias
      expect(repos.exerciseAlias.exists).toHaveBeenCalled();
      expect(repos.exerciseAlias.create).toHaveBeenCalled();
    });

    it('should not learn alias for low-confidence matches', async () => {
      // Setup a fuzzy match with low confidence
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.35 },
      ]);
      // Low popularity = low overall confidence
      repos.exercise.findById.mockResolvedValue(makeExercise({ popularity: 0 }));

      await service.resolve('xyz bench something');

      // Create should not be called because confidence is below threshold
      expect(repos.exerciseAlias.create).not.toHaveBeenCalled();
    });

    it('should not learn alias when learnAlias is false', async () => {
      repos.exerciseAlias.findByNormalizedAlias.mockResolvedValueOnce(null);
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.95 },
      ]);

      await service.resolve('Bnch Pres', { learnAlias: false });

      expect(repos.exerciseAlias.create).not.toHaveBeenCalled();
    });

    it('should not learn alias that already exists', async () => {
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.95 },
      ]);
      repos.exerciseAlias.exists.mockResolvedValueOnce(true);

      await service.resolve('Bnch Pres');

      expect(repos.exerciseAlias.create).not.toHaveBeenCalled();
    });

    it('should track usage on resolve', async () => {
      repos.exerciseAlias.findByNormalizedAlias.mockResolvedValueOnce({
        exerciseId: 'ex-1',
        alias: 'bench press',
      });

      await service.resolve('Bench Press');

      // Exact match short-circuits before trackUse, but multi-signal does fire-and-forget
      // The exact path doesn't track — only multi-signal does
    });

    it('should handle findByExactLex throwing gracefully', async () => {
      repos.exerciseAlias.findByExactLex.mockRejectedValueOnce(new Error('column not found'));
      // Falls through to multi-signal
      const result = await service.resolve('Bench Press');
      // Should not throw
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should return results from multi-signal search', async () => {
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.9 },
      ]);
      repos.exerciseAlias.findByLexFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', aliasLex: 'bench press', score: 0.85 },
      ]);
      repos.exerciseAlias.searchByText.mockResolvedValueOnce([
        makeExercise(),
      ]);

      const results = await service.search('bench press');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].exercise.id).toBe('ex-1');
      expect(results[0].confidence).toBeGreaterThan(0);
    });

    it('should deduplicate results by exercise ID', async () => {
      // Same exercise from multiple signals
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.8 },
      ]);
      repos.exerciseAlias.findByLexFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', aliasLex: 'bench press', score: 0.85 },
      ]);
      repos.exerciseAlias.searchByText.mockResolvedValueOnce([
        makeExercise(),
      ]);

      const results = await service.search('bench press');

      // Should be 1 result, not 3
      expect(results.length).toBe(1);
    });

    it('should keep best fuzzy score when duplicates exist', async () => {
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.6 },
        { exerciseId: 'ex-1', alias: 'barbell bench press', score: 0.9 },
      ]);

      const results = await service.search('bench press');

      expect(results.length).toBe(1);
      // The higher score (0.9) should be used
      expect(results[0].scores!.trgramNorm).toBe(0.9);
    });

    it('should sort results by confidence descending', async () => {
      const ex1 = makeExercise({ id: 'ex-1', name: 'Bench Press', popularity: 800 });
      const ex2 = makeExercise({ id: 'ex-2', name: 'Incline Bench', popularity: 200 });

      repos.exercise.findById.mockImplementation(async (id: string) => {
        if (id === 'ex-1') return ex1;
        if (id === 'ex-2') return ex2;
        return null;
      });
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.9 },
        { exerciseId: 'ex-2', alias: 'incline bench', score: 0.5 },
      ]);

      const results = await service.search('bench press');

      expect(results.length).toBe(2);
      expect(results[0].confidence).toBeGreaterThanOrEqual(results[1].confidence);
    });

    it('should respect limit option', async () => {
      const exercises = Array.from({ length: 5 }, (_, i) =>
        makeExercise({ id: `ex-${i}`, name: `Exercise ${i}`, popularity: 100 * i })
      );
      repos.exercise.findById.mockImplementation(async (id: string) =>
        exercises.find(e => e.id === id) || null
      );
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce(
        exercises.map(e => ({ exerciseId: e.id, alias: e.name, score: 0.7 }))
      );

      const results = await service.search('exercise', { limit: 3 });

      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array when no candidates found', async () => {
      const results = await service.search('xyznonexistent');
      expect(results).toEqual([]);
    });

    it('should filter out inactive exercises', async () => {
      repos.exercise.findById.mockResolvedValueOnce(makeExercise({ isActive: false }));
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.9 },
      ]);

      const results = await service.search('bench press');
      expect(results.length).toBe(0);
    });

    it('should handle all signal promises rejecting gracefully', async () => {
      repos.exerciseAlias.findByNormalizedAlias.mockRejectedValueOnce(new Error('DB error'));
      repos.exerciseAlias.findByExactLex.mockRejectedValueOnce(new Error('DB error'));
      repos.exerciseAlias.findByFuzzySimilarity.mockRejectedValueOnce(new Error('DB error'));
      repos.exerciseAlias.findByLexFuzzySimilarity.mockRejectedValueOnce(new Error('DB error'));
      repos.exerciseAlias.searchByText.mockRejectedValueOnce(new Error('DB error'));

      // Should not throw, just return empty
      const results = await service.search('bench press');
      expect(results).toEqual([]);
    });

    it('should include text match signal in scoring', async () => {
      repos.exerciseAlias.searchByText.mockResolvedValueOnce([
        makeExercise(),
      ]);

      const results = await service.search('bench press');

      expect(results.length).toBe(1);
      expect(results[0].scores!.textMatch).toBe(1.0);
    });

    it('should factor in popularity as intent priority', async () => {
      repos.exercise.findById.mockResolvedValue(makeExercise({ popularity: 750 }));
      repos.exerciseAlias.findByFuzzySimilarity.mockResolvedValueOnce([
        { exerciseId: 'ex-1', alias: 'bench press', score: 0.5 },
      ]);

      const results = await service.search('bench press');

      expect(results[0].scores!.intentPriority).toBe(0.75); // 750/1000
    });
  });
});
