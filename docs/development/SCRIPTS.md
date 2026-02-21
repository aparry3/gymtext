# SCRIPTS.md - GymText NPM Scripts Reference

> **Single source of truth for all npm scripts in the GymText monorepo**

All scripts are run with `pnpm <script-name>` or `pnpm run <script-name>`.

## Table of Contents

- [Development](#development)
- [Build](#build)
- [Linting](#linting)
- [Inngest](#inngest)
- [Database Management](#database-management)
- [Migrations](#migrations)
- [Seeding](#seeding)
- [SMS & Messaging](#sms--messaging)
- [Local Development Tools](#local-development-tools)
- [Backup](#backup)
- [Agent Management](#agent-management)
- [Asset Generation](#asset-generation)

---

## Development

Start development servers for the monorepo apps.

### `dev`
**Command:** `turbo dev`  
**Description:** Start all apps in development mode simultaneously  
**Prerequisites:** None  
**Usage:**
```bash
pnpm dev
```

### `dev:web`
**Command:** `turbo dev --filter=web`  
**Description:** Start only the web app in development mode  
**Prerequisites:** None  
**Usage:**
```bash
pnpm dev:web
```

### `dev:admin`
**Command:** `turbo dev --filter=admin`  
**Description:** Start only the admin app in development mode  
**Prerequisites:** None  
**Usage:**
```bash
pnpm dev:admin
```

### `dev:programs`
**Command:** `turbo dev --filter=programs`  
**Description:** Start only the programs app in development mode  
**Prerequisites:** None  
**Usage:**
```bash
pnpm dev:programs
```

---

## Build

Build production-ready bundles for deployment.

> **⚠️ IMPORTANT: TypeScript compilation (`tsc`) is NOT enough!**
> 
> Always verify changes with `pnpm build`, not just type checking. Here's why:
> - **`tsc`** only validates TypeScript types
> - **`pnpm build`** runs the full Next.js build pipeline: bundling, tree-shaking, route generation, static optimization
> - Code that passes `tsc` can still fail `pnpm build` due to:
>   - Import resolution errors
>   - Missing dependencies
>   - Circular dependencies
>   - Build-time configuration issues
>   - Next.js-specific constraints
> 
> **Rule of thumb**: Run `pnpm build` before committing significant changes to catch build failures early.

### `build`
**Command:** `turbo build`  
**Description:** Build all apps for production  
**Prerequisites:** None  
**Usage:**
```bash
pnpm build
```

### `build:web`
**Command:** `turbo build --filter=web`  
**Description:** Build only the web app for production  
**Prerequisites:** None  
**Usage:**
```bash
pnpm build:web
```

### `build:admin`
**Command:** `turbo build --filter=admin`  
**Description:** Build only the admin app for production  
**Prerequisites:** None  
**Usage:**
```bash
pnpm build:admin
```

### `build:programs`
**Command:** `turbo build --filter=programs`  
**Description:** Build only the programs app for production  
**Prerequisites:** None  
**Usage:**
```bash
pnpm build:programs
```

---

## Linting

Code quality and formatting checks.

### `lint`
**Command:** `turbo lint`  
**Description:** Run ESLint across all packages in the monorepo  
**Prerequisites:** None  
**Usage:**
```bash
pnpm lint
```

---

## Inngest

Background job and event processing.

### `inngest`
**Command:** `npx inngest-cli@latest dev`  
**Description:** Start the Inngest development server for local event processing  
**Prerequisites:** Inngest account and configuration  
**Usage:**
```bash
pnpm inngest
```
**Notes:** Used to test and develop Inngest functions locally before deploying.

---

## Database Management

Core database operations (dump, restore, anonymization, codegen).

### `db:codegen`
**Command:** `pnpm --filter @gymtext/shared db:codegen`  
**Description:** Generate TypeScript types from the database schema using Kysely  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm db:codegen
```
**Notes:** Run this after making schema changes or migrations to update type definitions.

### `db:dump`
**Command:** `tsx scripts/db/dump-data.ts`  
**Description:** Export database data to JSON files for backup or transfer  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm db:dump
```

### `db:restore`
**Command:** `tsx scripts/db/restore-data.ts`  
**Description:** Restore database data from previously dumped JSON files  
**Prerequisites:** `DATABASE_URL` in `.env.local`, dump files exist  
**Usage:**
```bash
pnpm db:restore
```

### `db:reset-migrations`
**Command:** `tsx scripts/db/reset-migration-history.ts`  
**Description:** Clear migration history (use with caution in development only)  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm db:reset-migrations
```
**⚠️ Warning:** This is a destructive operation. Only use in development.

### `db:anonymize`
**Command:** `source .env.local && tsx scripts/db/anonymize-prod-to-dev.ts`  
**Description:** Anonymize production data for safe use in development/testing  
**Prerequisites:** Source `.env.local` with `DATABASE_URL` and production credentials  
**Usage:**
```bash
pnpm db:anonymize
```
**Notes:** Replaces sensitive user data (names, emails, phone numbers) with fake data.

### `db:anonymize:dry`
**Command:** `source .env.local && tsx scripts/db/anonymize-prod-to-dev.ts --dry-run`  
**Description:** Preview anonymization changes without applying them  
**Prerequisites:** Source `.env.local` with `DATABASE_URL` and production credentials  
**Parameters:** `--dry-run` flag  
**Usage:**
```bash
pnpm db:anonymize:dry
```

---

## Migrations

Database schema migration management.

### `db:migrate`
**Command:** `tsx scripts/migrations/run.ts latest`  
**Description:** Run all pending migrations to bring the database up to date  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm db:migrate
```
**Alias:** `migrate:latest`

### `migrate:latest`
**Command:** `tsx scripts/migrations/run.ts latest`  
**Description:** Alias for `db:migrate` - run all pending migrations  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm migrate:latest
```

### `db:migrate:down`
**Command:** `tsx scripts/migrations/run.ts down`  
**Description:** Rollback the last applied migration  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm db:migrate:down
```
**Alias:** `migrate:down`

### `migrate:down`
**Command:** `tsx scripts/migrations/run.ts down`  
**Description:** Alias for `db:migrate:down` - rollback the last migration  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm migrate:down
```

### `db:migrate:create`
**Command:** `tsx scripts/migrations/create.ts`  
**Description:** Create a new migration file with timestamp prefix  
**Prerequisites:** None  
**Usage:**
```bash
pnpm db:migrate:create
```
**Notes:** Follow the interactive prompts to name your migration.  
**Alias:** `migrate:create`

### `migrate:create`
**Command:** `tsx scripts/migrations/create.ts`  
**Description:** Alias for `db:migrate:create` - create a new migration file  
**Prerequisites:** None  
**Usage:**
```bash
pnpm migrate:create
```

### `migrate:up`
**Command:** `tsx scripts/migrations/run.ts up`  
**Description:** Run the next pending migration (one at a time)  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm migrate:up
```

### `migrate:training`
**Command:** `tsx scripts/migrations/regenerate-training-data.ts`  
**Description:** Regenerate training data after schema changes  
**Prerequisites:** `DATABASE_URL` in `.env.local`  
**Usage:**
```bash
pnpm migrate:training
```

### `migrate:prompts`
**Command:** `tsx scripts/update-agent-prompts.ts`  
**Description:** Update agent system prompts from the `prompts/` directory  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`  
**Usage:**
```bash
pnpm migrate:prompts
```
**Notes:** Updates the `agent_definitions` table with latest prompt templates.

---

## Seeding

Populate database with initial or test data.

### `seed:exercises`
**Command:** `source .env.local && npx tsx scripts/seed-exercises.ts`  
**Description:** Import exercise data into the database from `exercises.json`  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`, `exercises.json` file exists  
**Usage:**
```bash
pnpm seed:exercises
```

### `seed:exercise-db`
**Command:** `npx tsx scripts/seed-exercise-db.ts`  
**Description:** Seed the exercise database with base data  
**Prerequisites:** `DATABASE_URL` in environment  
**Usage:**
```bash
pnpm seed:exercise-db
```

### `seed:embeddings`
**Command:** `tsx scripts/seed-exercise-embeddings.ts`  
**Description:** Generate and store vector embeddings for exercise search  
**Prerequisites:** `DATABASE_URL` and OpenAI/embedding API credentials in `.env.local`  
**Usage:**
```bash
pnpm seed:embeddings
```
**Notes:** This can be a long-running operation for large exercise databases.

### `seed:templates`
**Command:** `source .env.local && npx tsx scripts/seed-context-templates.ts`  
**Description:** Seed context templates for agent workflows  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`  
**Usage:**
```bash
pnpm seed:templates
```

---

## SMS & Messaging

Test and debug SMS/messaging functionality.

### `sms:test`
**Command:** `source .env.local && tsx scripts/sms-test.ts`  
**Description:** Test SMS sending and receiving functionality  
**Prerequisites:** Source `.env.local` with Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_NUMBER`)  
**Usage:**
```bash
pnpm sms:test
```

---

## Local Development Tools

Tools for local testing and development.

### `local:sms`
**Command:** `node tools/local-sms-cli/dist/index.js`  
**Description:** Start the local SMS CLI simulator for testing without real SMS  
**Prerequisites:** Build the tool first with `local:sms:build`  
**Usage:**
```bash
pnpm local:sms
```

### `local:sms:build`
**Command:** `cd tools/local-sms-cli && pnpm exec tsc`  
**Description:** Compile the local SMS CLI tool from TypeScript to JavaScript  
**Prerequisites:** None  
**Usage:**
```bash
pnpm local:sms:build
```
**Notes:** Run this before using `local:sms` for the first time or after changes.

---

## Backup

Database backup operations.

### `backup:local`
**Command:** `source .env.local && ./scripts/backup-db.sh`  
**Description:** Create a backup of the local development database  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`, `scripts/backup-db.sh` must exist  
**Usage:**
```bash
pnpm backup:local
```
**Status:** ⚠️ Script referenced but not yet implemented

### `backup:prod`
**Command:** `source .env.production && ./scripts/backup-db.sh`  
**Description:** Create a backup of the production database  
**Prerequisites:** Source `.env.production` with production `DATABASE_URL`, `scripts/backup-db.sh` must exist  
**Usage:**
```bash
pnpm backup:prod
```
**Status:** ⚠️ Script referenced but not yet implemented  
**⚠️ Warning:** Requires production credentials - handle with care

---

## Agent Management

Manage AI agent definitions and prompts in the database.

### `agent:upsert`
**Command:** `source .env.local && tsx scripts/agent-definition.ts upsert`  
**Description:** Create or update an agent definition in the database  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`  
**Usage:**
```bash
pnpm agent:upsert
```
**Notes:** Interactive - follow prompts to provide agent details.

### `agent:get`
**Command:** `source .env.local && tsx scripts/agent-definition.ts get`  
**Description:** Retrieve and display an agent definition by ID  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`  
**Usage:**
```bash
pnpm agent:get
```
**Notes:** Interactive - you'll be prompted for the agent ID.

### `agent:list`
**Command:** `source .env.local && tsx scripts/agent-definition.ts list`  
**Description:** List all agent definitions in the database  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`  
**Usage:**
```bash
pnpm agent:list
```

### `agent:update-prompts`
**Command:** `source .env.local && tsx scripts/update-agent-prompts.ts`  
**Description:** Update all agent system prompts from markdown files in `prompts/`  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`, prompt files exist in `prompts/` directory  
**Usage:**
```bash
pnpm agent:update-prompts
```
**Notes:** See [scripts/README-update-prompts.md](../../scripts/README-update-prompts.md) for details.  
**Alias:** `migrate:prompts`

### `agent:update-user-prompts`
**Command:** `source .env.local && tsx scripts/update-user-prompts.ts`  
**Description:** Update user-facing prompt templates for agents  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`  
**Usage:**
```bash
pnpm agent:update-user-prompts
```

### `agent:update-user-prompts:dry`
**Command:** `source .env.local && tsx scripts/update-user-prompts.ts --dry-run`  
**Description:** Preview user prompt updates without applying them  
**Prerequisites:** Source `.env.local` with `DATABASE_URL`  
**Parameters:** `--dry-run` flag  
**Usage:**
```bash
pnpm agent:update-user-prompts:dry
```

---

## Asset Generation

Generate static assets for the application.

### `favicon:generate`
**Command:** `node scripts/generate-favicons.js`  
**Description:** Generate favicon files in multiple sizes from source image  
**Prerequisites:** Source image exists, Sharp library installed  
**Usage:**
```bash
pnpm favicon:generate
```

---

## Common Workflows

### First-Time Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Run migrations
pnpm migrate:latest

# 4. Generate types
pnpm db:codegen

# 5. Seed data (optional)
pnpm seed:exercises
pnpm seed:templates

# 6. Start development
pnpm dev
```

### After Schema Changes
```bash
# 1. Create migration
pnpm migrate:create

# 2. Edit migration file in migrations/

# 3. Run migration
pnpm migrate:latest

# 4. Regenerate types
pnpm db:codegen
```

### Updating Agent Prompts
```bash
# 1. Edit markdown files in prompts/

# 2. Update database
pnpm agent:update-prompts

# 3. Verify changes
pnpm agent:list
```

---

## Environment Variables Required

Most scripts require environment variables to be set in `.env.local`:

| Variable | Required By | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Most DB scripts | PostgreSQL connection string |
| `TWILIO_ACCOUNT_SID` | SMS scripts | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | SMS scripts | Twilio authentication token |
| `TWILIO_NUMBER` | SMS scripts | Twilio phone number |
| `OPENAI_API_KEY` | Embedding scripts | OpenAI API key for embeddings |

**Note:** Scripts that require environment variables typically use `source .env.local` prefix to load them.

---

## Script Conventions

### Sourcing Environment
Scripts that need environment variables use:
```bash
source .env.local && <command>
```

### TypeScript Execution
Most scripts use `tsx` for direct TypeScript execution:
```bash
tsx scripts/<script-name>.ts
```

### Turbo Filtering
Monorepo workspace scripts use Turbo's `--filter` flag:
```bash
turbo <command> --filter=<workspace-name>
```

### Dry Run Pattern
Destructive operations support `--dry-run` for safety:
```bash
tsx scripts/<script>.ts --dry-run
```

---

## Troubleshooting

### "DATABASE_URL not found"
- Ensure `.env.local` exists with `DATABASE_URL` set
- Use `source .env.local` prefix for scripts that need it
- Check that the database is running

### "Migration failed"
- Check migration file syntax
- Ensure database is accessible
- Review migration logs for specific errors
- Use `pnpm migrate:down` to rollback if needed

### "Type generation failed"
- Ensure database schema is up to date
- Run `pnpm migrate:latest` first
- Check Kysely codegen configuration

---

**Last Updated:** 2024-02-21  
**Maintainer:** Development Team  
**Related Docs:**
- [Local Setup](./local-setup.md)
- [Common Workflows](./common-workflows.md)
- [Scripts Directory](../../scripts/README.md)
