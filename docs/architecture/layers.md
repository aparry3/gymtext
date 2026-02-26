# Layer Separation

## Overview

GymText follows a clean layered architecture: **Routes → Orchestration Services → Agent Services → Domain Services → Repositories → Connections**. Each layer has clear responsibilities and dependency rules.

```
┌─────────────────────────────────────────────────────────────┐
│ Routes Layer (HTTP Entry Points)                            │
│ - Request validation, context creation, response formatting │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│ Orchestration Services (Workflow Coordination)              │
│ - Multi-service coordination, agent invocation orchestration│
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│ Agent Services (Agent Wrapping)                             │
│ - Domain-specific agentRunner.invoke() calls               │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│ Domain Services (Business Logic)                            │
│ - 16 subdomain folders, specific domain implementations    │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│ Repositories (Data Access Layer)                            │
│ - Type-safe database operations via Kysely                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│ Connections (External Services)                             │
│ - Database, Twilio, Stripe, Pinecone, Blob Storage, etc.   │
└─────────────────────────────────────────────────────────────┘
```

## Routes Layer

### Web API Routes (`apps/web/src/app/api/`)

Consumer-facing API with ~16 route groups:

| Route Group | Purpose | Key Responsibilities |
|------------|---------|------------------|
| `/api/auth/` | User authentication | Login, SMS code verification, logout, session management |
| `/api/blog/` | Blog content | Blog delivery, search, metadata retrieval |
| `/api/checkout/` | Stripe checkout | Create checkout sessions, manage billing |
| `/api/cron/` | Scheduled jobs | Daily messages, weekly messages, queue monitoring, log cleanup |
| `/api/health/` | Health checks | System status, readiness probes |
| `/api/inngest/` | Workflow management | Inngest event handling, queue coordination |
| `/api/messages/` | SMS streaming | Message streaming via SSE, delivery status |
| `/api/short-links/` | URL shortening | Generate and manage short links |
| `/api/start/` | Onboarding flow | Questions, fitness profile setup, initial state |
| `/api/stripe/` | Stripe webhooks | Subscription events, payment confirmations |
| `/api/track/` | Analytics | Event tracking, user behavior metrics |
| `/api/twilio/` | SMS/WhatsApp webhooks | Inbound SMS, delivery receipts, status updates |
| `/api/users/` | User management | Profile, fitness plans, workouts, microcycles |
| `/api/whatsapp/` | WhatsApp webhooks | WhatsApp message delivery, status updates |
| `/api/whatsapp-cloud/` | WhatsApp Cloud API | Cloud API webhook handling |

### Admin API Routes (`apps/admin/src/app/api/`)

Admin portal with ~11 route groups:

| Route Group | Purpose | Key Responsibilities |
|------------|---------|------------------|
| `/api/auth/` | Admin authentication | Phone verification, SMS codes, session management |
| `/api/agents/` | Agent definition CRUD | Create/update/delete agent definitions, version management |
| `/api/agent-logs/` | Agent observability | Agent invocation history, execution analysis, debugging |
| `/api/dashboard/` | Admin analytics | User metrics, revenue, engagement, system health |
| `/api/exercises/` | Exercise management | Exercise CRUD, ranking, aliasing, usage metrics |
| `/api/enrollments/` | Program enrollment | Manage user program enrollments, assignment |
| `/api/messages/` | Message queue | View queue status, trigger delivery, cleanup |
| `/api/program-owners/` | Program owner CRUD | Create/update program owners, image uploads |
| `/api/programs/` | Program management | Program CRUD, versions, enrollment listing |
| `/api/users/` | User admin tools | User lookup, chat impersonation, cron triggers |
| `/api/cron/trigger` | Manual job triggers | Trigger scheduled jobs on-demand |

### Programs API Routes (`apps/programs/src/app/api/`)

Partner portal with ~3 route groups:

| Route Group | Domain | Purpose |
|------------|--------|---------|
| `/api/auth/` | Authentication | SMS verification (request-code, verify-code, logout) |
| `/api/programs/` | Programs | Program CRUD, versions, enrollment questions, template generation |
| `/api/blog/` | Content | Blog CRUD, publish/unpublish, image upload, AI metadata generation |

