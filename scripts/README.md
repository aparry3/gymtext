# Test Scripts

This directory contains test scripts for development and testing of the GymText application.

## Directory Structure

```
scripts/
├── migrations/         # Database migration scripts
├── test/              # Test scripts organized by feature
│   ├── user/          # User management tests
│   ├── fitness/       # Fitness plan tests
│   ├── messages/      # Messaging tests
│   └── flows/         # End-to-end flow tests
├── utils/             # Shared utilities
├── docker/            # Docker test scripts
└── archive/           # Archived/deprecated scripts
```

## Available Scripts

### Database Management
- `pnpm migrate:create` - Create a new migration
- `pnpm migrate:up` - Run pending migrations
- `pnpm migrate:down` - Rollback last migration

### User Management
- `pnpm test:checkout` - Test user creation via checkout
- `pnpm test:sms` - Test SMS webhook endpoint

### Docker Testing
- `pnpm test:docker` - Run tests in Docker
- `pnpm test:docker:unit` - Run unit tests in Docker
- `pnpm test:docker:integration` - Run integration tests in Docker

## Utilities

### `utils/config.ts`
Configuration management for test scripts
- Environment variable loading
- API endpoint configuration
- Test user defaults

### `utils/db.ts`
Database utilities for tests
- User lookup methods
- Fitness plan queries
- Progress tracking
- Cleanup utilities

### `utils/users.ts`
User management utilities
- Create users via API
- Update profiles
- Delete test users
- List active users

### `utils/common.ts`
Common utilities
- Formatting helpers
- Display utilities
- Timing utilities
- Phone number parsing

## Environment Setup

Tests require a `.env.local` file with:
```env
DATABASE_URL=postgresql://...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...
```

## Migration Notes

### Phase 1 Complete (Current)
- ✅ Created new directory structure
- ✅ Moved migration scripts to `migrations/`
- ✅ Moved docker scripts to `docker/`
- ✅ Archived old scripts in `archive/`
- ✅ Created base utility modules
- ✅ Updated package.json paths

### Archived Scripts
The following scripts have been archived and will be replaced:
- `get-test-user.ts` - Replaced by utils/db.ts methods
- `test-programs.ts` - Will be replaced by test/fitness/create-plan.ts
- `test-user-flow.ts` - Will be replaced by test/flows/onboarding.ts
- `test-cron-daily-messages.ts` - Will be replaced by test/messages/daily.ts

### Next Steps (Phase 2-6)
- Implement user management scripts
- Create fitness plan test scripts
- Update message testing scripts
- Build end-to-end flow tests

## Usage Examples

```bash
# Test user creation
pnpm test:checkout

# Test SMS handling
pnpm test:sms

# Run database migrations
pnpm migrate:up

# Run Docker tests
pnpm test:docker
```