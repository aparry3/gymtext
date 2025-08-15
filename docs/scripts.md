# GymText Scripts Documentation

This document provides comprehensive documentation for all scripts available in the GymText project.

## Overview

GymText includes several utility scripts for development, testing, and database management. All scripts are written in TypeScript and executed using `tsx`.

## Script Organization

Scripts are organized into the following directories:

```
scripts/
├── migrations/         # Database migration scripts
│   ├── create.ts      # Create new migrations
│   └── run.ts         # Run migrations up/down
├── test/              # Test scripts organized by feature
│   ├── user/          # User management scripts
│   │   ├── create.ts  # Create test users
│   │   ├── get.ts     # Retrieve user information
│   │   └── profile.ts # Update user profiles
│   ├── fitness/       # Fitness plan scripts (Phase 3)
│   ├── messages/      # Messaging test scripts
│   │   └── sms.ts     # SMS webhook testing
│   └── flows/         # End-to-end flow tests
├── utils/             # Shared utilities
│   ├── config.ts      # Environment configuration
│   ├── db.ts          # Database utilities
│   ├── users.ts       # User management helpers
│   └── common.ts      # Common display and formatting utilities
├── docker/            # Docker test scripts
│   └── run-tests.sh   # Docker test runner
└── archive/           # Deprecated scripts for reference
```

## Available Scripts

### Database Management

#### `pnpm db:codegen`
Generates TypeScript types from the PostgreSQL database schema using Kysely Codegen.

**When to use:** After any database schema changes or before running the application.

**Details:**
- Automatically runs before `dev` and `build` commands
- Outputs types to `./src/server/models/_types/index.ts`
- Excludes internal Kysely tables
- Uses camel-case naming convention

---

#### `pnpm migrate:create [migration-name]`
Creates a new database migration file with proper timestamp and boilerplate code.

**Location:** `scripts/migrations/create.ts`

**Example:**
```bash
pnpm migrate:create add_user_preferences_table
```

**Output:** Creates `migrations/20240124120000_add_user_preferences_table.ts`

---

#### `pnpm migrate:up`
Applies all pending database migrations.

**Location:** `scripts/migrations/run.ts`

**Prerequisites:**
- `DATABASE_URL` environment variable must be set
- Migration files must exist in the `migrations/` directory

**Example:**
```bash
pnpm migrate:up
```

---

#### `pnpm migrate:down`
Rolls back the last applied database migration.

**Location:** `scripts/migrations/run.ts`

**Example:**
```bash
pnpm migrate:down
```

### Development

#### `pnpm dev`
Starts the Next.js development server with Turbopack.

**Features:**
- Runs on `http://localhost:3000`
- Hot module replacement
- Automatic TypeScript type generation (via predev hook)
- Fast refresh for React components

---

#### `pnpm build`
Creates a production build of the application.

**Features:**
- Optimized for production
- Automatic TypeScript type generation (via prebuild hook)
- Static optimization where possible

---

#### `pnpm start`
Starts the production server (requires `pnpm build` first).

---

#### `pnpm lint`
Runs ESLint with Next.js specific rules.

### Testing Scripts

#### User Management Scripts

##### `pnpm test:user:create`
Creates a test user with comprehensive fitness profile setup.

**Features:**
- Interactive prompts for user data input
- Command-line arguments for automation
- Phone number validation and formatting
- Stripe payment handling with skip option
- Test data generation for quick testing

**Usage:**
```bash
# Interactive mode (recommended)
pnpm test:user:create

# Quick creation with arguments
pnpm test:user:create -n "John Doe" -p "+1234567890" --skip-payment

# Generate test user automatically
pnpm test:user:create --generate-test --skip-payment

# Full specification
pnpm test:user:create \
  --name "Jane Smith" \
  --phone "+1234567890" \
  --email "jane@example.com" \
  --goals "Build muscle" \
  --level intermediate \
  --frequency "4x/week" \
  --skip-payment
```

**Options:**
- `-n, --name <name>` - User name
- `-p, --phone <phone>` - Phone number
- `-e, --email <email>` - Email address
- `--goals <goals>` - Fitness goals
- `--level <level>` - Skill level (beginner/intermediate/advanced)
- `--frequency <frequency>` - Exercise frequency
- `--gender <gender>` - Gender
- `--age <age>` - Age
- `-t, --timezone <timezone>` - Timezone (e.g., America/New_York)
- `-h, --hour <hour>` - Preferred send hour (0-23)
- `--skip-payment` - Skip Stripe payment (test mode)
- `--no-interactive` - Disable interactive prompts
- `-g, --generate-test` - Generate test data automatically
- `-v, --verbose` - Show detailed output

---

##### `pnpm test:user:get`
Retrieves and displays user details including fitness profile, plan, and progress.