**Route Responsibilities** (all routes follow these patterns):
- Parse and validate HTTP request (body, query params, headers)
- Create environment context via `createEnvContext()` or `createProductionContext()`
- Instantiate service container via `getServices(ctx)`
- Delegate business logic to appropriate orchestration or domain service
- Format and return HTTP response (JSON, SSE, file, etc.)
- Handle errors and return appropriate HTTP status codes
- **Stateless**: Routes do not perform business logic or maintain state

## Orchestration Services (`services/orchestration/`)

High-level services that coordinate multiple domain services and agents for complex workflows. These are the main entry points called by API routes.

| Service | File | Purpose | Key Dependencies |
|---------|------|---------|-----------------|
| `ChatService` | `chat.ts` | Main chat interactions with agent tools | message, user, markdown, agentRunner, trainingService |
| `TrainingService` | `training.ts` | Workout/training generation and retrieval | user, markdown, agentRunner, workoutInstance, shortLink |
| `DailyMessageService` | `daily.ts` | Daily scheduled message delivery | user, messagingOrchestrator, dayConfig, trainingService |
| `WeeklyMessageService` | `weekly.ts` | Weekly scheduled message delivery | user, messagingOrchestrator, trainingService, markdown, messagingAgent |
| `OnboardingService` | `onboarding.ts` | Onboarding flow orchestration | markdown, trainingService, messagingOrchestrator, messagingAgent |
| `OnboardingCoordinator` | `onboardingCoordinator.ts` | Onboarding state management | onboardingData, user, onboarding, subscription |
| `ModificationService` | `modifications.ts` | Routes modifications to handlers | user, workoutModification, planModification |
| `MessagingOrchestrator` | `messagingOrchestrator.ts` | Message queue coordination | message, queue, user, subscription |

**Key Pattern**: Orchestration services never directly instantiate LLMs or call agents directly. Instead, they call **Agent Services** which wrap `agentRunner.invoke()`.

### ChatService Example

```typescript
// Route calls ChatService
const response = await chatService.handleMessage(user, message, context);

// ChatService orchestrates:
1. Calls profileService.updateIfNeeded() for profile extraction
2. Calls trainingService.getOrGenerateWorkout() for current workout
3. Calls agentRunner.invoke('chat:generate', {...}) through agent service
4. Calls workoutModificationService if agent triggered modifications
5. Queues response message via messagingOrchestrator
```

## Agent Services (`services/agents/`)

Thin wrappers around `agentRunner.invoke()` that add domain-specific logic and context resolution. These are called by orchestration services, never by routes directly.

| Service | File | Agents Used | Purpose |
|---------|------|-------------|---------|
| `ProfileService` | `profile.ts` | `profile:update`, `profile:user` | Extract and update user fitness profiles from messages |
| `WorkoutModificationService` | `workoutModification.ts` | `workout:modify`, `week:modify` | Handle user requests to modify workouts or weekly patterns |
| `PlanModificationService` | `planModification.ts` | `plan:modify` | Handle plan-level modifications and program changes |
| `MessagingAgentService` | `messagingAgent.ts` | `messaging:plan-summary`, `messaging:plan-ready` | Generate notification messages (supports SSE streaming) |
| `ProgramAgentService` | `programAgent.ts` | `program:parse` | Parse programs from raw text input |
| `BlogMetadataAgentService` | `blogMetadata.ts` | `blog:metadata` | Extract blog metadata for indexing and display |

**Key Pattern**: Each agent service follows this structure:
```typescript
async function invoke(params) {
  // Resolve domain-specific context
  const context = { user, profile, workout, ... };

  // Call agentRunner with agent ID and context
  const result = await agentRunner.invoke('agent:id', {
    input: params.input,
    params: context,
  });

  // Post-process agent output (validation, persistence, formatting)
  return processedResult;
}
```

## Domain Services (`services/domain/`)

Implement business logic for specific domains. Organized into 16 subdomain folders:

