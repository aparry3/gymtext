/**
 * Service Factory
 *
 * Creates service instances with a specific environment context.
 * Used for environment switching in the admin app.
 *
 * This factory provides context-aware versions of services that need
 * database, Twilio, or Stripe access. Services created through this
 * factory will use the context's connections instead of the default singletons.
 *
 * @example
 * const ctx = await createEnvContext();
 * const services = getServices(ctx);
 * await services.user.getUser(userId);
 */
import type { EnvironmentContext } from '../context/types';
import { type RepositoryContainer } from '../repositories/factory';
/**
 * Service container with context-aware service instances
 *
 * Note: Some services are stateless static classes (ChatService, ProfileService, etc.)
 * and don't need context wrapping - they get context passed to their methods.
 *
 * This container provides the main data-access services that benefit from
 * being instantiated with a specific database connection.
 */
export interface ServiceContainer {
    /** Repository container for direct data access */
    repos: RepositoryContainer;
    /** Context for accessing connections directly */
    ctx: EnvironmentContext;
}
/**
 * Get a service container for the given environment context
 *
 * @param ctx - Environment context with db, twilio, stripe connections
 * @returns Service container with context-aware services
 */
export declare function getServices(ctx: EnvironmentContext): ServiceContainer;
/**
 * Clear the service container cache (for testing)
 */
export declare function clearServiceCache(): void;
/**
 * Helper type for services that accept context
 */
export type WithContext<T> = T & {
    ctx: EnvironmentContext;
};
//# sourceMappingURL=factory.d.ts.map