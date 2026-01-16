import type { RepositoryContainer } from '../../../repositories/factory';
import type {
  ProgramVersion,
  NewProgramVersion,
  ProgramVersionUpdate,
  ProgramVersionStatus,
  GenerationConfig,
} from '../../../models/programVersion';
import { AI_PROGRAM_VERSION_ID } from '../../../models/programVersion';
import type { PlanStructure } from '../../../models/fitnessPlan';

/**
 * Program Version Service Instance Interface
 *
 * Manages program versions - the "recipes" for generating user plans.
 * For AI programs, versions contain generation_config.
 * For coach programs, versions contain template content.
 */
export interface ProgramVersionServiceInstance {
  /**
   * Create a new draft version for a program
   */
  createDraft(programId: string, data?: Partial<NewProgramVersion>): Promise<ProgramVersion>;

  /**
   * Get a version by ID
   */
  getById(id: string): Promise<ProgramVersion | null>;

  /**
   * Get all versions for a program
   */
  getByProgramId(programId: string): Promise<ProgramVersion[]>;

  /**
   * Get the latest published version for a program
   */
  getLatestPublished(programId: string): Promise<ProgramVersion | null>;

  /**
   * Get the current draft version for a program
   */
  getDraft(programId: string): Promise<ProgramVersion | null>;

  /**
   * Get the AI program version (system default)
   */
  getAiVersion(): Promise<ProgramVersion>;

  /**
   * Update a version
   */
  update(id: string, data: ProgramVersionUpdate): Promise<ProgramVersion | null>;

  /**
   * Update version template content (for coach programs)
   */
  updateTemplate(
    id: string,
    data: {
      templateMarkdown?: string;
      templateStructured?: PlanStructure;
    }
  ): Promise<ProgramVersion | null>;

  /**
   * Update version generation config (for AI programs)
   */
  updateGenerationConfig(id: string, config: GenerationConfig): Promise<ProgramVersion | null>;

  /**
   * Publish a version (archives previous published version)
   */
  publish(id: string): Promise<ProgramVersion | null>;

  /**
   * Archive a version
   */
  archive(id: string): Promise<ProgramVersion | null>;

  /**
   * Delete a draft version
   */
  deleteDraft(id: string): Promise<boolean>;

  /**
   * Count versions for a program
   */
  countByProgramId(programId: string): Promise<number>;
}

/**
 * Create a ProgramVersionService instance
 */
export function createProgramVersionService(
  repos: RepositoryContainer
): ProgramVersionServiceInstance {
  // Cache the AI program version to avoid repeated lookups
  let cachedAiVersion: ProgramVersion | null = null;

  return {
    async createDraft(
      programId: string,
      data: Partial<NewProgramVersion> = {}
    ): Promise<ProgramVersion> {
      const nextVersionNumber = await repos.programVersion.getNextVersionNumber(programId);

      const versionData: NewProgramVersion = {
        programId,
        versionNumber: nextVersionNumber,
        status: 'draft',
        templateMarkdown: data.templateMarkdown ?? null,
        templateStructured: data.templateStructured ?? null,
        generationConfig: data.generationConfig ?? null,
        defaultDurationWeeks: data.defaultDurationWeeks ?? null,
        difficultyMetadata: data.difficultyMetadata ?? null,
      };

      return repos.programVersion.create(versionData);
    },

    async getById(id: string): Promise<ProgramVersion | null> {
      return repos.programVersion.findById(id);
    },

    async getByProgramId(programId: string): Promise<ProgramVersion[]> {
      return repos.programVersion.findByProgramId(programId);
    },

    async getLatestPublished(programId: string): Promise<ProgramVersion | null> {
      return repos.programVersion.findLatestPublished(programId);
    },

    async getDraft(programId: string): Promise<ProgramVersion | null> {
      return repos.programVersion.findDraft(programId);
    },

    async getAiVersion(): Promise<ProgramVersion> {
      if (cachedAiVersion) {
        return cachedAiVersion;
      }

      const version = await repos.programVersion.findById(AI_PROGRAM_VERSION_ID);
      if (!version) {
        throw new Error('AI program version not found - run migrations');
      }

      cachedAiVersion = version;
      return version;
    },

    async update(id: string, data: ProgramVersionUpdate): Promise<ProgramVersion | null> {
      // Invalidate cache if updating AI version
      if (id === AI_PROGRAM_VERSION_ID) {
        cachedAiVersion = null;
      }
      return repos.programVersion.update(id, data);
    },

    async updateTemplate(
      id: string,
      data: {
        templateMarkdown?: string;
        templateStructured?: PlanStructure;
      }
    ): Promise<ProgramVersion | null> {
      const updateData: ProgramVersionUpdate = {};

      if (data.templateMarkdown !== undefined) {
        updateData.templateMarkdown = data.templateMarkdown;
      }
      if (data.templateStructured !== undefined) {
        updateData.templateStructured = data.templateStructured as any;
      }

      return this.update(id, updateData);
    },

    async updateGenerationConfig(id: string, config: GenerationConfig): Promise<ProgramVersion | null> {
      return this.update(id, {
        generationConfig: config as any,
      });
    },

    async publish(id: string): Promise<ProgramVersion | null> {
      const published = await repos.programVersion.publishVersion(id);
      if (!published) return null;

      // Update the program's published_version_id
      await repos.program.update(published.programId, {
        publishedVersionId: id,
      });

      // Invalidate cache if publishing AI version
      if (id === AI_PROGRAM_VERSION_ID) {
        cachedAiVersion = null;
      }

      return published;
    },

    async archive(id: string): Promise<ProgramVersion | null> {
      // Invalidate cache if archiving AI version
      if (id === AI_PROGRAM_VERSION_ID) {
        cachedAiVersion = null;
      }
      return repos.programVersion.updateStatus(id, 'archived');
    },

    async deleteDraft(id: string): Promise<boolean> {
      return repos.programVersion.deleteDraft(id);
    },

    async countByProgramId(programId: string): Promise<number> {
      return repos.programVersion.countByProgramId(programId);
    },
  };
}
