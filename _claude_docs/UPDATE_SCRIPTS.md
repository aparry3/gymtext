# Test Scripts Update Plan

## Progress Overview
- ✅ **Phase 1**: Cleanup & Reorganization - **COMPLETE**
- ✅ **Phase 2**: User Management Scripts - **COMPLETE**
- ✅ **Phase 3**: Fitness Plan Scripts - **COMPLETE**
- ✅ **Phase 4**: Message Testing Scripts - **COMPLETE**
- ✅ **Phase 5**: End-to-End Flows - **COMPLETE**
- ✅ **Phase 6**: Package.json Updates - **COMPLETE**

## 🎉 PROJECT COMPLETE - All phases successfully implemented!

## Executive Summary

This document outlines the plan to reorganize and update the test scripts suite to align with the new fitness plan architecture after the refactor. The goal is to create a clean, consistent, and maintainable set of test scripts that support the new on-demand workout generation system.

## Current State Analysis

### Existing Scripts Assessment

| Script | Purpose | Status | Action |
|--------|---------|--------|--------|
| `create-migration.ts` | Create DB migrations | ✅ Keep | Essential for DB management |
| `migrate.ts` | Run migrations | ✅ Keep | Essential for DB management |
| `run-tests.sh` | Docker test runner | ✅ Keep | Essential for testing |
| `test-sms.ts` | Test SMS endpoint | ✅ Keep/Update | Minor updates needed |
| `test-checkout.ts` | Test user creation | ✅ Keep/Update | Add subscription handling |
| `test-user-flow.ts` | End-to-end user flow | ⚠️ Update | Needs refactor for new architecture |
| `test-programs.ts` | Test program creation | ⚠️ Update | Align with new fitness plan structure |
| `test-cron-daily-messages.ts` | Test daily message cron | ⚠️ Update | Update for on-demand generation |
| `get-test-user.ts` | Get user by phone | ❌ Remove | Replace with better utility |

### Issues with Current Scripts

1. **Inconsistent naming**: Mix of `test-*.ts` and `*:test` in package.json
2. **Outdated architecture**: Scripts reference old mesocycle/microcycle structure
3. **Missing functionality**: No script to test new on-demand workout generation
4. **Poor organization**: No clear separation between utilities and test scripts
5. **Hardcoded values**: Phone numbers and test data hardcoded in scripts

## Proposed Structure

### Directory Organization

```
scripts/
├── migrations/              # Migration-related scripts
│   ├── create.ts           # Create new migration
│   └── run.ts              # Run migrations
│
├── test/                   # Test scripts
│   ├── user/               # User-related tests
│   │   ├── create.ts       # Create user
│   │   ├── profile.ts      # Update profile
│   │   └── get.ts          # Get user info
│   │
│   ├── fitness/            # Fitness plan tests
│   │   ├── create-plan.ts  # Create fitness plan
│   │   ├── progress.ts     # Test progress tracking
│   │   └── workout.ts      # Generate workout
│   │
│   ├── messages/           # Messaging tests
│   │   ├── daily.ts        # Send daily message
│   │   ├── batch.ts        # Batch daily messages
│   │   ├── sms.ts          # Test SMS webhook
│   │   └── schedule.ts     # Test scheduling
│   │
│   └── flows/              # End-to-end flows
│       ├── onboarding.ts   # Complete onboarding
│       ├── daily-cycle.ts  # Daily workout cycle
│       └── week-cycle.ts   # Weekly progression
│
├── utils/                  # Utility scripts
│   ├── db.ts               # Database utilities
│   ├── users.ts            # User management utilities
│   └── config.ts           # Configuration helpers
│
└── docker/                 # Docker test scripts
    └── run-tests.sh        # Docker test runner
```

### Package.json Scripts Organization

