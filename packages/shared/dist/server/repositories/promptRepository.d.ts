import { BaseRepository } from './baseRepository';
import type { Prompt, NewPrompt, PromptRole, PromptPair } from '@/server/models/prompt';
/**
 * PromptRepository - Data access layer for agent prompts
 *
 * Insert-only design for versioning: each update creates a new row,
 * providing full audit trail and ability to revert.
 */
export declare class PromptRepository extends BaseRepository {
    /**
     * Get both system and user prompts for an agent (most recent of each)
     */
    getPromptPair(id: string): Promise<PromptPair | null>;
    /**
     * Get the most recent system prompt for an agent
     */
    getSystemPrompt(id: string): Promise<string | null>;
    /**
     * Get the most recent user prompt for an agent (if exists)
     */
    getUserPrompt(id: string): Promise<string | null>;
    /**
     * Get the most recent context prompt for an agent (if exists)
     */
    getContextPrompt(id: string): Promise<string | null>;
    /**
     * Create a new prompt version (insert-only)
     */
    createPrompt(newPrompt: NewPrompt): Promise<Prompt>;
    /**
     * Bulk insert prompts (for seeding)
     */
    createPrompts(prompts: NewPrompt[]): Promise<void>;
    /**
     * Get prompt history for an agent and role
     */
    getPromptHistory(id: string, role: PromptRole, limit?: number): Promise<Prompt[]>;
    /**
     * Get all unique prompt IDs (for listing available agents)
     */
    getAllPromptIds(): Promise<string[]>;
}
export declare const promptRepository: PromptRepository;
//# sourceMappingURL=promptRepository.d.ts.map