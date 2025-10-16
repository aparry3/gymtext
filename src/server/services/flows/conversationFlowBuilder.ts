import { Message } from '@/server/models/conversation';
import { BaseMessage } from '@langchain/core/messages';

/**
 * ConversationFlowBuilder
 *
 * Lightweight utility for building natural message flows with context awareness.
 * Used for ephemeral orchestration (not persisted to DB).
 *
 * Purpose:
 * - Track messages within a single flow (e.g., onboarding sequence)
 * - Provide context to subsequent agents to avoid repetitive greetings
 * - Format messages for LangChain or direct prompt injection
 *
 * Example:
 * ```typescript
 * const flow = new ConversationFlowBuilder();
 *
 * const welcome = await messageService.sendWelcomeMessage(user);
 * flow.addMessage(welcome);
 *
 * const planMessages = await messageService.sendPlanSummary(user, plan, flow.getRecentMessages());
 * flow.addMessage(planMessages);
 * ```
 */
export class ConversationFlowBuilder {
  private messages: Message[] = [];

  /**
   * Add one or more messages to the flow
   */
  addMessage(message: Message | Message[]): void {
    if (Array.isArray(message)) {
      this.messages.push(...message);
    } else {
      this.messages.push(message);
    }
  }

  /**
   * Get recent messages from the flow
   * @param limit - Maximum number of messages to return (most recent first)
   * @returns Array of messages
   */
  getRecentMessages(limit?: number): Message[] {
    if (!limit) {
      return [...this.messages];
    }
    return this.messages.slice(-limit);
  }

  /**
   * Convert messages to LangChain BaseMessage format
   * @param limit - Optional limit on number of messages to convert
   * @returns Array of BaseMessage for LangChain
   */
  toArray(limit?: number): BaseMessage[] {
    const messages = this.getRecentMessages(limit);
    return messages.map(msg => ({
      role: msg.direction === 'inbound' ? 'user' : 'assistant',
      content: msg.content,
    })) as BaseMessage[];
  }

  /**
   * Convert messages to formatted string for direct prompt injection
   * @param limit - Optional limit on number of messages to include
   * @returns Formatted string of conversation
   */
  toString(limit?: number): string {
    const messages = this.getRecentMessages(limit);
    return messages
      .map(msg => {
        const role = msg.direction === 'inbound' ? 'User' : 'Assistant';
        return `${role}: ${msg.content}`;
      })
      .join('\n\n');
  }

  /**
   * Get total number of messages in the flow
   */
  get length(): number {
    return this.messages.length;
  }

  /**
   * Clear all messages from the flow
   */
  clear(): void {
    this.messages = [];
  }
}
