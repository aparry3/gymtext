import type { RepositoryContainer } from '../../../repositories/factory';
import type { Program, NewProgram, ProgramUpdate } from '../../../models/program';

/**
 * Program Service Instance Interface
 */
export interface ProgramServiceInstance {
  create(data: NewProgram): Promise<Program>;
  getById(id: string): Promise<Program | null>;
  getByOwnerId(ownerId: string): Promise<Program[]>;
  getAiProgram(): Promise<Program>;
  listPublic(): Promise<Program[]>;
  listActive(): Promise<Program[]>;
  listAll(): Promise<Program[]>;
  update(id: string, data: ProgramUpdate): Promise<Program | null>;
}

/**
 * Create a ProgramService instance
 */
export function createProgramService(
  repos: RepositoryContainer
): ProgramServiceInstance {
  // Cache the AI program to avoid repeated lookups
  let cachedAiProgram: Program | null = null;

  return {
    async create(data: NewProgram): Promise<Program> {
      const program = await repos.program.create(data);

      // Auto-create initial draft version so every program has at least one version
      await repos.programVersion.create({
        programId: program.id,
        versionNumber: 1,
        status: 'draft',
        templateMarkdown: null,
        templateStructured: null,
        generationConfig: null,
        defaultDurationWeeks: null,
        difficultyMetadata: null,
      });

      return program;
    },

    async getById(id: string): Promise<Program | null> {
      return repos.program.findById(id);
    },

    async getByOwnerId(ownerId: string): Promise<Program[]> {
      return repos.program.findByOwnerId(ownerId);
    },

    async getAiProgram(): Promise<Program> {
      if (cachedAiProgram) {
        return cachedAiProgram;
      }

      const program = await repos.program.findAiProgram();
      if (!program) {
        throw new Error('AI Personal Training program not found - run migrations');
      }

      cachedAiProgram = program;
      return program;
    },

    async listPublic(): Promise<Program[]> {
      return repos.program.listPublic();
    },

    async listActive(): Promise<Program[]> {
      return repos.program.listActive();
    },

    async listAll(): Promise<Program[]> {
      return repos.program.listAll();
    },

    async update(id: string, data: ProgramUpdate): Promise<Program | null> {
      // Invalidate cache if updating AI program
      if (cachedAiProgram && cachedAiProgram.id === id) {
        cachedAiProgram = null;
      }
      return repos.program.update(id, data);
    },
  };
}
