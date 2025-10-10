/**
 * Messaging Client Factory
 *
 * Provides a centralized way to get the appropriate messaging client
 * based on environment configuration.
 */

import type { IMessagingClient, MessagingProvider } from './types';
import { twilioMessagingClient } from './twilioClient';
import { localMessagingClient } from './localClient';

/**
 * Get the messaging client based on environment configuration
 * Defaults to Twilio in production, can be overridden with MESSAGING_PROVIDER env var
 */
export function getMessagingClient(): IMessagingClient {
  const provider = (process.env.MESSAGING_PROVIDER || 'twilio') as MessagingProvider;

  switch (provider) {
    case 'local':
      console.log('[MessagingFactory] Using LocalMessagingClient (no SMS will be sent)');
      return localMessagingClient;
    case 'twilio':
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
    case 'local':
      return localMessagingClient;
    case 'twilio':
      return twilioMessagingClient;
    default:
      throw new Error(`Unknown messaging provider: ${provider}`);
  }
}

// Export the default client as a singleton
export const messagingClient = getMessagingClient();
