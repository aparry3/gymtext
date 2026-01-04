/**
 * Twilio Client Factory
 *
 * Creates Twilio client instances on-demand. Supports multiple
 * credentials for environment switching (sandbox/production).
 */
import twilio from 'twilio';
// Cache clients by account SID
const clientCache = new Map();
/**
 * Create or retrieve a cached Twilio client
 * @param credentials - Twilio account credentials
 * @param statusCallbackUrl - Optional status callback URL for message delivery updates
 * @returns ITwilioClient instance
 */
export function createTwilioClient(credentials, statusCallbackUrl) {
    const cacheKey = credentials.accountSid;
    // Return cached instance if available
    if (clientCache.has(cacheKey)) {
        return clientCache.get(cacheKey);
    }
    const client = twilio(credentials.accountSid, credentials.authToken);
    const fromNumber = credentials.phoneNumber;
    const twilioClient = {
        async sendSMS(to, message, mediaUrls) {
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
            }
            catch (error) {
                console.error('Error sending SMS/MMS:', error);
                throw error;
            }
        },
        async sendMMS(to, message, mediaUrls) {
            return this.sendSMS(to, message, mediaUrls);
        },
        async getMessageStatus(messageSid) {
            return await client.messages(messageSid).fetch();
        },
        getFromNumber() {
            return fromNumber;
        },
    };
    clientCache.set(cacheKey, twilioClient);
    return twilioClient;
}
/**
 * Clear all cached Twilio clients
 */
export function clearTwilioClients() {
    clientCache.clear();
}
/**
 * Get all active Twilio account SIDs (for debugging)
 */
export function getActiveTwilioAccounts() {
    return Array.from(clientCache.keys());
}
