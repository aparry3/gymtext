import { z } from 'zod';

// ============================================================================
// Context Configuration (migrated from context.config.ts)
// ============================================================================
export const ContextConfigSchema = z.object({
  messageHistoryLimit: z.number().int().positive().default(5),
  includeSystemMessages: z.boolean().default(true),
  maxContextTokens: z.number().int().positive().default(1000),
  reserveTokensForResponse: z.number().int().positive().default(1500),
  conversationGapMinutes: z.number().int().positive().default(30),
  enableCaching: z.boolean().default(true),
  cacheTTLSeconds: z.number().int().nonnegative().default(300),
});

// ============================================================================
// Chat Configuration
// ============================================================================
export const ChatConfigSchema = z.object({
  smsMaxLength: z.number().int().positive().default(1600),
  contextMinutes: z.number().int().positive().default(10),
});

// ============================================================================
// Messaging Configuration
// ============================================================================
export const MessagingProviderSchema = z.enum(['twilio', 'local']);

export const MessagingConfigSchema = z.object({
  provider: MessagingProviderSchema.default('twilio'),
});

// ============================================================================
// Feature Flags
// ============================================================================
export const FeatureFlagsSchema = z.object({
  agentLogging: z.boolean().default(false),
  enableConversationStorage: z.boolean().default(true),
});

// ============================================================================
// Conversation Configuration
// ============================================================================
export const ConversationConfigSchema = z.object({
  timeoutMinutes: z.number().int().positive().default(30),
  maxLength: z.number().int().positive().default(100),
  inactiveThresholdDays: z.number().int().positive().default(7),
});

// ============================================================================
// Short Links Configuration
// ============================================================================
export const ShortLinksConfigSchema = z.object({
  defaultExpiryDays: z.number().int().positive().default(7),
  domain: z.string().optional(),
});

// ============================================================================
// Stripe Configuration (non-secret)
// ============================================================================
export const StripeConfigSchema = z.object({
  priceId: z.string().min(1),
});

// ============================================================================
// Admin Configuration
// ============================================================================
export const AdminConfigSchema = z.object({
  phoneNumbers: z.array(z.string()).default([]),
  maxRequestsPerWindow: z.number().int().positive().default(3),
  rateLimitWindowMinutes: z.number().int().positive().default(15),
  codeExpiryMinutes: z.number().int().positive().default(10),
  codeLength: z.number().int().positive().default(6),
  devBypassCode: z.string().optional(),
});

// ============================================================================
// Application URLs
// ============================================================================
export const UrlsConfigSchema = z.object({
  baseUrl: z.string().optional(),
  publicBaseUrl: z.string().optional(),
});

// ============================================================================
// Root Configuration Schema
// ============================================================================
export const AppConfigSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  context: ContextConfigSchema,
  chat: ChatConfigSchema,
  messaging: MessagingConfigSchema,
  features: FeatureFlagsSchema,
  conversation: ConversationConfigSchema,
  shortLinks: ShortLinksConfigSchema,
  stripe: StripeConfigSchema,
  admin: AdminConfigSchema,
  urls: UrlsConfigSchema,
});

// Export types inferred from schemas
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type ContextConfig = z.infer<typeof ContextConfigSchema>;
export type ChatConfig = z.infer<typeof ChatConfigSchema>;
export type MessagingConfig = z.infer<typeof MessagingConfigSchema>;
export type MessagingProvider = z.infer<typeof MessagingProviderSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type ConversationConfig = z.infer<typeof ConversationConfigSchema>;
export type ShortLinksConfig = z.infer<typeof ShortLinksConfigSchema>;
export type StripeConfig = z.infer<typeof StripeConfigSchema>;
export type AdminConfig = z.infer<typeof AdminConfigSchema>;
export type UrlsConfig = z.infer<typeof UrlsConfigSchema>;