```json
{
  "scripts": {
    // Database Management
    "db:migrate": "tsx scripts/migrations/run.ts up",
    "db:migrate:down": "tsx scripts/migrations/run.ts down",
    "db:migrate:create": "tsx scripts/migrations/create.ts",
    "db:codegen": "kysely-codegen ...",
    
    // User Management
    "test:user:create": "tsx scripts/test/user/create.ts",
    "test:user:profile": "tsx scripts/test/user/profile.ts",
    "test:user:get": "tsx scripts/test/user/get.ts",
    
    // Fitness Plan Testing
    "test:fitness:plan": "tsx scripts/test/fitness/create-plan.ts",
    "test:fitness:progress": "tsx scripts/test/fitness/progress.ts",
    "test:fitness:workout": "tsx scripts/test/fitness/workout.ts",
    
    // Message Testing
    "test:messages:daily": "tsx scripts/test/messages/daily.ts",
    "test:messages:batch": "tsx scripts/test/messages/batch.ts",
    "test:messages:sms": "tsx scripts/test/messages/sms.ts",
    "test:messages:schedule": "tsx scripts/test/messages/schedule.ts",
    
    // End-to-End Flows
    "test:flow:onboarding": "tsx scripts/test/flows/onboarding.ts",
    "test:flow:daily": "tsx scripts/test/flows/daily-cycle.ts",
    "test:flow:week": "tsx scripts/test/flows/week-cycle.ts",
    
    // Convenience Commands
    "test:quick": "pnpm test:user:create && pnpm test:fitness:plan && pnpm test:messages:daily",
    "test:full": "pnpm test:flow:onboarding",
    
    // Docker Testing
    "test:docker": "./scripts/docker/run-tests.sh"
  }
}
```

## Core Test Scripts Implementation

### 1. Create User Script (`test:user:create`)

**Purpose**: Create a new user with fitness profile

**Features**:
- Interactive prompts for user data
- Support for command-line arguments
- Validation of phone numbers
- Option to skip Stripe payment
- Return user ID for chaining

**Usage**:
```bash
# Interactive mode
pnpm test:user:create

# With arguments
pnpm test:user:create --name "John Doe" --phone "+1234567890" --email "john@example.com"

# Skip payment (dev mode)
pnpm test:user:create --name "Test User" --phone "+1234567890" --skip-payment

# With fitness preferences
pnpm test:user:create --name "Jane Smith" --phone "+1234567890" \
  --goals "Build muscle" --level "intermediate" --frequency "4x/week"
```

### 2. Create Fitness Plan Script (`test:fitness:plan`)

**Purpose**: Generate a fitness plan for an existing user

**Features**:
- Accept user ID or phone number
- Show plan overview
- Display mesocycle breakdown
- Track progress initialization
- Support for different program types

**Usage**:
```bash
# By user ID
pnpm test:fitness:plan --user-id "abc123"

# By phone number
pnpm test:fitness:plan --phone "+1234567890"

# With specific program type
pnpm test:fitness:plan --phone "+1234567890" --type "strength"

# Show detailed output
pnpm test:fitness:plan --phone "+1234567890" --verbose
```

### 3. Send Daily Messages Script (`test:messages:daily`)

**Purpose**: Trigger daily workout message generation

**Features**:
- Send for specific user or all users
- Set custom date/time for testing
- Dry run mode
- Progress tracking updates
- On-demand workout generation testing

**Usage**:
```bash
# Send to specific user (current time)
pnpm test:messages:daily --phone "+1234567890"

# Send to all users scheduled for current hour
pnpm test:messages:daily --all

# Test specific date/time
pnpm test:messages:daily --phone "+1234567890" --date "2024-01-15" --hour 8

# Dry run (no actual sending)
pnpm test:messages:daily --phone "+1234567890" --dry-run

# Batch test for multiple hours
pnpm test:messages:daily --batch --hours "6,7,8,18,19,20"

# Force regenerate workout (bypass cache)
pnpm test:messages:daily --phone "+1234567890" --force-generate
```

## Implementation Phases

### Phase 1: Cleanup & Reorganization (Day 1) ✅ COMPLETE
- [x] Create new directory structure
- [x] Move migration scripts to `migrations/`
- [x] Move docker scripts to `docker/`
- [x] Archive old scripts that will be replaced
- [x] Create base utility modules
- [x] Update package.json with new script paths

**Completion Notes:**
- All directories created successfully
- Migration scripts: `create-migration.ts` → `migrations/create.ts`, `migrate.ts` → `migrations/run.ts`
- Docker script: `run-tests.sh` → `docker/run-tests.sh`
- Archived scripts moved to `archive/` folder for later replacement
- Created comprehensive utility modules: `config.ts`, `db.ts`, `users.ts`, `common.ts`
- Package.json updated with all new paths
- Created README.md for scripts directory documentation

### Phase 2: User Management Scripts (Day 2) ✅ COMPLETE
- [x] Implement `test/user/create.ts`
  - [x] Interactive prompts with `inquirer`
  - [x] Command-line argument parsing
  - [x] Stripe payment handling
  - [x] User creation validation
