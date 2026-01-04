import type { PromptPair } from '@/server/models/prompt';
/**
 * PromptService - Manages prompt retrieval with caching
 *
 * Features:
 * - TTL-based in-memory cache (5 minutes)
 * - Throws if prompt not found (all prompts must be seeded)
 * - Singleton pattern for consistent cache state
 */
export declare class PromptService {
    private static instance;
    private cache;
    private contextCache;
    private constructor();
    static getInstance(): PromptService;
    /**
     * Get prompts for an agent, using cache when available
     *
     * @throws Error if prompt not found (prompts must be seeded)
     */
    getPrompts(agentId: string): Promise<PromptPair>;
    /**
     * Get context prompt for an agent, using cache when available
     *
     * @returns The context prompt value, or null if not found
     */
    getContextPrompt(agentId: string): Promise<string | null>;
    /**
     * Invalidate cache for a specific agent (useful after updates)
     */
    invalidateCache(agentId: string): void;
    /**
     * Clear entire cache (useful for testing or force refresh)
     */
    clearCache(): void;
}
export declare const promptService: PromptService;
//# sourceMappingURL=promptService.d.ts.map