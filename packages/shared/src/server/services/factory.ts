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
import { createRepositories, type RepositoryContainer } from '../repositories/factory';

// Import service classes that we'll wrap
import { UserService } from './user/userService';
import { FitnessProfileService } from './user/fitnessProfileService';
import { MessageService } from './messaging/messageService';
import { DailyMessageService } from './orchestration/dailyMessageService';
import { WeeklyMessageService } from './orchestration/weeklyMessageService';
import { DayConfigService } from './calendar/dayConfigService';

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

  // Service instances would go here if we fully refactored them
  // For now, use repos directly or call service static methods with ctx
}

// Cache service containers by environment mode
const containerCache = new Map<string, ServiceContainer>();

/**
 * Get a service container for the given environment context
 *
 * @param ctx - Environment context with db, twilio, stripe connections
 * @returns Service container with context-aware services
 */
export function getServices(ctx: EnvironmentContext): ServiceContainer {
  const cacheKey = ctx.mode;

  // Return cached container if available
  const cached = containerCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Create new service container
  const container: ServiceContainer = {
    repos: createRepositories(ctx.db),
    ctx,
  };

  // Cache for reuse
  containerCache.set(cacheKey, container);
  return container;
}

/**
 * Clear the service container cache (for testing)
 */
export function clearServiceCache(): void {
  containerCache.clear();
}

/**
 * Helper type for services that accept context
 */
export type WithContext<T> = T & { ctx: EnvironmentContext };
