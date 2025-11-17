# Production Backup and Migration Testing Guide

## Quick Start (Recommended)

Use the automated script:

```bash
chmod +x scripts/backup-and-test-migration.sh
./scripts/backup-and-test-migration.sh
```

**The script automatically:**
- Reads production DATABASE_URL from `.env.production`
- Prefers `DATABASE_URL_UNPOOLED` for better backup performance
- Falls back to prompting if `.env.production` not found
- Uses `.env.local` for local test database operations

**What it does:**
1. Load production config from `.env.production`
2. Backup production database
3. Restore to local test database
4. Run migration on test data
5. Verify results
6. Cleanup

**Prerequisites:**
- `.env.production` file with your production DATABASE_URL
- `.env.local` file with your local DATABASE_URL
- PostgreSQL installed locally (`pg_dump`, `psql` commands available)

**Example output:**
```
=== GymText Database Backup & Migration Test ===

Step 1: Loading production database configuration...
Found .env.production, loading production database URL...
✓ Using DATABASE_URL_UNPOOLED from .env.production
Production database: neondb

Step 2: Creating production database backup...
Creating backup at: ./backups/production_backup_20251116_180000.sql
✓ Backup created successfully: ./backups/production_backup_20251116_180000.sql
  Backup size: 2.3M

Step 3: Setting up test database...
Do you want to restore to a local test database? (y/n)
> y
Creating test database: gymtext_migration_test_20251116_180000
Restoring backup to test database...
✓ Backup restored to test database

Step 4: Testing migration on backup...
Choose migration mode:
1) Schema-only (fast, recommended)
2) Full data migration (slow, uses AI)
> 1
✓ Migration completed successfully
✓ Mesocycles table exists
```

### Setting up .env.production

If you don't have `.env.production` yet, create it with your production database credentials:

```bash
# .env.production
export DATABASE_URL="postgresql://user:password@host:port/database"

# For Neon (recommended - better for backups):
export DATABASE_URL_UNPOOLED="postgresql://user:password@host-unpooled/database"

# For Vercel Postgres (alternative):
export POSTGRES_URL_NON_POOLING="postgresql://user:password@host/database"
```

**Where to get these values:**
- **Neon**: Dashboard → Connection Details → Connection string (unpooled)
- **Vercel Postgres**: Project Settings → Storage → Database → Show secret
- **Supabase**: Project Settings → Database → Connection string (Direct connection)

## Manual Backup & Test (Alternative)

### Step 1: Backup Production Database

```bash
# Create backup directory
mkdir -p backups

# Option A: Use .env.production
source .env.production
pg_dump "$DATABASE_URL_UNPOOLED" > backups/production_$(date +%Y%m%d_%H%M%S).sql
# or
pg_dump "$DATABASE_URL" > backups/production_$(date +%Y%m%d_%H%M%S).sql

# Option B: Specify connection string directly
pg_dump "postgresql://user:password@host:port/production_db" > backups/production_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backups/
```

**Tip:** Use the unpooled/direct connection URL for backups when available (DATABASE_URL_UNPOOLED or POSTGRES_URL_NON_POOLING). Connection poolers like PgBouncer can cause issues with pg_dump.

### Step 2: Create Local Test Database

```bash
# Create test database
createdb gymtext_migration_test

# Or using psql
psql -c "CREATE DATABASE gymtext_migration_test;"
```

### Step 3: Restore Backup to Test Database

```bash
# Restore backup (replace with your backup file)
psql gymtext_migration_test < backups/production_20251116_180000.sql

# Verify restore
psql gymtext_migration_test -c "SELECT COUNT(*) FROM fitness_plans;"
psql gymtext_migration_test -c "SELECT COUNT(*) FROM users;"
```

### Step 4: Test Migration on Backup

Create a test `.env.test.local` file:

```bash
# Copy your .env.local
cp .env.local .env.test.local

# Update DATABASE_URL to point to test database
# Edit .env.test.local:
# DATABASE_URL=postgresql://localhost/gymtext_migration_test
```

Run migration on test database:

```bash
# Load test environment
source .env.test.local

# Option A: Schema-only migration (fast, recommended)
SKIP_DATA_MIGRATION=true pnpm migrate:up

# Option B: Full migration with data transformation (slow)
pnpm migrate:up
```

### Step 5: Verify Migration Results

