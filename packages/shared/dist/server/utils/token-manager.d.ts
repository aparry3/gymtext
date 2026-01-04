import { BaseMessage } from '@langchain/core/messages';
import { TiktokenModel } from '@dqbd/tiktoken';
export declare class TokenManager {
    private modelName;
    constructor(modelName?: TiktokenModel);
    /**
     * Count tokens in a single message
     */
    countMessageTokens(message: BaseMessage): number;
    /**
     * Count tokens in an array of messages
     */
    countMessagesTokens(messages: BaseMessage[]): number;
    /**
     * Count tokens in a string
     */
    countStringTokens(text: string): number;
    /**
     * Estimate tokens based on character count
     * Rough approximation: 1 token ≈ 4 characters
     */
    private estimateTokens;
    /**
     * Truncate messages to fit within token limit
     */
    truncateMessagesToLimit(messages: BaseMessage[], maxCompletionTokens: number, options?: {
        preserveFirst?: number;
        preserveLast?: number;
    }): BaseMessage[];
    /**
     * Calculate remaining tokens after context
     */
    calculateRemainingTokens(contextTokens: number, modelLimit?: number, reserveForResponse?: number): number;
    /**
     * Get token usage statistics
     */
    getTokenUsageStats(messages: BaseMessage[]): {
        total: number;
        byType: Record<string, number>;
        average: number;
    };
}
//# sourceMappingURL=token-manager.d.ts.map