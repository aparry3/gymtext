# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GymText is a personalized fitness coaching application that delivers workout plans via SMS. It uses AI to provide intelligent coaching conversations and generates customized fitness plans based on user profiles.

This is a **monorepo** with two deployable Next.js applications and a shared package:
- **apps/web** - Consumer-facing app (gymtext.com)
- **apps/admin** - Admin portal (admin.gymtext.com)
- **packages/shared** - `@gymtext/shared` package with all server logic

## Essential Commands

```bash
# Development
pnpm dev                # Start all apps via Turborepo
pnpm dev:web            # Start consumer app (localhost:3000)
pnpm dev:admin          # Start admin portal (localhost:3001)

# Building
pnpm build              # Build all apps
pnpm build:web          # Build consumer app only
pnpm build:admin        # Build admin portal only
pnpm lint               # Run ESLint on all apps

# Database Management
pnpm db:codegen         # Generate TypeScript types from PostgreSQL schema
pnpm migrate:create     # Create new migration (interactive)
pnpm migrate:up         # Apply pending migrations
pnpm migrate:down       # Rollback last migration

# Testing
pnpm test               # Run Vitest tests
pnpm test:ui            # Run tests with Vitest UI
pnpm sms:test           # Test SMS functionality (requires Twilio config)
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API routes, PostgreSQL with Kysely ORM
- **Monorepo**: pnpm workspaces, Turborepo
- **AI/LLM**: LangChain with OpenAI and Google Gemini
- **External Services**: Twilio (SMS), Stripe (payments), Pinecone (vector DB)

### Directory Structure
```
gymtext/
├── apps/
│   ├── web/                      # Consumer app (gymtext.com)
│   │   ├── src/
│   │   │   ├── app/             # Next.js App Router pages and API routes
│   │   │   ├── components/      # React components
│   │   │   ├── context/         # React contexts
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── lib/             # Client-side utilities
│   │   └── vercel.json          # Vercel config (cron jobs)
│   │
│   └── admin/                    # Admin portal (admin.gymtext.com)
│       ├── src/
│       │   ├── app/             # Admin pages and API routes
│       │   ├── components/      # Admin-specific components
│       │   └── context/         # EnvironmentContext for env switching
│       └── vercel.json          # Vercel config
│
├── packages/
│   └── shared/                   # @gymtext/shared package
│       └── src/
│           ├── server/          # All server-side logic
│           │   ├── agents/      # AI/LLM chain implementations
│           │   ├── connections/ # External service factories
│           │   ├── context/     # EnvironmentContext system
│           │   ├── models/      # Database schema and types
│           │   ├── repositories/# Data access layer
│           │   ├── services/    # Business logic layer
│           │   └── utils/       # Server utilities
│           └── shared/          # Shared utilities and configs
│
├── scripts/                      # Build, test, migration scripts
├── migrations/                   # Database migrations
├── turbo.json                    # Turborepo configuration
└── pnpm-workspace.yaml          # Workspace configuration
```

### Architecture Layer Overview

The application follows a clean architecture pattern with clear separation of concerns:

1. **Routes Layer** (`apps/*/src/app/api/`)
   - Handles HTTP routing and request/response processing
   - Validates incoming requests
   - Delegates business logic to services
   - Returns formatted responses
   - **Stateless**: For onboarding, receives and returns partial profile state via SSE

2. **Services Layer** (`packages/shared/src/server/services/`)
   - Contains all business logic
   - Orchestrates operations between agents and repositories
   - Handles complex workflows and state management
   - **Pass-Through**: Onboarding services process partial objects without intermediate DB writes
   - Never directly instantiates LLMs - delegates to agents

3. **Agents Layer** (`packages/shared/src/server/agents/`)
   - Manages all LLM interactions and AI chains
   - Each agent has a specific purpose with tailored prompts
   - Uses LangChain for chain composition
   - Abstracts AI complexity from business logic

4. **Repositories Layer** (`packages/shared/src/server/repositories/`)
   - Handles all database operations
   - Provides clean data access interface
   - Uses Kysely ORM for type-safe queries
   - Isolates database logic from business logic

5. **Supporting Layers**:
   - **Models** (`packages/shared/src/server/models/`) - TypeScript type definitions and database schema
   - **Connections** (`packages/shared/src/server/connections/`) - External service factories (DB, Twilio, Stripe)
   - **Context** (`packages/shared/src/server/context/`) - Environment context for multi-environment support
   - **Utils** (`packages/shared/src/server/utils/`) - Shared utilities and helper functions

### Key Architectural Patterns
- **Repository Pattern**: All database operations go through repositories
- **Service Layer**: Business logic is isolated in services, delegates LLM work to agents
- **Agent Pattern**: Each AI task has a dedicated agent with specific prompts - services should NOT instantiate LLMs directly
- **Factory Pattern**: Connections use factories for environment switching
- **Environment Context**: Request-scoped context carries environment-specific connections
- **Type Safety**: Full TypeScript with Kysely codegen for database types
- **Clean Architecture**: Services use agents for all LLM interactions (see _claude_docs/AGENT_ARCHITECTURE.md)

## Environment Context System

The admin app supports switching between production and sandbox environments (like Stripe's dashboard). This is implemented through the Environment Context System.

### How It Works

1. **Cookie Storage**: User's environment preference stored in `gt_env` cookie
2. **Middleware Injection**: Admin middleware reads cookie, sets `X-Gymtext-Env` header
3. **Context Creation**: `createEnvContext()` reads header, returns appropriate connections
4. **Service Binding**: Services receive context with env-specific db/twilio/stripe clients

### Key Files

- **`packages/shared/src/server/context/createEnvContext.ts`** - Factory for environment contexts
  ```typescript
  // In API routes:
  const ctx = await createEnvContext();  // Reads X-Gymtext-Env header
  const { db, twilioClient, stripeClient } = ctx;

  // Force production (for web app):
  const ctx = await createProductionContext();
  ```

- **`packages/shared/src/server/connections/*/factory.ts`** - Connection factories with caching
  - `postgres/factory.ts` - `createDatabase(connectionString)`
  - `twilio/factory.ts` - `createTwilioClient(credentials)`
  - `stripe/factory.ts` - `createStripeClient(credentials)`

- **`packages/shared/src/server/repositories/factory.ts`** - Repository container factory
  ```typescript
  const repos = createRepositories(ctx.db);
  const user = await repos.user.findById(userId);
  ```

- **`packages/shared/src/server/services/factory.ts`** - Service container factory
  ```typescript
  const services = getServices(ctx);
  // Access repos, ctx, and services
  ```

- **`apps/admin/src/context/EnvironmentContext.tsx`** - React context for UI toggle
- **`apps/admin/src/middleware.ts`** - Injects X-Gymtext-Env header for API routes

### What's Affected by Environment Toggle

| Service | Affected | Notes |
|---------|----------|-------|
| Database | Yes | Sandbox uses `SANDBOX_DATABASE_URL` |
| Twilio | Yes | Sandbox uses `SANDBOX_TWILIO_*` credentials |
| Stripe | Yes | Sandbox uses `SANDBOX_STRIPE_*` credentials |
| OpenAI | No | Always uses production |
| Pinecone | No | Always uses production |

### Usage in API Routes

**Admin app** (supports environment switching):
```typescript
import { createEnvContext } from '@gymtext/shared/server';

