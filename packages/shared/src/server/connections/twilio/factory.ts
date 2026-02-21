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
  sendWhatsAppMessage(to: string, from: string, message?: string, mediaUrls?: string[]): Promise<MessageInstance>;
  sendTemplateMessage(to: string, from: string, contentSid: string, contentVariables?: Record<string, string>): Promise<MessageInstance>;
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
        console.log(`Sending ${messageType} from:`, fromNumber, 'to:', to);
        if (mediaUrls && mediaUrls.length > 0) {
          console.log('Media URLs:', mediaUrls);
        }
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

    async sendWhatsAppMessage(to: string, from: string, message?: string, mediaUrls?: string[]): Promise<MessageInstance> {
      try {
        console.log('Sending WhatsApp message from:', from, 'to:', to);

        const response = await client.messages.create({
          ...(message && { body: message }),
          from: from, // whatsapp:+14155238886
          to: to,     // whatsapp:+15005550006
          statusCallback: statusCallbackUrl,
          ...(mediaUrls && mediaUrls.length > 0 && { mediaUrl: mediaUrls }),
        });

        return response;
      } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
      }
    },

    async sendTemplateMessage(
      to: string,
      from: string,
      contentSid: string,
      contentVariables?: Record<string, string>
    ): Promise<MessageInstance> {
      try {
        console.log('Sending WhatsApp template message:', contentSid, 'from:', from, 'to:', to);

        const response = await client.messages.create({
          from: from,
          to: to,
          contentSid: contentSid,
          ...(contentVariables && { contentVariables: JSON.stringify(contentVariables) }),
          statusCallback: statusCallbackUrl,
        });

        return response;
      } catch (error) {
        console.error('Error sending template message:', error);
        throw error;
      }
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
