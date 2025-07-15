# CLAUDE.md - GymText Development Guide

## Project Overview

GymText is a fitness coaching application that delivers personalized workouts and coaching via SMS messages using AI agents. It's built with Next.js 15, TypeScript, and includes Twilio integration for SMS functionality, AI/LLM integration for intelligent responses, and a PostgreSQL database for data persistence.

## Package Manager

This project uses **pnpm** as the package manager. The presence of `pnpm-lock.yaml` confirms this.

```bash
# Install dependencies
pnpm install

# Add a dependency
pnpm add package-name

# Add a dev dependency
pnpm add -D package-name
```

## Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database migrations
pnpm migrate          # Run all pending migrations
pnpm migrate:create   # Create a new migration file
pnpm migrate:up       # Run migrations up
pnpm migrate:down     # Run migrations down

# Testing
pnpm sms:test         # Test SMS functionality
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── agent/         # AI agent endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── sms/           # Twilio SMS webhook
│   │   └── webhook/       # Stripe webhooks
│   ├── success/           # Post-signup success page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
├── server/               # Server-side business logic
│   ├── agents/           # AI agents (fitness, workout generation)
│   ├── core/            # Core infrastructure
│   │   ├── clients/     # External service clients (Twilio)
│   │   └── database/    # Database connections (Postgres, Vector)
│   ├── data/            # Data access layer
│   │   └── repositories/ # Data repositories
│   ├── services/        # Business services
│   │   ├── ai/          # AI/LLM services
│   │   └── infrastructure/ # Storage & infrastructure services
│   └── utils/           # Server utilities
└── shared/              # Shared code between client/server
    ├── config/          # Configuration files
    ├── schemas/         # Zod validation schemas
    ├── types/           # TypeScript type definitions
    └── utils/           # Shared utilities

migrations/              # Database migration files
scripts/                # Build and utility scripts
docs/                   # Project documentation
```

## Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Kysely ORM
- **SMS**: Twilio
- **AI**: LangChain with OpenAI & Google GenAI
- **Payments**: Stripe
- **Vector Store**: Pinecone
- **Forms**: React Hook Form with Zod validation

### Key Architectural Patterns

#### 1. Layered Architecture
- **Presentation Layer**: React components in `src/components/` and `src/app/`
- **API Layer**: Next.js API routes in `src/app/api/`
- **Business Logic**: Services in `src/server/services/`
- **Data Access**: Repositories in `src/server/data/repositories/`
- **Infrastructure**: Database and external clients in `src/server/core/`

#### 2. Repository Pattern
All database operations go through repositories that extend `BaseRepository`:
- `UserRepository` - User and profile management
- `ConversationRepository` - Chat conversation storage
- `MessageRepository` - Individual message storage

#### 3. Service Layer
- **AI Services**: Chat, context, memory, and prompt services
- **Infrastructure Services**: Conversation storage with circuit breaker pattern

#### 4. AI Agent Pattern
Specialized agents for different fitness coaching tasks:
- `fitnessOutlineAgent` - Initial fitness assessment
- `workoutGeneratorAgent` - Workout plan creation
- `workoutUpdateAgent` - Workout modifications

## Database Schema

The application uses PostgreSQL with the following main tables:

### Core Tables
- `users` - User accounts and basic information
- `fitness_profiles` - User fitness goals, experience level, preferences
- `subscriptions` - Stripe subscription tracking

### Conversation System
- `conversations` - Chat conversation metadata
- `messages` - Individual SMS messages (inbound/outbound)

### Workout System
- `workouts` - Generated workout plans
- `workout_logs` - User feedback and completion tracking

## Environment Variables

Required environment variables (create `.env.local`):

```bash
# Database
DATABASE_URL=postgres://username:password@localhost:5432/gymtext

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=+1234567890

# AI/LLM
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...

# Vector Database
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

## Best Practices

### Code Organization
1. Use the established layered architecture
2. Keep business logic in services, not in API routes
3. Use repositories for all database operations
4. Implement proper error handling and circuit breakers
5. Follow the existing TypeScript patterns and naming conventions

### Database Migrations
1. Always create migrations for schema changes: `pnpm migrate:create`
2. Test both up and down migrations
3. Use meaningful migration names with timestamps

### AI/LLM Integration
1. Use the existing agent pattern for new AI functionality
2. Implement proper context management and memory services
3. Handle token limits and rate limiting appropriately
4. Store conversation history for context continuity

### SMS Integration
1. All SMS handling goes through `/api/sms/route.ts`
2. Use TwiML for responses
3. Implement proper error handling for Twilio webhooks
4. Store all messages for conversation history

### Type Safety
1. Define types in `src/shared/types/`
2. Use Zod schemas for validation in `src/shared/schemas/`
3. Leverage TypeScript's strict mode
4. Use the `@/*` path alias for imports

### Testing
1. Use the `pnpm sms:test` script to test SMS functionality
2. Test payment flows in Stripe test mode
3. Verify database migrations in development before production

### Development Workflow
1. Start development server: `pnpm dev`
2. Use Turbopack for fast rebuilds
3. Run linting: `pnpm lint`
4. Test SMS integration locally with ngrok for Twilio webhooks
5. Monitor database performance with proper indexing

### Security
1. Never commit secrets to the repository
2. Use environment variables for all sensitive configuration
3. Implement proper input validation with Zod
4. Follow OWASP security guidelines for web applications

## Common Commands

```bash
# Setup new development environment
pnpm install
cp .env.local.example .env.local
# Edit .env.local with your values
pnpm migrate
pnpm dev

# Database operations
pnpm migrate:create "add_new_table"
pnpm migrate:up
pnpm migrate:down

# Code quality
pnpm lint
pnpm build  # Verify production build

# Testing SMS locally (requires ngrok)
ngrok http 3000
# Update Twilio webhook URL to: https://your-ngrok-url.ngrok.io/api/sms
pnpm sms:test
```