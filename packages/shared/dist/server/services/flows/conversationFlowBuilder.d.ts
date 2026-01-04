import { Message } from '@/server/models/conversation';
/**
 * ConversationFlowBuilder
 *
 * Lightweight utility for building natural message flows with context awareness.
 * Used for ephemeral orchestration of multi-message sequences (not persisted to DB).
 *
 * ## Purpose
 *
 * Track messages BEING SENT within a single orchestrated flow to provide context
 * to subsequent agents. This prevents repetitive greetings and creates natural
 * conversational flows.
 *
 * ## When to Use
 *
 * **Use ConversationFlowBuilder when:**
 * - Orchestrating multiple messages in a single flow (e.g., onboarding)
 * - Each message in the sequence needs context from previous messages in THAT flow
 * - You want agents to avoid repeating greetings/names
 *
 * **DO NOT use ConversationFlowBuilder when:**
 * - Responding to a single user message (use ConversationService.getRecentMessages())
 * - Retrieving historical conversation data (use ConversationService)
 * - Persisting messages to database (use ConversationService)
 *
 * ## Architecture Pattern
 *
 * **ConversationService** = Persistent storage (Database)
 * - Store/retrieve messages from DB
 * - Get conversation history
 * - Source of truth for past conversations
 * - Example: `conversationService.getRecentMessages(userId, 10)`
 *
 * **ConversationFlowBuilder** = Ephemeral flow tracking (In-Memory)
 * - Track messages being sent RIGHT NOW in an orchestration
 * - Provide context to agents in the same flow
 * - Formatting utilities for LangChain/prompts
 * - Example: `flow.addMessage(msg); flow.getRecentMessages()`
 *
 * ## Pattern A: Single Message (Use ConversationService)
 *
 * ```typescript
 * // User sends a message, you respond once
 * const previousMessages = await conversationService.getRecentMessages(userId, 10);
 * const response = await chatAgent(user, message, previousMessages);
 * ```
 *
 * ## Pattern B: Multi-Message Flow (Use ConversationFlowBuilder)
 *
 * ```typescript
 * // Orchestrating multiple messages in sequence
 * const flow = new ConversationFlowBuilder();
 *
 * const welcome = await messageService.sendWelcomeMessage(user);
 * flow.addMessage(welcome);
 *
 * const planMessages = await messageService.sendPlanSummary(user, plan, flow.getRecentMessages());
 * flow.addMessage(planMessages);
 *
 * const workout = await dailyMessageService.sendDailyMessage(user, flow.getRecentMessages());
 * // Now agents see previous messages in THIS flow, creating natural conversation
 * ```
 *
 * @example
 * ```typescript
 * // Onboarding flow - multiple messages in sequence
 * const flow = new ConversationFlowBuilder();
 *
 * // 1. Welcome message (first message, no context)
 * const welcome = await messageService.sendWelcomeMessage(user);
 * flow.addMessage(welcome);
 *
 * // 2. Plan summary (has context from welcome, won't repeat greeting)
 * const planMessages = await messageService.sendPlanSummary(
 *   user,
 *   plan,
 *   flow.getRecentMessages()
 * );
 * flow.addMessage(planMessages);
 *
 * // 3. First workout (has context from welcome + plan, natural continuation)
 * await dailyMessageService.sendDailyMessage(user, flow.getRecentMessages());
 * ```
 */
export declare class ConversationFlowBuilder {
    private messages;
    /**
     * Convert Message array to LangChain message format (static utility)
     *
     * Use this when you need to convert Message objects to the format expected
     * by LangChain/OpenAI APIs. This is the single source of truth for message formatting.
     *
     * @param messages - Array of Message objects to convert
     * @returns Array formatted for LangChain with proper roles (user/assistant)
     *
     * @example
     * ```typescript
     * // In an agent:
     * const messages = [
     *   { role: 'system', content: systemPrompt },
     *   ...ConversationFlowBuilder.toMessageArray(previousMessages),
     *   { role: 'user', content: currentMessage }
     * ];
     * ```
     */
    static toMessageArray(messages: Message[]): Array<{
        role: string;
        content: string;
    }>;
    /**
     * Filter messages to get proper context for chat agents
     *
     * When processing a new inbound message, the database may contain:
     * - Case 1: [..., user_message] - Last is the current inbound message being processed (duplicate)
     * - Case 2: [..., reply_agent_message] - Last is the reply agent's acknowledgment (needed for context)
     *
     * This method intelligently filters to avoid duplicates while preserving reply agent context.
     *
     * @param messages - Array of messages from the database
     * @returns Filtered messages for use as chat context
     *
     * @example
     * ```typescript
     * // In chatService when processing a new message:
     * const recentMessages = await conversationService.getRecentMessages(userId, 10);
     * const contextMessages = ConversationFlowBuilder.filterMessagesForContext(recentMessages);
     * const response = await chatAgent(user, message, contextMessages);
     * ```
     */
    static filterMessagesForContext(messages: Message[]): Message[];
    /**
     * Add one or more messages to the flow
     */
    addMessage(message: Message | Message[]): void;
    /**
     * Get recent messages from the flow
     * @param limit - Maximum number of messages to return (most recent first)
     * @returns Array of messages
     */
    getRecentMessages(limit?: number): Message[];
    /**
     * Convert messages to LangChain message format
     * @param limit - Optional limit on number of messages to convert
     * @returns Array formatted for LangChain with proper roles
     */
    toArray(limit?: number): Array<{
        role: string;
        content: string;
    }>;
    /**
     * Convert messages to formatted string for direct prompt injection
     * @param limit - Optional limit on number of messages to include
     * @returns Formatted string of conversation
     */
    toString(limit?: number): string;
    /**
     * Get total number of messages in the flow
     */
    get length(): number;
    /**
     * Clear all messages from the flow
     */
    clear(): void;
}
//# sourceMappingURL=conversationFlowBuilder.d.ts.map