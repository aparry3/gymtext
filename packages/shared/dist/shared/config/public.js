/**
 * Public Configuration
 *
 * Safe for client-side usage. All NEXT_PUBLIC_* values are validated here.
 */
import { z } from 'zod';
// =============================================================================
// Public Environment Schema
// =============================================================================
const PublicEnvSchema = z.object({
    NEXT_PUBLIC_BASE_URL: z.string().optional(),
    NEXT_PUBLIC_ANALYTICS_WRITE_KEY: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});
// =============================================================================
// Validation & Caching
// =============================================================================
let _publicEnv = null;
function getPublicEnv() {
    if (!_publicEnv) {
        const result = PublicEnvSchema.safeParse({
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
            NEXT_PUBLIC_ANALYTICS_WRITE_KEY: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        });
        if (!result.success) {
            console.warn('Public environment validation warnings:', result.error.errors);
        }
        _publicEnv = result.data ?? {};
    }
    return _publicEnv;
}
/**
 * Reset env cache (useful for testing).
 */
export function resetPublicEnv() {
    _publicEnv = null;
}
// =============================================================================
// URL Settings
// =============================================================================
export function getPublicUrls() {
    const env = getPublicEnv();
    return {
        baseUrl: env.NEXT_PUBLIC_BASE_URL,
    };
}
// =============================================================================
// Analytics Config
// =============================================================================
export function getAnalyticsConfig() {
    const env = getPublicEnv();
    return {
        writeKey: env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
        isEnabled: Boolean(env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY),
    };
}
// =============================================================================
// Public Stripe Config
// =============================================================================
export function getPublicStripeConfig() {
    const env = getPublicEnv();
    return {
        publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    };
}
// =============================================================================
// Environment Detection (client-safe)
// =============================================================================
/**
 * Check if running in production environment.
 * Safe for use in client components.
 */
export function isProductionEnvironment() {
    return process.env.NODE_ENV === 'production';
}
/**
 * Check if running in development environment.
 * Safe for use in client components.
 */
export function isDevelopmentEnvironment() {
    return process.env.NODE_ENV === 'development';
}
