# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Database Migrations
```bash
# Create a new migration file
npm run migrate:create -- migration-name

# Run all pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down

# Run migrations (legacy command)
npm run migrate
```

## Architecture Overview

GymText is a Next.js 15 application that delivers personalized workout plans via SMS. It uses AI to generate workouts based on user fitness profiles and sends them directly to users' phones.

### Key Technologies
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS v4
- **Database**: PostgreSQL with Kysely ORM
- **AI**: LangChain with OpenAI/Google Gemini, Pinecone vector database
- **Payments**: Stripe for subscriptions
- **SMS**: Twilio for message delivery

### Project Structure
- `/src/app/` - Next.js App Router pages and API routes
- `/src/server/` - Backend logic including AI agents, database operations, and external service clients
- `/src/components/` - React components
- `/src/shared/` - Shared schemas, types, and utilities

### Key API Endpoints
- `/api/auth/` - User authentication
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

### AI Agent System
The workout generation uses a multi-agent architecture in `/src/server/agents/`:
- `orchestrator.ts` - Coordinates the workout generation process
- `workout-designer.ts` - Creates the workout structure
- `exercise-selector.ts` - Chooses appropriate exercises
- Agents use prompt templates from `/src/server/prompts/`

### Important Patterns
1. **Zod Schemas**: All API inputs are validated using Zod schemas in `/src/shared/schemas/`
2. **Database Types**: Generated from database schema in `/src/shared/types/`
3. **Path Aliases**: Use `@/` to import from `/src/`
4. **Environment Variables**: Required variables include database URL, API keys for Stripe, Twilio, OpenAI/Gemini, and Pinecone

### Development Notes
- No test suite currently exists
- Database migrations use Kysely's migration system
- All API routes use Next.js App Router's route handlers
- TypeScript is configured in strict mode