**Usage:**
```bash
# Look up by phone
pnpm test:user:get --phone "+1234567890"

# Look up by user ID
pnpm test:user:get --user-id "abc123"

# List all active users
pnpm test:user:get --active

# Get detailed info with workouts
pnpm test:user:get --phone "+1234567890" --workout --verbose

# Export as JSON
pnpm test:user:get --phone "+1234567890" --json > user.json
```

**Options:**
- `-p, --phone <phone>` - Phone number to look up
- `-u, --user-id <id>` - User ID to look up
- `-a, --all` - List all users
- `--active` - List only active users
- `--no-profile` - Exclude fitness profile
- `--no-plan` - Exclude fitness plan
- `--no-progress` - Exclude progress info
- `-w, --workout` - Include recent workouts
- `-j, --json` - Output as JSON
- `-v, --verbose` - Show detailed output

---

##### `pnpm test:user:profile`
Updates user fitness profile including equipment, preferences, and injuries.

**Usage:**
```bash
# Interactive update (recommended)
pnpm test:user:profile --phone "+1234567890"

# Update specific fields
pnpm test:user:profile --user-id "abc123" \
  --goals "Build muscle and lose fat" \
  --level intermediate

# Update equipment and preferences
pnpm test:user:profile --phone "+1234567890" \
  --equipment "Dumbbells,Barbell,Bench" \
  --preferences "Strength Training,HIIT"

# Add injury information
pnpm test:user:profile --phone "+1234567890" \
  --injuries "Lower back pain,Shoulder impingement"

# Clear profile
pnpm test:user:profile --phone "+1234567890" --clear
```

**Options:**
- `-p, --phone <phone>` - Phone number
- `-u, --user-id <id>` - User ID
- `--goals <goals>` - Fitness goals
- `--level <level>` - Skill level (beginner/intermediate/advanced)
- `--frequency <frequency>` - Exercise frequency
- `--equipment <equipment>` - Available equipment (comma-separated)
- `--preferences <preferences>` - Workout preferences (comma-separated)
- `--injuries <injuries>` - Current injuries (comma-separated)
- `--no-interactive` - Disable interactive prompts
- `--clear` - Clear the fitness profile
- `-v, --verbose` - Show detailed output

---

#### `pnpm sms:test`
Tests the SMS webhook endpoint by simulating incoming text messages.

**Usage:**
```bash
pnpm sms:test -p "+1234567890" -m "What's my workout today?"
```

