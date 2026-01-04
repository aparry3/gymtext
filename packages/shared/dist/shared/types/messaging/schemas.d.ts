/**
 * Messaging types for conversation context
 */
export interface RecentMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    messageId?: string;
}
//# sourceMappingURL=schemas.d.ts.map