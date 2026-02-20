# Architecture Overview

GymText follows a clean architecture pattern with clear separation of concerns. This document provides a high-level overview of the system architecture.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              External Services                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Twilio   │  │   Stripe    │  │  OpenAI     │  │  Pinecone   │    │
│  │   (SMS)    │  │ (Payments)  │  │   (LLM)     │  │ (Vector DB) │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API Routes Layer                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  apps/web/src/app/api/*    apps/admin/src/app/api/*            │   │
│  │  apps/programs/src/app/api/*                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Service Layer                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │            packages/shared/src/server/services/                │   │
│  │  - ChatService                                                 │   │
│  │  - WorkoutService                                              │   │
│  │  - ProfileService                                              │   │
│  │  - SubscriptionService                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Agent Layer                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │         packages/shared/src/server/agents/                      │   │
│  │  - AgentRunner (entry point)                                    │   │
│  │  - Tool Registry                                                │   │
│  │  - Context Registry                                             │   │
│  │  - Agent definitions (database-driven)                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Repository Layer                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │          packages/shared/src/server/repositories/              │   │
│  │  - UserRepository                                              │   │
│  │  - WorkoutRepository                                           │   │
│  │  - MessageRepository                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Database Layer                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL (Kysely ORM)                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

### 1. Separation of Concerns

- **API Routes**: Handle HTTP routing, request/response processing
- **Services**: Business logic and orchestration
- **Agents**: All LLM interactions and AI logic
- **Repositories**: Database operations

### 2. Database-Driven Agents

Agent definitions (prompts, models, tools, context) are stored in the `agent_definitions` table and resolved at runtime via code-side registries. See [Agent System](./agents/index.md) for details.

### 3. Environment Context System

The admin app supports switching between production and sandbox environments. This is achieved through:

- Cookie-based environment preference (`gt_env` cookie)
- Middleware injection of `X-Gymtext-Env` header
- Environment-specific connection factories

### 4. Pass-Through Architecture for Onboarding

The onboarding flow uses a pass-through architecture where:
- Frontend maintains state and sends to API via SSE
- Database is only updated upon final confirmation
- No intermediate DB writes during onboarding

## Directory Structure

```
gymtext/
├── apps/
│   ├── web/                      # Consumer app (gymtext.com)
│   ├── admin/                    # Admin portal (admin.gymtext.com)
│   └── programs/                  # Program owners portal
│
├── packages/
│   └── shared/                   # @gymtext/shared package
│       └── src/server/
│           ├── agents/           # AI agent system
│           ├── connections/      # External service factories
│           ├── context/          # Environment context
│           ├── models/           # Database schema & types
│           ├── repositories/     # Data access layer
│           ├── services/        # Business logic
│           └── utils/            # Utilities
│
├── scripts/                      # Build, test, migration scripts
├── migrations/                   # Database migrations
├── tools/                        # Development tools
└── docs/                         # Documentation
```

## Related Documentation

- [Tech Stack](./tech-stack.md) - Detailed technology breakdown
- [Database Schema](./database.md) - Database design
- [API Structure](./api-structure.md) - API routes
- [Messaging Flow](./messaging-flow.md) - SMS/WhatsApp messaging
- [Authentication](./auth.md) - Auth & authorization
