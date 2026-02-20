# API Structure

GymText uses Next.js API routes for all backend functionality. This document outlines the API structure across all apps.

## API Organization

```
apps/
├── web/src/app/api/
│   ├── chat/              # Chat endpoints
│   ├── webhooks/          # External webhooks (Twilio, Stripe)
│   ├── auth/              # Authentication
│   ├── profile/           # User profiles
│   └── workouts/          # Workout data
│
├── admin/src/app/api/
│   ├── users/             # User management
│   ├── programs/          # Program management
│   ├── analytics/        # Admin analytics
│   └── admin/             # Admin-specific endpoints
│
└── programs/src/app/api/
    ├── programs/          # Program CRUD
    ├── enrollments/       # User enrollments
    └── analytics/         # Program analytics
```

## Web App API Routes

### Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send a chat message |

### Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/twilio` | POST | Receive incoming SMS |
| `/api/webhooks/stripe` | POST | Stripe payment events |

### Profile

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET | Get current user profile |
| `/api/profile` | PATCH | Update profile |

### Workouts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workouts/today` | GET | Get today's workout |
| `/api/workouts` | GET | List user's workouts |

## Admin App API Routes

### Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | List all users |
| `/api/users/[id]` | GET | Get user details |
| `/api/users/[id]` | PATCH | Update user |

### Programs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/programs` | GET | List programs |
| `/api/programs` | POST | Create program |
| `/api/programs/[id]` | PATCH | Update program |

### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/overview` | GET | Get analytics overview |
| `/api/analytics/users` | GET | User analytics |

## Programs App API Routes

### Program Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/programs` | GET | List my programs |
| `/api/programs` | POST | Create program |
| `/api/programs/[id]` | GET | Get program details |
| `/api/programs/[id]` | PATCH | Update program |

### Enrollments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/enrollments` | GET | List enrollments |
| `/api/enrollments` | POST | Enroll user |

## API Request/Response Patterns

### Standard Response Format

```typescript
// Success response
{
  "data": { ... },
  "message": "Success"
}

// Error response
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Using Services

API routes should delegate to services:

```typescript
// apps/web/src/app/api/chat/route.ts
import { ChatService } from '@gymtext/shared/server';
import { createProductionContext } from '@gymtext/shared/server';

export async function POST(request: Request) {
  const ctx = await createProductionContext();
  const services = getServices(ctx);
  
  const { message, userId } = await request.json();
  const result = await services.chatService.sendMessage(userId, message);
  
  return Response.json({ data: result });
}
```

## Environment Context

### Web App (Production Only)

The web app always uses production context:

```typescript
import { createProductionContext } from '@gymtext/shared/server';

export async function GET() {
  const ctx = await createProductionContext();
  // Always production database, Twilio, Stripe
}
```

### Admin App (Environment Switching)

The admin app supports environment switching via header:

```typescript
import { createEnvContext } from '@gymtext/shared/server';

export async function GET(request: Request) {
  // Reads X-Gymtext-Env header or falls back to production
  const ctx = await createEnvContext(request);
  
  // ctx.db, ctx.twilioClient, ctx.stripeClient
  // are environment-specific
}
```

## Related Documentation

- [Architecture Overview](./overview.md) - System architecture
- [Messaging Flow](./messaging-flow.md) - SMS handling
- [Authentication](./auth.md) - Auth & authorization
