# Directory Reorganization Plan

## Current Structure Analysis

### Issues Identified

1. **Mixed concerns in `server/db/`**: Contains both database connection logic and data access patterns
2. **Duplicate database clients**: Both `server/clients/dbClient.ts` and `server/db/postgres/db.ts` create database connections
3. **Mixed types**: Types scattered across `shared/types/`, `server/types/`, and inline in files
4. **Inconsistent data access patterns**: Mix of direct database operations (users.ts) and repository pattern (conversation.repository.ts)
5. **Business logic mixed with data access**: Some files contain both business logic and database operations
6. **Scattered schemas**: Zod schemas in `shared/schemas/` but only a few files
7. **Utils scattered**: Utils in both `shared/utils/` and `server/utils/`

### Current Directory Structure

```
src/
├── shared/
│   ├── config/
│   ├── schemas/          # Zod schemas (incomplete)
│   ├── types/            # Database types + conversation types
│   ├── utils.ts          # Date utilities
│   └── utils/            # Client/server cookie utilities
├── server/
│   ├── agents/           # AI workflow logic
│   ├── clients/          # External API clients (Twilio, Vector, DB)
│   ├── db/               # Mixed: connections + data access
│   │   ├── postgres/     # Direct DB operations
│   │   └── vector/       # Vector DB operations
│   ├── prompts/          # AI prompt templates
│   ├── repositories/     # Repository pattern (partial)
│   ├── services/         # Business logic
│   ├── types/            # Server-specific types
│   └── utils/            # Server utilities
```

## Proposed New Structure

### Core Principles

1. **Clear separation of concerns**
2. **Consistent data access patterns**
3. **Centralized type and schema definitions**
4. **Logical grouping of related functionality**
5. **Scalable architecture**

### New Directory Structure

```
src/
├── shared/
│   ├── types/            # ALL type definitions (database, domain, API)
│   ├── schemas/          # ALL Zod schemas (validation, API contracts)
│   ├── constants/        # Application constants
│   ├── enums/            # Shared enums
│   └── utils/            # Utilities usable by both client and server
├── server/
│   ├── core/             # Core application infrastructure
│   │   ├── database/     # Database connections and configuration
│   │   ├── clients/      # External service clients
│   │   └── config/       # Server configuration
│   ├── data/             # Data access layer
│   │   ├── repositories/ # Repository implementations
│   │   └── models/       # Domain models with business logic
│   ├── services/         # Business logic services
│   │   ├── domain/       # Domain-specific services
│   │   ├── integrations/ # External service integrations
│   │   └── ai/           # AI-related services
│   ├── agents/           # AI workflow orchestration
│   ├── utils/            # Server-only utilities
│   └── types/            # Server-specific types (if any)
```

## File Naming Convention

**All files should follow camelCase naming convention:**
- ✅ `userRepository.ts` (not `user.repository.ts`)
- ✅ `conversationService.ts` (not `conversation.service.ts`)
- ✅ `fitnessOutlineAgent.ts` (not `fitness-outline.agent.ts`)
- ✅ `chatService.ts` (not `chat.service.ts`)

This applies to all files being moved, renamed, or created during the reorganization process.

## Detailed Migration Plan

### Phase 1: Consolidate Types and Schemas

**Target: `src/shared/types/` and `src/shared/schemas/`**

#### Types Consolidation

**Files to move/merge:**
- `src/shared/types/schema.ts` → `src/shared/types/database.ts`
- `src/shared/types/conversation-context.ts` → `src/shared/types/conversation.ts`
- `src/server/types/updateContext.ts` → `src/shared/types/ai.ts`
- `src/server/types/weeklyWorkout.ts` → `src/shared/types/workout.ts`

**New structure:**
```
src/shared/types/
├── database.ts       # Database table types (from schema.ts)
├── conversation.ts   # Conversation and context types
├── user.ts           # User and profile types
├── workout.ts        # Workout and fitness types
├── ai.ts             # AI agent and prompt types
├── api.ts            # API request/response types
├── common.ts         # Common/utility types
└── index.ts          # Export all types
```

#### Schema Consolidation

**Files to create:**
```
src/shared/schemas/
├── user.ts           # User creation/update validation
├── fitness.ts        # Fitness profile validation
├── workout.ts        # Workout validation
├── conversation.ts   # Conversation validation
├── api.ts            # API request/response validation
├── common.ts         # Common validation schemas
└── index.ts          # Export all schemas
```

### Phase 2: Reorganize Database Layer

**Target: `src/server/core/database/` and `src/server/data/`**

#### Database Connections

**New structure:**
```
src/server/core/database/
├── postgres.ts       # PostgreSQL connection (merge dbClient.ts + db.ts)
├── vector.ts         # Vector database connection
└── index.ts          # Export all connections
```

**Files to consolidate:**
- `src/server/clients/dbClient.ts` + `src/server/db/postgres/db.ts` → `src/server/core/database/postgres.ts`
- `src/server/clients/vectorClient.ts` → `src/server/core/database/vector.ts`

#### Data Access Layer

**New structure:**
```
src/server/data/
├── repositories/
│   ├── base.repository.ts     # Base repository (existing)
│   ├── user.repository.ts     # User CRUD operations
│   ├── fitness.repository.ts  # Fitness profile operations
│   ├── workout.repository.ts  # Workout operations
│   ├── conversation.repository.ts  # Existing
│   ├── message.repository.ts      # Existing
│   └── subscription.repository.ts # Subscription operations
└── models/
    ├── user.model.ts         # User domain model with business logic
    ├── fitness.model.ts      # Fitness domain model
    ├── workout.model.ts      # Workout domain model
    └── conversation.model.ts # Conversation domain model
```

