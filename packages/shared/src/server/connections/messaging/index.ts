/**
 * Messaging Module Exports
 *
 * Central export point for all messaging-related types, clients, and utilities.
 */

export type { IMessagingClient, MessageResult, MessagingProvider } from './types';
export { MessageProvider } from './types';
export type { LocalMessage } from './localClient';

export { TwilioMessagingClient, twilioMessagingClient } from './twilioClient';
export { WhatsAppCloudClient, createWhatsAppCloudClient, getWhatsAppCloudConfig } from './whatsappCloudClient';
export { LocalMessagingClient, localMessagingClient } from './localClient';
export { getMessagingClient, getMessagingClientByProvider, messagingClient } from './factory';