| Folder | Services | Purpose |
|--------|----------|---------|
| `auth/` | adminAuthService, userAuthService, programOwnerAuthService | Authentication, authorization, session management |
| `user/` | userService, fitnessProfileService, onboardingDataService, signupDataFormatter | User account management, profile data, onboarding state |
| `training/` | fitnessPlanService, microcycleService, progressService, exerciseMetricsService, workoutInstanceService | Training data: plans, cycles, workouts, progress tracking |
| `messaging/` | messageService, messageQueueService | Message storage, queue management, delivery tracking |
| `program/` | programOwnerService, programService, enrollmentService, programVersionService | Fitness programs, ownership, user enrollments |
| `subscription/` | subscriptionService | Stripe subscription lifecycle, billing |
| `referral/` | referralService | Referral program tracking and rewards |
| `agents/` | agentDefinitionService, agentLogService | Agent definition CRUD, invocation history, observability |
| `exercise/` | exerciseResolutionService | Exercise name resolution, aliasing, standardization |
| `calendar/` | dayConfigService | Training day configuration, week scheduling |
| `blog/` | blogService | Blog post management, publishing, search |
| `organization/` | organizationService | Organization management and multi-tenancy |
| `links/` | shortLinkService | URL shortening and tracking |
| `markdown/` | markdownService | Markdown rendering, parsing, template substitution |

**Key Responsibilities**:
- Implement domain-specific business rules
- Coordinate with repositories for data access
- No HTTP concerns (no request/response handling)
- No LLM calls (delegate to agent services)
- Return domain models and errors clearly

**Example**: `userService.findActiveUsers()` calls `userRepository.findBy({status: 'active'})` and applies business logic filters.

## Repositories (`repositories/`)

Type-safe data access layer providing 30+ repositories. All extend `BaseRepository` for common CRUD operations.

### Base Repository Pattern

```typescript
export class BaseRepository {
  async findById(id: string): Promise<T | undefined>;
  async findAll(): Promise<T[]>;
  async create(data: CreateInput): Promise<T>;
  async update(id: string, data: UpdateInput): Promise<T>;
  async delete(id: string): Promise<void>;
  async findBy(filters: Record<string, any>): Promise<T[]>;
  async count(): Promise<number>;
}
```

### Key Repositories (30+)

| Category | Repositories |
|----------|--------------|
| User | `user`, `profile`, `profileUpdate`, `userAuth` |
| Training | `fitnessPlan`, `microcycle`, `workoutInstance`, `exerciseMetrics`, `movement` |
| Messaging | `message`, `messageQueue` |
| Program | `program`, `programOwner`, `programEnrollment`, `programVersion`, `programFamily` |
| Exercise | `exercise`, `exerciseAlias`, `exerciseUse` |
| Configuration | `agentDefinition`, `agentLog`, `dayConfig`, `onboarding` |
| Billing | `subscription` |
| Content | `blogPost`, `shortLink` |
| Support | `organization`, `adminActivityLog`, `eventLog`, `pageVisit`, `uploadedImage`, `referral` |

**Factory** (`repositories/factory.ts`):
- Creates all repositories with WeakMap caching by Kysely instance
- Ensures single repository instance per DB connection
- Type-safe repository access via `createRepositories(db)`

**Key Pattern**: Repositories use Kysely for type-safe SQL queries with generated TypeScript types from schema codegen.

```typescript
// Type-safe query with Kysely
const users = await repos.user
  .find()
  .selectAll()
  .where('status', '=', 'active')
  .execute();
```

## Connections (`connections/`)

External service factories with connection pooling and environment-aware caching:

| Connection | Factory | Caching | Environment-Aware |
|-----------|---------|---------|-------------------|
| PostgreSQL | `postgres/factory.ts` | By connection string, max 10 clients/pool | Yes (sandbox/prod) |
| Twilio | `twilio/factory.ts` | By account SID | Yes (sandbox/prod) |
| Stripe | `stripe/factory.ts` | By secret key prefix (first 20 chars) | Yes (sandbox/prod) |
| Pinecone | `pinecone/vector.ts` | Singleton with userId namespacing | No (always prod) |
| Blob Storage | `storage/storage.ts` | Vercel Blob (public) | No (always prod) |
| Inngest | `inngest/client.ts` | Singleton | No (always prod) |
| Messaging | `messaging/factory.ts` | Selects Twilio/WhatsApp/local implementation | Partial |

### Environment Context Pattern

