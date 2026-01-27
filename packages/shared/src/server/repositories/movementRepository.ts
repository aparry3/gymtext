/**
 * Movement Repository
 *
 * Data access layer for canonical movements.
 * Handles lookups for progress tracking groupings.
 */

import { BaseRepository } from '@/server/repositories/baseRepository';
import type { Movement } from '@/server/models/movement';

export class MovementRepository extends BaseRepository {
  /**
   * Find all movements
   */
  async findAll(): Promise<Movement[]> {
    return await this.db
      .selectFrom('movements')
      .selectAll()
      .orderBy('name', 'asc')
      .execute();
  }

  /**
   * Find movement by slug
   */
  async findBySlug(slug: string): Promise<Movement | undefined> {
    return await this.db
      .selectFrom('movements')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst();
  }

  /**
   * Find movement by ID
   */
  async findById(id: string): Promise<Movement | undefined> {
    return await this.db
      .selectFrom('movements')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }
}
