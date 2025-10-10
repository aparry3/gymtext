/**
 * Twilio Messaging Client
 *
 * Implements IMessagingClient for Twilio SMS delivery.
 * Wraps the Twilio API and provides a standardized messaging interface.
 */

import { twilioClient as twilioSdk } from '../twilio/twilio';
import type { IMessagingClient, MessageResult, MessagingProvider } from './types';

export class TwilioMessagingClient implements IMessagingClient {
  public readonly provider: MessagingProvider = 'twilio';

  async sendMessage(to: string, message: string): Promise<MessageResult> {
    try {
      const twilioResponse = await twilioSdk.sendSMS(to, message);

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
        },
      };
    } catch (error) {
      console.error('TwilioMessagingClient: Failed to send message', error);
      throw error;
    }
  }

  /**
   * Maps Twilio status to standardized message status
   */
  private mapTwilioStatus(
    twilioStatus: string
  ): MessageResult['status'] {
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
