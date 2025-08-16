# Test Scripts Documentation

This document provides comprehensive documentation for all test scripts in the GymText project. These scripts are designed to facilitate development, testing, and debugging of the fitness coaching application.

## Quick Start

```bash
# Most common operations
pnpm test:user:create          # Create a new test user
pnpm test:fitness:plan          # Generate a fitness plan
pnpm test:messages:daily        # Send daily workout message
pnpm test:flow:onboarding       # Complete onboarding flow
```

## Directory Structure

```
scripts/
├── migrations/              # Database migration scripts
├── test/                   # Test scripts organized by category
│   ├── user/              # User management
│   ├── fitness/           # Fitness plan operations
│   ├── messages/          # Messaging tests
│   └── flows/             # End-to-end workflows
├── utils/                 # Shared utilities
└── docker/                # Docker test runner
```

## User Management Scripts

### Create User (`test:user:create`)

Creates a new user with fitness profile.

```bash
# Interactive mode (prompts for all information)
pnpm test:user:create

# With command-line arguments
pnpm test:user:create --name "John Doe" --phone "+1234567890" --email "john@example.com"

# Skip payment for development testing
pnpm test:user:create --name "Test User" --phone "+1234567890" --skip-payment

# Include fitness preferences
pnpm test:user:create --name "Jane Smith" --phone "+1234567890" \
  --goals "Build muscle" --level "intermediate" --frequency "4x/week"

# JSON output for automation
pnpm test:user:create --name "Bot User" --phone "+1234567890" --json
```

**Options:**
- `--name <name>`: User's full name
- `--phone <phone>`: Phone number (E.164 format)
- `--email <email>`: Email address
- `--skip-payment`: Skip Stripe payment (dev only)
- `--goals <goals>`: Fitness goals
- `--level <level>`: Experience level (beginner/intermediate/advanced)
- `--frequency <frequency>`: Preferred workout frequency
- `--json`: Output result as JSON
- `--verbose`: Show detailed output

### Get User (`test:user:get`)

Retrieves and displays user information.

```bash
# By phone number
pnpm test:user:get --phone "+1234567890"

# By user ID
pnpm test:user:get --user-id "abc123"

# Show detailed information
pnpm test:user:get --phone "+1234567890" --verbose

# JSON output
pnpm test:user:get --phone "+1234567890" --json
```

**Options:**
- `--phone <phone>`: Phone number to lookup
- `--user-id <id>`: User ID to lookup
- `--json`: Output as JSON
- `--verbose`: Show detailed information

### Update Profile (`test:user:profile`)

Updates user's fitness profile.

```bash
# Interactive mode
pnpm test:user:profile --phone "+1234567890"

# Update specific fields
pnpm test:user:profile --phone "+1234567890" \
  --goals "Lose weight" \
  --level "advanced" \
  --frequency "5x/week"

# Update equipment availability
pnpm test:user:profile --phone "+1234567890" \
  --equipment "dumbbells,barbell,pull-up bar"

# Add injury information
pnpm test:user:profile --phone "+1234567890" \
  --injuries "lower back pain"
```

**Options:**
- `--phone <phone>` or `--user-id <id>`: User identifier
- `--goals <goals>`: Updated fitness goals
- `--level <level>`: New experience level
- `--frequency <frequency>`: Updated workout frequency
- `--equipment <list>`: Available equipment (comma-separated)
- `--injuries <list>`: Current injuries or limitations

## Fitness Plan Scripts

### Create Fitness Plan (`test:fitness:plan`)

Generates a new fitness plan for a user.

```bash
# Generate plan for user
pnpm test:fitness:plan --phone "+1234567890"

# Specify program type
pnpm test:fitness:plan --phone "+1234567890" --type "strength"

# Verbose output showing mesocycles
pnpm test:fitness:plan --phone "+1234567890" --verbose

# JSON output for automation
pnpm test:fitness:plan --user-id "abc123" --json
```

**Options:**
- `--phone <phone>` or `--user-id <id>`: User identifier
- `--type <type>`: Program type (strength/hypertrophy/endurance)
- `--verbose`: Show detailed plan structure
- `--json`: Output as JSON

### View/Update Progress (`test:fitness:progress`)

Manages user's workout progress.

```bash
# View current progress
pnpm test:fitness:progress --phone "+1234567890"

# Advance to next week
pnpm test:fitness:progress --phone "+1234567890" --advance-week

# Advance to next mesocycle
pnpm test:fitness:progress --phone "+1234567890" --advance-mesocycle

# Reset progress (start over)
pnpm test:fitness:progress --phone "+1234567890" --reset

# Show detailed progress visualization
pnpm test:fitness:progress --phone "+1234567890" --verbose
```

**Options:**
- `--phone <phone>` or `--user-id <id>`: User identifier
- `--advance-week`: Move to next week
- `--advance-mesocycle`: Move to next mesocycle
- `--reset`: Reset all progress
- `--verbose`: Show detailed visualization

### Generate Workout (`test:fitness:workout`)

Generates or retrieves today's workout.