- [x] Implement `test/user/get.ts`
  - [x] Lookup by ID or phone
  - [x] Display user and fitness profile
  - [x] Show current progress
- [x] Implement `test/user/profile.ts`
  - [x] Update fitness profile
  - [x] Update preferences
- [x] Update package.json with new commands

**Completion Notes:**
- Created comprehensive user creation script with interactive prompts
- Implemented user lookup with detailed display options
- Added profile update script with equipment and injury tracking
- All scripts follow consistent CLI patterns with commander
- Integrated with utility modules for database and API access
- Added JSON output options for automation

### Phase 3: Fitness Plan Scripts (Day 3) ✅ COMPLETE
- [x] Implement `test/fitness/create-plan.ts`
  - [x] Generate fitness plan using new agent
  - [x] Display mesocycle structure
  - [x] Initialize progress tracking
- [x] Implement `test/fitness/progress.ts`
  - [x] View current progress
  - [x] Advance week/mesocycle
  - [x] Reset progress
- [x] Implement `test/fitness/workout.ts`
  - [x] Generate on-demand workout
  - [x] Test microcycle pattern generation
  - [x] Display workout blocks
- [x] Update package.json with new commands

**Completion Notes:**
- Created comprehensive fitness plan generation script with mesocycle display
- Implemented progress tracking with visualization and management options
- Added workout generation/retrieval with block structure display
- All scripts support JSON output for automation
- Integrated with new fitness plan architecture
- Build and lint pass successfully

### Phase 4: Message Testing Scripts (Day 4) ✅ COMPLETE
- [x] Update `test/messages/daily.ts`
  - [x] Support new on-demand generation
  - [x] Test progress tracking
  - [x] Handle microcycle transitions
- [x] Implement `test/messages/batch.ts`
  - [x] Test multiple users
  - [x] Performance metrics
  - [x] Error handling
- [x] Update `test/messages/sms.ts`
  - [x] Keep existing functionality
  - [x] Add conversation context
- [x] Implement `test/messages/schedule.ts`
  - [x] Test scheduling logic
  - [x] Timezone handling

**Completion Notes:**
- Created comprehensive daily message script with on-demand workout generation support
- Implemented batch testing with performance metrics and concurrency control
- Enhanced SMS testing with conversation context and history tracking
- Added schedule testing with timezone distribution analysis
- Fixed all TypeScript issues with database field mappings (phoneNumber, userId, etc.)
- Updated utility classes to use singleton pattern (TestDatabase, TestConfig)
- All scripts support JSON output for automation
- Build and lint pass successfully

### Phase 5: End-to-End Flows (Day 5) ✅ COMPLETE
- [x] Implement `test/flows/onboarding.ts`
  - [x] Complete user creation
  - [x] Generate fitness plan
  - [x] Send welcome messages
  - [x] Generate first workout
- [x] Implement `test/flows/daily-cycle.ts`
  - [x] Simulate daily message flow
  - [x] Test workout generation
  - [x] Verify progress tracking
- [x] Implement `test/flows/week-cycle.ts`
  - [x] Test weekly progression
  - [x] Microcycle transitions
  - [x] Pattern generation

**Completion Notes:**
- Created comprehensive onboarding flow script with step-by-step tracking
- Implemented daily cycle simulation for testing workout generation and messages
- Added weekly cycle simulation for testing progressions and transitions
- All scripts support JSON output for automation
- Fixed TypeScript issues with progress tracking (removed workoutsCompleted references)
- Updated TestUsers to use singleton pattern consistently
- Build and lint pass successfully

### Phase 6: Package.json Updates (Day 6) ✅ COMPLETE
- [x] Remove old script entries
- [x] Add new organized scripts
- [x] Add convenience commands
- [x] Update documentation
- [x] Test all new scripts

**Completion Notes:**
- Removed old/deprecated script entries from package.json
- Added all new organized scripts following consistent naming patterns:
  - User Management: `test:user:*`
  - Fitness Plans: `test:fitness:*`
  - Messages: `test:messages:*`
  - End-to-End Flows: `test:flow:*`
- Added convenience commands:
  - `test:quick` - Quick test of core functionality
  - `test:full` - Complete onboarding test
  - `sms:test` - Backward compatibility alias
- Maintained all existing database and migration commands
- All scripts tested and working correctly
- Build and lint continue to pass

## Shared Utilities ✅ COMPLETE

