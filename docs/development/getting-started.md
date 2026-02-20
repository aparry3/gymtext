# Getting Started

Welcome to GymText development! This guide will help you get up and running.

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20.x+ | JavaScript runtime |
| **pnpm** | 9.x | Package manager |
| **PostgreSQL** | Latest | Local database |
| **Git** | Latest | Version control |

### Recommended Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Code editor |
| **Docker** | Containerized services |
| **TablePlus** | Database GUI |

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/aparry3/gymtext.git
cd gymtext
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your credentials
```

### 4. Set Up Database

```bash
# Create database
createdb gymtext

# Update DATABASE_URL in .env.local
# Format: postgresql://user:password@localhost:5432/gymtext
```

### 5. Run Migrations

```bash
pnpm migrate:up
```

### 6. Generate Types

```bash
pnpm db:codegen
```

### 7. Start Development Server

```bash
pnpm dev
```

The app will be available at:
- **Web app**: http://localhost:3000
- **Admin app**: http://localhost:3001
- **Programs app**: http://localhost:3002

## Essential Commands

```bash
# Development
pnpm dev                # Start all apps
pnpm dev:web           # Start web app only
pnpm dev:admin         # Start admin app only

# Building
pnpm build             # Build all apps
pnpm build:web         # Build web app

# Database
pnpm migrate:up        # Run migrations
pnpm migrate:create    # Create migration
pnpm db:codegen        # Generate types

# Testing
pnpm test              # Run tests
pnpm sms:test          # Test SMS
```

## Next Steps

### Understand the Architecture

- Read [Architecture Overview](../architecture/overview.md)
- Explore [Agent System](../agents/index.md)
- Review [Database Models](../models/index.md)

### Set Up External Services

For full functionality, you'll need:
- **Twilio** - SMS messaging
- **Stripe** - Payment processing
- **OpenAI** - AI/LLM
- **Pinecone** - Vector database (for embeddings)

### Start Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a PR

## Common Issues

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL format
# postgresql://user:password@host:port/database
```

### Port Already in Use

```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
```

### Missing Dependencies

```bash
# Reinstall
rm -rf node_modules
pnpm install
```

## Related Documentation

- [Local Setup](./local-setup.md) - Detailed setup guide
- [Testing](./testing.md) - Testing approaches
- [Common Workflows](./common-workflows.md) - Typical development tasks