**Migration tasks:**
- Move functions from `src/server/db/postgres/users.ts` to `src/server/data/repositories/user.repository.ts`
- Move functions from `src/server/db/postgres/subscriptions.ts` to `src/server/data/repositories/subscription.repository.ts`
- Create domain models that encapsulate business logic

### Phase 3: Reorganize External Clients

**Target: `src/server/core/clients/`**

**New structure:**
```
src/server/core/clients/
├── twilio.ts         # SMS client (existing)
├── stripe.ts         # Payment client (if exists)
├── openai.ts         # AI client configuration
├── google.ts         # Google AI client configuration
└── index.ts          # Export all clients
```

### Phase 4: Reorganize Business Logic

**Target: `src/server/services/`**

#### Services Reorganization

**New structure:**
```
src/server/services/
├── domain/
│   ├── user.service.ts        # User business logic
│   ├── fitness.service.ts     # Fitness business logic
│   ├── workout.service.ts     # Workout business logic
│   └── subscription.service.ts # Subscription business logic
├── integrations/
│   ├── sms.service.ts         # SMS integration service
│   ├── payment.service.ts     # Payment integration service
│   └── notification.service.ts # Notification service
├── ai/
│   ├── chat.service.ts        # Chat AI service (from chat.ts)
│   ├── context.service.ts     # Conversation context service
│   ├── memory.service.ts      # Vector memory service
│   └── prompt.service.ts      # Prompt building service
└── infrastructure/
    ├── conversation-storage.service.ts # Existing
    └── circuit-breaker.service.ts     # Utility service
```

**Migration tasks:**
- Move `src/server/services/chat.ts` → `src/server/services/ai/chat.service.ts`
- Move `src/server/services/conversation-context.ts` → `src/server/services/ai/context.service.ts`
- Move `src/server/services/conversationStorage.ts` → `src/server/services/infrastructure/conversation-storage.service.ts`
- Move `src/server/services/prompt-builder.ts` → `src/server/services/ai/prompt.service.ts`
- Move `src/server/db/vector/memoryTools.ts` → `src/server/services/ai/memory.service.ts`

### Phase 5: Reorganize AI Agents

**Target: `src/server/agents/`**

**Existing structure is good, minor cleanup:**
```
src/server/agents/
├── fitnessOutlineAgent.ts     # Keep current camelCase naming
├── workoutGeneratorAgent.ts   # Keep current camelCase naming
├── workoutUpdateAgent.ts      # Fix typo in workoutUpdateAgentt.ts
├── baseAgent.ts               # Create base agent class
└── index.ts                   # Export all agents
```

### Phase 6: Reorganize Utilities

**Target: `src/shared/utils/` and `src/server/utils/`**

#### Shared Utils

**New structure:**
```
src/shared/utils/
├── dateUtils.ts      # Date utilities (from utils.ts)
├── formatting.ts     # Text formatting utilities
├── validation.ts     # Common validation utilities
├── constants.ts      # Application constants
└── index.ts          # Export all utils
```

#### Server Utils

**New structure:**
```
src/server/utils/
├── circuitBreaker.ts   # Existing
├── tokenManager.ts     # Existing
├── errorHandling.ts    # Error handling utilities
├── logging.ts          # Logging utilities
└── index.ts            # Export all utils
```

## Implementation Strategy

### Step-by-Step Migration

1. **Create new directory structure** (empty folders)
2. **Move and consolidate types** (Phase 1)
3. **Update all imports** to use new type locations
4. **Consolidate database connections** (Phase 2a)
5. **Migrate data access layer** (Phase 2b)
6. **Update imports** for database layer
7. **Move external clients** (Phase 3)
8. **Reorganize services** (Phase 4)
9. **Update agents** (Phase 5)
10. **Clean up utilities** (Phase 6)
11. **Update all imports** throughout application
12. **Test and validate** all functionality

### Import Path Updates

**Before:**
```typescript
import { Database } from '@/shared/types/schema';
import { ConversationContext } from '@/shared/types/conversation-context';
import { db } from '@/server/clients/dbClient';
import { twilioClient } from '@/server/clients/twilio';
```

**After:**
```typescript
import { Database } from '@/shared/types/database';
import { ConversationContext } from '@/shared/types/conversation';
import { postgresDb } from '@/server/core/database/postgres';
import { twilioClient } from '@/server/core/clients/twilio';
```

### Benefits of New Structure

1. **Clear separation of concerns**
2. **Consistent data access patterns**
3. **Centralized type definitions**
4. **Easier testing and mocking**
5. **Better code organization**
6. **Improved maintainability**
7. **Clearer dependencies**
8. **Reduced code duplication**

### Risks and Considerations

1. **Large-scale refactoring** - requires careful testing
2. **Import updates** - need to update all import statements
3. **Build process** - may need to update build configurations
4. **Team coordination** - should be done in phases with team coordination
5. **Testing** - comprehensive testing required after each phase

### Next Steps

1. **Review and approve** this plan
2. **Create feature branch** for reorganization
3. **Implement in phases** as outlined above
4. **Update documentation** as structure changes
5. **Comprehensive testing** after each phase
6. **Team review** before merging

This reorganization will create a much more maintainable and scalable codebase with clear separation of concerns and consistent patterns throughout the application.