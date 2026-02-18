/**
 * WhatsApp Cloud API Client
 *
 * Direct integration with Meta's WhatsApp Business Cloud API.
 * Implements IMessagingClient for drop-in compatibility with existing messaging infrastructure.
 *
 * This client uses the WhatsApp Cloud API directly (not through Twilio),
 * providing lower costs and direct Meta integration.
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/
 */

import type { IMessagingClient, MessageResult, MessagingProvider } from './types';
import type { UserWithProfile } from '@/server/models/user';
import axios, { AxiosError } from 'axios';

interface WhatsAppCloudConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion: string;
}

interface WhatsAppAPIResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

interface WhatsAppErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

/**
 * WhatsApp Cloud API Client
 *
 * Sends messages via Meta's WhatsApp Business Cloud API.
 * Supports both template messages (business-initiated) and free-form messages (within 24h window).
 */
export class WhatsAppCloudClient implements IMessagingClient {
  public readonly provider: MessagingProvider = 'whatsapp-cloud';

  private config: WhatsAppCloudConfig;

  constructor(config: WhatsAppCloudConfig) {
    this.config = config;
  }

  async sendMessage(
    user: UserWithProfile,
    message?: string,
    mediaUrls?: string[],
    templateSid?: string,
    templateVariables?: Record<string, string>
  ): Promise<MessageResult> {
    try {
      const recipientPhone = this.formatPhoneNumber(user.phoneNumber);

      let response: WhatsAppAPIResponse;

      if (templateSid) {
        // Send template message (business-initiated)
        response = await this.sendTemplateMessage(
          recipientPhone,
          templateSid,
          templateVariables
        );
      } else {
        // Send free-form text message (within 24-hour window)
        if (!message) {
          throw new Error('Message content required for non-template messages');
        }
        response = await this.sendTextMessage(recipientPhone, message, mediaUrls);
      }

      const messageId = response.messages[0]?.id;
      const waId = response.contacts[0]?.wa_id;

      return {
        messageId,
        status: 'sent', // WhatsApp Cloud API accepts message, status updates come via webhook
        provider: this.provider,
        to: waId || recipientPhone,
        from: this.config.phoneNumberId,
        timestamp: new Date(),
        metadata: {
          whatsappMessageId: messageId,
          whatsappPhoneNumberId: this.config.phoneNumberId,
          templateSid,
          templateVariables,
          mediaUrls,
        },
      };
    } catch (error) {
      console.error('[WhatsAppCloudClient] Failed to send message:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Send a template message via WhatsApp Cloud API
   *
   * Template messages are required for business-initiated conversations.
   * Templates must be pre-approved by Meta.
   */
  private async sendTemplateMessage(
    to: string,
    templateName: string,
    variables?: Record<string, string>
  ): Promise<WhatsAppAPIResponse> {
    const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;

    // Convert variables object to WhatsApp template parameters format
    const parameters = variables
      ? Object.values(variables).map((value) => ({
          type: 'text',
          text: value,
        }))
      : [];

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_US' },
        components:
          parameters.length > 0
            ? [
                {
                  type: 'body',
                  parameters,
                },
              ]
            : [],
      },
    };

    console.log('[WhatsAppCloudClient] Sending template message:', {
      to,
      templateName,
      variableCount: parameters.length,
    });

    const response = await axios.post<WhatsAppAPIResponse>(url, payload, {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  /**
   * Send a free-form text message via WhatsApp Cloud API
   *
   * Can only be sent within 24 hours of the last user message.
   * For business-initiated messages, use templates instead.
   */
  private async sendTextMessage(
    to: string,
    messageText: string,
    mediaUrls?: string[]
  ): Promise<WhatsAppAPIResponse> {
    const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;

    // For now, implement text-only messages
    // TODO: Add media message support (images, documents, etc.)
    if (mediaUrls && mediaUrls.length > 0) {
      console.warn(
        '[WhatsAppCloudClient] Media URLs provided but media messages not yet implemented. Sending text only.'
      );
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    console.log('[WhatsAppCloudClient] Sending text message to:', to);

    const response = await axios.post<WhatsAppAPIResponse>(url, payload, {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  /**
   * Format phone number for WhatsApp Cloud API
   *
   * WhatsApp expects E.164 format without the leading +
   * Example: "15551234567" (not "+1-555-123-4567")
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Remove leading + if present
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.slice(1);
    }

    // Ensure US numbers have country code
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    return cleaned;
  }

  /**
   * Handle WhatsApp Cloud API errors
   *
   * Common error codes:
   * - 190: Invalid access token
   * - 100: Invalid parameter
   * - 131047: Message undeliverable (user blocked, invalid number, etc.)
   * - 131056: Phone number not registered
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<WhatsAppErrorResponse>;

      if (axiosError.response?.data?.error) {
        const whatsappError = axiosError.response.data.error;

        const errorMessage = `WhatsApp API Error ${whatsappError.code}: ${whatsappError.message}`;

        console.error('[WhatsAppCloudClient] API Error:', {
          code: whatsappError.code,
          type: whatsappError.type,
          message: whatsappError.message,
          subcode: whatsappError.error_subcode,
          traceId: whatsappError.fbtrace_id,
        });

        // Map common errors to more helpful messages
        switch (whatsappError.code) {
          case 190:
            return new Error(
              'WhatsApp authentication failed. Check WHATSAPP_ACCESS_TOKEN environment variable.'
            );
          case 131047:
            return new Error(
              'Message undeliverable. User may have blocked business or number is invalid.'
            );
          case 131056:
            return new Error(
              'Phone number not registered with WhatsApp Business API.'
            );
          default:
            return new Error(errorMessage);
        }
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown error sending WhatsApp message');
  }
}

/**
 * Get WhatsApp Cloud API configuration from environment
 */
export function getWhatsAppCloudConfig(): WhatsAppCloudConfig {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v23.0';

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      'WhatsApp Cloud API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN environment variables.'
    );
  }

  return {
    phoneNumberId,
    accessToken,
    apiVersion,
  };
}

/**
 * Create and export singleton instance
 *
 * Will be initialized lazily when first accessed.
 * Throws error if environment variables not set.
 */
export const createWhatsAppCloudClient = (): WhatsAppCloudClient => {
  const config = getWhatsAppCloudConfig();
  return new WhatsAppCloudClient(config);
};

// Export singleton instance
// Note: This will throw if environment variables are not set
// Use getMessagingClientByProvider('whatsapp-cloud') in factory instead
export const whatsappCloudClient = createWhatsAppCloudClient();
