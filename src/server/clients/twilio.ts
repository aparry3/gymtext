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

  async sendSMS(to: string, message: string): Promise<MessageInstance> {
    try {
      console.log('Sending SMS from:', this.fromNumber, 'to:', to);
      const response = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });
      return response;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
}

export const twilioClient = new TwilioClient(); 