export async function GET() {
  const ctx = await createEnvContext();  // Respects X-Gymtext-Env header
  const users = await ctx.db.selectFrom('users').selectAll().execute();
  return Response.json(users);
}
```

**Web app** (always production):
```typescript
import { createProductionContext } from '@gymtext/shared/server';

export async function GET() {
  const ctx = await createProductionContext();  // Always production
  // ...
}
```

## Database Schema

Core tables include:
- `users` - User accounts and authentication
- `fitness_profiles` - User fitness data and preferences
- `conversations` & `messages` - SMS conversation history
- `fitness_plans` - Simplified fitness plans with progress tracking
- `mesocycles` - Dedicated table for training phases (linked to plans)
- `microcycles` - Weekly training patterns (generated on-demand)
- `workout_instances` - Individual workouts with enhanced block structure
- `subscriptions` - Stripe subscription tracking

## AI Agent System

Specialized agents in `packages/shared/src/server/agents/`:

### Chat & Profile Management
- `chatAgent` (`chat/chain.ts`) - Generates contextual conversation responses
  - Uses conversation history and user profile for personalized coaching
  - Supports multiple models (GPT-4, Gemini 2.0 Flash)
  - Keeps responses concise for SMS format
- `userProfileAgent` (`profile/chain.ts`) - Extracts and updates user profiles from conversations
  - **Stateless Operation**: Receives `currentProfile` and `currentUser` partial objects
  - Analyzes messages for fitness information with confidence scoring
  - Returns *updated* partial objects to the caller (does not write to DB)
  - Supports batch message processing for conversation history
  - Only updates with high confidence (>0.75 threshold)

### Fitness Planning
- `generateFitnessPlanAgent` - Creates fitness plans with simplified mesocycle structure
- `dailyWorkout` - Generates on-demand workouts with block structure using Gemini 2.0 Flash
- `microcyclePattern` - Creates weekly training patterns with progressive overload
- `dailyMessageAgent` - Generates daily workout messages
- `welcomeMessageAgent` - Onboarding messages

### Agent Tools
- `profilePatchTool` (`tools/profilePatchTool.ts`) - LangChain tool for profile updates
  - **Pure Function**: Takes partial profile, returns updated partial profile
  - Validates confidence scores before applying updates
  - Tracks which fields were updated and why
  - **No Side Effects**: Does not interact with the database

**Important**: Services should use these agents, not instantiate their own LLMs

## Environment Variables

Required environment variables (see `.env.example`):

### Production (Required)
```bash
# Database
DATABASE_URL=postgresql://...
SESSION_ENCRYPTION_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID=...