```typescript
// Web app (always production)
const ctx = await createProductionContext();

// Admin app (respects environment toggle)
const ctx = await createEnvContext();  // Reads X-Gymtext-Env header

// ctx contains environment-specific connections:
const { db, twilioClient, stripeClient } = ctx;
```

**Connection Pooling**: PostgreSQL maintains up to 10 clients per pool with statement caching. Twilio and Stripe clients are reused by account/key. Pinecone uses a singleton with per-user vector namespacing.

## Dependency Rules

### Allowed Dependencies

```
Routes
  ↓
Orchestration Services
  ↓
Agent Services
  ↓
Domain Services
  ↓
Repositories
  ↓
Connections
```

### Forbidden Patterns

- **Routes → Domain Services**: Must go through Orchestration Services
- **Routes → Repositories**: Must go through Domain Services
- **Routes → LLM/Agents**: Must go through Agent Services (via Orchestration)
- **Domain Services → Routes**: No HTTP concerns in domain layer
- **Repositories → Business Logic**: Repositories are pure data access
- **Services → Direct LLM instantiation**: Always use `agentRunner.invoke()`

### Circular Dependency Breaking

The agent system uses **lazy service injection** to break circular dependencies:

```typescript
// agentRunner receives getServices lambda to defer service instantiation
const runner = new AgentRunner(async () => {
  return createServices(ctx);  // Called only when needed
});

// Tools can now call any service without circular imports
```

## Chat Message Lifecycle

### Request Flow Diagram

```
User
  │
  ├─ SMS to Twilio
  │
Twilio (Cloud Infrastructure)
  │
  └─ POST /api/twilio/sms (WebAPI Route)
      │
      ├─ createProductionContext()
      │   └─ Returns: { db, twilioClient, stripeClient, ... }
      │
      ├─ getServices(ctx)
      │   └─ Returns: { chatService, userService, ... agentRunner }
      │
      ├─ ChatService.handleMessage(user, message)
      │   │
      │   ├─ Resolve context (currentWorkout, dateContext)
      │   │
      │   ├─ AgentRunner.invoke('chat:generate', params)
      │   │   │
      │   │   ├─ Fetch agent definition from DB (cached 5min)
      │   │   │
      │   │   ├─ Resolve context types via ContextRegistry
      │   │   │
      │   │   ├─ Resolve tools via ToolRegistry
      │   │   │   ├─ get_workout → TrainingService.getOrGenerateWorkout()
      │   │   │   ├─ update_profile → ProfileService.updateProfile()
      │   │   │   └─ make_modification → ModificationService.route()
      │   │   │
      │   │   ├─ LLM invocation (OpenAI/Gemini)
      │   │   │   ├─ Tool call: get_workout
      │   │   │   │   └─ Returns workout data
      │   │   │   │
      │   │   │   ├─ Tool call: update_profile
      │   │   │   │   └─ Persists profile changes
      │   │   │   │
      │   │   │   └─ Final response generation
      │   │   │
      │   │   └─ Log invocation to agent_logs table
      │   │
      │   └─ MessagingOrchestrator.queueMessage(response)
      │       │
      │       ├─ MessageService.create(message)
      │       │
      │       └─ MessageQueueService.enqueue(message)
      │
      └─ Twilio/SMS Gateway
          │
          └─ SMS to User

(Async Background Job)
  │
  ├─ MessageQueue worker (Inngest)
  │
  ├─ Twilio.sendSMS(message)
  │
  └─ Delivery receipt → /api/twilio/status
```

### Sequence Diagram (Detailed)