```bash
# Check if mesocycles table was created
psql gymtext_migration_test -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mesocycles');"

# Check fitness_plans schema
psql gymtext_migration_test -c "\d fitness_plans"

# Verify old columns are gone
psql gymtext_migration_test -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'fitness_plans' AND column_name IN ('overview', 'plan_description', 'reasoning');"
# Should return 0 rows

# Verify new columns exist
psql gymtext_migration_test -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'fitness_plans' AND column_name = 'formatted';"
# Should return 1 row

# Check microcycles schema
psql gymtext_migration_test -c "\d microcycles"

# Count mesocycles
psql gymtext_migration_test -c "SELECT COUNT(*) FROM mesocycles;"
```

### Step 6: Test Application with Migrated Data

```bash
# Update .env.test.local with test database
# Run app against test database
DATABASE_URL=postgresql://localhost/gymtext_migration_test pnpm dev

# Test user workflows:
# - View existing plan
# - Create new plan
# - Generate workout
```

### Step 7: Cleanup Test Database

```bash
# Drop test database when done
dropdb gymtext_migration_test

# Or using psql
psql -c "DROP DATABASE gymtext_migration_test;"
```

## Common Scenarios

### Scenario 1: Test Schema Changes Only

```bash
# Backup
pg_dump "$PROD_DB_URL" > backups/prod.sql

# Create & restore test DB
createdb gymtext_test
psql gymtext_test < backups/prod.sql

# Test schema migration
DATABASE_URL=postgresql://localhost/gymtext_test SKIP_DATA_MIGRATION=true pnpm migrate:up

# Verify
psql gymtext_test -c "\d mesocycles"
```

### Scenario 2: Test Full Data Migration

```bash
# Backup
pg_dump "$PROD_DB_URL" > backups/prod.sql

# Create & restore test DB
createdb gymtext_test
psql gymtext_test < backups/prod.sql

# Test full migration (will regenerate all plans)
DATABASE_URL=postgresql://localhost/gymtext_test pnpm migrate:up

# Check results
psql gymtext_test -c "SELECT COUNT(*) FROM mesocycles;"
psql gymtext_test -c "SELECT id, description FROM mesocycles LIMIT 1;"
```

### Scenario 3: Test Migration Rollback

```bash
# After running migration
DATABASE_URL=postgresql://localhost/gymtext_test pnpm migrate:down
DATABASE_URL=postgresql://localhost/gymtext_test pnpm migrate:down

# Verify rollback
psql gymtext_test -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mesocycles');"
# Should return 'f' (false)
```

## Backup Storage Best Practices

```bash
# Compress backups to save space
pg_dump "$PROD_DB_URL" | gzip > backups/production_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore compressed backup
gunzip -c backups/production_20251116_180000.sql.gz | psql gymtext_test

# Upload to S3 for safekeeping (optional)
aws s3 cp backups/production_20251116_180000.sql.gz s3://your-bucket/database-backups/
```

## Troubleshooting

### Error: "database already exists"

```bash
# Drop and recreate
dropdb gymtext_migration_test
createdb gymtext_migration_test
```

### Error: "permission denied"

```bash
# Ensure you have permissions
psql -c "CREATE DATABASE gymtext_migration_test WITH OWNER = your_username;"
```

### Error: "could not connect to server"

```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@14

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Backup Taking Too Long

```bash
# Use parallel dump for faster backup
pg_dump -Fd -j 4 "$PROD_DB_URL" -f backups/production_dir/

# Restore parallel dump
pg_restore -d gymtext_test -j 4 backups/production_dir/
```

## Production Deployment Checklist

After successful testing:

- [ ] Backup created and verified
- [ ] Migration tested on backup data
- [ ] Schema changes verified
- [ ] Application tested with migrated data
- [ ] Rollback tested and understood
- [ ] Team notified of deployment window
- [ ] Monitoring/alerts ready
- [ ] Production DATABASE_URL confirmed
- [ ] AI API keys verified (if running full migration)

## Ready for Production?

Once testing is complete, deploy to production:

```bash
# 1. Final production backup
pg_dump "$PRODUCTION_DB_URL" > backups/pre_migration_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migration (schema-only recommended)
SKIP_DATA_MIGRATION=true pnpm migrate:up

# 3. Regenerate types
pnpm db:codegen

# 4. Deploy application
pnpm build
# ... deploy to your hosting platform
```

See `MIGRATION_V2_DEPLOYMENT.md` for complete production deployment guide.
