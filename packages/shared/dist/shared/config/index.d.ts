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
export * from './public';
import type { ContextConfig, ChatConfig, MessagingConfig, FeatureFlags, ConversationConfig, ShortLinksConfig, StripeConfig, AdminConfig, UrlsConfig } from './schema';
/**
 * The validated application configuration.
 * Use this for direct property access: config.chat.smsMaxLength
 *
 * Note: This is a getter that lazily loads config on first access.
 */
export declare const config: {
    context: {
        messageHistoryLimit: number;
        includeSystemMessages: boolean;
        maxContextTokens: number;
        reserveTokensForResponse: number;
        conversationGapMinutes: number;
        enableCaching: boolean;
        cacheTTLSeconds: number;
    };
    shortLinks: {
        defaultExpiryDays: number;
        domain?: string | undefined;
    };
    environment: "production" | "development" | "staging";
    chat: {
        smsMaxLength: number;
        contextMinutes: number;
    };
    messaging: {
        provider: "twilio" | "local";
    };
    features: {
        agentLogging: boolean;
        enableConversationStorage: boolean;
    };
    conversation: {
        maxLength: number;
        timeoutMinutes: number;
        inactiveThresholdDays: number;
    };
    stripe: {
        priceId: string;
    };
    admin: {
        phoneNumbers: string[];
        maxRequestsPerWindow: number;
        rateLimitWindowMinutes: number;
        codeExpiryMinutes: number;
        codeLength: number;
        devBypassCode?: string | undefined;
    };
    urls: {
        baseUrl?: string | undefined;
        publicBaseUrl?: string | undefined;
    };
};
export declare function getContextConfig(): ContextConfig;
export declare function getChatConfig(): ChatConfig;
export declare function getMessagingConfig(): MessagingConfig;
export declare function getFeatureFlags(): FeatureFlags;
export declare function getConversationConfig(): ConversationConfig;
export declare function getShortLinksConfig(): ShortLinksConfig;
export declare function getStripeConfig(): StripeConfig;
export declare function getAdminConfig(): AdminConfig;
export declare function getUrlsConfig(): UrlsConfig;
//# sourceMappingURL=index.d.ts.map