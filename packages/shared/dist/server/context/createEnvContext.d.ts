import type { EnvironmentContext, EnvironmentMode } from './types';
/**
 * Create an environment context for the current request
 *
 * @param overrideMode - Optional mode to override header-based detection
 * @returns EnvironmentContext for the specified environment
 */
export declare function createEnvContext(overrideMode?: EnvironmentMode): Promise<EnvironmentContext>;
/**
 * Create a production-only context (for web app)
 * This always returns production context regardless of headers
 */
export declare function createProductionContext(): Promise<EnvironmentContext>;
/**
 * Clear the context cache (for testing)
 */
export declare function clearContextCache(): void;
/**
 * Check if sandbox environment is configured
 * Returns true if SANDBOX_DATABASE_URL is set
 */
export declare function isSandboxConfigured(): boolean;
//# sourceMappingURL=createEnvContext.d.ts.map