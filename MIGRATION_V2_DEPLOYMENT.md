# Fitness Planning V2 Migration - Production Deployment Guide

## Summary

This guide covers the deployment of the consolidated fitness planning schema V2 migrations to production. The migration simplifies the fitness planning data model by removing redundant fields and introducing a dedicated mesocycles table.

## What Changed

### Before (Production Schema)
- **fitness_plans**: Contains `overview`, `plan_description`, `reasoning`, `mesocycles` (JSON array)
- **microcycles**: Contains `week_number`, `pattern` (complex JSON structure)
- **No mesocycles table**

### After (New Schema)
- **fitness_plans**: Removed `overview`, `plan_description`, `reasoning`; added `formatted` (markdown display)
- **microcycles**: Removed `pattern`; added individual day overviews (mon-sun), `description`, `is_deload`, `formatted`
- **mesocycles**: New table with `description`, `microcycles` (text[]), `formatted`, `start_week`, `duration_weeks`

## Migration Files

Two new migrations consolidate the previous 7 separate migrations:

1. **`20251116180000_schema_v2_fitness_planning.ts`** - Schema changes (safe, fast)
   - Drops redundant columns from fitness_plans
   - Adds day overview columns to microcycles
   - Creates mesocycles table with indexes

2. **`20251116180001_data_migration_fitness_plans_v2.ts`** - Data transformation (slow, uses AI)
   - Regenerates existing fitness plans using AI agents
   - Creates mesocycle table rows
   - Can be skipped with `SKIP_DATA_MIGRATION=true` environment variable

## Deployment Options

### Option A: Schema-Only Migration (Recommended for Initial Deployment)

**Fastest, safest approach - regenerate plans on-demand**

1. Backup production database
2. Run migrations with skip flag:
   ```bash
   SKIP_DATA_MIGRATION=true pnpm migrate:up
   ```
3. Regenerate database types:
   ```bash
   pnpm db:codegen
   ```
4. Deploy application code
5. Plans will be regenerated automatically when users access them

**Pros:**
- Fast deployment (~30 seconds)
- No AI API calls during migration
- Plans regenerated with latest logic
- No downtime

**Cons:**
- First access per user may be slower while plan regenerates
- Old plan data is not preserved (but can be in database backup)

### Option B: Full Data Migration (For Complete Transition)

**Complete migration with upfront plan regeneration**

1. Backup production database
2. Schedule maintenance window (allow 5-10 minutes per existing plan)
3. Ensure AI API keys are configured
4. Run full migration:
   ```bash
   pnpm migrate:up
   ```
5. Monitor migration progress in logs
6. Regenerate types:
   ```bash
   pnpm db:codegen
   ```
7. Deploy application code

**Pros:**
- All plans migrated upfront
- Consistent user experience immediately

**Cons:**
- Long migration time (AI generation is slow)
- Requires maintenance window
- Higher AI API costs
- May timeout on large databases

## Production Deployment Steps

### Testing Migrations Locally

**Before deploying to production**, test the migration on a copy of production data:

```bash
# Automated testing (recommended)
./scripts/backup-and-test-migration.sh
```

This script will:
1. Load production config from `.env.production`
2. Backup production database
3. Restore to local test database
4. Run migration on test data
5. Verify migration results

See `BACKUP_AND_TEST_GUIDE.md` for detailed instructions.

## Pre-Deployment Checklist

- [ ] Test migrations locally using production backup (see above)
- [ ] Review and test migrations in staging environment
- [ ] Backup production database
- [ ] Verify AI API keys are configured (if running full migration)
- [ ] Schedule deployment window (if running full migration)
- [ ] Notify users of potential maintenance (if running full migration)

### Deployment Process

```bash
# 1. SSH into production server or deployment environment

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
pnpm install

# 4. Run migrations (choose option A or B)
# Option A (Recommended):
SKIP_DATA_MIGRATION=true pnpm migrate:up

# Option B:
pnpm migrate:up

# 5. Regenerate types (production environment must have DATABASE_URL)
pnpm db:codegen

# 6. Build application
pnpm build

# 7. Restart application server
# (command depends on your deployment setup)
```

### Rollback Plan

If migration fails or issues arise:

```bash
# Roll back both migrations
pnpm migrate:down
pnpm migrate:down

# Regenerate types
pnpm db:codegen

# Restore code to previous version
git checkout <previous-commit>

# Rebuild and restart
pnpm build
# restart server
```

**Important:** If data migration completed, rollback will **DELETE** all mesocycles. Original fitness plan data **CANNOT** be restored except from database backup.

## Post-Deployment Verification

### 1. Check Migration Status

```bash
# Verify mesocycles table exists
psql $DATABASE_URL -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'mesocycles');"

# Check fitness_plans schema
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'fitness_plans';"

# Verify old columns are gone
# Should NOT see: overview, plan_description, reasoning

# Verify new columns exist
# Should see: formatted
```

### 2. Test User Workflows

- [ ] Existing user can view their plan
- [ ] New user can create a plan
- [ ] Workout generation works correctly
- [ ] Weekly check-ins are sent properly

### 3. Monitor Logs

Watch for errors related to:
- Missing plan data
- Mesocycle generation failures
- Microcycle creation issues

## Troubleshooting

### Issue: Migration Timeout

**Cause:** AI generation taking too long

**Solution:**
1. Use Option A (skip data migration)
2. Increase migration timeout in `scripts/migrations/run.ts`
3. Run data migration separately in batches

### Issue: TypeScript Errors After Migration

**Cause:** Types not regenerated after schema change

**Solution:**
```bash
pnpm db:codegen
pnpm build
```

### Issue: Users See Missing Plan Data

**Cause:** Data migration skipped or failed

**Solution:**
- Plans will regenerate on first access
- Or manually trigger plan regeneration for affected users

### Issue: Build Fails in CI/CD

**Cause:** `prebuild` script requires DATABASE_URL

**Solution:**
- Provide DATABASE_URL in CI/CD environment
- Or modify `package.json` to make `prebuild` optional

## Data Migration Behavior

When data migration runs (Option B):

1. **For each existing fitness plan:**
   - Fetches user profile
   - Deletes old plan
   - Calls fitness plan agent to regenerate plan
   - Creates mesocycle table rows using mesocycle agent
   - Logs success/failure

2. **Error Handling:**
   - Continues with next plan if one fails
   - Logs all errors
   - Reports success/error counts at end

3. **Time Estimate:**
   - ~30-60 seconds per plan (AI generation)
   - 10 plans = ~10 minutes
   - 50 plans = ~45 minutes

## Environment Variables

- `DATABASE_URL` - Required for migrations and type generation
- `OPENAI_API_KEY` - Required if running full data migration
- `GOOGLE_API_KEY` - Required if running full data migration
- `SKIP_DATA_MIGRATION=true` - Skip data migration (Option A)

## Support

If issues arise during deployment:

1. Check migration logs for specific errors
2. Verify database connection and credentials
3. Ensure AI API keys are valid
4. Restore from backup if necessary
5. Contact development team with error logs

## Changelog

### Migration V2 (2025-11-16)

**Added:**
- `mesocycles` table with indexes
- `formatted` column to `fitness_plans` and `microcycles`
- Day overview columns to `microcycles` (mon-sun)
- `description`, `is_deload` columns to `microcycles`

**Removed:**
- `overview`, `plan_description`, `reasoning` from `fitness_plans`
- `pattern` column from `microcycles`

**Behavior:**
- Plans can be regenerated on-demand
- Mesocycles stored as separate table rows
- Microcycles generated from mesocycle microcycle strings
