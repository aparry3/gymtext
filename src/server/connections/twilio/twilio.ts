import twilio from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

class TwilioClient {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_NUMBER || '';

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not properly configured');
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendSMS(to: string, message?: string, mediaUrls?: string[]): Promise<MessageInstance> {
    try {
      const messageType = mediaUrls && mediaUrls.length > 0 ? 'MMS' : 'SMS';
      console.log(`Sending ${messageType} from:`, this.fromNumber, 'to:', to);
      if (mediaUrls && mediaUrls.length > 0) {
        console.log('Media URLs:', mediaUrls);
      }
      if (!message && (!mediaUrls || mediaUrls.length === 0)) {
        throw new Error('Must provide either message text or media URLs');
      }

      // Build status callback URL if BASE_URL is configured
      const statusCallback = process.env.BASE_URL
        ? `${process.env.BASE_URL}/api/twilio/status`
        : undefined;

      const response = await this.client.messages.create({
        ...(message && { body: message }),
        from: this.fromNumber,
        to: to,
        statusCallback,
        ...(mediaUrls && mediaUrls.length > 0 && { mediaUrl: mediaUrls }),
      });
      return response;
    } catch (error) {
      console.error('Error sending SMS/MMS:', error);
      throw error;
    }
  }

  async sendMMS(to: string, message: string | undefined, mediaUrls: string[]): Promise<MessageInstance> {
    return this.sendSMS(to, message, mediaUrls);
  }
}

export const twilioClient = new TwilioClient(); 