import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  ProgramVersionModel,
  type ProgramVersion,
  type NewProgramVersion,
  type ProgramVersionUpdate,
  type ProgramVersionStatus,
} from '@/server/models/programVersion';

/**
 * Repository for program version database operations
 *
 * Program versions represent the "recipe" for generating user plans.
 * For AI programs, they contain generation_config for personalization.
 * For coach programs, they contain template content.
 */
export class ProgramVersionRepository extends BaseRepository {
  /**
   * Create a new program version
   */
  async create(data: NewProgramVersion): Promise<ProgramVersion> {
    // Stringify JSON fields for JSONB columns - Kysely doesn't auto-serialize
    const insertData = {
      ...data,
      templateStructured: data.templateStructured ? JSON.stringify(data.templateStructured) : null,
      generationConfig: data.generationConfig ? JSON.stringify(data.generationConfig) : null,
      difficultyMetadata: data.difficultyMetadata ? JSON.stringify(data.difficultyMetadata) : null,
      questions: data.questions ? JSON.stringify(data.questions) : null,
    };

    const result = await this.db
      .insertInto('programVersions')
      .values(insertData as typeof data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return ProgramVersionModel.fromDB(result);
  }

  /**
   * Find a program version by ID
   */
  async findById(id: string): Promise<ProgramVersion | null> {
    const result = await this.db
      .selectFrom('programVersions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? ProgramVersionModel.fromDB(result) : null;
  }

  /**
   * Find all versions for a program
   */
  async findByProgramId(programId: string): Promise<ProgramVersion[]> {
    const results = await this.db
      .selectFrom('programVersions')
      .selectAll()
      .where('programId', '=', programId)
      .orderBy('versionNumber', 'desc')
      .execute();

    return results.map(ProgramVersionModel.fromDB);
  }

  /**
   * Find the latest published version for a program
   */
  async findLatestPublished(programId: string): Promise<ProgramVersion | null> {
    const result = await this.db
      .selectFrom('programVersions')
      .selectAll()
      .where('programId', '=', programId)
      .where('status', '=', 'published')
      .orderBy('versionNumber', 'desc')
      .limit(1)
      .executeTakeFirst();

    return result ? ProgramVersionModel.fromDB(result) : null;
  }

  /**
   * Find the current draft version for a program (if any)
   */
  async findDraft(programId: string): Promise<ProgramVersion | null> {
    const result = await this.db
      .selectFrom('programVersions')
      .selectAll()
      .where('programId', '=', programId)
      .where('status', '=', 'draft')
      .orderBy('versionNumber', 'desc')
      .limit(1)
      .executeTakeFirst();

    return result ? ProgramVersionModel.fromDB(result) : null;
  }

  /**
   * Get the next version number for a program
   */
  async getNextVersionNumber(programId: string): Promise<number> {
    const result = await this.db
      .selectFrom('programVersions')
      .select((eb) => eb.fn.max('versionNumber').as('maxVersion'))
      .where('programId', '=', programId)
      .executeTakeFirst();

    const maxVersion = result?.maxVersion as number | null;
    return (maxVersion ?? 0) + 1;
  }

  /**
   * Update a program version
   */
  async update(id: string, data: ProgramVersionUpdate): Promise<ProgramVersion | null> {
    // Stringify JSON fields if they're being updated - Kysely doesn't auto-serialize
    const updateData = {
      ...data,
      ...(data.templateStructured !== undefined && {
        templateStructured: data.templateStructured ? JSON.stringify(data.templateStructured) : null,
      }),
      ...(data.generationConfig !== undefined && {
        generationConfig: data.generationConfig ? JSON.stringify(data.generationConfig) : null,
      }),
      ...(data.difficultyMetadata !== undefined && {
        difficultyMetadata: data.difficultyMetadata ? JSON.stringify(data.difficultyMetadata) : null,
      }),
      ...(data.questions !== undefined && {
        questions: data.questions ? JSON.stringify(data.questions) : null,
      }),
    };

    const result = await this.db
      .updateTable('programVersions')
      .set(updateData as typeof data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? ProgramVersionModel.fromDB(result) : null;
  }

  /**
   * Update version status
   */
  async updateStatus(id: string, status: ProgramVersionStatus): Promise<ProgramVersion | null> {
    const updates: ProgramVersionUpdate = { status };

    // Set timestamp fields based on status transition
    if (status === 'published') {
      updates.publishedAt = new Date();
    } else if (status === 'archived') {
      updates.archivedAt = new Date();
    }

    return this.update(id, updates);
  }

  /**
   * Publish a version and archive the previous published version
   */
  async publishVersion(id: string): Promise<ProgramVersion | null> {
    // Get the version to publish
    const version = await this.findById(id);
    if (!version) return null;

    // Archive any currently published versions for this program
    await this.db
      .updateTable('programVersions')
      .set({
        status: 'archived',
        archivedAt: new Date(),
      })
      .where('programId', '=', version.programId)
      .where('status', '=', 'published')
      .execute();

    // Publish the new version
    return this.updateStatus(id, 'published');
  }

  /**
   * Count versions by program
   */
  async countByProgramId(programId: string): Promise<number> {
    const result = await this.db
      .selectFrom('programVersions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('programId', '=', programId)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }

  /**
   * List all published versions across all programs
   */
  async listAllPublished(): Promise<ProgramVersion[]> {
    const results = await this.db
      .selectFrom('programVersions')
      .selectAll()
      .where('status', '=', 'published')
      .orderBy('publishedAt', 'desc')
      .execute();

    return results.map(ProgramVersionModel.fromDB);
  }

  /**
   * Delete a draft version (cannot delete published versions)
   */
  async deleteDraft(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('programVersions')
      .where('id', '=', id)
      .where('status', '=', 'draft')
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0) > 0;
  }
}
