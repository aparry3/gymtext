import { BaseRepository } from './baseRepository';
import type { ContextTemplate, NewContextTemplate } from '@/server/models/contextTemplate';

/**
 * ContextTemplateRepository - Data access for context provider templates
 *
 * Insert-only design for versioning: each update creates a new row.
 */
export class ContextTemplateRepository extends BaseRepository {
  /**
   * Get the latest template for a context type and variant
   */
  async getLatest(contextType: string, variant: string = 'default'): Promise<ContextTemplate | null> {
    const result = await this.db
      .selectFrom('contextTemplates')
      .where('contextType', '=', contextType)
      .where('variant', '=', variant)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    return result ?? null;
  }

  /**
   * Get version history for a context type and variant
   */
  async getHistory(contextType: string, variant: string = 'default', limit: number = 20): Promise<ContextTemplate[]> {
    return this.db
      .selectFrom('contextTemplates')
      .where('contextType', '=', contextType)
      .where('variant', '=', variant)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();
  }

  /**
   * Create a new template version (insert-only)
   */
  async create(template: NewContextTemplate): Promise<ContextTemplate> {
    return this.db
      .insertInto('contextTemplates')
      .values(template)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * List all distinct context type + variant combinations
   */
  async listDistinct(): Promise<Array<{ contextType: string; variant: string }>> {
    const results = await this.db
      .selectFrom('contextTemplates')
      .select(['contextType', 'variant'])
      .distinct()
      .orderBy('contextType')
      .execute();

    return results;
  }
}
