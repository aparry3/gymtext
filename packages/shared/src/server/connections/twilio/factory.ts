/**
 * Twilio Client Factory
 *
 * Creates Twilio client instances on-demand. Supports multiple
 * credentials for environment switching (sandbox/production).
 */
import twilio from 'twilio';
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

// Cache clients by account SID
const clientCache = new Map<string, ITwilioClient>();

/**
 * Create or retrieve a cached Twilio client
 * @param credentials - Twilio account credentials
 * @param statusCallbackUrl - Optional status callback URL for message delivery updates
 * @returns ITwilioClient instance
 */
export function createTwilioClient(
  credentials: TwilioCredentials,
  statusCallbackUrl?: string
): ITwilioClient {
  const cacheKey = credentials.accountSid;

  // Return cached instance if available
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const client = twilio(credentials.accountSid, credentials.authToken);
  const fromNumber = credentials.phoneNumber;

  const twilioClient: ITwilioClient = {
    async sendSMS(to: string, message?: string, mediaUrls?: string[]): Promise<MessageInstance> {
      try {
        const messageType = mediaUrls && mediaUrls.length > 0 ? 'MMS' : 'SMS';
        if (!message && (!mediaUrls || mediaUrls.length === 0)) {
          throw new Error('Must provide either message text or media URLs');
        }

        const response = await client.messages.create({
          ...(message && { body: message }),
          from: fromNumber,
          to: to,
          statusCallback: statusCallbackUrl,
          ...(mediaUrls && mediaUrls.length > 0 && { mediaUrl: mediaUrls }),
        });
        return response;
      } catch (error) {
        console.error('Error sending SMS/MMS:', error);
        throw error;
      }
    },

    async sendMMS(to: string, message: string | undefined, mediaUrls: string[]): Promise<MessageInstance> {
      return this.sendSMS(to, message, mediaUrls);
    },

    async getMessageStatus(messageSid: string): Promise<MessageInstance> {
      return await client.messages(messageSid).fetch();
    },

    getFromNumber(): string {
      return fromNumber;
    },
  };

  clientCache.set(cacheKey, twilioClient);
  return twilioClient;
}

/**
 * Clear all cached Twilio clients
 */
export function clearTwilioClients(): void {
  clientCache.clear();
}

/**
 * Get all active Twilio account SIDs (for debugging)
 */
export function getActiveTwilioAccounts(): string[] {
  return Array.from(clientCache.keys());
}