```bash
# Get today's workout
pnpm test:fitness:workout --phone "+1234567890"

# Force regenerate (bypass cache)
pnpm test:fitness:workout --phone "+1234567890" --force

# Get workout for specific date
pnpm test:fitness:workout --phone "+1234567890" --date "2024-01-15"

# Show microcycle pattern
pnpm test:fitness:workout --phone "+1234567890" --show-pattern

# JSON output
pnpm test:fitness:workout --phone "+1234567890" --json
```

**Options:**
- `--phone <phone>` or `--user-id <id>`: User identifier
- `--force`: Force regeneration
- `--date <date>`: Specific date (YYYY-MM-DD)
- `--show-pattern`: Display weekly pattern
- `--json`: Output as JSON

## Message Testing Scripts

### Daily Messages (`test:messages:daily`)

Tests daily workout message generation and sending.

```bash
# Send to specific user
pnpm test:messages:daily --phone "+1234567890"

# Send to all scheduled users (current hour)
pnpm test:messages:daily --all

# Test specific date/time
pnpm test:messages:daily --phone "+1234567890" --date "2024-01-15" --hour 8

# Dry run (no actual sending)
pnpm test:messages:daily --phone "+1234567890" --dry-run

# Force workout regeneration
pnpm test:messages:daily --phone "+1234567890" --force-generate
```

**Options:**
- `--phone <phone>`: Target user's phone
- `--all`: Send to all scheduled users
- `--date <date>`: Specific date (YYYY-MM-DD)
- `--hour <hour>`: Specific hour (0-23)
- `--dry-run`: Preview without sending
- `--force-generate`: Force new workout generation

### Batch Messages (`test:messages:batch`)

Tests sending messages to multiple users.

```bash
# Send to all active users
pnpm test:messages:batch

# Limit number of users
pnpm test:messages:batch --limit 10

# Dry run with performance metrics
pnpm test:messages:batch --dry-run --verbose

# Control concurrency
pnpm test:messages:batch --concurrency 5

# Filter by schedule hour
pnpm test:messages:batch --hour 8
```

**Options:**
- `--limit <n>`: Maximum users to process
- `--concurrency <n>`: Parallel processing limit
- `--hour <hour>`: Filter by schedule hour
- `--dry-run`: Preview without sending
- `--verbose`: Show performance metrics

### SMS Testing (`test:messages:sms`)

Tests SMS webhook and conversation handling.

```bash
# Send test SMS
pnpm test:messages:sms --phone "+1234567890" --message "What's my workout today?"

# Test with conversation history
pnpm test:messages:sms --phone "+1234567890" --message "Show me alternatives" --with-history

# Custom webhook URL
pnpm test:messages:sms --phone "+1234567890" --message "Help" --webhook-url "http://localhost:3000/api/webhooks/sms"

# Show conversation context
pnpm test:messages:sms --phone "+1234567890" --message "Next exercise" --verbose
```

**Options:**
- `--phone <phone>`: Sender's phone number
- `--message <text>`: SMS message content
- `--with-history`: Include conversation history
- `--webhook-url <url>`: Custom webhook endpoint
- `--verbose`: Show conversation context

### Schedule Testing (`test:messages:schedule`)

Tests message scheduling logic.

```bash
# Show all scheduled users
pnpm test:messages:schedule

# Show users for specific hour
pnpm test:messages:schedule --hour 8

# Show timezone distribution
pnpm test:messages:schedule --show-timezones

# Test scheduling for specific user
pnpm test:messages:schedule --phone "+1234567890"

# Show next 24 hours schedule
pnpm test:messages:schedule --next-24
```

**Options:**
- `--hour <hour>`: Filter by hour
- `--phone <phone>`: Check specific user
- `--show-timezones`: Display timezone analysis
- `--next-24`: Show next 24 hours

## End-to-End Flow Scripts

### Onboarding Flow (`test:flow:onboarding`)

Simulates complete user onboarding.

```bash
# Run full onboarding
pnpm test:flow:onboarding

# With custom user data
pnpm test:flow:onboarding --name "New User" --phone "+1234567890"

# Skip payment step
pnpm test:flow:onboarding --skip-payment

# Fast mode (skip delays)
pnpm test:flow:onboarding --fast

# Verbose mode with step details
pnpm test:flow:onboarding --verbose
```

**Flow includes:**
1. User creation
2. Fitness profile setup
3. Payment processing (optional)
4. Fitness plan generation
5. Welcome message sending
6. First workout generation

### Daily Cycle (`test:flow:daily-cycle`)

Simulates a day's worth of workouts and messages.

```bash
# Run for specific user
pnpm test:flow:daily-cycle --phone "+1234567890"

# Simulate multiple days
pnpm test:flow:daily-cycle --phone "+1234567890" --days 3

# Include rest days
pnpm test:flow:daily-cycle --phone "+1234567890" --include-rest

# Fast mode
pnpm test:flow:daily-cycle --phone "+1234567890" --fast
```

**Options:**
- `--phone <phone>`: Target user
- `--days <n>`: Number of days to simulate
- `--include-rest`: Include rest days
- `--fast`: Skip delays

### Weekly Cycle (`test:flow:week-cycle`)

Tests weekly progression and microcycle transitions.

