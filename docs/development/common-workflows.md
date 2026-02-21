# Common Workflows

This guide covers typical development tasks in GymText.

## Creating a New Feature

### 1. Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
```

### 2. Make Changes

```bash
# Make your code changes
# Write tests
```

### 3. Test

```bash
# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint
```

### 4. Commit

```bash
git add .
git commit -m "feat: add my new feature"
```

### 5. Push and PR

```bash
git push -u origin feature/my-new-feature
# Create PR via GitHub
```

## Database Changes

### Adding a New Table

1. **Create migration**:

```bash
pnpm migrate:create add_new_table
```

2. **Edit migration file** in `migrations/`:

```typescript
// migrations/20260220000000_add_new_table.ts
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('new_table')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('new_table').execute();
}
```

3. **Run migration**:

```bash
pnpm migrate:up
```

4. **Generate types**:

```bash
pnpm db:codegen
```

5. **Create model** (optional):

```typescript
// packages/shared/src/server/models/newTable.ts
export interface NewTable {
  id: string;
  name: string;
}
```

### Modifying Existing Table

```bash
pnpm migrate:create add_column_to_users
```

```typescript
// migrations/20260220000000_add_column_to_users.ts
export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('users')
    .addColumn('new_column', 'varchar(100)', (col) => col.defaultTo(''))
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('users')
    .dropColumn('new_column')
    .execute();
}
```

## Agent Changes

### Modifying an Agent Prompt

1. **Update via CLI**:

```bash
pnpm agent:upsert --agent chat:generate --file prompts/04-chat-agent.md
```

2. **Or update directly in database**:

```sql
UPDATE agent_definitions 
SET system_prompt = 'New prompt here...'
WHERE agent_id = 'chat:generate';
```

### Adding a New Agent

1. **Create prompt files** in `prompts/`

2. **Create migration** to add agent definition

3. **Register tools** if needed in Tool Registry

4. **Register context** if needed in Context Registry

5. **Add agent ID constant**:

```typescript
// packages/shared/src/server/agents/constants.ts
export const AGENT_NEW_AGENT = 'new:agent';
```

## Working with Environment Variables

### Adding New Environment Variable

1. **Add to `.env.example`**

2. **Add to `.env.local`**

3. **If used in Turbo**, add to `turbo.json`:

```json
{
  "globalEnv": [
    "NEW_VARIABLE"
  ],
  "tasks": {
    "build": {
      "env": ["NEW_VARIABLE"]
    }
  }
}
```

4. **Document in** `docs/reference/environment-variables.md`

## Testing Changes

### Quick Test

```bash
# Build
pnpm build

# Start dev server
pnpm dev:web
```

### Full Test

```bash
# Run tests
pnpm test

# Run lint
pnpm lint

# Build all
pnpm build
```

### SMS Test

```bash
pnpm sms:test
```

## Deployment

### Production Build

```bash
# Build all apps
pnpm build

# Verify
# Check build output in apps/*/.next
```

### Database Backup

```bash
# Before major changes
pnpm backup:local
```

## Code Review Checklist

- [ ] Tests pass
- [ ] Build succeeds
- [ ] No lint errors
- [ ] Environment variables documented
- [ ] New migrations are reversible

## Related Documentation

- [Getting Started](./getting-started.md) - Quick start
- [Local Setup](./local-setup.md) - Environment setup
- [Testing](./testing.md) - Testing approaches
