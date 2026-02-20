# Scripts Overview

> **Note:** For comprehensive script documentation with detailed examples, troubleshooting, and workflows, see **[Scripts Reference](../reference/SCRIPTS.md)**.

This page provides a quick overview. The reference guide above has complete details.

## Directory Structure

```
scripts/
├── migrations/              # Database migration scripts
├── db/                      # Database utilities
├── utils/                   # Shared utilities
├── archive/                 # Archived scripts
│
├── seed-exercises.ts        # Seed exercise database
├── seed-exercise-embeddings.ts # Seed vector embeddings
├── seed-context-templates.ts # Seed prompt templates
├── migrate-prompts.ts       # Migrate agent prompts
├── update-agent-prompts.ts # Update agent prompts
├── agent-definition.ts      # Manage agent definitions
├── sms-test.ts             # Test SMS functionality
└── generate-favicons.js   # Generate favicons
```

## Database Scripts

### Migrations

```bash
# Create new migration (interactive)
pnpm migrate:create

# Run pending migrations
pnpm migrate:up

# Rollback last migration
pnpm migrate:down

# Run migrations (alias)
pnpm db:migrate
```

### Database Utilities

```bash
# Dump database
pnpm db:dump

# Restore database
pnpm db:restore

# Reset migration history
pnpm db:reset-migrations

# Anonymize production data for dev
pnpm db:anonymize
pnpm db:anonymize:dry   # Dry run
```

## Seeding Scripts

### Exercise Database

```bash
# Seed exercise database
pnpm seed:exercises
```

Seeds the `exercises` table with workout exercises.

### Embeddings

```bash
# Generate exercise embeddings for vector search
pnpm seed:embeddings
```

### Context Templates

```bash
# Seed context prompt templates
pnpm seed:templates
```

## Agent Management Scripts

### List Agents

```bash
pnpm agent:list
```

Lists all agent definitions from the database.

### Get Agent

```bash
pnpm agent:get chat:generate
```

Gets a specific agent definition by ID.

### Upsert Agent

```bash
pnpm agent:upsert --agent chat:generate --file prompts/04-chat-agent.md
```

Updates or inserts an agent definition from a prompt file.

### Update Prompts

```bash
pnpm agent:update-prompts
```

Batch updates agent prompts from the `prompts/` directory.

## Testing Scripts

### SMS Test

```bash
pnpm sms:test
```

Tests SMS functionality locally. Requires Twilio credentials in `.env.local`.

## Build Scripts

### Generate Favicons

```bash
pnpm favicon:generate
```

Generates favicons from source images.

## Backup Scripts

### Local Backup

```bash
pnpm backup:local
```

Backups local database (requires `.env.local`).

### Production Backup

```bash
pnpm backup:prod
```

Backups production database (requires `.env.production`).

## Migration Scripts (Special)

### Prompt Migration

```bash
pnpm migrate:prompts
```

Migrates agent prompts to the database.

### Training Data Regeneration

```bash
pnpm migrate:training
```

Regenerates training data.

## Common Workflows

### Creating a New Agent

```bash
# 1. Write prompt files in prompts/ directory
# 2. Create agent definition
pnpm agent:upsert --agent my-new-agent --file prompts/my-agent.md

# 3. Verify
pnpm agent:list
pnpm agent:get my-new-agent
```

### Running Migrations

```bash
# 1. Create new migration
pnpm migrate:create

# 2. Edit migration file
# ...

# 3. Run migration
pnpm migrate:up

# 4. Generate types
pnpm db:codegen
```

### Testing SMS Locally

```bash
# 1. Ensure .env.local has Twilio credentials
# 2. Run test
pnpm sms:test
```

## Related Documentation

- [Getting Started](../development/getting-started.md) - Development setup
- [Database Schema](../architecture/database.md) - Database design
- [Agent System](../agents/index.md) - Agent system
