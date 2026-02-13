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
│           │   ├── agents/      # DB-driven AI agent system
│           │   │   ├── constants.ts    # Agent ID constants
│           │   │   ├── createAgent.ts  # Agent factory
│           │   │   ├── runner/         # AgentRunner (invoke entry point)
│           │   │   ├── context/        # Context registry & providers
│           │   │   ├── tools/          # Tool registry & definitions
│           │   │   └── declarative/    # Input mapping, templates, validation
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
   - **Database-driven**: Agent definitions (prompts, model, tools, context, sub-agents, validation) stored in `agent_definitions` table
   - **Code-side registries**: Tool Registry and Context Registry resolve tool/context references from DB config at runtime
   - **AgentRunner**: Central entry point - services call `agentRunner.invoke(agentId, params)` instead of building chains
   - Uses LangChain under the hood; abstracts all LLM complexity from services

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
- **Service Layer**: Business logic is isolated in services, delegates LLM work to agents via AgentRunner
- **Database-Driven Agents**: Agent definitions (prompts, model config, tools, context, sub-agents, validation) live in the `agent_definitions` table with append-only versioning
- **Registries in Code**: Tool Registry and Context Registry map string IDs from DB config to runtime implementations
- **AgentRunner**: Services call `agentRunner.invoke(agentId, params)` - never instantiate LLMs directly
- **Factory Pattern**: Connections use factories for environment switching
- **Environment Context**: Request-scoped context carries environment-specific connections
- **Type Safety**: Full TypeScript with Kysely codegen for database types
- **Lazy Service Injection**: AgentRunner receives `getServices()` lambda to break circular dependencies between services and tools
- **Clean Architecture**: See `_claude_docs/AGENT_ARCHITECTURE.md` for full agent pattern details

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

- **`packages/shared/src/server/services/factory.ts`** - Service container factory (multi-phase bootstrap with AgentRunner setup)
  ```typescript
  const services = getServices(ctx);
  // Access repos, ctx, services, and agentRunner
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
- `agent_definitions` - AI agent configurations (append-only versioned)
- `agent_logs` - Agent invocation history for observability

## AI Agent System

Agents are **defined in the database** (`agent_definitions` table) and **executed via code-side registries**. See `_claude_docs/AGENT_ARCHITECTURE.md` for the full reference.

### Database-Driven Agent Definitions

Each agent is a row in `agent_definitions` with append-only versioning (latest `created_at` = active version):

| Column | Purpose |
|--------|---------|
| `agent_id` | Unique identifier (e.g., `'chat:generate'`, `'workout:generate'`) |
| `system_prompt` | System prompt instructions |
| `user_prompt_template` | Template with `{{variable}}` substitution |
| `model` | Model identifier (e.g., `'gpt-5.1'`, `'gpt-5-nano'`) |
| `tool_ids` | Tool names available to agent (e.g., `['update_profile', 'get_workout']`) |
| `context_types` | Context to resolve at runtime (e.g., `['dateContext', 'currentWorkout']`) |
| `sub_agents` | Sub-agent configurations (batches, parallel/sequential) |
| `schema_json` | JSON Schema for structured output |
| `validation_rules` | Declarative validation rules with auto-retry |
| `temperature`, `max_tokens`, `max_iterations`, `max_retries` | Model configuration |

Agent IDs are defined as constants in `packages/shared/src/server/agents/constants.ts`.

### Code-Side Registries

**Tool Registry** (`agents/tools/toolRegistry.ts`):
- Maps tool name strings (from DB `tool_ids`) to LangChain tool implementations
- Tools registered in `agents/tools/definitions/` (e.g., `chatTools.ts`, `modificationTools.ts`)
- Tools receive a `ToolExecutionContext` with user, message, and service access
- Key tools: `update_profile`, `get_workout`, `make_modification`, `modify_workout`, `modify_week`, `modify_plan`

**Context Registry** (`agents/context/contextRegistry.ts`):
- Maps context type strings (from DB `context_types`) to context provider functions
- Resolves multiple context types in parallel
- Key contexts: `user`, `userProfile`, `fitnessPlan`, `dayOverview`, `currentWorkout`, `dateContext`, `currentMicrocycle`, `experienceLevel`

### AgentRunner

The `AgentRunner` (`agents/runner/agentRunner.ts`) is the single entry point for all agent invocations:

```typescript
// Services invoke agents like this:
const result = await agentRunner.invoke('chat:generate', {
  input: message,
  params: { user: userWithProfile, previousMessages },
});
```

**Invocation flow**:
1. Fetch agent definition + extended config from DB (cached 5min)
2. Resolve context strings via Context Registry
3. Resolve tools via Tool Registry
4. Recursively build sub-agents (up to depth 5)
5. Build validation function from declarative rules
6. Execute via `createAgent()` with three output modes: tool agent, structured output, or plain text
7. Execute sub-agents (sequential batches, parallel within batch)
8. Log invocation to `agent_logs` table

### Agent Definitions (Key Agents)

- `chat:generate` - Main chat response with tools (`update_profile`, `get_workout`, `make_modification`)
- `profile:fitness` - Extracts/updates fitness profile from messages, with `profile:structured` sub-agent
- `profile:user` - Extracts user info (name, gender, etc.)
- `plan:generate` - Creates fitness plans with mesocycle structure
- `workout:generate` - Generates daily workouts with `workout:message` and `workout:structured` sub-agents
- `microcycle:generate` - Creates weekly training patterns
- `modifications:router` - Routes modification requests to appropriate sub-agents

### Declarative Features

- **Input Mapping**: Maps parent output to sub-agent input using `$`-prefixed references (`$result.field`, `$user.name`, `$extras.field`)
- **Template Engine**: Resolves `{{variable}}` placeholders in `user_prompt_template`
- **Validation Rules**: Declarative checks (`equals`, `truthy`, `nonEmpty`, `length`) with auto-retry on failure

**Important**: Services must use `agentRunner.invoke()` - never instantiate LLMs directly

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

The chat system is orchestrated by `ChatService` which calls agents via `agentRunner.invoke()`:

1. **Chat Response** - `chat:generate` agent with tool access
   - Tools: `update_profile` (persists profile changes), `get_workout` (fetches/generates today's workout), `make_modification` (delegates program changes)
   - Context: `dateContext`, `currentWorkout` resolved automatically from DB config
   - Returns main response + accumulated tool messages

2. **Profile Updates** - Handled via `update_profile` tool during chat, not a separate phase
   - Tool calls `profile:fitness` agent which extracts profile data with structured sub-agents
   - Profile updates persisted through the tool's service callback

3. **Modifications** - `make_modification` tool routes to `modifications:router` agent
   - Router determines modification type and delegates to appropriate sub-agents

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
- Use `agentRunner.invoke(agentId, params)` for all LLM tasks - never instantiate LLMs directly
- New agents: add a row to `agent_definitions` (via migration), add agent ID to `agents/constants.ts`
- New tools: add definition in `agents/tools/definitions/`, register in `registerAllTools()`
- New context providers: add in `agents/context/`, register in `registerAllContextProviders()`
- Add proper TypeScript types for all new code
- See `_claude_docs/AGENT_ARCHITECTURE.md` for full agent pattern details

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
