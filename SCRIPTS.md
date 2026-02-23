# Scripts Reference

This document lists all available scripts in the GymText project.

## Database Scripts

### Migrations

```bash
# Run all pending migrations
pnpm db:migrate

# Rollback last migration
pnpm db:migrate:down

# Create a new migration
pnpm migrate:create <migration-name>
```

### Seeding

The project has a comprehensive seeding system for system data. All seed scripts use upsert operations and are safe to run multiple times (idempotent).

```bash
# Run ALL seeders (agents, exercises, templates, prompts)
pnpm seed

# Run individual seeders
pnpm seed:agents      # Seed agent definitions
pnpm seed:exercises   # Seed exercise database
pnpm seed:templates    # Seed context templates
pnpm seed:prompts     # Seed prompts

# Run all seeders (explicit)
pnpm seed:all
```

#### Seed System Details

The seed system is located in `scripts/seed/` and consists of:

- **`scripts/seed/index.ts`** - Main entry point that runs all seeders in order
- **`scripts/seed/system/agents.ts`** - Seeds agent definitions from the prompts table
- **`scripts/seed/system/exercises.ts`** - Seeds exercise database
- **`scripts/seed/system/templates.ts`** - Seeds context templates
- **`scripts/seed/system/prompts.ts`** - Seeds prompt configurations

##### Agent Seeding

The `seed:agents` command:
1. Reads prompts from the `prompts` table
2. Creates/updates entries in `agent_definitions` table
3. Configures tools, context types, and other agent settings
4. Handles the `chat:generate` agent with tool integrations

##### Exercise Seeding

The `seed:exercises` command populates the exercise database with standard exercises.

### Other Database Scripts

```bash
# Generate database types
pnpm db:codegen
```

## Development Scripts

```bash
# Start all services
pnpm dev

# Start specific service
pnpm dev:web      # Frontend only
pnpm dev:admin    # Admin panel only
pnpm dev:programs # Programs service only
```

## Build Scripts

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:web
pnpm build:admin
pnpm build:programs
```

## Utility Scripts

```bash
# Check environment variables
pnpm check-env

# Check environment variables (CI mode)
pnpm check-env:ci
```

## Migration Testing

```bash
# Full migration test: reset DB → main migrations → feature migrations → seed → codegen
pnpm test:migration
```

This automates the complete DB reset workflow. Use it to verify migrations work cleanly from scratch.

## Data Anonymization

```bash
# Anonymize production data for local development
pnpm db:anonymize

# Dry run (preview what would change)
pnpm db:anonymize:dry
```

## Test Users & Personas

```bash
# Create test user from persona (requires dev server running)
pnpm signup --persona sarah-chen

# Create all 15 test personas
pnpm signup --all

# List available personas
pnpm signup --list

# Clean up test users
pnpm test:cleanup-users
pnpm test:cleanup-users --dry-run

# Monitor local SMS in real-time
pnpm local:sms
```

See `docs/development/TEST_PERSONAS.md` for persona details.

## Testing

```bash
# Run all tests
pnpm test

# Vitest UI
pnpm test:ui

# SMS testing
pnpm sms:test
```

See `DEVELOPMENT.md` for full development guide, rules, and workflows.