# AI Services
OPENAI_API_KEY=...
GOOGLE_API_KEY=...

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX=...

# Admin Auth
ADMIN_PHONE_NUMBERS=+1234567890,+0987654321
```

### Sandbox (Optional - Admin App Only)
```bash
# Database
SANDBOX_DATABASE_URL=postgresql://...

# Twilio
SANDBOX_TWILIO_ACCOUNT_SID=...
SANDBOX_TWILIO_AUTH_TOKEN=...
SANDBOX_TWILIO_NUMBER=...

# Stripe
SANDBOX_STRIPE_SECRET_KEY=...
SANDBOX_STRIPE_WEBHOOK_SECRET=...
```

If sandbox variables are not set, sandbox mode falls back to production credentials.

## Chat Architecture

The chat system uses a two-agent architecture for processing messages:

1. **Profile Extraction Phase** - UserProfileAgent analyzes incoming messages
   - **Input**: User message + Current Partial Profile State (from client)
   - Extracts fitness-related information with confidence scoring (>0.75)
   - **Output**: Updated Partial Profile State + Explanation
   - No database writes occur in this phase

2. **Response Generation Phase** - ChatAgent generates the response
   - Receives updated profile from UserProfileAgent
   - Uses conversation history for context
   - Generates personalized coaching responses
   - Acknowledges profile updates when they occur

This separation ensures:
- Profile building happens automatically and consistently
- Chat responses remain conversational and engaging
- Services don't need to manage LLM instantiation
- Clean separation of concerns between data extraction and conversation

**Onboarding Chat**: A specialized flow for new users that uses a **pass-through architecture**. The frontend maintains state, sends it to the API, and receives updates via SSE. The database is only updated upon final confirmation.

## Admin Authentication

The admin panel uses phone-based SMS verification with a whitelist system:

**Authentication Flow**:
1. Admin navigates to `/admin/*` without a session → redirected to `/login`
2. Admin enters phone number
3. System checks `ADMIN_PHONE_NUMBERS` whitelist (environment variable)
4. If whitelisted, sends 6-digit SMS verification code
5. Admin enters code
6. System validates code and sets `gt_admin=ok` cookie
7. Admin redirected to original destination

**Key Components**:
- **Whitelist**: `ADMIN_PHONE_NUMBERS` env var (comma-separated E.164 phone numbers)
- **Service**: `AdminAuthService` (`packages/shared/src/server/services/auth/adminAuthService.ts`)
- **Middleware**: `apps/admin/src/middleware.ts` protects all routes except login
- **Cookie**: `gt_admin=ok` (httpOnly, secure in prod, 30-day expiry)

**Important Notes**:
- Admin users don't need user accounts - just whitelisted phone numbers
- Rate limiting: max 3 code requests per 15 minutes per phone
- Codes expire after 10 minutes
- To manage admins: update `ADMIN_PHONE_NUMBERS` environment variable

## Development Guidelines

### Working with the Database
- Always run `pnpm db:codegen` after schema changes to update TypeScript types
- Use repositories for all database operations
- Migrations are in the `migrations/` directory

### Working with the Monorepo
- Shared server code goes in `packages/shared/src/server/`
- App-specific components stay in their respective `apps/*/src/` directories
- Use `@gymtext/shared` or `@gymtext/shared/server` imports for shared code
- Run `pnpm build` from root to build all packages in dependency order

### Adding New Features
- Follow the existing service/repository/agent pattern
- Place business logic in services, not in API routes
- Use the appropriate AI agent for LLM tasks - never instantiate LLMs directly in services
- Add proper TypeScript types for all new code
- See `_claude_docs/AGENT_ARCHITECTURE.md` for agent pattern details

### Testing Considerations
- The project uses Vitest for testing
- Test files should be colocated with the code they test
- Use `pnpm sms:test` to test SMS functionality locally
- Be sure that all tests pass when implementing new features, similar to build and lint

### Environment Variable Management
- **ALWAYS run `source .env.local` before running `pnpm build` or `pnpm lint`** - these commands require DATABASE_URL for db:codegen
- Sandbox variables only needed for admin app environment switching

### Code Quality and Validation
- Be sure that any implementations continue to pass `pnpm build` and `pnpm lint`
- When making db schema changes, all migrations should utilize Kysely
