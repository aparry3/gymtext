# Technology Stack

GymText uses a modern, TypeScript-first stack optimized for rapid development and reliability.

## Core Technologies

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 16.x |
| **React** | UI library | 19.x |
| **TypeScript** | Type safety | 5.x |
| **Tailwind CSS** | Styling | v4 |
| **Radix UI** | Component primitives | Latest |
| **Zod** | Schema validation | 3.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | API routes & server functions | 16.x |
| **Kysely** | Type-safe SQL query builder | 0.28.x |
| **PostgreSQL** | Primary database | Latest |
| **LangChain** | LLM framework | 0.3.x |

### AI/LLM

| Technology | Purpose |
|------------|---------|
| **OpenAI** | Primary LLM provider (GPT-4, GPT-4o) |
| **Google Gemini** | Secondary LLM provider |
| **Pinecone** | Vector database for embeddings |

### External Services

| Service | Purpose |
|---------|---------|
| **Twilio** | SMS messaging |
| **Stripe** | Payment processing |
| **Inngest** | Background jobs & cron |

### Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager |
| **Turborepo** | Monorepo orchestration |
| **Vitest** | Testing framework |
| **tsx** | TypeScript execution |
| **Kysely Codegen** | Database type generation |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Web App │  │  Admin   │  │ Programs │  │  Shared  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │    Twilio      │ │     Stripe      │
│   (Kysely)      │ │    (SMS)       │ │  (Payments)     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                                       │
          ▼                                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Pinecone      │ │     OpenAI      │ │    Google       │
│   (Embeddings)   │ │    (GPT-4)      │ │    Gemini        │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Monorepo Structure

GymText uses pnpm workspaces with Turborepo for efficient monorepo management.

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"
```

### Apps

| App | Description | Port |
|-----|-------------|------|
| `apps/web` | Consumer-facing application | 3000 |
| `apps/admin` | Admin portal with environment switching | 3001 |
| `apps/programs` | Program owners portal | 3002 |

### Packages

| Package | Description |
|---------|-------------|
| `packages/shared` | Shared server logic, agents, models |

### Build Pipeline

Turborepo orchestrates the build pipeline:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Database

- **PostgreSQL**: Primary relational database
- **Kysely**: Type-safe query builder with codegen
- **Migrations**: Managed via custom migration system in `scripts/migrations/`

## Related Documentation

- [Architecture Overview](./overview.md) - System architecture
- [Database Schema](./database.md) - Database design
- [API Structure](./api-structure.md) - API routes
- [Environment Variables](../reference/environment-variables.md) - Required env vars
