# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GymText is a personalized fitness coaching application that delivers workout plans via SMS. It uses AI to provide intelligent coaching conversations and generates customized fitness plans based on user profiles.

## Essential Commands

```bash
# Development
pnpm dev                # Start dev server with Turbopack on localhost:3000
pnpm build              # Create production build
pnpm start              # Start production server

# Database Management
pnpm db:codegen         # Generate TypeScript types from PostgreSQL schema
pnpm migrate:create     # Create new migration (interactive)
pnpm migrate:up         # Apply pending migrations
pnpm migrate:down       # Rollback last migration

# Testing
pnpm test               # Run Vitest tests
pnpm test:ui            # Run tests with Vitest UI
pnpm sms:test           # Test SMS functionality (requires Twilio config)

# Linting
pnpm lint               # Run ESLint with Next.js rules
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API routes, PostgreSQL with Kysely ORM
- **AI/LLM**: LangChain with OpenAI and Google Gemini
- **External Services**: Twilio (SMS), Stripe (payments), Pinecone (vector DB)

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages and API routes
├── components/            # React components (pages/ and ui/)
├── server/               # Backend logic
│   ├── agents/          # AI/LLM chain implementations
│   ├── connections/     # External service integrations
│   ├── models/          # Database schema and types
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   └── utils/           # Server utilities
└── shared/              # Shared utilities and configs
```

### Architecture Layer Overview

The application follows a clean architecture pattern with clear separation of concerns:

1. **Routes Layer** (`src/app/api/`)
   - Handles HTTP routing and request/response processing
   - Validates incoming requests
   - Delegates business logic to services
   - Returns formatted responses

2. **Services Layer** (`src/server/services/`)
   - Contains all business logic
   - Orchestrates operations between agents and repositories
   - Handles complex workflows and state management
   - Never directly instantiates LLMs - delegates to agents

3. **Agents Layer** (`src/server/agents/`)
   - Manages all LLM interactions and AI chains
   - Each agent has a specific purpose with tailored prompts
   - Uses LangChain for chain composition
   - Abstracts AI complexity from business logic

4. **Repositories Layer** (`src/server/repositories/`)
   - Handles all database operations
   - Provides clean data access interface
   - Uses Kysely ORM for type-safe queries
   - Isolates database logic from business logic

5. **Supporting Layers**:
   - **Models** (`src/server/models/`) - TypeScript type definitions and database schema
   - **Connections** (`src/server/connections/`) - External service clients (DB, Twilio, Stripe, etc.)
   - **Utils** (`src/server/utils/`) - Shared utilities and helper functions

### Key Architectural Patterns
- **Repository Pattern**: All database operations go through repositories
- **Service Layer**: Business logic is isolated in services, delegates LLM work to agents
- **Agent Pattern**: Each AI task has a dedicated agent with specific prompts - services should NOT instantiate LLMs directly
- **Type Safety**: Full TypeScript with Kysely codegen for database types
- **Clean Architecture**: Services use agents for all LLM interactions (see _claude_docs/AGENT_ARCHITECTURE.md)

### Database Schema
Core tables include:
- `users` - User accounts and authentication
- `fitness_profiles` - User fitness data and preferences  
- `conversations` & `messages` - SMS conversation history
- `fitness_plans` - Simplified fitness plans with mesocycles array and progress tracking
- `microcycles` - Weekly training patterns (generated on-demand)
- `workout_instances` - Individual workouts with enhanced block structure
- `subscriptions` - Stripe subscription tracking

### AI Agent System
Specialized agents in `src/server/agents/`:

#### Chat & Profile Management
- `chatAgent` (`chat/chain.ts`) - Generates contextual conversation responses
  - Uses conversation history and user profile for personalized coaching
  - Supports multiple models (GPT-4, Gemini 2.0 Flash)
  - Keeps responses concise for SMS format
- `userProfileAgent` (`profile/chain.ts`) - Extracts and updates user profiles from conversations
  - Analyzes messages for fitness information with confidence scoring
  - Uses `profilePatchTool` for automatic profile updates
  - Supports batch message processing for conversation history
  - Only updates with high confidence (>0.5 threshold)

#### Fitness Planning
- `generateFitnessPlanAgent` - Creates fitness plans with simplified mesocycle structure
- `dailyWorkout` - Generates on-demand workouts with block structure using Gemini 2.0 Flash
- `microcyclePattern` - Creates weekly training patterns with progressive overload
- `dailyMessageAgent` - Generates daily workout messages
- `welcomeMessageAgent` - Onboarding messages

#### Agent Tools
- `profilePatchTool` (`tools/profilePatchTool.ts`) - LangChain tool for profile updates
  - Validates confidence scores before applying updates
  - Tracks which fields were updated and why
  - Integrates with ProfilePatchService for database persistence

**Important**: Services should use these agents, not instantiate their own LLMs

### Environment Variables
Required environment variables (see .env.example):
- Database: `DATABASE_URL`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_NUMBER`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- AI: `OPENAI_API_KEY`, `GOOGLE_API_KEY`
- Pinecone: `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`

### Chat Architecture

The chat system uses a two-agent architecture for processing messages:

1. **Profile Extraction Phase** - UserProfileAgent analyzes incoming messages
   - Extracts fitness-related information with confidence scoring
   - Updates user profile automatically via profilePatchTool
   - Only updates when confidence exceeds 0.5 threshold
   - Returns profile state and update summary

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

**Onboarding Chat**: A specialized flow for new users that focuses on profile building through conversation to prepare for SMS-based coaching (see `_claude_docs/chat/CHAT_FEATURE_PRD.md`)

## Development Guidelines

### Working with the Database
- Always run `pnpm db:codegen` after schema changes to update TypeScript types
- Use repositories for all database operations
- Migrations are in the `migrations/` directory

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
- Use source .env.local for environment variables

### Code Quality and Validation
- Be sure that any implementations continue to pass pnpm build and pnpm lint
- when making db schema changes, all migrations should utilize kysely, and exisitnig infrastrucutre (such as pnpm migrate commands and correct DB typing)