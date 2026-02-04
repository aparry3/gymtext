import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  ProgramOwnerModel,
  type ProgramOwner,
  type NewProgramOwner,
  type ProgramOwnerUpdate,
} from '@/server/models/programOwner';

/**
 * Repository for program owner database operations
 */
export class ProgramOwnerRepository extends BaseRepository {
  /**
   * Create a new program owner
   */
  async create(data: NewProgramOwner): Promise<ProgramOwner> {
    const result = await this.db
      .insertInto('programOwners')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return ProgramOwnerModel.fromDB(result);
  }

  /**
   * Find a program owner by ID
   */
  async findById(id: string): Promise<ProgramOwner | null> {
    const result = await this.db
      .selectFrom('programOwners')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? ProgramOwnerModel.fromDB(result) : null;
  }

  /**
   * Find a program owner by their linked user ID
   */
  async findByUserId(userId: string): Promise<ProgramOwner | null> {
    const result = await this.db
      .selectFrom('programOwners')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst();

    return result ? ProgramOwnerModel.fromDB(result) : null;
  }

  /**
   * Find a program owner by their phone number
   */
  async findByPhone(phone: string): Promise<ProgramOwner | null> {
    const result = await this.db
      .selectFrom('programOwners')
      .selectAll()
      .where('phone', '=', phone)
      .executeTakeFirst();

    return result ? ProgramOwnerModel.fromDB(result) : null;
  }

  /**
   * Find a program owner by their slug (for public landing pages)
   */
  async findBySlug(slug: string): Promise<ProgramOwner | null> {
    const result = await this.db
      .selectFrom('programOwners')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();

    return result ? ProgramOwnerModel.fromDB(result) : null;
  }

  /**
   * Find the system AI owner
   */
  async findAiOwner(): Promise<ProgramOwner | null> {
    const result = await this.db
      .selectFrom('programOwners')
      .selectAll()
      .where('ownerType', '=', 'ai')
      .executeTakeFirst();

    return result ? ProgramOwnerModel.fromDB(result) : null;
  }

  /**
   * List all active program owners
   */
  async listActive(): Promise<ProgramOwner[]> {
    const results = await this.db
      .selectFrom('programOwners')
      .selectAll()
      .where('isActive', '=', true)
      .orderBy('displayName', 'asc')
      .execute();

    return results.map(ProgramOwnerModel.fromDB);
  }

  /**
   * List all program owners (including inactive)
   */
  async listAll(): Promise<ProgramOwner[]> {
    const results = await this.db
      .selectFrom('programOwners')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(ProgramOwnerModel.fromDB);
  }

  /**
   * Update a program owner
   */
  async update(id: string, data: ProgramOwnerUpdate): Promise<ProgramOwner | null> {
    const result = await this.db
      .updateTable('programOwners')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? ProgramOwnerModel.fromDB(result) : null;
  }
}