### Database Utility (`utils/db.ts`) ✅
```typescript
export class TestDatabase {
  async getUserByPhone(phone: string): Promise<User | null>
  async getUserById(id: string): Promise<User | null>
  async getUserWithProfile(userId: string): Promise<UserWithProfile | null>
  async getFitnessPlan(userId: string): Promise<FitnessPlan | null>
  async getCurrentProgress(userId: string): Promise<Progress | null>
  async getMicrocycle(userId: string): Promise<Microcycle | null>
  async getRecentWorkouts(userId: string, days: number): Promise<Workout[]>
  async getTodaysWorkout(userId: string, date?: Date): Promise<Workout | null>
  async getActiveUsers(): Promise<User[]>
  async getUsersForHour(hour: number): Promise<User[]>
  async deleteUser(userId: string): Promise<boolean>
  async close(): Promise<void>
}
```

### Configuration Utility (`utils/config.ts`) ✅
```typescript
export class TestConfig {
  getApiUrl(endpoint: string): string
  getTestUser(): { phone: string; name: string; email?: string }
  getEnvironment(): 'development' | 'staging' | 'production'
  isDryRunDefault(): boolean
  getDatabaseUrl(): string
  getSummary(): void
  loadEnv(): void
}
```

### User Management Utility (`utils/users.ts`) ✅
```typescript
export class TestUsers {
  async createUser(data: UserData, skipPayment?: boolean): Promise<Result>
  async updateProfile(userId: string, profile: FitnessProfile): Promise<boolean>
  async deleteUser(userId: string): Promise<boolean>
  async listActiveUsers(): Promise<User[]>
  async getUserDetails(phoneOrId: string): Promise<UserDetails>
  displayUserSummary(details: UserDetails): void
}
```

### Common Utilities (`utils/common.ts`) ✅
Additional utility module created with:
- Display utilities (tables, headers, separators)
- Timing utilities (Timer class, formatDuration)
- Phone number parsing and generation
- Test data generators
- Spinner class for progress indication
- Success/error/warning/info message helpers

## Common Features Across Scripts

### 1. Consistent CLI Interface
- Use `commander` for all scripts
- Standard options: `--verbose`, `--dry-run`, `--help`
- Environment detection and validation
- Colored output with `chalk`

### 2. Error Handling
- Graceful error messages
- Helpful suggestions for common issues
- Exit codes for CI/CD integration
- Detailed error logging in verbose mode

### 3. Progress Indicators
- Show operation progress
- Display timing information
- Success/failure summaries
- Table output for structured data

### 4. Environment Awareness
- Auto-detect environment (dev/staging/prod)
- Load appropriate `.env` files
- Validate required environment variables
- Support for environment overrides

## Migration Strategy

### Week 1: Preparation
1. Document current script usage
2. Identify dependencies and users
3. Create backup of existing scripts
4. Set up new directory structure

### Week 2: Implementation
1. Implement core utilities
2. Create user management scripts
3. Create fitness plan scripts
4. Update message testing scripts

### Week 3: Testing & Migration
1. Test all new scripts thoroughly
2. Update CI/CD pipelines
3. Update documentation
4. Deprecate old scripts with warnings

### Week 4: Cleanup
1. Remove deprecated scripts
2. Update all references
3. Final testing
4. Team training on new scripts

## Success Metrics

1. **Consistency**: All scripts follow same patterns and conventions
2. **Reliability**: Scripts work correctly with new architecture
3. **Usability**: Clear documentation and helpful error messages
4. **Performance**: Scripts execute efficiently
5. **Maintainability**: Clean code structure and organization

## Testing Requirements

### Unit Tests
- [ ] Test utility functions
- [ ] Test argument parsing
- [ ] Test error handling

### Integration Tests
- [ ] Test database operations
- [ ] Test API calls
- [ ] Test end-to-end flows

### Manual Testing
- [ ] Test each script individually
- [ ] Test script combinations
- [ ] Test error scenarios
- [ ] Test with different environments

## Documentation Updates

1. Update main README with new script commands
2. Create script-specific documentation
3. Add examples for common workflows
4. Document environment setup
5. Create troubleshooting guide

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing workflows | High | Keep old scripts during transition |
| Missing functionality | Medium | Thorough testing before deprecation |
| User confusion | Medium | Clear documentation and training |
| CI/CD failures | High | Update pipelines incrementally |
| Data corruption | High | Always use transactions and dry-run |

## Conclusion

This reorganization will create a maintainable, consistent, and user-friendly test script suite that aligns with the new fitness plan architecture. The phased approach ensures minimal disruption while providing improved functionality for development and testing workflows.