import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
/**
 * Twilio credentials configuration
 */
export interface TwilioCredentials {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}
/**
 * Twilio client interface for dependency injection
 */
export interface ITwilioClient {
    sendSMS(to: string, message?: string, mediaUrls?: string[]): Promise<MessageInstance>;
    sendMMS(to: string, message: string | undefined, mediaUrls: string[]): Promise<MessageInstance>;
    getMessageStatus(messageSid: string): Promise<MessageInstance>;
    getFromNumber(): string;
}
/**
 * Create or retrieve a cached Twilio client
 * @param credentials - Twilio account credentials
 * @param statusCallbackUrl - Optional status callback URL for message delivery updates
 * @returns ITwilioClient instance
 */
export declare function createTwilioClient(credentials: TwilioCredentials, statusCallbackUrl?: string): ITwilioClient;
/**
 * Clear all cached Twilio clients
 */
export declare function clearTwilioClients(): void;
/**
 * Get all active Twilio account SIDs (for debugging)
 */
export declare function getActiveTwilioAccounts(): string[];
//# sourceMappingURL=factory.d.ts.map