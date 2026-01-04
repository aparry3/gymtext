import { z } from 'zod';
export declare const ContextConfigSchema: z.ZodObject<{
    messageHistoryLimit: z.ZodDefault<z.ZodNumber>;
    includeSystemMessages: z.ZodDefault<z.ZodBoolean>;
    maxContextTokens: z.ZodDefault<z.ZodNumber>;
    reserveTokensForResponse: z.ZodDefault<z.ZodNumber>;
    conversationGapMinutes: z.ZodDefault<z.ZodNumber>;
    enableCaching: z.ZodDefault<z.ZodBoolean>;
    cacheTTLSeconds: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    messageHistoryLimit: number;
    includeSystemMessages: boolean;
    maxContextTokens: number;
    reserveTokensForResponse: number;
    conversationGapMinutes: number;
    enableCaching: boolean;
    cacheTTLSeconds: number;
}, {
    messageHistoryLimit?: number | undefined;
    includeSystemMessages?: boolean | undefined;
    maxContextTokens?: number | undefined;
    reserveTokensForResponse?: number | undefined;
    conversationGapMinutes?: number | undefined;
    enableCaching?: boolean | undefined;
    cacheTTLSeconds?: number | undefined;
}>;
export declare const ChatConfigSchema: z.ZodObject<{
    smsMaxLength: z.ZodDefault<z.ZodNumber>;
    contextMinutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    smsMaxLength: number;
    contextMinutes: number;
}, {
    smsMaxLength?: number | undefined;
    contextMinutes?: number | undefined;
}>;
export declare const MessagingProviderSchema: z.ZodEnum<["twilio", "local"]>;
export declare const MessagingConfigSchema: z.ZodObject<{
    provider: z.ZodDefault<z.ZodEnum<["twilio", "local"]>>;
}, "strip", z.ZodTypeAny, {
    provider: "twilio" | "local";
}, {
    provider?: "twilio" | "local" | undefined;
}>;
export declare const FeatureFlagsSchema: z.ZodObject<{
    agentLogging: z.ZodDefault<z.ZodBoolean>;
    enableConversationStorage: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    agentLogging: boolean;
    enableConversationStorage: boolean;
}, {
    agentLogging?: boolean | undefined;
    enableConversationStorage?: boolean | undefined;
}>;
export declare const ConversationConfigSchema: z.ZodObject<{
    timeoutMinutes: z.ZodDefault<z.ZodNumber>;
    maxLength: z.ZodDefault<z.ZodNumber>;
    inactiveThresholdDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxLength: number;
    timeoutMinutes: number;
    inactiveThresholdDays: number;
}, {
    maxLength?: number | undefined;
    timeoutMinutes?: number | undefined;
    inactiveThresholdDays?: number | undefined;
}>;
export declare const ShortLinksConfigSchema: z.ZodObject<{
    defaultExpiryDays: z.ZodDefault<z.ZodNumber>;
    domain: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    defaultExpiryDays: number;
    domain?: string | undefined;
}, {
    defaultExpiryDays?: number | undefined;
    domain?: string | undefined;
}>;
export declare const StripeConfigSchema: z.ZodObject<{
    priceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    priceId: string;
}, {
    priceId: string;
}>;
export declare const AdminConfigSchema: z.ZodObject<{
    phoneNumbers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    maxRequestsPerWindow: z.ZodDefault<z.ZodNumber>;
    rateLimitWindowMinutes: z.ZodDefault<z.ZodNumber>;
    codeExpiryMinutes: z.ZodDefault<z.ZodNumber>;
    codeLength: z.ZodDefault<z.ZodNumber>;
    devBypassCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phoneNumbers: string[];
    maxRequestsPerWindow: number;
    rateLimitWindowMinutes: number;
    codeExpiryMinutes: number;
    codeLength: number;
    devBypassCode?: string | undefined;
}, {
    phoneNumbers?: string[] | undefined;
    maxRequestsPerWindow?: number | undefined;
    rateLimitWindowMinutes?: number | undefined;
    codeExpiryMinutes?: number | undefined;
    codeLength?: number | undefined;
    devBypassCode?: string | undefined;
}>;
export declare const UrlsConfigSchema: z.ZodObject<{
    baseUrl: z.ZodOptional<z.ZodString>;
    publicBaseUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    baseUrl?: string | undefined;
    publicBaseUrl?: string | undefined;
}, {
    baseUrl?: string | undefined;
    publicBaseUrl?: string | undefined;
}>;
export declare const AppConfigSchema: z.ZodObject<{
    environment: z.ZodEnum<["development", "staging", "production"]>;
    context: z.ZodObject<{
        messageHistoryLimit: z.ZodDefault<z.ZodNumber>;
        includeSystemMessages: z.ZodDefault<z.ZodBoolean>;
        maxContextTokens: z.ZodDefault<z.ZodNumber>;
        reserveTokensForResponse: z.ZodDefault<z.ZodNumber>;
        conversationGapMinutes: z.ZodDefault<z.ZodNumber>;
        enableCaching: z.ZodDefault<z.ZodBoolean>;
        cacheTTLSeconds: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        messageHistoryLimit: number;
        includeSystemMessages: boolean;
        maxContextTokens: number;
        reserveTokensForResponse: number;
        conversationGapMinutes: number;
        enableCaching: boolean;
        cacheTTLSeconds: number;
    }, {
        messageHistoryLimit?: number | undefined;
        includeSystemMessages?: boolean | undefined;
        maxContextTokens?: number | undefined;
        reserveTokensForResponse?: number | undefined;
        conversationGapMinutes?: number | undefined;
        enableCaching?: boolean | undefined;
        cacheTTLSeconds?: number | undefined;
    }>;
    chat: z.ZodObject<{
        smsMaxLength: z.ZodDefault<z.ZodNumber>;
        contextMinutes: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        smsMaxLength: number;
        contextMinutes: number;
    }, {
        smsMaxLength?: number | undefined;
        contextMinutes?: number | undefined;
    }>;
    messaging: z.ZodObject<{
        provider: z.ZodDefault<z.ZodEnum<["twilio", "local"]>>;
    }, "strip", z.ZodTypeAny, {
        provider: "twilio" | "local";
    }, {
        provider?: "twilio" | "local" | undefined;
    }>;
    features: z.ZodObject<{
        agentLogging: z.ZodDefault<z.ZodBoolean>;
        enableConversationStorage: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        agentLogging: boolean;
        enableConversationStorage: boolean;
    }, {
        agentLogging?: boolean | undefined;
        enableConversationStorage?: boolean | undefined;
    }>;
    conversation: z.ZodObject<{
        timeoutMinutes: z.ZodDefault<z.ZodNumber>;
        maxLength: z.ZodDefault<z.ZodNumber>;
        inactiveThresholdDays: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxLength: number;
        timeoutMinutes: number;
        inactiveThresholdDays: number;
    }, {
        maxLength?: number | undefined;
        timeoutMinutes?: number | undefined;
        inactiveThresholdDays?: number | undefined;
    }>;
    shortLinks: z.ZodObject<{
        defaultExpiryDays: z.ZodDefault<z.ZodNumber>;
        domain: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        defaultExpiryDays: number;
        domain?: string | undefined;
    }, {
        defaultExpiryDays?: number | undefined;
        domain?: string | undefined;
    }>;
    stripe: z.ZodObject<{
        priceId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        priceId: string;
    }, {
        priceId: string;
    }>;
    admin: z.ZodObject<{
        phoneNumbers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        maxRequestsPerWindow: z.ZodDefault<z.ZodNumber>;
        rateLimitWindowMinutes: z.ZodDefault<z.ZodNumber>;
        codeExpiryMinutes: z.ZodDefault<z.ZodNumber>;
        codeLength: z.ZodDefault<z.ZodNumber>;
        devBypassCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phoneNumbers: string[];
        maxRequestsPerWindow: number;
        rateLimitWindowMinutes: number;
        codeExpiryMinutes: number;
        codeLength: number;
        devBypassCode?: string | undefined;
    }, {
        phoneNumbers?: string[] | undefined;
        maxRequestsPerWindow?: number | undefined;
        rateLimitWindowMinutes?: number | undefined;
        codeExpiryMinutes?: number | undefined;
        codeLength?: number | undefined;
        devBypassCode?: string | undefined;
    }>;
    urls: z.ZodObject<{
        baseUrl: z.ZodOptional<z.ZodString>;
        publicBaseUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        baseUrl?: string | undefined;
        publicBaseUrl?: string | undefined;
    }, {
        baseUrl?: string | undefined;
        publicBaseUrl?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
    context: {
        messageHistoryLimit?: number | undefined;
        includeSystemMessages?: boolean | undefined;
        maxContextTokens?: number | undefined;
        reserveTokensForResponse?: number | undefined;
        conversationGapMinutes?: number | undefined;
        enableCaching?: boolean | undefined;
        cacheTTLSeconds?: number | undefined;
    };
    shortLinks: {
        defaultExpiryDays?: number | undefined;
        domain?: string | undefined;
    };
    environment: "production" | "development" | "staging";
    chat: {
        smsMaxLength?: number | undefined;
        contextMinutes?: number | undefined;
    };
    messaging: {
        provider?: "twilio" | "local" | undefined;
    };
    features: {
        agentLogging?: boolean | undefined;
        enableConversationStorage?: boolean | undefined;
    };
    conversation: {
        maxLength?: number | undefined;
        timeoutMinutes?: number | undefined;
        inactiveThresholdDays?: number | undefined;
    };
    stripe: {
        priceId: string;
    };
    admin: {
        phoneNumbers?: string[] | undefined;
        maxRequestsPerWindow?: number | undefined;
        rateLimitWindowMinutes?: number | undefined;
        codeExpiryMinutes?: number | undefined;
        codeLength?: number | undefined;
        devBypassCode?: string | undefined;
    };
    urls: {
        baseUrl?: string | undefined;
        publicBaseUrl?: string | undefined;
    };
}>;
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
//# sourceMappingURL=schema.d.ts.map