/**
 * WhatsApp Messaging Client
 *
 * Implements IMessagingClient for WhatsApp delivery via Twilio.
 * Handles phone number prefixing and template-based messaging.
 */

import { twilioClient as twilioSdk } from '../twilio/twilio';
import type { IMessagingClient, MessageResult, MessagingProvider } from './types';
import type { UserWithProfile } from '@/server/models/user';
import { getTwilioSecrets } from '@/server/config';

export class WhatsAppMessagingClient implements IMessagingClient {
  public readonly provider: MessagingProvider = 'whatsapp';

  async sendMessage(
    user: UserWithProfile,
    message?: string,
    mediaUrls?: string[],
    templateSid?: string,
    templateVariables?: Record<string, string>
  ): Promise<MessageResult> {
    try {
      const whatsappNumber = this.formatWhatsAppNumber(user.phoneNumber);
      const fromNumber = this.formatWhatsAppNumber(getTwilioSecrets().phoneNumber);

      let twilioResponse;

      if (templateSid) {
        // Send template message
        twilioResponse = await twilioSdk.sendTemplateMessage(
          whatsappNumber,
          fromNumber,
          templateSid,
          templateVariables
        );
      } else {
        // Send freeform message (within 24h session window)
        twilioResponse = await twilioSdk.sendWhatsAppMessage(
          whatsappNumber,
          fromNumber,
          message,
          mediaUrls
        );
      }

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
          templateSid,
        },
      };
    } catch (error) {
      console.error('WhatsAppMessagingClient: Failed to send message', error);
      throw error;
    }
  }

  /**
   * Format phone number for WhatsApp (add whatsapp: prefix)
   */
  private formatWhatsAppNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('whatsapp:')) {
      return phoneNumber;
    }
    return `whatsapp:${phoneNumber}`;
  }

  /**
   * Maps Twilio status to standardized message status
   */
  private mapTwilioStatus(twilioStatus: string): MessageResult['status'] {
    switch (twilioStatus) {
      case 'sent':
      case 'delivered':
      case 'read':
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
export const whatsappMessagingClient = new WhatsAppMessagingClient();
