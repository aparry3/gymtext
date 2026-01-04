/**
 * Local Messaging Client
 *
 * Implements IMessagingClient for local development and testing.
 * Uses EventEmitter to broadcast messages to connected SSE clients.
 * Does not actually send SMS - instead emits events for local consumption.
 */
import type { IMessagingClient, MessageResult, MessagingProvider } from './types';
import type { UserWithProfile } from '@/server/models/user';
export interface LocalMessage {
    messageId: string;
    to: string;
    from: string;
    content: string;
    timestamp: Date;
}
export declare class LocalMessagingClient implements IMessagingClient {
    readonly provider: MessagingProvider;
    private eventEmitter;
    private messageCounter;
    constructor();
    sendMessage(user: UserWithProfile, message?: string, mediaUrls?: string[]): Promise<MessageResult>;
    /**
     * Subscribe to message events (for SSE connections)
     */
    onMessage(listener: (message: LocalMessage) => void): void;
    /**
     * Unsubscribe from message events
     */
    offMessage(listener: (message: LocalMessage) => void): void;
    /**
     * Get current number of active listeners
     */
    getListenerCount(): number;
}
export declare const localMessagingClient: LocalMessagingClient;
//# sourceMappingURL=localClient.d.ts.map