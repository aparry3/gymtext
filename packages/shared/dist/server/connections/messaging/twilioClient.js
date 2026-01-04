/**
 * Twilio Messaging Client
 *
 * Implements IMessagingClient for Twilio SMS delivery.
 * Wraps the Twilio API and provides a standardized messaging interface.
 */
import { twilioClient as twilioSdk } from '../twilio/twilio';
export class TwilioMessagingClient {
    provider = 'twilio';
    async sendMessage(user, message, mediaUrls) {
        try {
            const twilioResponse = await twilioSdk.sendSMS(user.phoneNumber, message, mediaUrls);
            return {
                messageId: twilioResponse.sid,
                status: this.mapTwilioStatus(twilioResponse.status),
                provider: this.provider,
                to: twilioResponse.to,
                from: twilioResponse.from,
                timestamp: twilioResponse.dateCreated,
                metadata: {
                    twilioSid: twilioResponse.sid,
                    twilioStatus: twilioResponse.status,
                    errorCode: twilioResponse.errorCode,
                    errorMessage: twilioResponse.errorMessage,
                    mediaUrls,
                },
            };
        }
        catch (error) {
            console.error('TwilioMessagingClient: Failed to send message', error);
            throw error;
        }
    }
    /**
     * Maps Twilio status to standardized message status
     */
    mapTwilioStatus(twilioStatus) {
        switch (twilioStatus) {
            case 'sent':
            case 'delivered':
                return 'delivered';
            case 'queued':
            case 'accepted':
            case 'sending':
                return 'queued';
            case 'failed':
            case 'undelivered':
                return 'failed';
            default:
                return 'sent';
        }
    }
}
// Export singleton instance
export const twilioMessagingClient = new TwilioMessagingClient();
