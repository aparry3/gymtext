import { encoding_for_model } from '@dqbd/tiktoken';
export class TokenManager {
    modelName;
    constructor(modelName = 'gpt-3.5-turbo') {
        // Using gpt-3.5-turbo as proxy for token counting
        // Gemini models don't have exact tiktoken support
        this.modelName = modelName;
    }
    /**
     * Count tokens in a single message
     */
    countMessageTokens(message) {
        try {
            const encoder = encoding_for_model(this.modelName);
            const content = message.content.toString();
            const roleTokens = 4; // Approximate tokens for message metadata
            const tokens = encoder.encode(content);
            encoder.free();
            return tokens.length + roleTokens;
        }
        catch {
            // Fallback to character-based estimation
            return this.estimateTokens(message.content.toString());
        }
    }
    /**
     * Count tokens in an array of messages
     */
    countMessagesTokens(messages) {
        return messages.reduce((total, msg) => total + this.countMessageTokens(msg), 0);
    }
    /**
     * Count tokens in a string
     */
    countStringTokens(text) {
        try {
            const encoder = encoding_for_model(this.modelName);
            const tokens = encoder.encode(text);
            encoder.free();
            return tokens.length;
        }
        catch {
            return this.estimateTokens(text);
        }
    }
    /**
     * Estimate tokens based on character count
     * Rough approximation: 1 token ≈ 4 characters
     */
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    /**
     * Truncate messages to fit within token limit
     */
    truncateMessagesToLimit(messages, maxCompletionTokens, options = {}) {
        const { preserveFirst = 1, preserveLast = 1 } = options;
        // If all messages fit, return them all
        const totalTokens = this.countMessagesTokens(messages);
        if (totalTokens <= maxCompletionTokens) {
            return messages;
        }
        // Preserve first N and last N messages
        const preserved = [];
        const removable = [];
        messages.forEach((msg, index) => {
            if (index < preserveFirst || index >= messages.length - preserveLast) {
                preserved.push(msg);
            }
            else {
                removable.push(msg);
            }
        });
        // Calculate tokens for preserved messages
        let currentTokens = this.countMessagesTokens(preserved);
        // Add removable messages from newest to oldest until we exceed limit
        const result = [...preserved.slice(0, preserveFirst)];
        for (let i = removable.length - 1; i >= 0; i--) {
            const msgTokens = this.countMessageTokens(removable[i]);
            if (currentTokens + msgTokens <= maxCompletionTokens) {
                result.push(removable[i]);
                currentTokens += msgTokens;
            }
        }
        // Add the last preserved messages
        result.push(...preserved.slice(preserveFirst));
        // Sort by original order
        return result.sort((a, b) => {
            const indexA = messages.findIndex(m => m === a);
            const indexB = messages.findIndex(m => m === b);
            return indexA - indexB;
        });
    }
    /**
     * Calculate remaining tokens after context
     */
    calculateRemainingTokens(contextTokens, modelLimit = 4096, reserveForResponse = 1500) {
        return Math.max(0, modelLimit - contextTokens - reserveForResponse);
    }
    /**
     * Get token usage statistics
     */
    getTokenUsageStats(messages) {
        const byType = {};
        let total = 0;
        messages.forEach(msg => {
            const tokens = this.countMessageTokens(msg);
            total += tokens;
            const type = msg._getType();
            byType[type] = (byType[type] || 0) + tokens;
        });
        return {
            total,
            byType,
            average: messages.length > 0 ? Math.round(total / messages.length) : 0,
        };
    }
}
