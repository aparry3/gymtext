/**
 * Server Settings
 *
 * Non-secret server-only settings.
 * For app config (admin, urls, etc.), use shared/config instead.
 */
import { getServerEnv } from './env';
// =============================================================================
// Environment Detection
// =============================================================================
export function getEnvironmentSettings() {
    const env = getServerEnv();
    return {
        nodeEnv: env.NODE_ENV,
        appEnv: env.APP_ENV,
        isDevelopment: env.NODE_ENV === 'development',
        isProduction: env.NODE_ENV === 'production',
        isTest: env.NODE_ENV === 'test',
    };
}
