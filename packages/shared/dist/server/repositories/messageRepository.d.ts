import { BaseRepository } from '@/server/repositories/baseRepository';
import type { Message, NewMessage } from '@/server/models/message';
export declare class MessageRepository extends BaseRepository {
    create(message: NewMessage): Promise<Message>;
    findById(id: string): Promise<Message | undefined>;
    findByClientId(clientId: string, limit?: number, offset?: number): Promise<Message[]>;
    /**
     * Find recent messages for a client, ordered oldest to newest
     * This is the primary method for getting message history
     */
    findRecentByClientId(clientId: string, limit?: number): Promise<Message[]>;
    countByClientId(clientId: string): Promise<number>;
    findByProviderMessageId(providerMessageId: string): Promise<Message | undefined>;
    updateDeliveryStatus(messageId: string, status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered', error?: string): Promise<Message>;
    incrementDeliveryAttempts(messageId: string): Promise<Message>;
    updateProviderMessageId(messageId: string, providerMessageId: string): Promise<Message>;
    /**
     * Find all messages with user info for admin view
     * Supports filtering by direction, status, and search
     */
    findAllWithUserInfo(params: {
        limit?: number;
        offset?: number;
        direction?: 'inbound' | 'outbound';
        status?: string;
        search?: string;
        clientId?: string;
    }): Promise<{
        messages: (Message & {
            userName: string | null;
            userPhone: string;
        })[];
        total: number;
    }>;
    /**
     * Get message statistics for admin view
     */
    getStats(clientId?: string): Promise<{
        totalMessages: number;
        inbound: number;
        outbound: number;
        pending: number;
        failed: number;
    }>;
}
//# sourceMappingURL=messageRepository.d.ts.map