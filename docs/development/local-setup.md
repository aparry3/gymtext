# Local Development Setup

This guide covers setting up a complete local development environment.

## Prerequisites

### System Requirements

- macOS, Linux, or Windows (WSL)
- 8GB+ RAM
- 20GB+ free disk space

### Required Software

| Software | Installation |
|----------|--------------|
| **Node.js 20+** | `brew install node` or from nodejs.org |
| **pnpm 9+** | `npm install -g pnpm` |
| **PostgreSQL** | `brew install postgresql` or from postgresql.org |
| **Git** | Usually pre-installed |

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/aparry3/gymtext.git
cd gymtext

# Install dependencies
pnpm install
```

### 2. PostgreSQL Setup

#### macOS

```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb gymtext

# Verify
psql -d gymtext -c "SELECT version();"
```

#### Linux

```bash
# Install
sudo apt-get install postgresql postgresql-contrib

# Start
sudo systemctl start postgresql

# Create user and database
sudo -u postgres createuser -s gymtext
sudo -u postgres createdb gymtext
```

### 3. Environment Variables

Create `.env.local` in the project root:

```bash
# Database
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/gymtext"

# Session (generate a 32+ character key)
SESSION_ENCRYPTION_KEY="your-secret-key-at-least-32-characters-long"

# Twilio (get from twilio.com)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_NUMBER="+1234567890"

# Stripe (get from stripe.com)
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"

# OpenAI (get from openai.com)
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"

# Google (for Gemini)
GOOGLE_API_KEY="xxxxxxxxxxxxx"

# Pinecone (get from pinecone.io)
PINECONE_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
PINECONE_INDEX="gymtext"

# Admin (comma-separated phone numbers)
ADMIN_PHONE_NUMBERS="+1234567890"
```

### 4. Run Migrations

```bash
# Run all migrations
pnpm migrate:up

# Generate database types
pnpm db:codegen
```

### 5. Seed Data (Optional)

```bash
# Seed exercise database
pnpm seed:exercises

# Seed context templates
pnpm seed:templates
```

### 6. Start Development Server

```bash
pnpm dev
```

This starts all three apps:
- **Web**: http://localhost:3000
- **Admin**: http://localhost:3001
- **Programs**: http://localhost:3002

## Database Management

### Using psql

```bash
# Connect to database
psql -d gymtext

# List tables
\dt

# Quit
\q
```

### Using a GUI

- **TablePlus** - `brew install --cask tableplus`
- **pgAdmin** - Download from pgadmin.org
- **DBeaver** - `brew install --cask dbeaver-community`

### Resetting the Database

```bash
# Drop and recreate
dropdb gymtext
createdb gymtext
pnpm migrate:up
```

## Troubleshooting

### "Database does not exist"

```bash
# Create it
createdb gymtext
```

### "Role does not exist"

```bash
# Create role
psql -c "CREATE USER your_user WITH PASSWORD 'your_password' CREATEDB;"
```

### "Port already in use"

```bash
# Find and kill
lsof -ti:3000 | xargs kill -9
```

### TypeScript errors after schema change

```bash
# Regenerate types
pnpm db:codegen
```

## Docker Alternative

Instead of installing PostgreSQL locally, you can use Docker:

```bash
# Start PostgreSQL container
docker run --name gymtext-db \
  -e POSTGRES_DB=gymtext \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:latest

# DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gymtext"
```

## Related Documentation

- [Getting Started](./getting-started.md) - Quick start guide
- [Testing](./testing.md) - Testing approaches
- [Common Workflows](./common-workflows.md) - Development workflows
