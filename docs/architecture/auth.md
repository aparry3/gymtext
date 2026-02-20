# Authentication & Authorization

GymText uses different authentication approaches for each application. This document covers the authentication systems.

## Authentication Overview

| App | Auth Method | Description |
|-----|-------------|-------------|
| **web** | Phone-based (SMS) | User login via SMS verification |
| **admin** | Phone whitelist | Admin access via whitelisted numbers |
| **programs** | Phone-based (SMS) | Program owner authentication |

## Web App Authentication

### User Login Flow

1. User enters phone number on login page
2. System sends 6-digit verification code via SMS
3. User enters code
4. System validates code and creates session
5. Session stored in secure, httpOnly cookie

### Session Management

```typescript
// Session cookie (from .env)
SESSION_ENCRYPTION_KEY=...  // 32+ character key

// Session is encrypted and stored in cookie
// Valid for 30 days
```

### Verification Codes

```typescript
// Generate code
const code = Math.floor(100000 + Math.random() * 900000).toString();

// Store with expiry
await repos.authCode.create({
  phone: userPhone,
  code: code,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
});
```

## Admin Authentication

The admin panel uses phone-based SMS verification with a whitelist system.

### Authentication Flow

```
1. Admin navigates to /admin/*
         │
         ▼
2. Middleware checks for session cookie
         │
         ▼
3. No cookie → Redirect to /login
         │
         ▼
4. Admin enters phone number
         │
         ▼
5. System checks ADMIN_PHONE_NUMBERS whitelist
         │
         ▼
6. Whitelisted → Send verification SMS
         │
         ▼
7. Admin enters 6-digit code
         │
         ▼
8. Validate code → Set cookie → Redirect to admin
```

### Configuration

```bash
# Environment variable (comma-separated E.164 numbers)
ADMIN_PHONE_NUMBERS=+1234567890,+0987654321
```

### Rate Limiting

- **Max 3 code requests** per 15 minutes per phone number
- **Codes expire** after 10 minutes

### Middleware Protection

```typescript
// apps/admin/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminCookie = request.cookies.get('gt_admin');
  
  if (!adminCookie || adminCookie.value !== 'ok') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}
```

### Protected Routes

All routes under `/admin/*` except `/login` require authentication.

## Programs App Authentication

Similar to web app - phone-based SMS verification for program owners.

## Authorization

### User Authorization

Users can only access their own data:

```typescript
// In services
async function getUserWorkouts(userId: string, requestedUserId: string) {
  if (userId !== requestedUserId) {
    throw new Error('Unauthorized');
  }
  return repos.workout.findByUser(userId);
}
```

### Admin Authorization

Admins have access to all data but operations are logged:

```typescript
// Admin actions are logged
await repos.adminActivityLog.create({
  adminPhone: adminPhone,
  action: 'update_user',
  targetUserId: userId,
  timestamp: new Date(),
});
```

## Security Considerations

### Session Security

- **Encrypted**: Session data encrypted with `SESSION_ENCRYPTION_KEY`
- **HttpOnly**: Cookie not accessible via JavaScript
- **Secure**: Cookie only sent over HTTPS in production
- **Expiry**: Sessions expire after 30 days

### Phone Number Validation

- **E.164 format**: All phone numbers stored in E.164 format
- **Validation**: Phone numbers validated before storage

### Rate Limiting

- **Auth codes**: Max 3 requests per 15 minutes
- **API endpoints**: Consider rate limiting for production

## Related Documentation

- [Architecture Overview](./overview.md) - System architecture
- [API Structure](./api-structure.md) - API routes
- [Environment Variables](../reference/environment-variables.md) - Required env vars
