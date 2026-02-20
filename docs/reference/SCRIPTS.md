# Scripts Reference

Complete reference for all npm/pnpm scripts in the GymText monorepo. This guide enables agents and developers to find the right script for any task without parsing `package.json`.

## Quick Reference Table

| Category | Script | Purpose |
|----------|--------|---------|
| **Development** | `pnpm dev` | Start all apps in dev mode |
| | `pnpm dev:web` | Start web app only |
| | `pnpm dev:admin` | Start admin app only |
| | `pnpm dev:programs` | Start programs app only |
| **Build** | `pnpm build` | Build all apps for production |
| | `pnpm build:web` | Build web app only |
| | `pnpm build:admin` | Build admin app only |
| | `pnpm build:programs` | Build programs app only |
| **Database** | `pnpm db:migrate` | Run pending migrations |
| | `pnpm db:migrate:create` | Create new migration |
| | `pnpm db:migrate:down` | Rollback last migration |
| | `pnpm db:codegen` | Generate Kysely types |
| | `pnpm db:dump` | Dump database to JSON |
| | `pnpm db:restore` | Restore from dump |
| | `pnpm db:reset-migrations` | Reset migration history |
| | `pnpm db:anonymize` | Anonymize prod data |
| **Seeding** | `pnpm seed:exercises` | Seed exercise table |
| | `pnpm seed:exercise-db` | Seed full exercise DB |
| | `pnpm seed:embeddings` | Generate vector embeddings |
| | `pnpm seed:templates` | Seed context templates |
| **Agents** | `pnpm agent:list` | List all agents |
| | `pnpm agent:get` | Get specific agent |
| | `pnpm agent:upsert` | Create/update agent |
| | `pnpm agent:update-prompts` | Batch update prompts |
| **Testing** | `pnpm sms:test` | Test Twilio SMS |
| **Utilities** | `pnpm favicon:generate` | Generate favicons |
| | `pnpm inngest` | Run Inngest dev server |
| **Backup** | `pnpm backup:local` | Backup local DB |
| | `pnpm backup:prod` | Backup production DB |
| **Migration** | `pnpm migrate:prompts` | Migrate prompts to DB |
| | `pnpm migrate:training` | Regenerate training data |

---

## Development Scripts

### `pnpm dev`

Starts all Next.js applications in development mode using Turbo.

```bash
pnpm dev
```

**What it does:** Runs `turbo dev` which starts web, admin, and programs apps concurrently on their respective ports.

**When to use:** Regular development. Watches for file changes and hot-reloads.

**Environment:** Uses `.env.local`

---

### `pnpm dev:web`

Starts only the consumer web application.

```bash
pnpm dev:web
```

**What it does:** Runs `turbo dev --filter=web` to start only the web app.

**When to use:** When working on the consumer-facing app only.

---

### `pnpm dev:admin`

Starts only the admin portal.

```bash
pnpm dev:admin
```

**What it does:** Runs `turbo dev --filter=admin` to start only the admin app.

**When to use:** When working on the admin dashboard only.

---

### `pnpm dev:programs`

Starts only the programs portal.

```bash
pnpm dev:programs
```

**What it does:** Runs `turbo dev --filter=programs` to start only the programs app.

**When to use:** When working on the program owners portal only.

---

## Build Scripts

### `pnpm build`

Builds all apps for production.

```bash
pnpm build
```

**What it does:** Runs `turbo build` which builds all applications for production deployment.

**When to use:** Before deploying or testing production builds.

**Environment:** Uses `.env.production` (or environment-specific env)

**Prerequisites:**
- All migrations must be run (`pnpm db:migrate`)
- Database types must be generated (`pnpm db:codegen`)

---

### `pnpm build:web`

Builds only the web app for production.

```bash
pnpm build:web
```

**What it does:** Runs `turbo build --filter=web`

**When to use:** Deploying only the web app.

---

### `pnpm build:admin`

Builds only the admin app for production.

```bash
pnpm build:admin
```

**What it does:** Runs `turbo build --filter=admin`

**When to use:** Deploying only the admin app.

---

### `pnpm build:programs`

Builds only the programs app for production.

```bash
pnpm build:programs
```

**What it does:** Runs `turbo build --filter=programs`

**When to use:** Deploying only the programs app.

---

### `pnpm lint`

Runs linting on all apps.

```bash
pnpm lint
```

**What it does:** Runs `turbo lint` which executes ESLint on all packages and apps.

**When to use:** Before committing code to check for linting errors.

---

### `pnpm inngest`

Runs the Inngest event-driven server locally.

```bash
pnpm inngest
```

