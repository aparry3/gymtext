# Scripts Reference

## Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps via Turborepo |
| `pnpm dev:web` | Start consumer app (localhost:3000) |
| `pnpm dev:admin` | Start admin portal (localhost:3001) |
| `pnpm dev:programs` | Start programs portal (localhost:3002) |
| `pnpm build` | Build all apps |
| `pnpm build:web` | Build consumer app only |
| `pnpm build:admin` | Build admin portal only |
| `pnpm build:programs` | Build programs portal only |
| `pnpm lint` | Run ESLint on all apps |
| `pnpm db:codegen` | Generate TypeScript types from schema |
| `pnpm migrate:create` | Create new migration (interactive) |
| `pnpm migrate:up` | Apply pending migrations |
| `pnpm migrate:latest` | Apply all pending migrations |
| `pnpm migrate:down` | Rollback last migration |
| `pnpm test:migration` | Full migration test cycle |
| `pnpm db:anonymize` | Anonymize production data |
| `pnpm seed` | Run all seeders |
| `pnpm seed --agents` | Seed agent definitions only |
| `pnpm seed --exercises` | Seed exercise database only |
| `pnpm agent:list` | List all agent definitions |
| `pnpm agent:get` | Get agent definition by ID |
| `pnpm agent:upsert` | Upsert agent definition |
| `pnpm agent:update-prompts` | Update agent prompts from files |
| `pnpm signup --list` | List available test personas |
| `pnpm signup --persona [name]` | Create single test user |
| `pnpm signup --all` | Create all 15 test users |
| `pnpm test:cleanup-users` | Delete all test users |
| `pnpm local:sms` | Monitor local SMS via SSE |
| `pnpm sms:test` | Test SMS with real Twilio |
| `pnpm test` | Run Vitest tests |
| `pnpm test:ui` | Run tests with Vitest UI |
| `pnpm check-env` | Validate environment variables |
| `pnpm backup:local` | Backup local database |
| `pnpm backup:prod` | Backup production database |

---

## Build & Development

### `pnpm dev`
Start all apps via Turborepo. Web at localhost:3000, admin at localhost:3001, programs at localhost:3002.

### `pnpm build`
Build all apps in dependency order via Turborepo. **Important**: Run `source .env.local` before building — `db:codegen` runs during build and requires `DATABASE_URL`.

### `pnpm lint`
Run ESLint across all apps and packages. Also requires `source .env.local`.

---

## Database

### `pnpm migrate:create`
Interactive migration creator. Generates a timestamped migration file (YYYYMMDDHHMMSS format) in `migrations/`. Uses inquirer for prompts.

### `pnpm migrate:up` / `pnpm migrate:latest`
Apply pending migrations to the database.

### `pnpm migrate:down`
Rollback the last applied migration.

### `pnpm test:migration`
Full migration test cycle:
1. Reset database (drop all tables)
2. Apply main branch migrations
3. Apply feature branch migrations
4. Run all seeders
5. Run codegen
Validates that migrations work from scratch. Uses `READONLY_PROD_DB_URL` if available.

### `pnpm db:codegen`
Generate TypeScript types from the current PostgreSQL schema using kysely-codegen. Run after any schema changes.

### `pnpm db:anonymize` / `pnpm db:anonymize:dry`
Anonymize production data for safe local development. Replaces PII (names, phones, emails) with fake data via @faker-js/faker. Generates new UUIDs with foreign key reference mapping. `--dry-run` previews changes without writing.

### `pnpm db:dump` / `pnpm db:restore`
Export/import database data for backups.

### `pnpm db:reset-migrations`
Clear migration history for a fresh start. Use with caution.

---

## Seeding

### `pnpm seed`
Run all seeders. Idempotent (upsert-based). Equivalent to `pnpm seed --all`.

Runs in order: agents → exercises.

### `pnpm seed --agents`
Seed agent definitions from `/prompts/*.md` files. Reads prompt markdown files via `loadPrompt()`, upserts into `agent_definitions` table. This is how prompt changes get deployed — edit the `.md` file, then seed.

### `pnpm seed --exercises`
Seed the exercise database with standard exercises.

**Important**: Prompts in `/prompts/*.md` are the single source of truth. Never edit prompts directly in the database.

---

## Agent Management

### `pnpm agent:list`
List all agent definitions in the database. Shows agent_id, model, temperature, created_at.

### `pnpm agent:get`
Get a specific agent definition by ID. Shows full configuration including prompts.

### `pnpm agent:upsert`
Upsert an agent definition directly to the database. No migration needed.

### `pnpm agent:update-prompts`
Update agent prompts from source `/prompts/*.md` files. Reads markdown files, updates matching agent definitions.

### `pnpm agent:update-user-prompts` / `pnpm agent:update-user-prompts:dry`
Update user-specific prompt templates. `--dry-run` previews without writing.

---

## Test Users & Personas

### `pnpm signup --list`
List all 15 available test personas with their profiles (name, goals, experience level, etc.).

### `pnpm signup --persona [name]`
Create a single test user from a persona definition. Requires local dev server running. Flow: load persona → cleanup existing → POST to `/api/users/signup` → triggers onboarding.

Example: `pnpm signup --persona sarah-chen`

### `pnpm signup --all`
Create all 15 test personas.

### `pnpm test:cleanup-users`
Delete all test users from the database. Supports `--dry-run`.

---

## SMS Testing

### `pnpm local:sms`
Monitor local SMS messages in real-time via Server-Sent Events (SSE). **No Twilio required** — uses the local messaging client for development.

### `pnpm sms:test`
Test SMS functionality with real Twilio credentials. Requires Twilio environment variables to be configured.

---

## Testing

### `pnpm test`
Run the Vitest test suite.

### `pnpm test:ui`
Run tests with the Vitest UI for interactive debugging.

---

## Other Commands

### `pnpm check-env` / `pnpm check-env:ci`
Validate that all required environment variables are set. CI mode exits with error code on missing vars.

### `pnpm inngest`
Start the Inngest dev server for workflow development.

### `pnpm favicon:generate`
Generate favicon assets from source image.

### `pnpm backup:local` / `pnpm backup:prod`
Backup local or production database.

### `pnpm migrate:training`
Regenerate training data (mesocycles, workouts).

---

## Script Files

Scripts live in the `/scripts/` directory:

| Directory | Files | Purpose |
|-----------|-------|---------|
| `scripts/seed/` | `index.ts`, `system/agents.ts`, `system/exercises.ts` | Seeding system |
| `scripts/db/` | `anonymize-prod-to-dev.ts`, `dump-data.ts`, `restore-data.ts`, `snapshot-*.ts`, `reset-from-main.ts` | Database management |
| `scripts/migrations/` | `create.ts`, `run.ts`, `regenerate-training-data.ts` | Migration tools |
| `scripts/test-users/` | `create-test-user.ts`, `cleanup-test-users.ts` | Test user management |
| `scripts/utils/` | `common.ts`, `config.ts`, `db.ts` | Shared script utilities |
| `scripts/` | `agent-definition.ts`, `update-agent-prompts.ts`, `check-env.ts`, etc. | Agent mgmt, env validation |
