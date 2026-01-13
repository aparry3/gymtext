import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  ProgramModel,
  type Program,
  type NewProgram,
  type ProgramUpdate,
} from '@/server/models/program';

/**
 * Repository for program database operations
 */
export class ProgramRepository extends BaseRepository {
  /**
   * Create a new program
   */
  async create(data: NewProgram): Promise<Program> {
    const result = await this.db
      .insertInto('programs')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return ProgramModel.fromDB(result);
  }

  /**
   * Find a program by ID
   */
  async findById(id: string): Promise<Program | null> {
    const result = await this.db
      .selectFrom('programs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? ProgramModel.fromDB(result) : null;
  }

  /**
   * Find all programs for a given owner
   */
  async findByOwnerId(ownerId: string): Promise<Program[]> {
    const results = await this.db
      .selectFrom('programs')
      .selectAll()
      .where('ownerId', '=', ownerId)
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(ProgramModel.fromDB);
  }

  /**
   * Find the system AI program
   */
  async findAiProgram(): Promise<Program | null> {
    const result = await this.db
      .selectFrom('programs')
      .innerJoin('programOwners', 'programs.ownerId', 'programOwners.id')
      .selectAll('programs')
      .where('programOwners.ownerType', '=', 'ai')
      .where('programs.isActive', '=', true)
      .executeTakeFirst();

    return result ? ProgramModel.fromDB(result) : null;
  }

  /**
   * List all public programs
   */
  async listPublic(): Promise<Program[]> {
    const results = await this.db
      .selectFrom('programs')
      .selectAll()
      .where('isActive', '=', true)
      .where('isPublic', '=', true)
      .orderBy('name', 'asc')
      .execute();

    return results.map(ProgramModel.fromDB);
  }

  /**
   * List all active programs
   */
  async listActive(): Promise<Program[]> {
    const results = await this.db
      .selectFrom('programs')
      .selectAll()
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .execute();

    return results.map(ProgramModel.fromDB);
  }

  /**
   * List all programs (including inactive)
   */
  async listAll(): Promise<Program[]> {
    const results = await this.db
      .selectFrom('programs')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(ProgramModel.fromDB);
  }

  /**
   * Update a program
   */
  async update(id: string, data: ProgramUpdate): Promise<Program | null> {
    const result = await this.db
      .updateTable('programs')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? ProgramModel.fromDB(result) : null;
  }
}
