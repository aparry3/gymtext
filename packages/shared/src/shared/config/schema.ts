import { z } from 'zod';

// ============================================================================
// Environment Detection (for smart defaults)
// ============================================================================
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

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
  // Longer cache in production
  cacheTTLSeconds: z.number().int().nonnegative().default(isProd ? 600 : 300),
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
export const MessagingProviderSchema = z.enum(['twilio', 'whatsapp', 'local', 'websocket']);

export const MessagingConfigSchema = z.object({
  // Use local provider in development, twilio in production
  provider: MessagingProviderSchema.default(isDev ? 'local' : 'twilio'),
});

// ============================================================================
// Feature Flags
// ============================================================================
export const FeatureFlagsSchema = z.object({
  // Enable agent logging in development by default
  agentLogging: z.boolean().default(isDev),
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
// Program Configuration
// ============================================================================
export const ProgramConfigSchema = z.object({
  defaultProgramId: z.string().min(1).optional(),
});

// ============================================================================
// Stripe Configuration (non-secret)
// TODO: Refactor config system to use modular loading where apps declare which
// config sections they require, rather than validating all sections globally.
// This would allow apps like 'programs' to skip Stripe config entirely.
// ============================================================================
export const StripeConfigSchema = z.object({
  priceId: z.string().min(1).optional(),
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
  program: ProgramConfigSchema,
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
export type ProgramConfig = z.infer<typeof ProgramConfigSchema>;
export type StripeConfig = z.infer<typeof StripeConfigSchema>;
export type AdminConfig = z.infer<typeof AdminConfigSchema>;
export type UrlsConfig = z.infer<typeof UrlsConfigSchema>;
