# Web App

The **web** app is the consumer-facing application at [gymtext.com](https://gymtext.com).

## Overview

| Property | Value |
|----------|-------|
| **Directory** | `apps/web` |
| **URL** | gymtext.com |
| **Port** | 3000 |
| **Framework** | Next.js 16 (App Router) |

## Purpose

The web app serves end users who:
- Sign up for GymText coaching
- View their fitness plans and workouts
- Chat with the AI coach via SMS
- Manage their profiles and preferences

## Key Routes

### Public Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/start` | Sign up / onboarding |
| `/login` | User login |
| `/blog` | Blog posts |

### Protected Routes (Requires Auth)

| Path | Description |
|------|-------------|
| `/me` | User dashboard |
| `/me/profile` | Profile management |
| `/me/workouts` | Workout history |
| `/chat` | Chat interface |

### API Routes

| Path | Method | Description |
|------|--------|-------------|
| `/api/chat` | POST | Send chat message |
| `/api/webhooks/twilio` | POST | Twilio SMS webhook |
| `/api/webhooks/stripe` | POST | Stripe webhooks |
| `/api/profile` | GET/PATCH | User profile |

## Features

### User Onboarding

New users go through an onboarding flow:
1. Enter phone number
2. Receive verification code
3. Complete fitness profile (via chat or form)
4. Receive initial fitness plan

### Chat Interface

Users can chat with the AI coach:
- View current workout
- Ask fitness questions
- Request modifications
- Update profile info

### Profile Management

Users can view and edit:
- Fitness goals
- Experience level
- Available equipment
- Injuries/limitations
- Workout preferences

## Technical Details

### Authentication

The web app uses phone-based authentication:
- SMS verification codes
- Encrypted session cookies

### Always Production

The web app **always uses production environment** - no sandbox switching:

```typescript
// Always use production context
import { createProductionContext } from '@gymtext/shared/server';

export async function GET() {
  const ctx = await createProductionContext();
  // ctx.db, ctx.twilioClient, ctx.stripeClient are production
}
```

### Environment Variables

Required for web app:
```bash
DATABASE_URL=...
SESSION_ENCRYPTION_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_NUMBER=...
STRIPE_SECRET_KEY=...
OPENAI_API_KEY=...
```

## Development

```bash
# Start development server
pnpm dev:web

# Build for production
pnpm build:web

# Run tests
pnpm test
```

## Related Documentation

- [Architecture Overview](../architecture/overview.md) - System architecture
- [Admin App](./admin.md) - Admin portal
- [Programs App](./programs.md) - Program owners portal
- [Messaging Flow](../architecture/messaging-flow.md) - SMS handling
