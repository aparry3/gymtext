/**
 * Reset env cache (useful for testing).
 */
export declare function resetPublicEnv(): void;
export declare function getPublicUrls(): {
    baseUrl: string | undefined;
};
export declare function getAnalyticsConfig(): {
    writeKey: string | undefined;
    isEnabled: boolean;
};
export declare function getPublicStripeConfig(): {
    publishableKey: string | undefined;
};
/**
 * Check if running in production environment.
 * Safe for use in client components.
 */
export declare function isProductionEnvironment(): boolean;
/**
 * Check if running in development environment.
 * Safe for use in client components.
 */
export declare function isDevelopmentEnvironment(): boolean;
//# sourceMappingURL=public.d.ts.map