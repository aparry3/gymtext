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
export * from './schema';
export * from './public';
import { getConfig } from './loader';
// ============================================================================
// Lazy config getter to avoid issues during build/module loading
// ============================================================================
let _cachedConfig = null;
function getCachedConfig() {
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
export const config = new Proxy({}, {
    get(_target, prop) {
        return getCachedConfig()[prop];
    },
});
// ============================================================================
// Convenience accessors for individual config sections
// These match the existing getContextConfig() pattern
// ============================================================================
export function getContextConfig() {
    return getConfig().context;
}
export function getChatConfig() {
    return getConfig().chat;
}
export function getMessagingConfig() {
    return getConfig().messaging;
}
export function getFeatureFlags() {
    return getConfig().features;
}
export function getConversationConfig() {
    return getConfig().conversation;
}
export function getShortLinksConfig() {
    return getConfig().shortLinks;
}
export function getStripeConfig() {
    return getConfig().stripe;
}
export function getAdminConfig() {
    return getConfig().admin;
}
export function getUrlsConfig() {
    return getConfig().urls;
}
