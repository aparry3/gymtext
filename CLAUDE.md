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

### Key Architectural Patterns
- **Repository Pattern**: All database operations go through repositories
- **Service Layer**: Business logic is isolated in services
- **Agent Pattern**: Each AI task has a dedicated agent with specific prompts
- **Type Safety**: Full TypeScript with Kysely codegen for database types

### Database Schema
Core tables include:
- `users` - User accounts and authentication
- `fitness_profiles` - User fitness data and preferences  
- `conversations` & `messages` - SMS conversation history
- `fitness_plans` → `mesocycles` → `microcycles` → `workouts` - Hierarchical fitness plan structure
- `subscriptions` - Stripe subscription tracking

### AI Agent System
Specialized agents in `src/server/agents/`:
- `chatAgent` - General conversation responses
- `generateFitnessPlanAgent` - Creates complete fitness plans
- `dailyMessageAgent` - Generates daily workout messages
- `welcomeMessageAgent` - Onboarding messages
- `mesocycleBreakdownAgent` - Breaks mesocycles into microcycles

### Environment Variables
Required environment variables (see .env.example):
- Database: `DATABASE_URL`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_NUMBER`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- AI: `OPENAI_API_KEY`, `GOOGLE_API_KEY`
- Pinecone: `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`

## Development Guidelines

### Working with the Database
- Always run `pnpm db:codegen` after schema changes to update TypeScript types
- Use repositories for all database operations
- Migrations are in the `migrations/` directory

### Adding New Features
- Follow the existing service/repository pattern
- Place business logic in services, not in API routes
- Use the appropriate AI agent for LLM tasks
- Add proper TypeScript types for all new code

### Testing Considerations
- The project uses Vitest for testing
- Test files should be colocated with the code they test
- Use `pnpm sms:test` to test SMS functionality locally
- Be sure that all tests pass when implementing new features, similar to build and lint

### Environment Variable Management
- Use source .env.local for environment variables

### Code Quality and Validation
- Be sure that any implementations continue to pass pnpm build and pnpm lint