```
User                 Twilio           WebAPI            Services          Agent           LLM
 │                     │                 │                 │                │             │
 ├─ SMS message ──────>│                 │                 │                │             │
 │                     │                 │                 │                │             │
 │                     ├─ POST /api/twilio/sms              │                │             │
 │                     │────────────────>│                 │                │             │
 │                     │                 │                 │                │             │
 │                     │                 ├─ createProductionContext()        │             │
 │                     │                 │                 │                │             │
 │                     │                 ├─ getServices(ctx)                │             │
 │                     │                 │                 │                │             │
 │                     │                 ├─ ChatService.handleMessage()      │             │
 │                     │                 ├────────────────>│                │             │
 │                     │                 │                 │                │             │
 │                     │                 │                 ├─ AgentRunner.invoke()       │
 │                     │                 │                 ├──────────────>│             │
 │                     │                 │                 │                │             │
 │                     │                 │                 │                ├─ DB lookup │
 │                     │                 │                 │                │<──────┐   │
 │                     │                 │                 │                │       └─┬─┘
 │                     │                 │                 │                │         │
 │                     │                 │                 │                ├─ Tool registry resolve
 │                     │                 │                 │                │         │
 │                     │                 │                 │                ├─ LLM.invoke()
 │                     │                 │                 │                ├─────────────>│
 │                     │                 │                 │                │         │   │
 │                     │                 │                 │                │<────────┤   │
 │                     │                 │                 │                │  tools  │   │
 │                     │                 │                 │                │         │   │
 │                     │                 │                 │<──────────────┤ result  │   │
 │                     │                 │<────────────────┤─────────────────────────┤   │
 │                     │                 │                 │                │         │   │
 │                     │                 ├─ MessagingOrchestrator.queue()    │         │   │
 │                     │                 │                 │                │         │   │
 │                     │                 ├─ 200 OK         │                │         │   │
 │                     │<────────────────┤                 │                │         │   │
 │                     │                 │                 │                │         │   │
 │                     │ (Async)         │                 │                │         │   │
 │                     │ Inngest queue   │                 │                │         │   │
 │                     │<─────────────────────────────────────────────────────────────────┤
 │                     │                 │                 │                │         │   │
 │                     ├─ sendSMS()      │                 │                │         │   │
 │                     │                 │                 │                │         │   │
 │<─ SMS response ─────┤                 │                 │                │         │   │
 │                     │                 │                 │                │         │   │
 │                     ├─ Status receipt │                 │                │         │   │
 │                     │────────────────>│ /api/twilio/status               │         │   │
 │                     │                 │                 │                │         │   │
```

## Key Patterns and Principles

### 1. Service Locator Pattern
Routes and services receive a service container with all dependencies:
```typescript
const services = getServices(ctx);
await services.chatService.handleMessage(...);
```

### 2. Repository Pattern
All database access goes through repositories:
```typescript
const user = await repos.user.findById(userId);
```

### 3. Factory Pattern
Connections use factories for environment switching:
```typescript
const db = createDatabase(connectionString);
const twilio = createTwilioClient(credentials);
```

### 4. Lazy Service Injection
Breaking circular dependencies:
```typescript
const runner = new AgentRunner(() => createServices(ctx));
```

### 5. Database-Driven Agents
Agent definitions stored in DB, executed via code-side registries:
```typescript
const def = await agentRunner.invoke('chat:generate', {...});
```

### 6. No Direct LLM Instantiation
Services never call LLM libraries directly:
```typescript
// ✗ WRONG
const response = await openai.createChatCompletion(...);

// ✓ CORRECT
const response = await agentRunner.invoke('agent:id', {...});
```

## Testing Considerations

### Testing by Layer

| Layer | Strategy | Example |
|-------|----------|---------|
| Routes | Mock services, test HTTP handling | Mock chatService, verify response format |
| Orchestration | Mock domain services and agents | Mock agentRunner.invoke() |
| Agent Services | Mock agentRunner, test wrapping logic | Verify context resolution |
| Domain Services | Use real repositories, mock external calls | Real DB in test, mock Stripe |
| Repositories | Use test database or mocks | Integration tests with test DB |
| Connections | Mock or test with real credentials | Test with Vercel Blob in CI |

### Isolation Principles
- Each layer can be tested independently
- Mock dependencies at layer boundaries
- Use repository factories for test DB access
- Use test personas for user-specific testing

## Summary

GymText's layered architecture ensures:
- **Clear separation of concerns**: Each layer has single responsibility
- **Testability**: Layers can be tested independently
- **Maintainability**: Changes localized to appropriate layer
- **Scalability**: Easy to add features without affecting existing layers
- **Type safety**: Full TypeScript with Kysely codegen throughout
- **No circular dependencies**: Lazy injection and one-way flow
- **Reusability**: Services can be composed by orchestration layer

The flow is always: **Routes → Orchestration → Agents → Domain Services → Repositories → Connections**

Never skip layers or create shortcuts across the architecture.
