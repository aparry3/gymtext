# Database Schema

GymText uses PostgreSQL with Kysely ORM for type-safe database operations. This document provides an overview of the core database schema.

## Core Tables

### Users & Authentication

| Table | Description |
|-------|-------------|
| `users` | User accounts with phone-based authentication |
| `user_auth_codes` | SMS verification codes for auth |
| `subscriptions` | Stripe subscription tracking |

### Fitness Data

| Table | Description |
|-------|-------------|
| `fitness_profiles` | User fitness data, goals, preferences |
| `fitness_plans` | User's fitness plans with progress tracking |
| `mesocycles` | Training phases (linked to plans) |
| `microcycles` | Weekly training patterns |
| `workout_instances` | Individual workout executions |

### Messaging

| Table | Description |
|-------|-------------|
| `conversations` | SMS conversation threads |
| `messages` | Individual messages within conversations |
| `message_queues` | Queued messages for delivery |

### Programs & Content

| Table | Description |
|-------|-------------|
| `program_owners` | Program creator accounts |
| `programs` | Fitness programs |
| `program_versions` | Version history for programs |
| `program_families` | Program groupings |

### AI & Agents

| Table | Description |
|-------|-------------|
| `agent_definitions` | AI agent configurations (database-driven) |
| `agent_logs` | Agent invocation history |
| `context_templates` | Reusable prompt templates |

### System

| Table | Description |
|-------|-------------|
| `prompts` | System prompts for AI agents |
| `page_visits` | Analytics tracking |
| `admin_activity_logs` | Admin actions audit trail |
| `referrals` | User referral tracking |

## Schema Diagram

```
┌──────────────┐       ┌──────────────────┐
│    users     │──────▶│ fitness_profiles │
└──────────────┘       └──────────────────┘
         │
         │ (has many)
         ▼
┌──────────────┐       ┌──────────────────┐
│subscriptions │       │   conversations  │
└──────────────┘       └────────┬─────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   messages    │
                         └──────────────┘

┌──────────────┐       ┌──────────────────┐
│fitness_plans │──────▶│   mesocycles    │
└──────────────┘       └────────┬─────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  microcycles  │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │workout_instances│
                         └──────────────┘

┌──────────────┐       ┌──────────────────┐
│program_owners│──────▶│    programs      │
└──────────────┘       └────────┬─────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │program_versions│
                          └──────────────┘
```

## Key Entity Relationships

### User → Plan Flow

1. User creates account (`users`)
2. Profile is built (`fitness_profiles`)
3. Fitness plan is generated (`fitness_plans`)
4. Mesocycle defines training phase (`mesocycles`)
5. Microcycles define weekly patterns (`microcycles`)
6. Daily workouts are executed (`workout_instances`)

### Message Flow

1. User sends SMS to Twilio number
2. Twilio webhook hits `/api/webhooks/twilio`
3. Message is stored (`messages`)
4. ChatService processes message
5. AI agent generates response
6. Response queued (`message_queues`) and sent via Twilio

## Database Access

All database operations go through the repository layer:

```typescript
// packages/shared/src/server/repositories/
import { createRepositories } from '@gymtext/shared/server';

const repos = createRepositories(db);
const user = await repos.user.findById(userId);
```

### Available Repositories

| Repository | Methods |
|------------|---------|
| `userRepository` | findById, findByPhone, create, update |
| `messageRepository` | findByConversation, create, findRecent |
| `workoutRepository` | findByDate, findByMicrocycle, create |
| `fitnessPlanRepository` | findByUser, create, update |
| `subscriptionRepository` | findByUser, create, update, cancel |

## Code Generation

After schema changes, regenerate TypeScript types:

```bash
pnpm db:codegen
```

This runs Kysely codegen to update types in `packages/shared/src/server/models/_types/`.

## Migrations

Migrations are in the `migrations/` directory and managed via:

```bash
# Create new migration
pnpm migrate:create

# Run pending migrations
pnpm migrate:up

# Rollback last migration
pnpm migrate:down
```

## Related Documentation

- [Models Overview](../models/index.md) - Detailed model documentation
- [Architecture Overview](./overview.md) - System architecture
- [Messaging Flow](./messaging-flow.md) - Message handling