```bash
# Run weekly progression
pnpm test:flow:week-cycle --phone "+1234567890"

# Simulate multiple weeks
pnpm test:flow:week-cycle --phone "+1234567890" --weeks 4

# Test mesocycle transition
pnpm test:flow:week-cycle --phone "+1234567890" --test-transition

# Show progression details
pnpm test:flow:week-cycle --phone "+1234567890" --verbose
```

**Options:**
- `--phone <phone>`: Target user
- `--weeks <n>`: Number of weeks
- `--test-transition`: Test mesocycle transition
- `--verbose`: Show progression details

## Database Migration Scripts

### Create Migration (`db:migrate:create`)

Creates a new database migration file.

```bash
# Interactive mode
pnpm db:migrate:create

# With migration name
pnpm db:migrate:create --name "add_user_preferences"
```

### Run Migrations (`db:migrate`)

Applies pending database migrations.

```bash
# Apply all pending migrations
pnpm db:migrate

# Rollback last migration
pnpm db:migrate:down

# Show migration status
pnpm db:migrate --status
```

## Convenience Commands

### Quick Test (`test:quick`)

Runs essential tests quickly.

```bash
pnpm test:quick
```

Executes:
1. Create user
2. Generate fitness plan
3. Send daily message

### Full Test (`test:full`)

Runs complete onboarding flow.

```bash
pnpm test:full
```

Equivalent to `pnpm test:flow:onboarding`

## Environment Configuration

Scripts automatically detect and use the appropriate environment:

```bash
# Development (default)
NODE_ENV=development pnpm test:user:create

# Staging
NODE_ENV=staging pnpm test:user:create

# Production (use with caution!)
NODE_ENV=production pnpm test:user:create
```

## Common Options

Most scripts support these standard options:

- `--verbose`: Show detailed output and debug information
- `--dry-run`: Preview actions without making changes
- `--json`: Output results as JSON for automation
- `--help`: Show command help and usage

## Error Handling

Scripts provide helpful error messages and suggestions:

```bash
# Example: Missing required parameter
$ pnpm test:user:get
Error: Please provide either --phone or --user-id

# Example: User not found
$ pnpm test:user:get --phone "+1234567890"
Error: User not found with phone +1234567890
Suggestion: Check the phone number or try with --user-id

# Example: Network error
$ pnpm test:fitness:plan --phone "+1234567890"
Error: Failed to connect to API
Suggestion: Check your network connection and API_URL configuration
```

## Tips and Best Practices

1. **Development Testing**: Always use `--skip-payment` in development to avoid Stripe charges
2. **Batch Operations**: Use `--dry-run` first when testing batch operations
3. **JSON Output**: Use `--json` for automation and CI/CD integration
4. **Verbose Mode**: Enable `--verbose` when debugging issues
5. **Phone Numbers**: Always use E.164 format (+1234567890)
6. **Cleanup**: Remember to clean up test users after testing

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
pnpm db:migrate --status
```

**SMS Not Sending**
```bash
# Check Twilio configuration
pnpm test:messages:sms --phone "+1234567890" --message "test" --dry-run --verbose

# Verify webhook URL
curl -X POST $API_URL/api/webhooks/sms
```

**User Creation Fails**
```bash
# Check for existing user
pnpm test:user:get --phone "+1234567890"

# Try with different phone number
pnpm test:user:create --phone "+1987654321"
```

## Docker Testing

Run tests in Docker container:

```bash
# Run all tests
pnpm test:docker

# Run specific test
./scripts/docker/run-tests.sh test:user:create
```

## Contributing

When adding new scripts:

1. Follow the existing directory structure
2. Use the utility classes in `scripts/utils/`
3. Support standard options (--verbose, --dry-run, --json)
4. Add appropriate error handling
5. Update this documentation
6. Add to package.json scripts section

## Script Development

Example of creating a new script:

```typescript
// scripts/test/example/new-feature.ts
import { Command } from 'commander';
import { TestDatabase, TestConfig, TestUsers } from '../../utils';
import { displayHeader, displaySuccess, displayError } from '../../utils/common';

const program = new Command()
  .name('test:example:new-feature')
  .description('Test new feature')
  .option('--phone <phone>', 'User phone number')
  .option('--verbose', 'Show detailed output')
  .option('--dry-run', 'Preview without making changes')
  .option('--json', 'Output as JSON')
  .parse();

async function main() {
  const options = program.opts();
  const config = TestConfig.getInstance();
  
  if (!options.json) {
    displayHeader('New Feature Test');
  }
  
  try {
    // Your test logic here
    
    if (options.json) {
      console.log(JSON.stringify(result));
    } else {
      displaySuccess('Test completed successfully');
    }
  } catch (error) {
    if (options.json) {
      console.log(JSON.stringify({ error: error.message }));
    } else {
      displayError('Test failed', error);
    }
    process.exit(1);
  }
}

main();
```

## Additional Resources

- [Testing Guide](./TESTING.md) - General testing documentation
- [Cron Testing](./CRON_TEST_SCRIPT.md) - Cron job testing
- [Vercel Deployment](./VERCEL_CRON_DEPLOYMENT.md) - Deployment guide