**Options:**
- `-p, --phone <phone>` (required) - Phone number to simulate
- `-m, --message <message>` (required) - Message content
- `-s, --sid <sid>` - Message SID (auto-generated if not provided)
- `-u, --url <url>` - API endpoint URL (default: http://localhost:3000/api/sms)
- `-v, --verbose` - Show detailed output

**Example Scenarios:**
```bash
# Ask about today's workout
pnpm sms:test -p "+1234567890" -m "What's my workout today?"

# Mark workout as complete
pnpm sms:test -p "+1234567890" -m "Done with my workout!"

# Ask a general fitness question
pnpm sms:test -p "+1234567890" -m "How many rest days should I take?"
```

---

#### `pnpm checkout:test`
Tests the checkout/registration API endpoint.

**Usage:**
```bash
pnpm checkout:test -n "John Doe" -p "+1234567890" -e "john@example.com"
```

**Options:**
- `-n, --name <name>` (required) - User's name
- `-p, --phone <phone>` (required) - Phone number
- `-e, --email <email>` - Email address
- `--fitness-goals <goals>` - Fitness goals description
- `--skill-level <level>` - Skill level (beginner/intermediate/advanced)
- `--exercise-frequency <frequency>` - How often they exercise
- `--gender <gender>` - User's gender
- `--age <age>` - User's age
- `--payment-method <id>` - Payment method ID for direct payment
- `-u, --url <url>` - API endpoint URL
- `-v, --verbose` - Show detailed output

**Example Scenarios:**
```bash
# Basic registration
pnpm checkout:test -n "John Doe" -p "+1234567890"

# Full profile registration
pnpm checkout:test -n "Jane Smith" -p "+1234567890" -e "jane@example.com" \
  --age 30 --skill-level intermediate --fitness-goals "Build muscle"

# Test with payment method
pnpm checkout:test -n "Test User" -p "+1234567890" \
  --payment-method "pm_card_visa"
```

---

#### `pnpm programs:test`
Tests fitness program generation for an existing user.

**Usage:**
```bash
pnpm programs:test -i "user_id_here"
```

**Options:**
- `-i, --user-id <id>` (required) - User ID from the database
- `-u, --url <url>` - API endpoint URL
- `-v, --verbose` - Show detailed output

**Note:** You need a valid user ID from a previously created user. Create a user first using `checkout:test`.

---

#### `pnpm flow:test`
Tests the complete user registration and onboarding flow end-to-end.

**Usage:**
```bash
pnpm flow:test -n "John Doe" -p "+1234567890"
```

**Options:**
- `-n, --name <name>` (required) - User's name
- `-p, --phone <phone>` (required) - Phone number
- `-e, --email <email>` - Email address
- `--fitness-goals <goals>` - Fitness goals
- `--skill-level <level>` - Skill level
- `--exercise-frequency <frequency>` - Exercise frequency
- `--gender <gender>` - Gender
- `--age <age>` - Age
- `-b, --base-url <url>` - Base API URL (default: http://localhost:3000)
- `-d, --delay <ms>` - Delay between steps (default: 2000)
- `--skip-payment` - Skip payment step for testing
- `-v, --verbose` - Show detailed output

**Example Scenarios:**
```bash
# Basic flow
pnpm flow:test -n "John Doe" -p "+1234567890"

# Full profile with custom delay
pnpm flow:test -n "Jane Smith" -p "+1234567890" -e "jane@example.com" \
  --age 30 --delay 5000

# Test without payment
pnpm flow:test -n "Test User" -p "+1234567890" --skip-payment
```

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gymtext

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_NUMBER=+1234567890

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# AI/LLM
OPENAI_API_KEY=sk_...
GOOGLE_API_KEY=...

# Pinecone (vector database)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=...
```

## Common Workflows

### Setting Up a New Development Environment

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables in `.env.local`
4. Create the database
5. Run migrations: `pnpm migrate:up`
6. Start development server: `pnpm dev`

### Testing the Complete User Journey

1. Start the dev server: `pnpm dev`
2. Create a test user interactively: `pnpm test:user:create`
   - Or with arguments: `pnpm test:user:create -n "Test User" -p "+1234567890" --skip-payment`
3. View user details: `pnpm test:user:get --phone "+1234567890"`
4. Update fitness profile: `pnpm test:user:profile --phone "+1234567890"`
5. Generate fitness plan: `pnpm test:fitness:plan --phone "+1234567890"` (coming in Phase 3)
6. Test SMS interaction: `pnpm sms:test -p "+1234567890" -m "What's my workout?"`

### Quick User Setup for Testing

```bash
# Create a test user with all details
pnpm test:user:create \
  --name "John Doe" \
  --phone "+1234567890" \
  --email "john@example.com" \
  --goals "Build muscle" \
  --level intermediate \
  --skip-payment

# Verify user was created
pnpm test:user:get --phone "+1234567890" --verbose

# Update profile with equipment
pnpm test:user:profile --phone "+1234567890" \
  --equipment "Dumbbells,Barbell,Bench" \
  --preferences "Strength Training"
```

### Adding a New Database Table

1. Create a migration: `pnpm migrate:create add_new_table`
2. Edit the migration file in `migrations/`
3. Apply the migration: `pnpm migrate:up`
4. Generate TypeScript types: `pnpm db:codegen`
5. Use the new types in your code

## Troubleshooting

### Common Issues

**"Connection refused" errors**
- Ensure the development server is running: `pnpm dev`
- Check that you're using the correct port (default: 3000)

**Database migration failures**
- Verify `DATABASE_URL` is set correctly
- Ensure PostgreSQL is running
- Check migration file syntax

**SMS test not working**
- Verify `TWILIO_NUMBER` is set in `.env.local`
- Ensure the phone number format includes country code

**Type generation issues**
- Run `pnpm db:codegen` manually
- Check database connection
- Ensure all migrations are applied

### Debugging Tips

1. Use the `-v, --verbose` flag on test scripts for detailed output
2. Check server logs when running `pnpm dev`
3. Verify environment variables are loaded correctly
4. Test each component independently before running end-to-end tests

## Deprecated Scripts

The following scripts have been archived and replaced with new implementations:

- `test-programs.ts` → Replaced by `test:fitness:plan` (coming in Phase 3)
- `test-user-flow.ts` → Replaced by `test:flow:onboarding` (coming in Phase 5)
- `test-cron-daily-messages.ts` → Replaced by `test:messages:daily` (coming in Phase 4)
- `get-test-user.ts` → Replaced by `test:user:get`

These scripts can be found in `scripts/archive/` for reference.

## Best Practices

1. **Always run migrations before starting development**
   ```bash
   pnpm migrate:up
   pnpm dev
   ```

2. **Test changes incrementally**
   - Test individual endpoints before running flow tests
   - Use verbose mode to debug issues

3. **Use interactive mode for exploration**
   - Most test scripts support interactive prompts
   - Great for discovering features and testing edge cases

4. **Keep test data realistic**
   - Use valid phone number formats
   - Provide realistic user profiles
   - Test edge cases

5. **Clean up test data periodically**
   - Test users can accumulate in the database
   - Use `pnpm test:user:get --all` to list users
   - Consider using the delete functionality in utils

6. **Document new scripts**
   - Add clear descriptions in package.json
   - Update this documentation
   - Include example usage