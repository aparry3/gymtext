import { BaseRepository } from './baseRepository';
import type { Selectable, Insertable } from 'kysely';
import type { Formatters } from '@/server/models/_types';

export type Formatter = Selectable<Formatters>;
export type NewFormatter = Insertable<Formatters>;

/**
 * FormatterRepository - Data access layer for shared prompt formatters
 *
 * Formatters are append-only versioned (like agent_definitions).
 * Each edit creates a new row; the latest version_id per formatter_id is the active version.
 */
export class FormatterRepository extends BaseRepository {
  /**
   * Get the latest active version of formatters by their IDs (batch fetch)
   */
  async getByIds(formatterIds: string[]): Promise<Formatter[]> {
    if (formatterIds.length === 0) return [];

    return this.db
      .selectFrom('formatters as f')
      .selectAll('f')
      .where('f.formatterId', 'in', formatterIds)
      .where('f.isActive', '=', true)
      .where(({ eb, selectFrom }) =>
        eb(
          'f.versionId',
          '=',
          selectFrom('formatters as inner')
            .select((eb) => eb.fn.max('inner.versionId').as('maxVersionId'))
            .where('inner.formatterId', '=', eb.ref('f.formatterId'))
        )
      )
      .execute();
  }

  /**
   * Get all formatters (latest active version of each)
   */
  async getAll(): Promise<Formatter[]> {
    return this.db
      .selectFrom('formatters as f')
      .selectAll('f')
      .where('f.isActive', '=', true)
      .where(({ eb, selectFrom }) =>
        eb(
          'f.versionId',
          '=',
          selectFrom('formatters as inner')
            .select((eb) => eb.fn.max('inner.versionId').as('maxVersionId'))
            .where('inner.formatterId', '=', eb.ref('f.formatterId'))
        )
      )
      .orderBy('f.formatterId', 'asc')
      .execute();
  }

  /**
   * Create a new formatter (first version)
   */
  async create(formatter: NewFormatter): Promise<Formatter> {
    return this.db
      .insertInto('formatters')
      .values(formatter)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Append a new version of a formatter (never mutate historical rows)
   */
  async appendVersion(formatterId: string, data: { content: string; description: string | null }): Promise<Formatter> {
    return this.db
      .insertInto('formatters')
      .values({
        formatterId,
        content: data.content,
        description: data.description,
        isActive: true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Soft-delete a formatter by appending an inactive version
   */
  async deactivate(formatterId: string): Promise<void> {
    // Get latest version to carry forward content
    const latest = await this.db
      .selectFrom('formatters')
      .selectAll()
      .where('formatterId', '=', formatterId)
      .orderBy('versionId', 'desc')
      .executeTakeFirst();

    if (!latest) return;

    await this.db
      .insertInto('formatters')
      .values({
        formatterId,
        content: latest.content,
        description: latest.description,
        isActive: false,
      })
      .execute();
  }

  /**
   * Upsert a formatter (for seeding - creates or appends new version)
   */
  async upsert(formatter: NewFormatter): Promise<Formatter> {
    return this.db
      .insertInto('formatters')
      .values(formatter)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
