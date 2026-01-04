import { type AppConfig } from './schema';
export type Environment = 'development' | 'staging' | 'production';
/**
 * Determine current environment.
 * APP_ENV can override NODE_ENV (useful for staging which isn't a Node concept).
 */
export declare function getEnvironment(): Environment;
/**
 * Load and validate configuration.
 * Builds config from env vars, letting Zod schemas handle defaults.
 * Throws on validation failure (fail-fast).
 */
export declare function loadConfig(): AppConfig;
/**
 * Get the validated application config.
 * Caches the result for subsequent calls.
 */
export declare function getConfig(): AppConfig;
/**
 * Reset config cache (useful for testing).
 */
export declare function resetConfig(): void;
//# sourceMappingURL=loader.d.ts.map