**What it does:** Starts the Inngest dev server for testing background jobs and event-driven workflows.

**When to use:** Developing features that use Inngest for async processing.

**Note:** Requires npx/inngest-cli to be installed. The `@latest` version is always used.

---

## Database - Migrations

### `pnpm db:migrate` / `pnpm migrate:latest`

Runs all pending database migrations.

```bash
pnpm db:migrate
# or
pnpm migrate:latest
```

**What it does:** Executes `tsx scripts/migrations/run.ts latest` which runs all pending migration files.

**When to use:**
- Setting up a fresh database
- After pulling changes that include new migrations
- Before building for production

**Required environment variables:**
- `DATABASE_URL` (via `.env.local` or `.env.production`)

**Prerequisites:**
- Database server must be running
- Migration files must exist in `scripts/migrations/`

**Related:** `pnpm db:codegen` - Generate types after migrations

---

### `pnpm db:migrate:create` / `pnpm migrate:create`

Creates a new migration file.

```bash
pnpm migrate:create
```

**What it does:** Runs `tsx scripts/migrations/create.ts` which creates a new migration file (interactive prompt).

**When to use:** When you need to modify the database schema.

**Creates:** A new file in `scripts/migrations/` with up/down functions.

**Workflow:**
```bash
# 1. Create migration
pnpm migrate:create

# 2. Edit migration file to add your changes

# 3. Run migration
pnpm db:migrate

# 4. Generate types
pnpm db:codegen
```

---

### `pnpm db:migrate:down` / `pnpm migrate:down`

Rolls back the most recent migration.

```bash
pnpm db:migrate:down
# or
pnpm migrate:down
```

**What it does:** Executes `tsx scripts/migrations/run.ts down` which reverts the last applied migration.

**When to use:**
- Undoing a migration that caused issues
- During development to recreate tables

**Warning:** Be careful in production - this can cause data loss.

---

### `pnpm migrate:up`

Runs pending migrations one at a time.

```bash
pnpm migrate:up
```

**What it does:** Runs `tsx scripts/migrations/run.ts up` which applies one pending migration.

**When to use:** When you want more control over migration execution.

---

## Database - Code Generation

### `pnpm db:codegen`

Generates TypeScript types from database schema.

```bash
pnpm db:codegen
```

**What it does:** Runs `pnpm --filter @gymtext/shared db:codegen` which uses Kysely codegen to generate type definitions from the database.

**When to use:**
- After running migrations
- When the database schema changes
- When columns are added/removed

**Output:** Generates type files in `packages/shared/src/db/` (typically `types.ts`)

**Prerequisites:**
- Database must be accessible (`DATABASE_URL`)
- Migrations must have been run

---

## Database - Utilities

### `pnpm db:dump`

Dumps database to JSON files.

```bash
pnpm db:dump
```

**What it does:** Runs `tsx scripts/db/dump-data.ts` which exports database tables to JSON files.

**When to use:**
- Backing up data before migrations
- Sharing test data
- Creating seed data for other environments

**Required environment variables:**
- `DATABASE_URL`

**Output:** JSON files in a `dumps/` or similar directory (check script for exact location)

---

### `pnpm db:restore`

Restores database from dump files.

```bash
pnpm db:restore
```

**What it does:** Runs `tsx scripts/db/restore-data.ts` which imports data from JSON dump files.

**When to use:**
- Restoring from a backup
- Populating a database with test data
- Syncing data between environments

**Required environment variables:**
- `DATABASE_URL`

**Warning:** May conflict with existing data - consider resetting first.

---

### `pnpm db:reset-migrations`

Resets the migration history table.

```bash
pnpm db:reset-migrations
```

**What it does:** Runs `tsx scripts/db/reset-migration-history.ts` which clears the migration tracking table.

**When to use:**
- When migration history is corrupted
- Starting fresh with a clean database

**Warning:** This does NOT rollback actual schema changes - it only clears the tracking table. You may need to drop and recreate tables manually.

---

### `pnpm db:anonymize`

Anonymizes production data for development.

```bash
pnpm db:anonymize
```

**What it does:** Runs `tsx scripts/db/anonymize-prod-to-dev.ts` which creates a copy of production data with PII (Personally Identifiable Information) removed/replaced.

**When to use:**
- Getting a safe copy of production data for local development
- Sharing data with team members

**Required environment variables:**
- Source database (production)
- Destination database (development)

**Privacy:** Replaces names, emails, phone numbers with fake data.

---

### `pnpm db:anonymize:dry`

Dry run of anonymization (shows what would be done).

```bash
pnpm db:anonymize:dry
```

