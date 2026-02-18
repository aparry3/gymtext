/**
 * Messaging Client Factory
 *
 * Provides a centralized way to get the appropriate messaging client
 * based on environment configuration.
 */

import type { IMessagingClient, MessagingProvider } from './types';
import { MessageProvider } from './types';
import { twilioMessagingClient } from './twilioClient';
import { localMessagingClient } from './localClient';
import { createWhatsAppCloudClient } from './whatsappCloudClient';
import { getMessagingConfig } from '@/shared/config';

// Lazy-loaded WhatsApp Cloud client (only created when needed)
let whatsappClientInstance: IMessagingClient | null = null;

/**
 * Get the messaging client based on environment configuration
 * Defaults to Twilio in production, can be overridden with MESSAGING_PROVIDER env var
 */
export function getMessagingClient(): IMessagingClient {
  const { provider } = getMessagingConfig();

  switch (provider) {
    case MessageProvider.LOCAL:
      console.log('[MessagingFactory] Using LocalMessagingClient (no SMS will be sent)');
      return localMessagingClient;
    case MessageProvider.WHATSAPP:
      console.log('[MessagingFactory] Using WhatsApp Cloud API (direct Meta integration)');
      if (!whatsappClientInstance) {
        whatsappClientInstance = createWhatsAppCloudClient();
      }
      return whatsappClientInstance;
    case MessageProvider.TWILIO:
    default:
      return twilioMessagingClient;
  }
}

/**
 * Get a specific messaging client by provider name
 * Useful for testing or when you need direct access to a specific provider
 */
export function getMessagingClientByProvider(provider: MessagingProvider): IMessagingClient {
  switch (provider) {
    case MessageProvider.LOCAL:
      return localMessagingClient;
    case MessageProvider.TWILIO:
      return twilioMessagingClient;
    case MessageProvider.WHATSAPP:
      if (!whatsappClientInstance) {
        whatsappClientInstance = createWhatsAppCloudClient();
      }
      return whatsappClientInstance;
    default:
      throw new Error(`Unknown messaging provider: ${provider}`);
  }
}

// Export the default client as a singleton
export const messagingClient = getMessagingClient();
