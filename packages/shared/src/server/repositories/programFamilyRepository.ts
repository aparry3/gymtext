import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  ProgramFamilyModel,
  ProgramFamilyProgramModel,
  type ProgramFamily,
  type NewProgramFamily,
  type ProgramFamilyUpdate,
  type ProgramFamilyProgram,
  type NewProgramFamilyProgram,
  type FamilyType,
  type FamilyVisibility,
} from '@/server/models/programFamily';

/**
 * Repository for program family database operations
 *
 * Program families group related programs together for:
 * - Categories (e.g., "Strength", "Cardio")
 * - Coach collections
 * - Purchasable bundles
 * - Curated lists
 */
export class ProgramFamilyRepository extends BaseRepository {
  // =========================================================================
  // Family CRUD
  // =========================================================================

  /**
   * Create a new program family
   */
  async create(data: NewProgramFamily): Promise<ProgramFamily> {
    const result = await this.db
      .insertInto('programFamilies')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return ProgramFamilyModel.fromDB(result);
  }

  /**
   * Find a family by ID
   */
  async findById(id: string): Promise<ProgramFamily | null> {
    const result = await this.db
      .selectFrom('programFamilies')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? ProgramFamilyModel.fromDB(result) : null;
  }

  /**
   * Find a family by slug
   */
  async findBySlug(slug: string): Promise<ProgramFamily | null> {
    const result = await this.db
      .selectFrom('programFamilies')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    return result ? ProgramFamilyModel.fromDB(result) : null;
  }

  /**
   * Find all families for an owner
   */
  async findByOwnerId(ownerId: string): Promise<ProgramFamily[]> {
    const results = await this.db
      .selectFrom('programFamilies')
      .selectAll()
      .where('ownerId', '=', ownerId)
      .orderBy('name', 'asc')
      .execute();

    return results.map(ProgramFamilyModel.fromDB);
  }

  /**
   * Find all families by type
   */
  async findByType(familyType: FamilyType): Promise<ProgramFamily[]> {
    const results = await this.db
      .selectFrom('programFamilies')
      .selectAll()
      .where('familyType', '=', familyType)
      .orderBy('name', 'asc')
      .execute();

    return results.map(ProgramFamilyModel.fromDB);
  }

  /**
   * List all public families
   */
  async listPublic(): Promise<ProgramFamily[]> {
    const results = await this.db
      .selectFrom('programFamilies')
      .selectAll()
      .where('visibility', '=', 'public')
      .orderBy('name', 'asc')
      .execute();

    return results.map(ProgramFamilyModel.fromDB);
  }

  /**
   * Update a family
   */
  async update(id: string, data: ProgramFamilyUpdate): Promise<ProgramFamily | null> {
    const result = await this.db
      .updateTable('programFamilies')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? ProgramFamilyModel.fromDB(result) : null;
  }

  /**
   * Update family visibility
   */
  async updateVisibility(id: string, visibility: FamilyVisibility): Promise<ProgramFamily | null> {
    return this.update(id, { visibility });
  }

  /**
   * Delete a family
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('programFamilies')
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0) > 0;
  }

  // =========================================================================
  // Family-Program Links
  // =========================================================================

  /**
   * Add a program to a family
   */
  async addProgram(data: NewProgramFamilyProgram): Promise<ProgramFamilyProgram> {
    const result = await this.db
      .insertInto('programFamilyPrograms')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return ProgramFamilyProgramModel.fromDB(result);
  }

  /**
   * Remove a program from a family
   */
  async removeProgram(familyId: string, programId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('programFamilyPrograms')
      .where('familyId', '=', familyId)
      .where('programId', '=', programId)
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0) > 0;
  }

  /**
   * Get all programs in a family
   */
  async getProgramsInFamily(familyId: string): Promise<ProgramFamilyProgram[]> {
    const results = await this.db
      .selectFrom('programFamilyPrograms')
      .selectAll()
      .where('familyId', '=', familyId)
      .orderBy('sortOrder', 'asc')
      .execute();

    return results.map(ProgramFamilyProgramModel.fromDB);
  }

  /**
   * Get all families a program belongs to
   */
  async getFamiliesForProgram(programId: string): Promise<ProgramFamily[]> {
    const results = await this.db
      .selectFrom('programFamilies')
      .innerJoin('programFamilyPrograms', 'programFamilies.id', 'programFamilyPrograms.familyId')
      .selectAll('programFamilies')
      .where('programFamilyPrograms.programId', '=', programId)
      .execute();

    return results.map(ProgramFamilyModel.fromDB);
  }

  /**
   * Update program sort order within a family
   */
  async updateProgramSortOrder(
    familyId: string,
    programId: string,
    sortOrder: number
  ): Promise<ProgramFamilyProgram | null> {
    const result = await this.db
      .updateTable('programFamilyPrograms')
      .set({ sortOrder })
      .where('familyId', '=', familyId)
      .where('programId', '=', programId)
      .returningAll()
      .executeTakeFirst();

    return result ? ProgramFamilyProgramModel.fromDB(result) : null;
  }

  /**
   * Pin/unpin a program in a family
   */
  async setProgramPinned(
    familyId: string,
    programId: string,
    pinned: boolean
  ): Promise<ProgramFamilyProgram | null> {
    const result = await this.db
      .updateTable('programFamilyPrograms')
      .set({ pinned })
      .where('familyId', '=', familyId)
      .where('programId', '=', programId)
      .returningAll()
      .executeTakeFirst();

    return result ? ProgramFamilyProgramModel.fromDB(result) : null;
  }

  /**
   * Count programs in a family
   */
  async countProgramsInFamily(familyId: string): Promise<number> {
    const result = await this.db
      .selectFrom('programFamilyPrograms')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('familyId', '=', familyId)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }

  /**
   * Get the next sort order for a family
   */
  async getNextSortOrder(familyId: string): Promise<number> {
    const result = await this.db
      .selectFrom('programFamilyPrograms')
      .select((eb) => eb.fn.max('sortOrder').as('maxOrder'))
      .where('familyId', '=', familyId)
      .executeTakeFirst();

    const maxOrder = result?.maxOrder as number | null;
    return (maxOrder ?? -1) + 1;
  }
}