**What it does:** Runs the same script as `db:anonymize` but with `--dry-run` flag.

**When to use:** Before running actual anonymization to verify the process.

---

## Database - Seeding

### `pnpm seed:exercises`

Seeds the exercises table.

```bash
pnpm seed:exercises
```

**What it does:** Runs `tsx scripts/seed-exercises.ts` which populates the `exercises` table with workout exercises.

**When to use:**
- Initial setup
- Adding new exercises to the database

**Required environment variables:**
- `DATABASE_URL` (via `source .env.local`)

**Data source:** Likely reads from a static list or JSON file in the scripts directory.

---

### `pnpm seed:exercise-db`

Seeds the full exercise database.

```bash
pnpm seed:exercise-db
```

**What it does:** Runs `tsx scripts/seed-exercise-db.ts` which populates the exercise database with comprehensive data.

**When to use:** Full exercise database setup (more comprehensive than `seed:exercises`).

**Required environment variables:**
- `DATABASE_URL`

---

### `pnpm seed:embeddings`

Generates vector embeddings for exercises.

```bash
pnpm seed:embeddings
```

**What it does:** Runs `tsx scripts/seed-exercise-embeddings.ts` which generates vector embeddings for exercises and stores them in Pinecone.

**When to use:**
- After seeding exercises
- When updating exercise embeddings for semantic search

**Required environment variables:**
- `DATABASE_URL`
- `PINECONE_API_KEY`
- `OPENAI_API_KEY` (for generating embeddings)

**Note:** This enables semantic search for exercises.

---

### `pnpm seed:templates`

Seeds context prompt templates.

```bash
pnpm seed:templates
```

**What it does:** Runs `tsx scripts/seed-context-templates.ts` which populates the database with prompt templates for AI agents.

**When to use:**
- Initial setup
- Updating available prompt templates

**Required environment variables:**
- `DATABASE_URL` (via `source .env.local`)

---

## Agent Management

### `pnpm agent:list`

Lists all agent definitions from the database.

```bash
pnpm agent:list
```

**What it does:** Runs `tsx scripts/agent-definition.ts list` which queries and displays all registered agents.

**When to use:**
- Seeing what agents are available
- Verifying agent registration

**Required environment variables:**
- `DATABASE_URL` (via `source .env.local`)

**Output:** Table showing agent IDs, names, and metadata.

---

### `pnpm agent:get`

Gets a specific agent definition.

```bash
pnpm agent:get <agent-id>
# Example:
pnpm agent:get chat:generate
```

**What it does:** Runs `tsx scripts/agent-definition.ts get <agent-id>` which retrieves a specific agent's full configuration.

**When to use:**
- Viewing agent configuration
- Debugging agent behavior

**Required environment variables:**
- `DATABASE_URL` (via `source .env.local`)

---

### `pnpm agent:upsert`

Creates or updates an agent definition.

```bash
pnpm agent:upsert --agent <agent-id> --file <path-to-prompt>
# Example:
pnpm agent:upsert --agent chat:generate --file prompts/04-chat-agent.md
```

**What it does:** Runs `tsx scripts/agent-definition.ts upsert` which reads a prompt file and creates/updates the agent in the database.

**When to use:**
- Creating a new agent
- Updating an existing agent's prompt

**Required environment variables:**
- `DATABASE_URL` (via `source .env.local`)

**Arguments:**
- `--agent` or `-a`: Agent ID (e.g., `chat:generate`)
- `--file` or `-f`: Path to prompt markdown file

---

### `pnpm agent:update-prompts`

Batch updates all agent prompts from the prompts directory.

```bash
pnpm agent:update-prompts
```

**What it does:** Runs `tsx scripts/update-agent-prompts.ts` which reads all prompt files from the `prompts/` directory and updates corresponding agents in the database.

**When to use:**
- After modifying multiple prompt files
- Syncing local prompts with database

**Required environment variables:**
- `DATABASE_URL` (via `source .env.local`)

**Prompts directory:** Typically `prompts/` in the project root.

---

## Testing Scripts

### `pnpm sms:test`

Tests SMS functionality with Twilio.

```bash
pnpm sms:test
```

**What it does:** Runs `tsx scripts/sms-test.ts` which sends a test SMS message.

**When to use:**
- Verifying Twilio configuration
- Testing SMS delivery

