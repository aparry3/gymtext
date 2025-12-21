import { BaseRepository } from './baseRepository';
import type { Prompt, NewPrompt, PromptRole, PromptPair } from '@/server/models/prompt';

/**
 * PromptRepository - Data access layer for agent prompts
 *
 * Insert-only design for versioning: each update creates a new row,
 * providing full audit trail and ability to revert.
 */
export class PromptRepository extends BaseRepository {
  /**
   * Get both system and user prompts for an agent (most recent of each)
   */
  async getPromptPair(id: string): Promise<PromptPair | null> {
    const prompts = await this.db
      .selectFrom('prompts')
      .where('id', '=', id)
      .orderBy('createdAt', 'desc')
      .selectAll()
      .execute();

    if (prompts.length === 0) return null;

    // Get the most recent of each role
    const system = prompts.find((p) => p.role === 'system');
    const user = prompts.find((p) => p.role === 'user');

    if (!system) return null;

    return {
      systemPrompt: system.value,
      userPrompt: user?.value ?? null,
    };
  }

  /**
   * Get the most recent system prompt for an agent
   */
  async getSystemPrompt(id: string): Promise<string | null> {
    const prompt = await this.db
      .selectFrom('prompts')
      .where('id', '=', id)
      .where('role', '=', 'system')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .select('value')
      .executeTakeFirst();

    return prompt?.value ?? null;
  }

  /**
   * Get the most recent user prompt for an agent (if exists)
   */
  async getUserPrompt(id: string): Promise<string | null> {
    const prompt = await this.db
      .selectFrom('prompts')
      .where('id', '=', id)
      .where('role', '=', 'user')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .select('value')
      .executeTakeFirst();

    return prompt?.value ?? null;
  }

  /**
   * Create a new prompt version (insert-only)
   */
  async createPrompt(newPrompt: NewPrompt): Promise<Prompt> {
    return this.db
      .insertInto('prompts')
      .values(newPrompt)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Bulk insert prompts (for seeding)
   */
  async createPrompts(prompts: NewPrompt[]): Promise<void> {
    if (prompts.length === 0) return;
    await this.db.insertInto('prompts').values(prompts).execute();
  }

  /**
   * Get prompt history for an agent and role
   */
  async getPromptHistory(
    id: string,
    role: PromptRole,
    limit: number = 10
  ): Promise<Prompt[]> {
    return this.db
      .selectFrom('prompts')
      .where('id', '=', id)
      .where('role', '=', role)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();
  }

  /**
   * Get all unique prompt IDs (for listing available agents)
   */
  async getAllPromptIds(): Promise<string[]> {
    const results = await this.db
      .selectFrom('prompts')
      .select('id')
      .distinct()
      .execute();

    return results.map((r) => r.id);
  }
}

export const promptRepository = new PromptRepository();
