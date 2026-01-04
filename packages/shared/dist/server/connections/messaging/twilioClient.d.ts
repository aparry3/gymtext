/**
 * Twilio Messaging Client
 *
 * Implements IMessagingClient for Twilio SMS delivery.
 * Wraps the Twilio API and provides a standardized messaging interface.
 */
import type { IMessagingClient, MessageResult, MessagingProvider } from './types';
import type { UserWithProfile } from '@/server/models/user';
export declare class TwilioMessagingClient implements IMessagingClient {
    readonly provider: MessagingProvider;
    sendMessage(user: UserWithProfile, message?: string, mediaUrls?: string[]): Promise<MessageResult>;
    /**
     * Maps Twilio status to standardized message status
     */
    private mapTwilioStatus;
}
export declare const twilioMessagingClient: TwilioMessagingClient;
//# sourceMappingURL=twilioClient.d.ts.map