**Required environment variables:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_NUMBER`
- (All via `source .env.local`)

**Note:** Will send an actual SMS (may incur charges).

---

## Utilities

### `pnpm favicon:generate`

Generates favicons from source images.

```bash
pnpm favicon:generate
```

**What it does:** Runs `node scripts/generate-favicons.js` which creates various favicon sizes from a source image.

**When to use:**
- After adding/changing the brand logo
- Before deployment

**Input:** Source image (typically in `public/` or `scripts/`) - check script for exact requirements.

**Output:** Multiple favicon files in various sizes/formats.

---

## Backup Scripts

### `pnpm backup:local`

Backs up the local database.

```bash
pnpm backup:local
```

**What it does:** Sources `.env.local` and runs `scripts/backup-db.sh` which creates a backup of the local database.

**When to use:**
- Before making schema changes
- Regular local backups

**Required environment variables:**
- `DATABASE_URL` (via `source .env.local`)

**Output:** Backup file (location depends on script).

---

### `pnpm backup:prod`

Backs up the production database.

```bash
pnpm backup:prod
```

**What it does:** Sources `.env.production` and runs `scripts/backup-db.sh` which creates a backup of the production database.

**When to use:**
- Before production deployments
- Regular production backups

**Required environment variables:**
- `DATABASE_URL` (via `.env.production`)

**Warning:** Production backups should be handled with extra care.

---

## Special Migrations

### `pnpm migrate:prompts`

Migrates agent prompts to the database.

```bash
pnpm migrate:prompts
```

**What it does:** Runs `tsx scripts/migrate-prompts.ts` which imports prompt templates into the database.

**When to use:**
- Initial setup of agent prompts
- Bulk import of prompts

**Required environment variables:**
- `DATABASE_URL`

---

### `pnpm migrate:training`

Regenerates training data.

```bash
pnpm migrate:training
```

**What it does:** Runs `tsx scripts/migrations/regenerate-training-data.ts` which rebuilds or refreshes training data used by AI models.

**When to use:**
- After significant data changes
- Updating model training data

**Required environment variables:**
- `DATABASE_URL`

---

## Workflow Examples

### Setting Up a Fresh Local Database

```bash
# 1. Ensure .env.local has DATABASE_URL
# 2. Run migrations
pnpm db:migrate

# 3. Generate types
pnpm db:codegen

# 4. Seed data
pnpm seed:exercises
pnpm seed:embeddings
pnpm seed:templates

# 5. Start development
pnpm dev
```

### Creating and Running a New Migration

```bash
# 1. Create migration file
pnpm migrate:create
# Follow interactive prompts to name your migration

# 2. Edit the migration file
# Add your up() and down() functions

# 3. Run the migration
pnpm db:migrate

# 4. Generate types
pnpm db:codegen

# 5. Verify in local dev
pnpm dev
```

### Creating a New Agent

```bash
# 1. Write the prompt file
# Create prompts/my-new-agent.md with system prompt

# 2. Register the agent
pnpm agent:upsert --agent my-new-agent --file prompts/my-new-agent.md

# 3. Verify
pnpm agent:list
pnpm agent:get my-new-agent
```

### Getting Production Data for Development

```bash
# 1. Anonymize production data
pnpm db:anonymize

# 2. Or dry run first to see what will happen
pnpm db:anonymize:dry
```

### Updating All Agent Prompts

```bash
# 1. Modify prompt files in prompts/ directory
# 2. Batch update
pnpm agent:update-prompts
```

### Testing After a Production Build

```bash
# 1. Build the project
pnpm build

# 2. Test production build locally
# (typically runs on localhost:3000)
```

---

## Script Dependencies

Some scripts must be run in a specific order:

| Task | Required First | Required After |
|------|-----------------|----------------|
| `pnpm build` | `pnpm db:migrate` | `pnpm db:codegen` |
| `pnpm db:codegen` | `pnpm db:migrate` | - |
| `pnpm seed:embeddings` | `pnpm seed:exercises` | - |
| `pnpm dev` | `pnpm db:migrate` | - |
| `pnpm agent:get` | `pnpm agent:upsert` | - |

---

## Troubleshooting

### "Database connection refused"
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`

### "Migration failed"
- Check migration SQL syntax
- Ensure database user has proper permissions
- Try `pnpm db:migrate:down` if partially applied

### "Codegen types are outdated"
- Run `pnpm db:migrate` first
- Then run `pnpm db:codegen`

### "Seed script fails"
- Ensure migrations have run
- Check DATABASE_URL is correct

### "Agent not found"
- Run `pnpm agent:list` to see available agents
- Ensure agent was created with `pnpm agent:upsert`

---

## Related Documentation

- [Environment Variables](./environment-variables.md) - Required env vars
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [Getting Started](../development/getting-started.md) - Quick start guide
- [Architecture Overview](../architecture/overview.md) - System design
- [Agent System](../agents/index.md) - AI agent documentation
