/**
 * Prompt Model
 *
 * Represents versioned prompts stored in the database.
 * Insert-only design enables version history and rollback.
 */
import type { Insertable, Selectable } from 'kysely';
import type { Prompts } from './_types';
export type Prompt = Selectable<Prompts>;
export type NewPrompt = Insertable<Prompts>;
export type PromptRole = 'system' | 'user' | 'context';
/**
 * A pair of system and user prompts for an agent
 */
export interface PromptPair {
    systemPrompt: string;
    userPrompt: string | null;
}
//# sourceMappingURL=prompt.d.ts.map