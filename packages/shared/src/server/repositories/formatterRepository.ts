import { BaseRepository } from './baseRepository';
import type { Selectable, Insertable } from 'kysely';
import type { Formatters } from '@/server/models/_types';

export type Formatter = Selectable<Formatters>;
export type NewFormatter = Insertable<Formatters>;

/**
 * FormatterRepository - Data access layer for shared prompt formatters
 */
export class FormatterRepository extends BaseRepository {
  /**
   * Get formatters by their IDs (batch fetch)
   */
  async getByIds(formatterIds: string[]): Promise<Formatter[]> {
    if (formatterIds.length === 0) return [];

    return this.db
      .selectFrom('formatters')
      .where('formatterId', 'in', formatterIds)
      .selectAll()
      .execute();
  }

  /**
   * Create a new formatter
   */
  async create(formatter: NewFormatter): Promise<Formatter> {
    return this.db
      .insertInto('formatters')
      .values(formatter)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Upsert a formatter (create or update content)
   */
  async upsert(formatter: NewFormatter): Promise<Formatter> {
    return this.db
      .insertInto('formatters')
      .values(formatter)
      .onConflict((oc) =>
        oc.column('formatterId').doUpdateSet({
          content: formatter.content,
          description: formatter.description,
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
