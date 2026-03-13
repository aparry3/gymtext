/**
 * WhatsApp Module — Public API
 *
 * Centralizes all WhatsApp Business Cloud API functionality:
 *   - Template definitions and submission payloads
 *   - Webhook parsing (reactions, buttons, text, statuses)
 *   - 24-hour messaging window management
 *   - Reaction-based engagement handling
 *   - Template message sending
 */

// Types
export type {
  WhatsAppWebhookPayload,
  WhatsAppInboundMessage,
  WhatsAppParsedEvent,
  WhatsAppEventType,
  WhatsAppStatusUpdate,
  WhatsAppReaction,
  WhatsAppMessageType,
  WhatsAppMetadata,
  MessagingWindow,
} from './types';

// Templates
export {
  ALL_TEMPLATES,
  TEMPLATE_BY_NAME,
  TEMPLATE_VARIABLES,
  DAILY_WORKOUT_READY,
  DAILY_WORKOUT_EVENING,
  STREAK_MILESTONE,
  REST_DAY,
  FIRST_WORKOUT_WELCOME,
  REENGAGEMENT,
  buildTemplateSubmissionPayload,
  buildTemplateSendPayload,
} from './templates';
export type { WhatsAppTemplateDefinition, WhatsAppTemplateComponent } from './templates';

// Webhook parser
export {
  parseWebhookPayload,
  opensMessagingWindow,
  getWindowTrigger,
} from './webhookParser';
export type { ParsedWebhookResult } from './webhookParser';

// Messaging window
export {
  openMessagingWindow,
  hasOpenWindow,
  getWindow,
  closeWindow,
  getOpenWindowCount,
} from './messagingWindow';

// Reactions
export {
  isCompletionEmoji,
  getSentiment,
  getAcknowledgmentMessage,
  sendBusinessReaction,
} from './reactions';
export type { WorkoutSentiment } from './reactions';

// Template sender
export {
  sendTemplate,
  sendFreeFormIfWindowOpen,
} from './templateSender';
