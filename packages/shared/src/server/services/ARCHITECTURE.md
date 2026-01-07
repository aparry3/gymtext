# Service Layer Architecture

This document describes the service layer architecture after the migration from singleton patterns to factory-based dependency injection.

## Overview

The service layer uses a **factory pattern with dependency injection** to create service instances. This approach:

- Eliminates circular dependencies through proper dependency ordering
- Supports environment switching (production/sandbox) in the admin app
- Makes services testable by allowing mock injection
- Removes all singleton patterns and lazy `require()` imports

## Service Container

All services are created through the `ServiceContainer` via factory functions:

```typescript
import { createServicesFromDb } from '@/server/services';
import { postgresDb } from '@/server/connections/postgres/postgres';

const services = createServicesFromDb(postgresDb);

// Access services
const user = await services.user.getUser(userId);
const plan = await services.fitnessPlan.getCurrentPlan(userId);
```

### Available Services

| Service | Description |
|---------|-------------|
| `user` | User management and preferences |
| `fitnessProfile` | Fitness profile CRUD operations |
| `onboardingData` | Onboarding state management |
| `message` | SMS message handling |
| `messageQueue` | Message queue processing |
| `fitnessPlan` | Fitness plan generation and management |
| `workoutInstance` | Workout generation and tracking |
| `microcycle` | Weekly training pattern management |
| `progress` | Training progress calculation |
| `subscription` | Stripe subscription management |
| `dayConfig` | Day-specific configuration |
| `shortLink` | Short URL generation |
| `prompt` | AI prompt management |
| `referral` | Referral code handling |
| `adminAuth` | Admin authentication |
| `userAuth` | User authentication |
| `dailyMessage` | Daily workout message orchestration |
| `weeklyMessage` | Weekly summary message orchestration |
| `onboarding` | Onboarding flow orchestration |
| `onboardingCoordinator` | Onboarding message coordination |
| `chainRunner` | Multi-step AI chain execution |
| `messagingAgent` | Messaging AI agent |
| `workoutModification` | Workout modification handling |
| `planModification` | Plan modification handling |
| `modification` | Modification orchestration service |
| `contextService` | AI context building |

## Dependency Ordering

Services are created in phases to handle dependencies properly:

```
Phase 1: Core Services (repos only)
├── user
├── fitnessProfile
├── onboardingData
├── fitnessPlan
├── workoutInstance
├── microcycle
├── progress
├── subscription
├── dayConfig
├── shortLink
└── prompt

Phase 2: Context Service
└── contextService (needs: fitnessPlan, workoutInstance, microcycle, fitnessProfile)

Phase 3: Services with Service Dependencies
├── message (needs: user, workoutInstance, contextService)
├── referral (needs: stripeClient)
├── adminAuth (needs: twilioClient)
├── userAuth (needs: twilioClient, adminAuth)
└── messageQueue (needs: message, user, twilioClient)

Phase 4: Orchestration Services
├── messagingAgent
├── dailyMessage (needs: user, workoutInstance, messageQueue, dayConfig, contextService)
├── weeklyMessage (needs: user, message, progress, fitnessPlan, messagingAgent)
├── onboarding (needs: fitnessPlan, progress, workoutInstance, dailyMessage, messageQueue, messagingAgent)
└── onboardingCoordinator (needs: onboardingData, user, onboarding)

Phase 5: Modification & Chain Services
├── workoutModification (needs: user, microcycle, workoutInstance, progress, fitnessPlan, contextService)
├── planModification (needs: user, fitnessPlan, workoutModification, contextService)
├── modification (needs: user, workoutInstance, workoutModification, planModification)
└── chainRunner (needs: fitnessPlan, microcycle, workoutInstance, user, fitnessProfile, contextService)
```

## External Client Injection

For environment switching, external clients (Stripe, Twilio) can be injected:

```typescript
import { createServices } from '@/server/services';
import { createRepositories } from '@/server/repositories/factory';

const repos = createRepositories(ctx.db);
const services = createServices(repos, {
  stripeClient: ctx.stripeClient,
  twilioClient: ctx.twilioClient,
});
```

## Creating Individual Services

Each service has a factory function for custom creation:

```typescript
import { createUserService } from '@/server/services';
import { createRepositories } from '@/server/repositories/factory';

const repos = createRepositories(db);
const userService = createUserService(repos);
```

## Agent Services

Agent services orchestrate AI operations and follow the same factory pattern:

### ChatService

```typescript
import { createChatService } from '@/server/services';

const chatService = createChatService({
  message: services.message,
  user: services.user,
  workoutInstance: services.workoutInstance,
  modification: services.modification,
  contextService: services.contextService,
});

const responses = await chatService.handleIncomingMessage(user);
```

### ModificationService

```typescript
import { createModificationService } from '@/server/services';

const modificationService = createModificationService({
  user: services.user,
  workoutInstance: services.workoutInstance,
  workoutModification: services.workoutModification,
  planModification: services.planModification,
});

const result = await modificationService.makeModification(userId, message);
```

### ProfileService

```typescript
import { createProfileService } from '@/server/services';

const profileService = createProfileService({
  user: services.user,
  fitnessProfile: services.fitnessProfile,
  workoutInstance: services.workoutInstance,
});

const result = await profileService.updateProfile(userId, message);
```

## Inngest Functions

Inngest functions create services at module level for reuse:

```typescript
// processMessage.ts
import { createServicesFromDb, createChatService } from '@/server/services';
import { postgresDb } from '@/server/connections/postgres/postgres';

const services = createServicesFromDb(postgresDb);
const chatService = createChatService({
  message: services.message,
  user: services.user,
  workoutInstance: services.workoutInstance,
  modification: services.modification,
  contextService: services.contextService,
});

export const processMessageFunction = inngest.createFunction(
  { id: 'process-message', ... },
  { event: 'message/received' },
  async ({ event, step }) => {
    // Use services and chatService here
  }
);
```

## Lazy Loading Pattern

For services that need to break circular dependencies, lazy loading is used with the factory:

```typescript
const getServices = async () => {
  const { createServicesFromDb } = await import('../factory');
  const { postgresDb } = await import('@/server/connections/postgres/postgres');
  return createServicesFromDb(postgresDb);
};

const getUserService = async (): Promise<UserServiceInstance> => {
  if (!userService) {
    const services = await getServices();
    userService = services.user;
  }
  return userService;
};
```

## Legacy Support

During migration, some classes maintain backward compatibility with warnings:

```typescript
// Legacy usage (deprecated)
const chatService = new ChatService(contextService);

// Logs: "[ChatService] Using deprecated class-based ChatService. Migrate to createChatService(deps)."
```

## Type Exports

All service instance types are exported for type annotations:

```typescript
import type {
  UserServiceInstance,
  MessageServiceInstance,
  FitnessPlanServiceInstance,
  ServiceContainer,
} from '@/server/services';

function myFunction(services: ServiceContainer) {
  // Type-safe access to all services
}
```

## Best Practices

1. **Use the ServiceContainer** - Access services through `createServicesFromDb()` rather than creating individual services
2. **Inject dependencies** - Pass services as dependencies rather than importing them directly
3. **Avoid lazy imports** - If you need a service, add it to your factory's dependencies
4. **Type your dependencies** - Use the `*ServiceInstance` types for proper type checking
5. **Module-level creation** - In Inngest functions, create services at module level for efficiency
