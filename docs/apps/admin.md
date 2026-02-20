# Admin App

The **admin** app is the admin portal at [admin.gymtext.com](https://admin.gymtext.com).

## Overview

| Property | Value |
|----------|-------|
| **Directory** | `apps/admin` |
| **URL** | admin.gymtext.com |
| **Port** | 3001 |
| **Framework** | Next.js 16 (App Router) |

## Purpose

The admin app allows staff to:
- Manage users
- View and manage fitness programs
- View analytics and metrics
- Access sandbox for testing

## Key Routes

### Public Routes

| Path | Description |
|------|-------------|
| `/login` | Admin login |

### Protected Routes (Requires Admin Auth)

| Path | Description |
|------|-------------|
| `/` | Dashboard overview |
| `/users` | User management |
| `/programs` | Program management |
| `/analytics` | Analytics dashboard |
| `/settings` | Admin settings |

### API Routes

| Path | Method | Description |
|------|--------|-------------|
| `/api/users` | GET/POST | List/create users |
| `/api/users/[id]` | GET/PATCH/DELETE | User CRUD |
| `/api/programs` | GET/POST | List/create programs |
| `/api/analytics/*` | GET | Analytics data |

## Features

### User Management

- View all users
- Search users by phone/name
- View user details and fitness plans
- Manually update user profiles

### Program Management

- View all fitness programs
- Create new programs
- Edit program details

### Analytics

- User growth metrics
- Engagement statistics
- Subscription analytics

### Environment Switching

The admin app supports switching between **production** and **sandbox** environments:

```
┌─────────────────────────────────────────┐
│           Admin Portal                  │
│  ┌─────────────────────────────────┐    │
│  │ Environment: [Production ▼]    │    │
│  └─────────────────────────────────┘    │
│         │                    │          │
│         ▼                    ▼          │
│  ┌─────────────┐    ┌─────────────┐      │
│  │ Production  │    │  Sandbox    │      │
│  │   Env      │    │    Env      │      │
│  └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────┘
```

This is useful for:
- Testing new features safely
- Reproducing user issues
- Checking data without affecting production

## Technical Details

### Authentication

Admin uses phone-based SMS verification with a **whitelist**:

```bash
# Environment variable (comma-separated E.164 numbers)
ADMIN_PHONE_NUMBERS=+1234567890,+0987654321
```

### Environment Switching

The admin app supports environment switching via:

1. **Cookie** - User preference stored in `gt_env` cookie
2. **Middleware** - Reads cookie, sets `X-Gymtext-Env` header
3. **Context** - Creates environment-specific connections

```typescript
// API routes use environment context
import { createEnvContext } from '@gymtext/shared/server';

export async function GET(request: Request) {
  // Reads X-Gymtext-Env header or defaults to production
  const ctx = await createEnvContext(request);
  
  // ctx.db, ctx.twilioClient, ctx.stripeClient
  // are environment-specific
}
```

### Environment Variables

**Production (required):**
```bash
DATABASE_URL=...
SESSION_ENCRYPTION_KEY=...
ADMIN_PHONE_NUMBERS=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...
```

**Sandbox (optional):**
```bash
SANDBOX_DATABASE_URL=...
SANDBOX_TWILIO_ACCOUNT_SID=...
SANDBOX_TWILIO_AUTH_TOKEN=...
SANDBOX_TWILIO_NUMBER=...
```

If sandbox variables are not set, sandbox mode falls back to production credentials.

## Development

```bash
# Start development server
pnpm dev:admin

# Build for production
pnpm build:admin
```

## Related Documentation

- [Architecture Overview](../architecture/overview.md) - System architecture
- [Web App](./web.md) - Consumer app
- [Programs App](./programs.md) - Program owners portal
- [Authentication](../architecture/auth.md) - Auth & authorization
