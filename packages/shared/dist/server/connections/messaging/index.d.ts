/**
 * Messaging Module Exports
 *
 * Central export point for all messaging-related types, clients, and utilities.
 */
export type { IMessagingClient, MessageResult, MessagingProvider } from './types';
export type { LocalMessage } from './localClient';
export { TwilioMessagingClient, twilioMessagingClient } from './twilioClient';
export { LocalMessagingClient, localMessagingClient } from './localClient';
export { getMessagingClient, getMessagingClientByProvider, messagingClient } from './factory';
//# sourceMappingURL=index.d.ts.map