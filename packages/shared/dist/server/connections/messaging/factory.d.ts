/**
 * Messaging Client Factory
 *
 * Provides a centralized way to get the appropriate messaging client
 * based on environment configuration.
 */
import type { IMessagingClient, MessagingProvider } from './types';
/**
 * Get the messaging client based on environment configuration
 * Defaults to Twilio in production, can be overridden with MESSAGING_PROVIDER env var
 */
export declare function getMessagingClient(): IMessagingClient;
/**
 * Get a specific messaging client by provider name
 * Useful for testing or when you need direct access to a specific provider
 */
export declare function getMessagingClientByProvider(provider: MessagingProvider): IMessagingClient;
export declare const messagingClient: IMessagingClient;
//# sourceMappingURL=factory.d.ts.map