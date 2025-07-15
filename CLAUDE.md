# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Test SMS functionality
pnpm sms:test
```

### Database Migrations
```bash
# Create a new migration file
pnpm migrate:create -- migration-name

# Run all pending migrations
pnpm migrate:up

# Rollback the last migration
pnpm migrate:down

# Run migrations (legacy command)
pnpm migrate
```

## Architecture Overview

GymText is a Next.js 15 application that delivers personalized workout plans via SMS. It uses AI to generate workouts based on user fitness profiles and sends them directly to users' phones.

### Key Technologies
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS v4
- **Database**: PostgreSQL with Kysely ORM
- **AI**: LangChain with OpenAI/Google Gemini, Pinecone vector database
- **Payments**: Stripe for subscriptions
- **SMS**: Twilio for message delivery
- **Package Manager**: pnpm

### Project Structure
```
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/               # API endpoints
│   │   │   ├── agent/         # AI workout generation
│   │   │   ├── auth/          # Authentication
│   │   │   ├── sms/           # Twilio webhook handler
│   │   │   └── webhook/       # Stripe webhook handler
│   │   └── success/           # Post-signup workout setup
│   ├── components/            # React components
│   ├── server/                # Backend logic
│   │   ├── agents/           # AI agents for workout generation
│   │   ├── clients/          # External service clients
│   │   ├── db/               # Database operations
│   │   ├── prompts/          # AI prompt templates
│   │   ├── repositories/     # Data access layer
│   │   ├── services/         # Business logic
│   │   └── utils/            # Server utilities
│   └── shared/               # Shared schemas, types, and utilities
├── scripts/                  # Migration and utility scripts
├── migrations/               # Database migration files
└── docs/                     # Project documentation
```

### Key API Endpoints
- `/api/auth/session/` - User authentication
- `/api/agent/` - AI workout generation endpoints
- `/api/sms/` - Twilio webhook handler
- `/api/webhook/` - Stripe webhook handler
- `/api/create-checkout-session/` - Stripe checkout session creation

### Database Schema
The application uses PostgreSQL with these main tables:
- `users` - Basic user information
- `fitness_profiles` - User fitness goals, skill level, equipment
- `subscriptions` - Stripe subscription tracking
- `workouts` - Generated workout plans
- `workout_logs` - User completion tracking and feedback
- `conversations` - SMS conversation tracking
- `messages` - Individual SMS messages
- `conversation_topics` - Conversation topic classification

### AI Agent System
The workout generation uses a multi-agent architecture in `/src/server/agents/`:
- `fitnessOutlineAgent.ts` - Creates fitness program outlines
- `workoutGeneratorAgent.ts` - Generates specific workout plans
- `workoutUpdateAgent.ts` - Updates existing workout plans
- Agents use prompt templates from `/src/server/prompts/`

### Conversation History System
The application includes a conversation history system that stores all SMS interactions:
- **Database Tables**: `conversations`, `messages`, `conversation_topics`
- **Service**: `ConversationStorageService` handles message storage with circuit breaker pattern
- **Integration**: SMS handler stores messages without blocking SMS delivery
- **Configuration**: 
  - `CONVERSATION_TIMEOUT_MINUTES`: Time before a new conversation starts (default: 30)
  - `ENABLE_CONVERSATION_STORAGE`: Feature flag (default: true)

### Important Patterns
1. **Zod Schemas**: All API inputs are validated using Zod schemas in `/src/shared/schemas/`
2. **Database Types**: Generated from database schema in `/src/shared/types/schema.ts`
3. **Path Aliases**: Use `@/` to import from `/src/`
4. **TypeScript Configuration**: Strict mode enabled with ES2017 target
5. **Repository Pattern**: Data access abstracted through repository classes

### Required Environment Variables
```bash
DATABASE_URL=            # PostgreSQL connection string
STRIPE_SECRET_KEY=       # Stripe API key
TWILIO_ACCOUNT_SID=     # Twilio account SID
TWILIO_AUTH_TOKEN=      # Twilio authentication token
OPENAI_API_KEY=         # OpenAI API key
GOOGLE_API_KEY=         # Google Gemini API key
PINECONE_API_KEY=       # Pinecone vector database key
```

### Development Notes
- Uses pnpm as package manager
- No test suite currently exists
- Database migrations use Kysely's migration system
- All API routes use Next.js App Router's route handlers
- TypeScript is configured in strict mode
- ESLint configured with Next.js recommended rules
- Tailwind CSS v4 for styling

### Code Quality
- Run `pnpm lint` before committing
- Follow TypeScript strict mode conventions
- Use Zod for input validation
- Implement proper error handling with circuit breaker pattern
- Use repository pattern for data access
- Follow Next.js 15 best practices