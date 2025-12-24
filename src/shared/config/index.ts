/**
 * Application Configuration
 *
 * This module provides type-safe, validated configuration for the application.
 * Config values are loaded once at startup and cached.
 *
 * Usage:
 *   import { config } from '@/shared/config';
 *   console.log(config.chat.smsMaxLength);
 *
 * Or use section accessors:
 *   import { getChatConfig, getFeatureFlags } from '@/shared/config';
 *   const { smsMaxLength } = getChatConfig();
 */

export { getConfig, loadConfig, resetConfig, getEnvironment } from './loader';
export type { Environment } from './loader';
export * from './schema';

import { getConfig } from './loader';
import type {
  AppConfig,
  ContextConfig,
  ChatConfig,
  MessagingConfig,
  FeatureFlags,
  ConversationConfig,
  ShortLinksConfig,
  StripeConfig,
  AdminConfig,
  UrlsConfig,
} from './schema';

// ============================================================================
// Lazy config getter to avoid issues during build/module loading
// ============================================================================

let _cachedConfig: AppConfig | null = null;

function getCachedConfig(): AppConfig {
  if (!_cachedConfig) {
    _cachedConfig = getConfig();
  }
  return _cachedConfig;
}

/**
 * The validated application configuration.
 * Use this for direct property access: config.chat.smsMaxLength
 *
 * Note: This is a getter that lazily loads config on first access.
 */
export const config = new Proxy({} as AppConfig, {
  get(_target, prop) {
    return getCachedConfig()[prop as keyof AppConfig];
  },
});

// ============================================================================
// Convenience accessors for individual config sections
// These match the existing getContextConfig() pattern
// ============================================================================

export function getContextConfig(): ContextConfig {
  return getConfig().context;
}

export function getChatConfig(): ChatConfig {
  return getConfig().chat;
}

export function getMessagingConfig(): MessagingConfig {
  return getConfig().messaging;
}

export function getFeatureFlags(): FeatureFlags {
  return getConfig().features;
}

export function getConversationConfig(): ConversationConfig {
  return getConfig().conversation;
}

export function getShortLinksConfig(): ShortLinksConfig {
  return getConfig().shortLinks;
}

export function getStripeConfig(): StripeConfig {
  return getConfig().stripe;
}

export function getAdminConfig(): AdminConfig {
  return getConfig().admin;
}

export function getUrlsConfig(): UrlsConfig {
  return getConfig().urls;
}
